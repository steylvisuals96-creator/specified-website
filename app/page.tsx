import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Split from "@/components/Split";
import Jobs from "@/components/Jobs";
import Team from "@/components/Team";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import PageShapes from "@/components/PageShapes";

export const revalidate = 60;

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

async function getRecentJobs() {
  try {
    const res = await fetch(
      "https://specified-cms.vercel.app/api/vacatures?where[status][equals]=actief&limit=5&sort=-createdAt",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs ?? []).map((v: any) => ({
      title: v.titel,
      type: TYPE_LABEL[v.type] ?? v.type ?? "Vast",
      location: v.locatie ?? "België",
      sector: SECTOR_LABEL[v.sector] ?? v.sector ?? "",
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const jobs = await getRecentJobs();

  return (
    <>
      <PageShapes />
      <Nav />
      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        <Stats />
        <Split />
        <Jobs jobs={jobs} />
        <Team />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
