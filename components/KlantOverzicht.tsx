import Link from "next/link";
import { StatusBadge, fmtDate, knopSecundair } from "@/components/DashboardShell";
import { SECTOR_LABEL } from "@/lib/labels";

/**
 * Het overzicht voor Specified zelf: wat staat er op de website en wat is de
 * volgende handeling. Zij beheren vacatures en blog; sollicitaties komen per
 * mail binnen. De creator ziet het recruitmentoverzicht (dashboard/page.tsx).
 */
const WEBSITE_URL = process.env.WEBSITE_URL ?? "https://specified-website.vercel.app";

const VAC_STATUS: Record<string, { label: string; kleur: string }> = {
  actief: { label: "Open", kleur: "#9bd17f" },
  ingevuld: { label: "Ingevuld", kleur: "#dffd7b" },
  on_hold: { label: "On hold", kleur: "#d9a86c" },
  geannuleerd: { label: "Geannuleerd", kleur: "#6f6d62" },
};

type Vac = { id: string; titel: string; slug?: string | null; status?: string | null; sector?: string | null; locatie?: string | null; zichtbaar_op_website?: boolean | null; uren?: string | null; beschrijving?: any };
type Artikel = { id: string; titel: string; status?: string | null; publicatiedatum?: string | null; updatedAt: string };

const opWebsite = (v: Vac) => v.zichtbaar_op_website !== false && (v.status === "actief" || v.status === "ingevuld");

/** Wat een bezoeker mist als het leeg blijft. */
function ontbreekt(v: Vac): string[] {
  const tekst = v.beschrijving?.root?.children?.some((n: any) => n.children?.some((c: any) => c.text?.trim()));
  return [!tekst && "jobomschrijving", !v.uren && "uren", !v.locatie && "locatie"].filter(Boolean) as string[];
}

export default function KlantOverzicht({
  groet, voornaam, vacatures, artikels, cijfers,
}: {
  groet: string;
  voornaam: string;
  vacatures: Vac[];
  artikels: Artikel[];
  cijfers: { open: number; ingevuld: number; gepubliceerd: number; concepten: number };
}) {
  const tegels = [
    { label: "Open vacatures", waarde: cijfers.open, href: "/dashboard/vacatures" },
    { label: "Ingevulde vacatures", waarde: cijfers.ingevuld, href: "/dashboard/vacatures" },
    { label: "Artikels online", waarde: cijfers.gepubliceerd, href: "/dashboard/blog" },
    { label: "Artikels in concept", waarde: cijfers.concepten, href: "/dashboard/blog" },
  ];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-6 px-5 pt-10 pb-8 sm:px-8 lg:px-10 lg:pt-12">
        <h1 className="kop text-[3.25rem] sm:text-[4.5rem]">
          {groet}
          {voornaam && (
            <>
              ,<br />
              <span className="mens text-[0.9em]">{voornaam}</span>
            </>
          )}
        </h1>
        <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className={knopSecundair}>
          Bekijk de website
        </a>
      </header>

      <section aria-label="Kerncijfers" className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
        {tegels.map((c, i) => (
          <Link
            key={c.label}
            href={c.href}
            className={`group px-5 py-6 transition-colors duration-150 hover:bg-ink-800 sm:px-8 lg:px-10 ${
              i % 2 === 1 ? "border-l border-line" : ""
            } ${i >= 2 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
          >
            <p className="text-sm text-bone-400 transition-colors group-hover:text-bone-100">{c.label}</p>
            <p className="kop mt-3 text-[3.5rem] leading-none tabular sm:text-[4.25rem]">{c.waarde}</p>
          </Link>
        ))}
      </section>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.62fr)]">
        <section aria-labelledby="vac-kop" className="px-5 py-10 sm:px-8 lg:border-r lg:border-line lg:px-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="vac-kop" className="kop text-[2rem]">
              Vacatures
            </h2>
            <Link href="/dashboard/vacatures" className="text-sm text-bone-400 underline-offset-4 hover:text-lime-300 hover:underline">
              Alle vacatures en nieuwe toevoegen
            </Link>
          </div>
          {vacatures.length === 0 ? (
            <p className="mt-6 text-sm text-bone-400">Nog geen vacatures. Voeg de eerste toe onder Vacatures.</p>
          ) : (
            <ul className="mt-5">
              {vacatures.map((v) => {
                const mist = v.status === "actief" ? ontbreekt(v) : [];
                const st = VAC_STATUS[v.status ?? ""] ?? { label: v.status ?? "", kleur: "" };
                return (
                  <li key={v.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-3">
                    <span className="min-w-0">
                      <Link href={`/dashboard/vacatures/${v.id}`} className="block truncate text-sm text-bone-100 hover:text-lime-300">
                        {v.titel}
                      </Link>
                      <span className="block truncate text-sm text-bone-400">
                        {[SECTOR_LABEL[v.sector ?? ""], v.locatie].filter(Boolean).join(", ") || "Geen vakgebied of locatie"}
                        {mist.length > 0 && <span className="text-[#d9a86c]">{`. Nog invullen: ${mist.join(", ")}`}</span>}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      {opWebsite(v) && v.slug ? (
                        <a
                          href={`${WEBSITE_URL}/vacatures/${v.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hidden text-sm text-bone-400 underline-offset-4 hover:text-lime-300 hover:underline sm:inline"
                        >
                          Op de website
                        </a>
                      ) : (
                        <span className="hidden text-sm text-bone-400 sm:inline">Niet zichtbaar</span>
                      )}
                      <StatusBadge label={st.label} kleur={st.kleur} />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="blog-kop" className="border-t border-line px-5 py-10 sm:px-8 lg:border-t-0 lg:px-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="blog-kop" className="kop text-[2rem]">
              Blog
            </h2>
            <Link href="/dashboard/blog/create" className="text-sm text-bone-400 underline-offset-4 hover:text-lime-300 hover:underline">
              Nieuw artikel
            </Link>
          </div>
          {artikels.length === 0 ? (
            <p className="mt-6 text-sm text-bone-400">Nog geen artikels.</p>
          ) : (
            <ul className="mt-5">
              {artikels.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/dashboard/blog/${a.id}/edit`}
                    className="-mx-3 grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line px-3 py-3 transition-colors hover:bg-ink-800"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-bone-100">{a.titel}</span>
                      <span className="block truncate text-sm text-bone-400">
                        {a.status === "gepubliceerd" && a.publicatiedatum ? `Online sinds ${fmtDate(a.publicatiedatum)}` : `Bewerkt op ${fmtDate(a.updatedAt)}`}
                      </span>
                    </span>
                    <StatusBadge label={a.status === "gepubliceerd" ? "Online" : "Concept"} kleur={a.status === "gepubliceerd" ? "#9bd17f" : "#d9a86c"} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-8 text-sm text-bone-400">
            Sollicitaties en aanvragen van de website komen per e-mail binnen, niet in dit dashboard.
          </p>
        </section>
      </div>
    </>
  );
}
