import { metAccent } from "@/lib/accent";

type Job = {
  title: string;
  type: string;
  location: string;
  sector: string;
  ervaring?: string;
  dagen?: number;
};

function versheid(dagen?: number) {
  if (dagen === undefined) return null;
  if (dagen < 1) return { getal: "Nieuw", label: "vandaag online" };
  return { getal: String(dagen), label: dagen === 1 ? "dag online" : "dagen online" };
}

export default function Jobs({ jobs, titel, linkTekst }: { jobs: Job[]; titel?: string; linkTekst?: string }) {
  return (
    <section id="jobs" className="jobs">
      <div className="wrap">
        <div className="jobs__kop">
          <h2 className="display display-l">{metAccent(titel || "Vind jouw volgende stap.")}</h2>
        </div>

        {jobs.length === 0 ? (
          <div className="jobs__leeg">
            <p className="lead">
              Er staan op dit moment geen vacatures online. Stuur ons gerust je cv: we zoeken ook
              buiten de openstaande jobs.
            </p>
            <a href="mailto:info@specified.be?subject=Open%20sollicitatie" className="btn btn-primary">
              Stuur een open sollicitatie
            </a>
          </div>
        ) : (
          <ul className="jobs__lijst">
            {jobs.map((job, i) => {
              const v = versheid(job.dagen);
              return (
                <li key={`${job.title}-${i}`}>
                  <a href="/vacatures" className="jobs__rij">
                    <span className="jobs__vers">
                      {v && (
                        <>
                          <span className="jobs__getal display">{v.getal}</span>
                          <span className="jobs__vers-label">{v.label}</span>
                        </>
                      )}
                    </span>
                    <span className="jobs__titel">{job.title}</span>
                    <span className="jobs__meta">{job.location}</span>
                    <span className="jobs__meta">{job.sector}</span>
                    <span className="jobs__meta">{job.ervaring}</span>
                    <span className="jobs__meta">{job.type}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}

        <a href="/vacatures" className="btn btn-secondary jobs__alle">
          {linkTekst || "Bekijk alle vacatures"}
        </a>
      </div>
    </section>
  );
}
