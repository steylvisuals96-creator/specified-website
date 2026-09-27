export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import DashboardShell, { fmtDate } from "@/components/DashboardShell";
import { ActiviteitFeed, type ActiviteitItem } from "@/components/ActiviteitFeed";
import KandidaatEditDrawer from "@/components/KandidaatEditDrawer";
import ActiviteitAddDrawer from "@/components/ActiviteitAddDrawer";
import { KandidaatFoto } from "@/components/KandidaatFoto";
import { StatusActies, StatusLijn } from "@/components/kandidaat/StatusActies";
import { Notitie } from "@/components/kandidaat/Notitie";
import { BESCHIKBAARHEID_LABEL, BRON_LABEL, NIVEAU_LABEL, SECTOR_LABEL, naamVan } from "@/lib/labels";

function Rij({ label, children }: { label: string; children?: React.ReactNode }) {
  if (children === undefined || children === null || children === "") return null;
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-4 border-b border-line py-3.5 sm:grid-cols-[11rem_1fr]">
      <dt className="text-sm text-bone-400">{label}</dt>
      <dd className="min-w-0 text-sm break-words text-bone-100">{children}</dd>
    </div>
  );
}

const link = "text-bone-100 underline decoration-olive-600 underline-offset-4 hover:text-lime-300 hover:decoration-lime-300";

