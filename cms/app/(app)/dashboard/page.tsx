export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import DashboardShell, { StatusBadge, knopSecundair } from "@/components/DashboardShell";
import SysteemStatus from "@/components/SysteemStatus";
import KlantOverzicht from "@/components/KlantOverzicht";
import { SOLLICITATIE_FASEN, KANDIDAAT_STATUS, naamVan, SECTOR_LABEL } from "@/lib/labels";

const TZ = "Europe/Brussels";

function groet(nu: Date) {
  const uur = Number(nu.toLocaleString("nl-BE", { hour: "numeric", hour12: false, timeZone: TZ }));
  if (uur < 12) return "Goedemorgen";
  if (uur < 18) return "Goedemiddag";
  return "Goedenavond";
}

/** Begin van vandaag, deze week (maandag) en dit kwartaal, in Belgische tijd. */
function grenzen(nu: Date) {
  const lokaal = new Date(nu.toLocaleString("en-US", { timeZone: TZ }));
  const verschil = nu.getTime() - lokaal.getTime();
  const dag = new Date(lokaal);
  dag.setHours(0, 0, 0, 0);
  const morgen = new Date(dag);
  morgen.setDate(dag.getDate() + 1);
  const week = new Date(dag);
  week.setDate(dag.getDate() - ((dag.getDay() + 6) % 7));
  const volgendeWeek = new Date(week);
  volgendeWeek.setDate(week.getDate() + 7);
  const kwartaal = new Date(dag.getFullYear(), Math.floor(dag.getMonth() / 3) * 3, 1);
  const utc = (d: Date) => new Date(d.getTime() + verschil).toISOString();
  return { dag: utc(dag), morgen: utc(morgen), week: utc(week), volgendeWeek: utc(volgendeWeek), kwartaal: utc(kwartaal) };
}

const tijd = (d: string) => new Date(d).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

