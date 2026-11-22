import { rolLabel, type TeamMember } from "@/lib/settings";
import type { Taal } from "@/lib/taal";
import { ui } from "@/lib/teksten";

const FALLBACK: TeamMember[] = [
  {
    id: "tom",
    voornaam: "Tom",
    achternaam: "Wijdooghe",
    rol: "managing_partner",
    bio: "Founder & partner at Specified. Tom is a seasoned professional within engineering consultancy. Eager to make a change in the consultancy world with over 10 years' experience in the industry. Always ready to go the extra mile.",
    linkedin: "https://www.linkedin.com/in/tom-wijdooghe/",
    fotoUrl: "/images/team/IMG_5734-768x1024.jpg",
  },
  {
    id: "simon",
    voornaam: "Simon",
    achternaam: "Claeys",
    rol: "managing_partner",
    bio: "Founder & partner at Specified. A former engineer who understands like no other what drives candidates and what companies really need to grow.",
    linkedin: "https://www.linkedin.com/in/simon-claeys-specified/",
    fotoUrl: "/images/team/Simon-768x1024.jpeg",
  },
];

export default function Team({
  members,
  titel,
  titelAccent,
  taal = "nl",
}: {
  members?: TeamMember[];
  titel?: string;
  titelAccent?: string;
  taal?: Taal;
}) {
  const lijst = members && members.length > 0 ? members : FALLBACK;
  const t = ui(taal).team;

  return (
    <section id="over-ons" className="team">
      <div className="wrap">
        <h2 className="display display-l team__kop">
          {titel || t.titel}{" "}
          <span className="human team__accent">{titelAccent || t.accent}</span>
        </h2>

        <div className="team__grid">
          {lijst.map((m) => {
            const naam = [m.voornaam, m.achternaam].filter(Boolean).join(" ");
            return (
              <article key={m.id} className="team__lid">
                <div className="team__foto">
                  {m.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.fotoUrl} alt={naam} loading="lazy" />
                  ) : (
                    <span className="display team__foto-leeg">{naam}</span>
                  )}
                  {/* Placeholder tot de echte handtekening er is (DESIGN.md). */}
                  <span className="team__signatuur human" aria-hidden="true">
                    {m.voornaam}
                  </span>
                </div>
                <div className="team__kaart">
                  <h3 className="display team__naam">{naam}</h3>
                  {m.rol && <p className="team__rol">{rolLabel(m.rol)}</p>}
                  {m.bio && <p className="team__bio">{m.bio}</p>}
                  {m.linkedin && (
                    <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-link team__linkedin">
                      {t.linkedin(m.voornaam ?? "")}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
