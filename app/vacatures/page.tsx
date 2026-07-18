import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import VacaturesClient from "@/components/VacaturesClient";
import { getSettings } from "@/lib/settings";

export const revalidate = 60; // refresh elke minuut

export const metadata = {
  title: "Vacatures — Specified",
  description: "Bekijk alle openstaande engineering vacatures bij Specified. Vaste en interim posities in bouw, infra, manufacturing en meer.",
};

const SECTOR_LABEL: Record<string, string> = {
  civiel: "Civiele techniek",
  elektro: "Elektrotechniek",
  werktuig: "Werktuigbouwkunde",
  bouw: "Bouw & Infra",
  industrie: "Industrie & Productie",
  energie: "Energie",
  it: "IT & Software",
  projectmanagement: "Projectmanagement",
};

const TYPE_LABEL: Record<string, string> = {
  vast: "Vast",
  interim: "Interim",
  freelance: "Freelance",
  student: "Student",
};

function lexicalToText(richText: any): string {
  if (!richText?.root?.children) return "";
  return richText.root.children
    .map((node: any) => {
      if (node.children) return node.children.map((c: any) => c.text || "").join("");
      return node.text || "";
    })
    .filter(Boolean)
    .join(" ");
}

async function getVacatures() {
  try {
    const res = await fetch(
      "https://specified-cms.vercel.app/api/vacatures?where[status][equals]=actief&limit=100&sort=-createdAt",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs ?? []).map((v: any, i: number) => ({
      id: v.id ?? i,
      title: v.titel,
      type: TYPE_LABEL[v.type] ?? v.type ?? "Vast",
      location: v.locatie ?? "België",
      sector: SECTOR_LABEL[v.sector] ?? v.sector ?? "",
      regime: "Voltijds",
      beschrijving: lexicalToText(v.beschrijving),
      profiel: (v.vereisten ?? []).map((r: any) => r.punt).filter(Boolean),
      aanbod: (v.aanbod ?? []).map((a: any) => a.punt).filter(Boolean),
    }));
  } catch {
    return [];
  }
}

export default async function VacaturesPage() {
  const [vacatures, settings] = await Promise.all([getVacatures(), getSettings()]);

  return (
    <>
      <Nav />
      <main>
        <VacaturesClient
          vacatures={vacatures}
          titel={settings.vacatures_titel}
          contactEmail={settings.contact_email}
        />
      </main>
      <Footer linkedin={settings.linkedin} footerTekst={settings.footer_tekst} />
    </>
  );
}