export default async function DashboardPage() {
  const sessie = await payloadAlsGebruiker().catch(() => null);
  if (!sessie) redirect("/admin/login");
  const { payload, user, als } = sessie;

  const nu = new Date();
  const naam = ((user as { naam?: string }).naam || user.email || "").trim();
  const voornaam = naam.includes("@") ? "" : naam.split(" ")[0];

  // Specified zelf beheert vacatures en blog; het recruitmentoverzicht
  // hieronder is alleen voor de creator.
  if ((user as { rol?: string }).rol !== "creator") {
    const [vacs, open, ingevuld, artikels, online, concepten] = await Promise.all([
      payload.find({ collection: "vacatures", sort: "-updatedAt", limit: 8, depth: 0, ...als }),
      payload.count({ collection: "vacatures", where: { status: { equals: "actief" } }, ...als }),
      payload.count({ collection: "vacatures", where: { status: { equals: "ingevuld" } }, ...als }),
      payload.find({ collection: "blog", sort: "-updatedAt", limit: 5, depth: 0, ...als }),
      payload.count({ collection: "blog", where: { status: { equals: "gepubliceerd" } }, ...als }),
      payload.count({ collection: "blog", where: { status: { equals: "concept" } }, ...als }),
    ]);
    return (
      <DashboardShell userName={naam} rol={(user as { rol?: string }).rol}>
        <KlantOverzicht
          groet={groet(nu)}
          voornaam={voornaam}
          vacatures={vacs.docs as any[]}
          artikels={artikels.docs as any[]}
          cijfers={{ open: open.totalDocs, ingevuld: ingevuld.totalDocs, gepubliceerd: online.totalDocs, concepten: concepten.totalDocs }}
        />
        <footer className="border-t border-line px-5 py-5 sm:px-8 lg:px-10">
          <SysteemStatus />
        </footer>
      </DashboardShell>
    );
  }

  const g = grenzen(nu);

  const [vacatures, nieuweSoll, interviews, geplaatst, alleSoll, agenda, kandidaten, recenteSoll] = await Promise.all([
    payload.count({ collection: "vacatures", where: { status: { equals: "actief" } }, ...als }),
    payload.count({ collection: "sollicitaties", where: { status: { equals: "nieuw" } }, ...als }),
    payload.count({
      collection: "sollicitaties",
      where: { datum_interview: { greater_than_equal: g.week, less_than: g.volgendeWeek } },
      ...als,
    }),
    payload.count({
      collection: "sollicitaties",
      where: { status: { equals: "geplaatst" }, updatedAt: { greater_than_equal: g.kwartaal } },
      ...als,
    }),
    payload.find({ collection: "sollicitaties", limit: 1000, depth: 0, select: { status: true }, pagination: false, ...als }),
    payload.find({
      collection: "activiteiten",
      where: { type: { equals: "meeting" }, datum: { greater_than_equal: g.dag, less_than: g.morgen } },
      sort: "datum",
      limit: 8,
      depth: 1,
      ...als,
    }),
    payload.find({ collection: "kandidaten", sort: "-createdAt", limit: 5, depth: 0, ...als }),
    payload.find({ collection: "sollicitaties", sort: "-updatedAt", limit: 5, depth: 1, ...als }),
  ]);

  const perFase = new Map<string, number>();
  for (const s of alleSoll.docs as { status?: string | null }[]) {
    const st = s.status ?? "nieuw";
    perFase.set(st, (perFase.get(st) ?? 0) + 1);
  }
  const fasen = SOLLICITATIE_FASEN.map((f) => ({ ...f, aantal: perFase.get(f.value) ?? 0 }));
  const max = Math.max(1, ...fasen.map((f) => f.aantal));

  const cijfers = [
    { label: "Open vacatures", waarde: vacatures.totalDocs, href: "/dashboard/vacatures" },
    { label: "Nieuwe sollicitaties", waarde: nieuweSoll.totalDocs, href: "/dashboard/sollicitaties" },
    { label: "Interviews deze week", waarde: interviews.totalDocs, href: "/dashboard/pipeline" },
    { label: "Geplaatst dit kwartaal", waarde: geplaatst.totalDocs, href: "/dashboard/pipeline" },
  ];

  return (
    <DashboardShell userName={naam} rol={(user as { rol?: string }).rol}>
      <header className="px-5 pt-10 pb-8 sm:px-8 lg:px-10 lg:pt-12">
        <h1 className="kop text-[3.25rem] sm:text-[4.5rem]">
          {groet(nu)}
          {voornaam && (
            <>
              ,<br />
              <span className="mens text-[0.9em]">{voornaam}</span>
            </>
          )}
        </h1>
      </header>

      <section aria-label="Kerncijfers" className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
        {cijfers.map((c, i) => (
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
        <section aria-labelledby="pipeline-kop" className="px-5 py-10 sm:px-8 lg:border-r lg:border-line lg:px-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="pipeline-kop" className="kop text-[2rem]">
              Pipeline
            </h2>
            <Link href="/dashboard/pipeline" className="text-sm text-bone-400 underline-offset-4 hover:text-lime-300 hover:underline">
              Naar het bord
            </Link>
          </div>
          <ul className="mt-7 space-y-4">
            {fasen.map((f) => (
              <li key={f.value} className="grid grid-cols-[9.5rem_1fr_2.5rem] items-center gap-4 sm:grid-cols-[12rem_1fr_3rem]">
                <span className="truncate text-sm text-bone-100">{f.label}</span>
                <span className="h-3 bg-ink-800" aria-hidden>
                  <span
                    className="block h-full bg-lime-300"
                    style={{ width: `${(f.aantal / max) * 100}%`, opacity: f.aantal ? 1 : 0 }}
                  />
                </span>
                <span className="text-right text-sm tabular text-bone-100">{f.aantal}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="agenda-kop" className="flex flex-col border-t border-line px-5 py-10 sm:px-8 lg:border-t-0 lg:px-10">
          <h2 id="agenda-kop" className="kop text-[2rem]">
            Vandaag in de agenda
          </h2>
          {agenda.docs.length === 0 ? (
            <p className="mt-7 text-sm text-bone-400">Geen afspraken vandaag.</p>
          ) : (
            <ul className="mt-5">
              {(agenda.docs as any[]).map((a) => {
                const wie = a.kandidaat && typeof a.kandidaat === "object" ? naamVan(a.kandidaat) : a.bedrijf?.naam;
                return (
                  <li key={a.id} className="grid grid-cols-[4rem_1fr] gap-4 border-b border-line py-3.5 last:border-b-0">
                    <span className="text-sm tabular text-bone-400">{tijd(a.datum)}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-bone-100">{a.onderwerp}</span>
                      {wie && <span className="block truncate text-sm text-bone-400">{wie}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href="/dashboard/agenda" className={`${knopSecundair} mt-6 w-full lg:mt-auto`}>
            Volledige agenda
          </Link>
        </section>
      </div>

      <div className="grid border-t border-line lg:grid-cols-2">
        <section aria-labelledby="nieuw-kop" className="px-5 py-10 sm:px-8 lg:border-r lg:border-line lg:px-10">
          <h2 id="nieuw-kop" className="kop text-[2rem]">
            Nieuwe kandidaten
          </h2>
          {kandidaten.docs.length === 0 ? (
            <p className="mt-6 text-sm text-bone-400">Nog geen kandidaten.</p>
          ) : (
            <ul className="mt-5">
              {(kandidaten.docs as any[]).map((k) => (
                <li key={k.id}>
                  <Link
                    href={`/dashboard/kandidaten/${k.id}`}
                    className="-mx-3 grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line px-3 py-3 transition-colors hover:bg-ink-800"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-bone-100">{naamVan(k)}</span>
                      <span className="block truncate text-sm text-bone-400">
                        {[k.functietitel, SECTOR_LABEL[k.sector]].filter(Boolean).join(", ") || "Geen functie ingevuld"}
                      </span>
                    </span>
                    <StatusBadge label={KANDIDAAT_STATUS[k.status]?.label ?? k.status} kleur={KANDIDAAT_STATUS[k.status]?.kleur ?? ""} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="soll-kop" className="border-t border-line px-5 py-10 sm:px-8 lg:border-t-0 lg:px-10">
          <h2 id="soll-kop" className="kop text-[2rem]">
            Laatst bijgewerkt
          </h2>
          {recenteSoll.docs.length === 0 ? (
            <p className="mt-6 text-sm text-bone-400">Nog geen sollicitaties.</p>
          ) : (
            <ul className="mt-5">
              {(recenteSoll.docs as any[]).map((s) => {
                const fase = SOLLICITATIE_FASEN.find((f) => f.value === s.status);
                return (
                  <li key={s.id}>
                    <Link
                      href={`/dashboard/sollicitaties/${s.id}`}
                      className="-mx-3 grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line px-3 py-3 transition-colors hover:bg-ink-800"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-bone-100">
                          {typeof s.kandidaat === "object" && s.kandidaat ? naamVan(s.kandidaat) : "Kandidaat"}
                        </span>
                        <span className="block truncate text-sm text-bone-400">
                          {typeof s.vacature === "object" && s.vacature ? s.vacature.titel : "Vacature"}
                        </span>
                      </span>
                      <StatusBadge label={fase?.label ?? s.status} kleur={fase?.kleur ?? ""} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <footer className="border-t border-line px-5 py-5 sm:px-8 lg:px-10">
        <SysteemStatus />
      </footer>
    </DashboardShell>
  );
}
