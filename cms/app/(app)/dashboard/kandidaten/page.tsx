export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import type { Where } from "payload";
import { payloadAlsGebruiker } from "@/lib/serverPayload";
import DashboardShell, { PageHeader, Empty, StatusBadge, fmtDate, knopSecundair } from "@/components/DashboardShell";
import KandidaatCreateDrawer from "@/components/KandidaatCreateDrawer";
import ZoekFilter from "@/components/ZoekFilter";
import { KandidaatFoto } from "@/components/KandidaatFoto";
import { BESCHIKBAARHEID_LABEL, KANDIDAAT_STATUS, NIVEAU_LABEL, SECTOR_LABEL, naamVan } from "@/lib/labels";

const opties = (r: Record<string, string>) => Object.entries(r).map(([value, label]) => ({ value, label }));

export default async function KandidatenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sector?: string; niveau?: string; beschikbaarheid?: string }>;
}) {
  const { q, sector, niveau, beschikbaarheid } = await searchParams;
  const sessie = await payloadAlsGebruiker().catch(() => null);
  if (!sessie) redirect("/admin/login");
  const { payload, user, als } = sessie;

  const voorwaarden: Where[] = [];
  if (q)
    voorwaarden.push({
      or: [
        { voornaam: { like: q } },
        { achternaam: { like: q } },
        { naam: { like: q } },
        { email: { like: q } },
        { functietitel: { like: q } },
      ],
    });
  if (sector && Object.hasOwn(SECTOR_LABEL, sector)) voorwaarden.push({ sector: { equals: sector } });
  if (niveau && Object.hasOwn(NIVEAU_LABEL, niveau)) voorwaarden.push({ ervaringsniveau: { equals: niveau } });
  if (beschikbaarheid && Object.hasOwn(BESCHIKBAARHEID_LABEL, beschikbaarheid))
    voorwaarden.push({ beschikbaarheid: { equals: beschikbaarheid } });

  const [docs, totaal] = await Promise.all([
    payload.find({
      collection: "kandidaten",
      limit: 100,
      sort: "-updatedAt",
      depth: 1,
      where: voorwaarden.length ? { and: voorwaarden } : undefined,
      ...als,
    }),
    payload.count({ collection: "kandidaten", ...als }),
  ]);
  const gefilterd = voorwaarden.length > 0;

  return (
    <DashboardShell userName={(user as any).naam || user.email} rol={(user as any).rol}>
      <PageHeader
        title="Kandidaten"
        aantal={totaal.totalDocs}
        actions={
          <>
            <a href="/dashboard/kandidaten/export" className={knopSecundair}>
              CSV exporteren
            </a>
            <KandidaatCreateDrawer />
          </>
        }
      />

      <div className="px-5 sm:px-8 lg:px-10">
        <ZoekFilter
          placeholder="Zoek op naam, e-mail of functietitel"
          defaultValue={q ?? ""}
          filters={[
            { naam: "sector", label: "Sector", opties: opties(SECTOR_LABEL) },
            { naam: "niveau", label: "Ervaringsniveau", opties: opties(NIVEAU_LABEL) },
            { naam: "beschikbaarheid", label: "Beschikbaarheid", opties: opties(BESCHIKBAARHEID_LABEL) },
          ]}
        />
        {gefilterd && (
          <p className="mt-3 text-sm text-bone-400" aria-live="polite">
            {docs.totalDocs} van {totaal.totalDocs} kandidaten
          </p>
        )}
      </div>

      <div className="px-5 pt-6 pb-12 sm:px-8 lg:px-10">
        {docs.docs.length === 0 ? (
          <Empty>
            {gefilterd ? "Geen kandidaten die aan deze filters voldoen." : "Nog geen kandidaten. Voeg de eerste toe met de knop hierboven."}
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-sm whitespace-nowrap">
              <thead>
                <tr className="text-left text-[0.8125rem] text-bone-400">
                  <th scope="col" className="border-b border-line pb-3 pl-5 font-medium">
                    Naam
                  </th>
                  <th scope="col" className="border-b border-line px-4 pb-3 font-medium">
                    Functietitel
                  </th>
                  <th scope="col" className="border-b border-line px-4 pb-3 font-medium">
                    Sector
                  </th>
                  <th scope="col" className="border-b border-line px-4 pb-3 text-right font-medium">
                    Jaren ervaring
                  </th>
                  <th scope="col" className="border-b border-line px-4 pb-3 font-medium">
                    Beschikbaarheid
                  </th>
                  <th scope="col" className="border-b border-line px-4 pb-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="border-b border-line pb-3 pl-4 text-right font-medium">
                    Laatst bijgewerkt
                  </th>
                </tr>
              </thead>
              <tbody>
                {(docs.docs as any[]).map((k) => {
                  const st = KANDIDAAT_STATUS[k.status];
                  const href = `/dashboard/kandidaten/${k.id}`;
                  return (
                    <tr
                      key={k.id}
                      className="group relative transition-colors duration-150 hover:bg-ink-800 focus-within:bg-ink-800"
                    >
                      <td className="border-b border-line py-3 pr-4 pl-5">
                        <span
                          aria-hidden
                          className="absolute inset-y-2 left-0 w-[3px] bg-lime-300 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                        />
                        <Link href={href} className="flex items-center gap-4 font-medium text-bone-100 outline-none after:absolute after:inset-0">
                          <KandidaatFoto kandidaat={k} grootte={44} />
                          {naamVan(k)}
                        </Link>
                      </td>
                      <td className="border-b border-line px-4 py-3 text-bone-100">{k.functietitel || "—"}</td>
                      <td className="border-b border-line px-4 py-3 text-bone-400">{SECTOR_LABEL[k.sector] ?? "—"}</td>
                      <td className="border-b border-line px-4 py-3 text-right tabular text-bone-100">{k.jaren_ervaring ?? "—"}</td>
                      <td className="border-b border-line px-4 py-3 text-bone-400">{BESCHIKBAARHEID_LABEL[k.beschikbaarheid] ?? "—"}</td>
                      <td className="border-b border-line px-4 py-3">
                        {k.status ? <StatusBadge label={st?.label ?? k.status} kleur={st?.kleur ?? ""} /> : "—"}
                      </td>
                      <td className="border-b border-line py-3 pl-4 text-right tabular text-bone-400">{fmtDate(k.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {docs.totalDocs > docs.docs.length && (
          <p className="mt-4 text-sm text-bone-400">
            De eerste {docs.docs.length} van {docs.totalDocs} worden getoond. Verfijn met zoeken of filters.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}
