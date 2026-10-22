"use client";

import { motion, MotionConfig } from "framer-motion";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

type Vacature = {
  id: string | number;
  title: string;
  type: string;
  location: string;
  sector: string;
  ervaring: string;
  salaris: string;
  opdrachtgever: string;
  beschrijving: string[];
  profiel: string[];
  niceToHave: string[];
  aanbod: string[];
};

const ALLE = "Alle";

/** Het contracttype krijgt een vet label; een vaste positie in limoen. */
function typeChip(type: string) {
  return `vac-chip vac-chip--type${type === "Vast" ? " vac-chip--vast" : ""}`;
}

/** De losse waarden die in deze lijst écht voorkomen. */
function opties(vacatures: Vacature[], veld: keyof Vacature): string[] {
  return Array.from(new Set(vacatures.map((v) => v[veld] as string).filter(Boolean)));
}

function FilterGroep({
  label,
  waarden,
  actief,
  onKies,
}: {
  label: string;
  waarden: string[];
  actief: string;
  onKies: (v: string) => void;
}) {
  // Eén optie kan niets filteren. Zo'n knop belooft controle die er niet is,
  // dus tonen we de groep pas als er echt iets te kiezen valt.
  if (waarden.length < 2) return null;

  return (
    <fieldset className="vac-filtergroep">
      {/* Het label staat op een eigen regel: naast de knoppen liepen die bij
          het afbreken onder het label door en oogde de rij rafelig. */}
      <legend>{label}</legend>
      <div className="vac-filtergroep__knoppen">
        {[ALLE, ...waarden].map((w) => (
          <button key={w} type="button" className="vac-filter" aria-pressed={actief === w} onClick={() => onKies(w)}>
            {w}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function VacaturesClient({ vacatures, titel, contactEmail }: { vacatures: Vacature[]; titel?: string; contactEmail?: string }) {
  const mail = contactEmail || "info@specified.be";
  const sectors = opties(vacatures, "sector");
  const types = opties(vacatures, "type");
  const ervaringen = opties(vacatures, "ervaring");

  const [activeSector, setActiveSector] = useState(ALLE);
  const [activeType, setActiveType] = useState(ALLE);
  const [activeErvaring, setActiveErvaring] = useState(ALLE);
  const [selected, setSelected] = useState<string | number | null>(null);

  const filtered = vacatures.filter(
    (v) =>
      (activeSector === ALLE || v.sector === activeSector) &&
      (activeType === ALLE || v.type === activeType) &&
      (activeErvaring === ALLE || v.ervaring === activeErvaring)
  );

  const selectedJob = vacatures.find((v) => v.id === selected);

  // De ondertitel beschreef altijd "vaste en interim posities", ook toen er
  // geen enkele interimpositie openstond. Nu volgt hij de werkelijke lijst.
  const TYPE_MEERVOUD: Record<string, string> = {
    Vast: "vaste posities",
    Interim: "interimopdrachten",
    Freelance: "freelanceopdrachten",
    Student: "studentenjobs",
  };
  const typeOmschrijving = types
    .map((t) => TYPE_MEERVOUD[t] ?? t.toLowerCase())
    .reduce((zin, deel, i, arr) => {
      if (i === 0) return deel;
      return i === arr.length - 1 ? `${zin} en ${deel}` : `${zin}, ${deel}`;
    }, "");

  return (
    // Respecteert "beweging beperken" van het besturingssysteem.
    <MotionConfig reducedMotion="user">
    <section className="pagina">
      <div className="pagina__inner">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="pagina__kop"
        >
          <h1 className="pagina__titel">{titel || "Jouw volgende stap."}</h1>
          <p className="pagina__intro">
            {filtered.length} vacature{filtered.length !== 1 ? "s" : ""} als engineering consultant bij Specified
            {typeOmschrijving ? `, ${typeOmschrijving}` : ""}.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          className="vac-filters"
        >
          {/* Elke dimensie krijgt een eigen rij met een naam. Voorheen stonden
              twee groepen in één rij, gescheiden door een lijn van 1px op 8%
              wit — op mobiel onzichtbaar, waardoor twee actieve knoppen als
              één meervoudige selectie lazen. */}
          <FilterGroep label="Sector" waarden={sectors} actief={activeSector} onKies={setActiveSector} />
          <FilterGroep label="Contract" waarden={types} actief={activeType} onKies={setActiveType} />
          <FilterGroep label="Ervaring" waarden={ervaringen} actief={activeErvaring} onKies={setActiveErvaring} />
        </motion.div>

        {/* Two-column layout */}
        <div className="vac-grid" data-open={selectedJob ? "true" : undefined}>

          {/* Job list */}
          <div className="vac-lijst">
            {filtered.length === 0 && <p className="pagina__leeg">Geen vacatures gevonden voor deze filters.</p>}
            {filtered.map((job, i) => (
              <motion.button
                key={job.id}
                initial={{ opacity: 0, transform: "translateY(12px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                transition={{ duration: 0.25, delay: Math.min(i, 4) * 0.04, ease: EASE }}
                type="button"
                aria-expanded={selected === job.id}
                onClick={() => setSelected(selected === job.id ? null : job.id)}
                className="vac-rij"
              >
                <div className="vac-rij__tekst">
                  <span className="vac-rij__titel">{job.title}</span>
                  <span className="vac-rij__meta">
                    {[job.location, job.sector, job.ervaring, job.salaris].filter(Boolean).join(", ")}
                  </span>
                </div>
                <div className="vac-rij__rechts">
                  <span className={typeChip(job.type)}>{job.type}</span>
                  <span className="vac-rij__actie">{selected === job.id ? "Sluiten" : "Bekijk"}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Job detail panel */}
          {selectedJob && (
            <motion.div
              key={String(selectedJob.id)}
              initial={{ opacity: 0, transform: "translateX(12px)" }}
              animate={{ opacity: 1, transform: "translateX(0px)" }}
              transition={{ duration: 0.25, ease: EASE }}
              className="vac-detail"
            >
              <div>
                <div className="vac-detail__chips">
                  <span className={typeChip(selectedJob.type)}>{selectedJob.type}</span>
                  {[selectedJob.location, selectedJob.ervaring, selectedJob.salaris, selectedJob.opdrachtgever]
                    .filter(Boolean)
                    .map((chip) => (
                      <span key={chip} className="vac-chip">
                        {chip}
                      </span>
                    ))}
                </div>
                <h2 className="vac-detail__titel">{selectedJob.title}</h2>
                <div className="vac-detail__tekst">
                  {selectedJob.beschrijving.map((alinea, i) => (
                    <p key={i}>{alinea}</p>
                  ))}
                </div>
              </div>

              {selectedJob.profiel.length > 0 && (
                <div>
                  <p className="vac-detail__label">Jouw profiel</p>
                  <ul className="vac-detail__lijst">
                    {selectedJob.profiel.map((p) => (
                      <li key={p}>
                        <span className="vac-detail__teken">-</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.niceToHave.length > 0 && (
                <div>
                  <p className="vac-detail__label">Nice to have</p>
                  <ul className="vac-detail__lijst">
                    {selectedJob.niceToHave.map((n) => (
                      <li key={n}>
                        <span className="vac-detail__teken vac-detail__teken--rustig">+</span>
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.aanbod.length > 0 && (
                <div>
                  <p className="vac-detail__label">Wat we bieden</p>
                  <ul className="vac-detail__lijst">
                    {selectedJob.aanbod.map((a) => (
                      <li key={a}>
                        <span aria-hidden className="vac-detail__streep" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a href={`mailto:${mail}?subject=Sollicitatie: ${selectedJob.title}`} className="btn btn-primary">
                Solliciteer voor deze job
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
    </MotionConfig>
  );
}
