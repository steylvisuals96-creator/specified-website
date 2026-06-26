import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import VacaturesClient from "@/components/VacaturesClient";

export const metadata = {
  title: "Vacatures — Specified",
  description: "Bekijk alle openstaande engineering vacatures bij Specified. Vaste en interim posities in bouw, infra, manufacturing en meer.",
};

export default function VacaturesPage() {
  return (
    <>
      <Nav />
      <main>
        <VacaturesClient />
      </main>
      <Footer />
    </>
  );
}
