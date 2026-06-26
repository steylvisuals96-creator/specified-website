import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Split from "@/components/Split";
import Jobs from "@/components/Jobs";
import Team from "@/components/Team";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
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
