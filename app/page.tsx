import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Split from "@/components/Split";
import Jobs from "@/components/Jobs";
import Team from "@/components/Team";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import PageShapes from "@/components/PageShapes";

export default function Home() {
  return (
    <>
      <PageShapes />
      <Nav />
      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        <Stats />
        <Split />
        <Jobs />
        <Team />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
