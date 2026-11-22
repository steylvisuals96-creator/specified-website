import type { Metadata } from "next";
import { OpenSollicitatieWeergave } from "@/components/paginas/Weergaven";
import { getPagina } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";
import { huidigeTaal } from "@/lib/taal-server";
import { taalAlternates } from "@/lib/taal";

export const revalidate = 60;

const META = {
  nl: { title: "Open sollicitatie — Specified", description: "Geen passende vacature gevonden? Stuur Specified je cv en vertel wat je zoekt als engineer." },
  en: { title: "Open application — Specified", description: "No suitable vacancy? Send Specified your CV and tell us what you are looking for as an engineer." },
};

export async function generateMetadata(): Promise<Metadata> {
  const taal = await huidigeTaal();
  return { ...META[taal], alternates: taalAlternates(taal, "/open-sollicitatie") };
}

export default async function OpenSollicitatie() {
  const taal = await huidigeTaal();
  const [t, s] = await Promise.all([getPagina("open-sollicitatie", taal), getSettings(taal)]);
  return <OpenSollicitatieWeergave t={t} taal={taal} footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }} />;
}