function kb(bytes?: number) {
  if (!bytes) return "";
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.round(bytes / 1024)} kB`;
}

export default async function KandidaatDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const sessie = await payloadAlsGebruiker().catch(() => null);
  if (!sessie) redirect("/admin/login");
  const { payload, user, als } = sessie;

  const kandidaat = await payload.findByID({ collection: "kandidaten", id, depth: 1, ...als }).catch(() => null);
  if (!kandidaat) notFound();
  const k = kandidaat as any;

  const [activiteiten, instellingen] = await Promise.all([
    payload.find({ collection: "activiteiten", where: { kandidaat: { equals: id } }, sort: "-datum", limit: 50, depth: 1, ...als }),
    payload.findGlobal({ slug: "instellingen", ...als }).catch(() => null),
  ]);
  const bccEmail = (instellingen as any)?.bcc_logging_email ?? undefined;

  const items: ActiviteitItem[] = (activiteiten.docs as any[]).map((d) => ({
    id: d.id,
    type: d.type,
    richting: d.richting,
    datum: d.datum,
    onderwerp: d.onderwerp,
    inhoud: d.inhoud,
    van: d.van,
    naar: d.naar,
    kandidaat: d.kandidaat,
    bedrijf: d.bedrijf,
  }));

  const naam = naamVan(k);
  const functie = [k.functietitel, k.huidige_werkgever].filter(Boolean).join(" bij ");
  const beschikbaar = BESCHIKBAARHEID_LABEL[k.beschikbaarheid];
  const cv = typeof k.cv === "object" && k.cv ? k.cv : null;
  const skills: string[] = (k.skills ?? []).map((s: any) => s.skill).filter(Boolean);

  return (
    <DashboardShell userName={(user as any).naam || user.email} rol={(user as any).rol}>
      <div className="px-5 pt-8 sm:px-8 lg:px-10 lg:pt-10">
        <nav aria-label="Kruimelpad" className="text-sm text-bone-400">
          <Link href="/dashboard/kandidaten" className="underline-offset-4 hover:text-lime-300 hover:underline">
            Kandidaten
          </Link>
          <span className="px-2 text-bone-600" aria-hidden>
            /
          </span>
          <span className="text-bone-100" aria-current="page">
            {naam}
          </span>
        </nav>

        <header className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-center gap-6">
            <KandidaatFoto kandidaat={k} grootte={112} />
            <div className="min-w-0">
              <h1 className="kop text-[2.75rem] sm:text-[3.75rem]">{naam}</h1>
              {functie && <p className="mt-2 text-lg text-bone-100">{functie}</p>}
              {beschikbaar && (
                <p className="mens mt-1 text-lg text-bone-400">
                  {k.beschikbaarheid === "onmiddellijk" ? "direct beschikbaar" : beschikbaar.toLowerCase()}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusActies id={id} status={k.status ?? "nieuw"} />
            <KandidaatEditDrawer
              id={id}
              autoOpen={edit === "1"}
              groot
              initial={{
                voornaam: k.voornaam,
                achternaam: k.achternaam,
                email: k.email,
                telefoon: k.telefoon,
                sector: k.sector,
                ervaringsniveau: k.ervaringsniveau,
                beschikbaarheid: k.beschikbaarheid,
                functietitel: k.functietitel,
                huidige_werkgever: k.huidige_werkgever,
                jaren_ervaring: k.jaren_ervaring,
                linkedin: k.linkedin,
                status: k.status,
                gewenst_salaris: k.gewenst_salaris,
                notities: k.notities,
                bron: k.bron,
              }}
            />
          </div>
        </header>

        <div className="mt-10 overflow-x-auto pb-2">
          <div className="min-w-[640px]">
            <StatusLijn status={k.status ?? "nieuw"} />
          </div>
        </div>
      </div>

      <div className="mt-8 grid border-t border-line xl:grid-cols-2">
        <section aria-labelledby="gegevens-kop" className="px-5 py-8 sm:px-8 lg:px-10 xl:border-r xl:border-line">
          <h2 id="gegevens-kop" className="kop text-[1.75rem]">
            Gegevens
          </h2>
          <dl className="mt-4">
            <Rij label="E-mail">
              {k.email && (
                <a href={`mailto:${k.email}`} className={link}>
                  {k.email}
                </a>
              )}
            </Rij>
            <Rij label="Telefoon">
              {k.telefoon && (
                <a href={`tel:${String(k.telefoon).replace(/\s/g, "")}`} className={`${link} tabular`}>
                  {k.telefoon}
                </a>
              )}
            </Rij>
            <Rij label="Sector">{SECTOR_LABEL[k.sector]}</Rij>
            <Rij label="Niveau">{NIVEAU_LABEL[k.ervaringsniveau]}</Rij>
            <Rij label="Jaren ervaring">{k.jaren_ervaring ?? undefined}</Rij>
            <Rij label="Gewenst salaris">{k.gewenst_salaris}</Rij>
            <Rij label="LinkedIn">
              {/^https:\/\//i.test(String(k.linkedin ?? "")) ? (
                <a href={k.linkedin} target="_blank" rel="noopener noreferrer" className={link}>
                  {String(k.linkedin).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </a>
              ) : (
                // Geen https-adres: tonen als tekst, nooit als link.
                k.linkedin || undefined
              )}
            </Rij>
            <Rij label="CV">
              {cv?.url && (
                <a href={cv.url} target="_blank" rel="noopener noreferrer" className="flex items-baseline justify-between gap-4">
                  <span className={link}>{cv.filename ?? "CV openen"}</span>
                  <span className="text-bone-400 tabular">{kb(cv.filesize)}</span>
                </a>
              )}
            </Rij>
            <Rij label="Herkomst">{BRON_LABEL[k.bron] ?? k.bron}</Rij>
            <Rij label="Toegevoegd">{fmtDate(k.createdAt)}</Rij>
          </dl>

          {skills.length > 0 && (
            <>
              <h3 className="mt-8 text-sm text-bone-400">Skills</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <li key={s} className="border border-olive-600 px-3 py-1.5 text-sm text-bone-100">
                    {s}
                  </li>
                ))}
              </ul>
            </>
          )}

          {k.notities && (
            <>
              <h3 className="mt-8 text-sm text-bone-400">Interne notities</h3>
              <p className="mt-2 max-w-prose text-sm leading-relaxed whitespace-pre-wrap text-bone-100">{k.notities}</p>
            </>
          )}
        </section>

        <section aria-labelledby="activiteiten-kop" className="border-t border-line px-5 py-8 sm:px-8 lg:px-10 xl:border-t-0">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="activiteiten-kop" className="kop text-[1.75rem]">
              Activiteiten
            </h2>
            <ActiviteitAddDrawer kandidaatId={id} defaultNaar={k.email} />
          </div>
          <div className="mt-5">
            <Notitie id={id} />
          </div>
          <div className="mt-8">
            <ActiviteitFeed items={items} bccEmail={bccEmail} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
