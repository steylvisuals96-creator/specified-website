import { CMS_URL } from "./settings";
import { CONSULTANTS, DIENSTEN, HERO, JOBS, TEKENING, TEKENING_CALLOUTS } from "./inhoud";

/**
 * De teksten van de homepage, zoals de redactie ze in de CMS beheert (global
 * "website"). lib/inhoud.ts blijft de terugval: een leeg of ontbrekend veld
 * in de CMS betekent de tekst uit de code, zodat de site nooit leeg valt.
 */
export type WebsiteInhoud = {
  hero: typeof HERO;
  tekening: typeof TEKENING.titelblok & { intro: string; scrollHint: string };
  callouts: [string, string][];
  consultants: { titel: string; accent: string; tekst: string; profielen: string[] };
  diensten: typeof DIENSTEN;
  jobs: typeof JOBS;
  /** Leeg = de standaard van het onderdeel (CTA/Footer). */
  contact: { email: string; telefoon: string; linkedin: string; footerTekst: string };
};

export const STANDAARD: WebsiteInhoud = {
  hero: HERO,
  tekening: { ...TEKENING.titelblok, intro: TEKENING.intro, scrollHint: TEKENING.scrollHint },
  callouts: TEKENING_CALLOUTS,
  consultants: CONSULTANTS,
  diensten: DIENSTEN,
  jobs: JOBS,
  contact: { email: "", telefoon: "", linkedin: "", footerTekst: "" },
};

const tekst = (cms: unknown, terugval: string): string =>
  typeof cms === "string" && cms.trim() ? cms.trim() : terugval;

/** Legt de CMS-waarden over de standaardteksten. Onbekende of lege velden vallen terug. */
export function samenvoegen(cms: any): WebsiteInhoud {
  const c = cms ?? {};
  const S = STANDAARD;

  const dienst = (d: (typeof DIENSTEN)[number], v: any) => ({
    ...d,
    kop: tekst(v?.kop, d.kop),
    titel: tekst(v?.titel, d.titel),
    tekst: tekst(v?.tekst, d.tekst),
    cta: tekst(v?.cta, d.cta),
  });

  const profielen = Array.isArray(c.consultants?.profielen)
    ? c.consultants.profielen.map((p: any) => tekst(p?.naam, "")).filter(Boolean)
    : [];

  return {
    hero: {
      prefix: tekst(c.hero?.prefix, S.hero.prefix),
      woord: tekst(c.hero?.woord, S.hero.woord),
      suffix: tekst(c.hero?.suffix, S.hero.suffix),
      ctaBedrijven: tekst(c.hero?.ctaBedrijven, S.hero.ctaBedrijven),
      ctaEngineers: tekst(c.hero?.ctaEngineers, S.hero.ctaEngineers),
    },
    tekening: {
      intro: tekst(c.tekening?.intro, S.tekening.intro),
      scrollHint: tekst(c.tekening?.scrollHint, S.tekening.scrollHint),
      project: tekst(c.tekening?.project, S.tekening.project),
      locatie: tekst(c.tekening?.locatie, S.tekening.locatie),
      waarden: tekst(c.tekening?.waarden, S.tekening.waarden),
      akkoord: tekst(c.tekening?.akkoord, S.tekening.akkoord),
    },
    // Het acrostichon heeft negen letters; ontbrekende regels houden de standaardtekst.
    callouts: S.callouts.map((standaard, i) => {
      const r = Array.isArray(c.callouts) ? c.callouts[i] : undefined;
      return [tekst(r?.label, standaard[0]), tekst(r?.tekst, standaard[1])] as [string, string];
    }),
    consultants: {
      titel: tekst(c.consultants?.titel, S.consultants.titel),
      accent: tekst(c.consultants?.accent, S.consultants.accent),
      tekst: tekst(c.consultants?.tekst, S.consultants.tekst),
      profielen: profielen.length > 0 ? profielen : S.consultants.profielen,
    },
    diensten: [dienst(S.diensten[0], c.diensten_bedrijven), dienst(S.diensten[1], c.diensten_engineers)],
    jobs: {
      titel: tekst(c.jobs?.titel, S.jobs.titel),
      linkTekst: tekst(c.jobs?.linkTekst, S.jobs.linkTekst),
    },
    contact: {
      email: tekst(c.contact?.email, ""),
      telefoon: tekst(c.contact?.telefoon, ""),
      linkedin: tekst(c.contact?.linkedin, ""),
      footerTekst: tekst(c.contact?.footerTekst, ""),
    },
  };
}

export async function getWebsite(): Promise<WebsiteInhoud> {
  try {
    const res = await fetch(`${CMS_URL}/api/globals/website`, { next: { revalidate: 60 } });
    if (!res.ok) return STANDAARD;
    return samenvoegen(await res.json());
  } catch {
    return STANDAARD;
  }
}
