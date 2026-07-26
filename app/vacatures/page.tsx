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

const ERVARING_LABEL: Record<string, string> = {
  junior: "Junior (0–2 jaar)",
  medior: "Medior (2–5 jaar)",
  senior: "Senior (5+ jaar)",
  lead: "Lead / Expert",
};

const GROOTTE_LABEL: Record<string, string> = {
  startup: "Startup (< 10)",
  kmo: "KMO (10–50)",
  middelgroot: "Middelgroot (50–250)",
  groot: "Groot (250+)",
};

/** Verzamelt alle tekst onder één node, hoe diep genest ook. */
function nodeText(node: any): string {
  if (typeof node?.text === "string") return node.text;
  if (Array.isArray(node?.children)) return node.children.map(nodeText).join("");
  return "";
}

/**
 * Geeft de omschrijving terug als losse alinea's. De vorige versie plakte
 * elke node met één spatie aan elkaar, waardoor elke jobomschrijving als
 * één ononderbroken muur tekst in het detailpaneel belandde.
 */
function lexicalToParagraphs(richText: any): string[] {
  if (!richText?.root?.children) return [];
  return richText.root.children.map(nodeText).map((t: string) => t.trim()).filter(Boolean);
}

async function getVacatures() {
  try {
    const res = await fetch(
      "https://specified-cms.vercel.app/api/vacatures?where[status][equals]=actief&limit=100&sort=-createdAt",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs ?? [])
      // De recruiter kan een vacature verbergen zonder haar op non-actief te
      // zetten. Dat vinkje werd genegeerd, dus verborgen vacatures stonden live.
      .filter((v: any) => v.zichtbaar_op_website !== false)
      .map((v: any, i: number) => {
        const og = typeof v.opdrachtgever === "object" && v.opdrachtgever ? v.opdrachtgever : null;
        return {
          id: v.id ?? i,
          title: v.titel,
          type: TYPE_LABEL[v.type] ?? v.type ?? "",
          location: v.locatie ?? "België",
          sector: SECTOR_LABEL[v.sector] ?? v.sector ?? "",
          ervaring: v.ervaringsniveau ? ERVARING_LABEL[v.ervaringsniveau] ?? v.ervaringsniveau : "",
          salaris: typeof v.salaris === "string" ? v.salaris.trim() : "",
          // Bewust niet de naam van de opdrachtgever: dat record is een intern
          // CRM-item met contactpersoon en notities. Wél het soort werkgever,
          // want dat is waar een ingenieur op beslist en het is niet herleidbaar.
          opdrachtgever: og
            ? [SECTOR_LABEL[og.sector] ?? og.sector, GROOTTE_LABEL[og.grootte] ?? og.grootte]
                .filter(Boolean)
                .join(" · ")
            : "",
          beschrijving: lexicalToParagraphs(v.beschrijving),
          profiel: (v.vereisten ?? []).map((r: any) => r.punt).filter(Boolean),
          niceToHave: (v.nice_to_have ?? []).map((n: any) => n.punt).filter(Boolean),
          aanbod: (v.aanbod ?? []).map((a: any) => a.punt).filter(Boolean),
        };
      });
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
