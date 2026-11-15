import Nav from "@/components/Nav";
import Glans from "@/components/Glans";
import Paginawissel from "@/components/Paginawissel";
import { isBeheerder, vereisSessie } from "@/lib/sessie";

export default async function BeheerLayout({ children }: { children: React.ReactNode }) {
  const s = await vereisSessie({ ookZonderTweestap: true });
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[236px_minmax(0,1fr)]">
      <Nav naam={s.naam} beheerder={isBeheerder(s)} />
      <Glans />
      <main className="min-w-0 w-full max-w-[1240px] px-4 md:px-[clamp(1.5rem,4vw,3.5rem)] py-8 md:py-[clamp(2rem,5vh,3.5rem)] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <Paginawissel>{children}</Paginawissel>
      </main>
      {/* Ruimte onder de tabbalk op de telefoon */}
      <div className="md:hidden h-[calc(5rem+env(safe-area-inset-bottom))]" aria-hidden="true" />
    </div>
  );
}
