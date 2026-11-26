import Link from "next/link";
import { metAccent } from "@/lib/accent";
import { lokaalPad, type Taal } from "@/lib/taal";
import { ui, versheid } from "@/lib/teksten";

type Job = {
  slug: string;
  title: string;
  type: string;
  location: string;
  sector: string;
  ervaring?: string;
  dagen?: number;
};

export default function Jobs({
  jobs,
  titel,
  linkTekst,
  leeg,
  openKnop,
  taal = "nl",
}: {
  jobs: Job[];
  titel?: string;
  linkTekst?: string;
  /** Tekst en knop als er geen vacatures online staan (beheer: Homepage > Vacatures). */
  leeg?: string;
  openKnop?: string;
  taal?: Taal;
}) {
  const t = ui(taal).jobs;
  const p = (pad: string) => lokaalPad(taal, pad);
  return (
    <section id="jobs" className="jobs">
      <div className="wrap">
        <div className="jobs__kop">
          <h2 className="display display-l" data-bewerk="jobs.titel">{metAccent(titel || t.titel)}</h2>
        </div>

        {jobs.length === 0 ? (
          <div className="jobs__leeg">
            <p className="lead" data-bewerk="jobs.leeg">
              {leeg || t.leeg}
            </p>
            <Link href={p("/open-sollicitatie")} className="btn btn-primary" data-bewerk="jobs.openKnop">
              {openKnop || t.open}
            </Link>
          </div>
        ) : (
          <ul className="jobs__lijst">
            {jobs.map((job) => {
              const v = versheid(job.dagen, taal);
              return (
                <li key={job.slug}>
                  <Link href={p(`/vacatures/${job.slug}`)} className="jobs__rij">
                    <span className="jobs__veeg" aria-hidden="true" />
                    <span className="jobs__vers" data-leeg={!v}>
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
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <Link href={p("/vacatures")} className="btn btn-secondary jobs__alle" data-bewerk="jobs.linkTekst">
          {linkTekst || t.alle}
        </Link>
      </div>
    </section>
  );
}
