import "server-only";
import { r2Ingesteld, verwijderBestand, zetBestand } from "../r2";
import { supabaseAdmin } from "../supabase/server";
import { verversWebsite } from "../website";
import { seoConfig, type Rapport, type ZoekSignaal } from "./config";
import { organisatie, vakOnderzoek, weekStart, zoekSignalen } from "./onderzoek";
import { genereerCover, maakConcept, maakVoorstellen, schrijfSeo, type Kandidaat } from "./redactie";

type Database = ReturnType<typeof supabaseAdmin>;
const VIER_WEKEN = 28 * 86_400_000;
const foutmelding = (fout: unknown, terugval: string) => fout instanceof Error ? fout.message : terugval;

function leesHtmlTekst(fragment: string) {
  const entiteiten: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return fragment.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (origineel, sleutel: string) => {
    if (!sleutel.startsWith("#")) return entiteiten[sleutel] ?? origineel;
    const hex = sleutel[1].toLowerCase() === "x";
    const code = parseInt(sleutel.slice(hex ? 2 : 1), hex ? 16 : 10);
    return code < 0x110000 ? String.fromCodePoint(code) : origineel;
  }).replace(/\s+/g, " ").trim();
}

async function leesPagina(adres: string) {
  const response = await fetch(adres, { redirect: "error", cache: "no-store", signal: AbortSignal.timeout(7000) });
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return null;
  const html = await response.text();
  if (/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) return null;
  const titel = html.match(/<title>([^<]*)<\/title>/i)?.[1];
  const beschrijving = html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1];
  if (!titel || !beschrijving) return null;
  return { titel: leesHtmlTekst(titel).slice(0, 160), beschrijving: leesHtmlTekst(beschrijving).slice(0, 400) };
}

async function metadataKandidaten(sb: Database, site: string, signalen: ZoekSignaal[], nu: Date, meldingen: string[]) {
  if (!signalen.length) return [];
  const { data, error } = await sb.from("seo_metadata").select("pad, voorstel_id, titel, beschrijving, bijgewerkt");
  if (error) {
    meldingen.push("De huidige SEO-metadata kon niet worden gelezen.");
    return [];
  }
  const kandidaten = await Promise.all(signalen.slice(0, 4).map(async (signaal): Promise<Kandidaat | null> => {
    const eerder = data.find((rij) => rij.pad === signaal.pad);
    if (eerder && nu.getTime() - Date.parse(eerder.bijgewerkt) < VIER_WEKEN) return null;
    if (eerder) return { ...signaal, vorigeId: eerder.voorstel_id, vorigeTitel: eerder.titel, vorigeBeschrijving: eerder.beschrijving };
    const pagina = await leesPagina(`${site}${signaal.pad}`).catch(() => null);
    if (!pagina) {
      meldingen.push(`De publieke metadata van ${signaal.pad} was niet beschikbaar.`);
      return null;
    }
    return { ...signaal, vorigeId: null, vorigeTitel: pagina.titel, vorigeBeschrijving: pagina.beschrijving };
  }));
  return kandidaten.filter((rij): rij is Kandidaat => rij !== null).slice(0, 3);
}

