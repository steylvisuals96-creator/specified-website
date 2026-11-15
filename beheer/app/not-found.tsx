import Link from "next/link";

export default function NietGevonden() {
  return (
    <main className="min-h-dvh grid place-items-center px-4">
      <div className="text-center">
        <p className="kop text-[clamp(5rem,18vw,10rem)] text-[var(--limoen)]">404</p>
        <p className="stil mt-2">Deze pagina bestaat niet (meer).</p>
        <Link href="/" className="knop mt-8">
          Naar het overzicht
        </Link>
      </div>
    </main>
  );
}
