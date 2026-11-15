// Verschijnt meteen bij elke klik terwijl de server de pagina klaarmaakt.
export default function Laden() {
  return (
    <div aria-busy="true" aria-label="Pagina laden" className="laden">
      <div className="h-[clamp(2.75rem,6vw,4.5rem)] w-[min(380px,70%)] bg-[var(--paneel-sterk)]" />
      <div className="h-[9px] mt-[18px] border-x border-[var(--streep)]" />
      <div className="grid gap-5 mt-10 lg:grid-cols-3">
        <div className="glas h-36" />
        <div className="glas h-36" />
        <div className="glas h-36" />
        <div className="glas h-72 lg:col-span-3" />
      </div>
      <span className="sr-only">Laden</span>
    </div>
  );
}