export async function voerSeoUit() {
  const config = seoConfig();
  if (!config.actief) return { status: "uit" } as const;
  if (config.ontbreekt.length) return { status: "configuratie ontbreekt" } as const;

  const sb = supabaseAdmin({ timeout: 9000 });
  const nu = new Date();
  const week = weekStart(nu);
  const { data: run, error } = await sb.from("seo_runs").insert({ week }).select("id").single();
  if (error?.code === "23505") return { status: "deze week al gestart" } as const;
  if (error || !run) {
    console.error("[seo] Run kon niet worden geregistreerd.", error?.code);
    return { status: "mislukt" } as const;
  }

  const meldingen: string[] = [];
  const rapport: Rapport = { meldingen };
  let opslag: string | null = null;
  try {
    const google = await zoekSignalen(config.site!, {
      property: config.google.property!, email: config.google.email!, sleutel: config.google.sleutel!,
    }, nu).catch((fout: unknown) => {
      meldingen.push(foutmelding(fout, "Google Search Console was niet beschikbaar."));
      return null;
    });
    const signalen = google?.signalen ?? [];
    rapport.periode = google?.periode;
    rapport.signalen = signalen;
    if (google && !signalen.length) meldingen.push("Google Search Console gaf geen pagina’s die aan de drempels voldoen.");

    const [gevonden, kandidaten, bestaande] = await Promise.all([
      vakOnderzoek(config.apify!, week, signalen, nu).catch((fout: unknown) => {
        meldingen.push(foutmelding(fout, "Het vakonderzoek is mislukt."));
        return null;
      }),
      metadataKandidaten(sb, config.site!, signalen, nu, meldingen),
      sb.from("blog").select("titel, slug").order("aangemaakt", { ascending: false }).limit(150),
    ]);
    const bronnen = gevonden ?? [];
    const schrijfBlog = !bestaande.error && new Set(bronnen.map(organisatie)).size >= 2;
    if (bestaande.error) meldingen.push("Bestaande artikels konden niet worden gecontroleerd op dubbele onderwerpen.");
    else if (!schrijfBlog) meldingen.push("Voor een blogconcept zijn minstens twee relevante vakbronnen van verschillende organisaties nodig.");
    rapport.bronnen = bronnen.map(({ url, titel }) => ({ url, titel }));

    if (!kandidaten.length && !schrijfBlog && !google && !gevonden) {
      throw new Error("De ronde kon geen onderbouwde inhoud voorbereiden.");
    }

    const resultaat = schrijfBlog || kandidaten.length
      ? await schrijfSeo(config.openai!, kandidaten, schrijfBlog ? bronnen : [],
        (bestaande.data ?? []).slice(0, 60).map((a) => a.titel), signalen.slice(0, 12).map((s) => s.zoekterm))
      : { voorstellen: [], artikel: null };
    const voorstellen = maakVoorstellen(resultaat.voorstellen, kandidaten);
    const concept = schrijfBlog ? maakConcept(resultaat.artikel, bronnen, bestaande.data ?? []) : null;
    if (concept) rapport.bronnen = concept.bronnen;
    else if (schrijfBlog) meldingen.push("Er was geen bruikbaar nieuw blogconcept. Controleer de gevonden vakbronnen.");
    if (kandidaten.length && !voorstellen.length) meldingen.push("Er is geen bruikbare metadatawijziging voorgesteld.");

    let media = null;
    if (concept && config.beeld) {
      if (!r2Ingesteld()) meldingen.push("De blogcover is overgeslagen omdat R2 nog niet is ingesteld.");
      else if (!concept.beeldPrompt || !concept.beeldAlt) meldingen.push("Het concept bevatte onvoldoende informatie voor een blogcover.");
      else {
        try {
          const bytes = await genereerCover(config.openai!, concept.beeldPrompt);
          opslag = `media/seo/${run.id}.webp`;
          await zetBestand(opslag, bytes.buffer, "image/webp", AbortSignal.timeout(10_000));
          media = { sleutel: opslag, bestandsnaam: `${concept.rij.slug}-ai.webp`, grootte: bytes.length, alt: concept.beeldAlt };
        } catch (fout) {
          meldingen.push(foutmelding(fout, "De blogcover kon niet worden opgeslagen."));
          if (opslag) await verwijderBestand(opslag, AbortSignal.timeout(4000)).catch(() => {});
          opslag = null;
        }
      }
    }
    if (concept) rapport.cover = Boolean(media);
    const { data: gewijzigd, error: voltooiFout } = await sb.rpc("seo_voltooi", {
      p_run: run.id, p_rapport: rapport, p_artikel: concept?.rij ?? null, p_media: media,
      p_voorstellen: voorstellen, p_automatisch: config.automatisch,
    });
    if (voltooiFout) {
      console.error("[seo] Resultaten konden niet worden bevestigd.", voltooiFout.code);
      throw new Error("De SEO-resultaten konden niet worden opgeslagen.");
    }
    if (Array.isArray(gewijzigd) && gewijzigd.length) await verversWebsite(gewijzigd);
    return { status: "klaar" } as const;
  } catch (fout) {
    meldingen.push(foutmelding(fout, "De SEO-ronde is onderbroken."));
    // Een verloren HTTP-antwoord kan op een geslaagde transactie volgen. Verwijder
    // alleen een R2-object nadat blijkt dat de ronde effectief als mislukt is opgeslagen.
    const { data: mislukt } = await sb.from("seo_runs")
      .update({ status: "mislukt", voltooid: new Date().toISOString(), rapport })
      .eq("id", run.id).eq("status", "bezig").select("id").maybeSingle();
    if (mislukt && opslag) await verwijderBestand(opslag, AbortSignal.timeout(4000)).catch(() => {});
    return { status: "mislukt" } as const;
  }
}
