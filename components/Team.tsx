import Image from "next/image";
import { rolLabel, type TeamMember } from "@/lib/settings";
import type { Taal } from "@/lib/taal";
import { ui } from "@/lib/teksten";
import { mediaUrl } from "@/lib/beheer";
import PortretWissel from "@/components/PortretWissel";

// Elke engineerbewerking hoort bij één specifiek bronportret. Een andere
// foto uit het beheer krijgt het effect pas na een bijpassende bewerking.
const ENGINEER_PORTRETTEN: Record<string, { bron: string; engineer: string }> = {
  "c80e8c93-deb9-4944-be51-3feeb93ad7cc": {
    bron: "e2c2c849-b495-4c35-885a-1232e928755e",
    engineer: "6ccda54a-0502-49c4-ac3b-bef599432d10",
  },
  "6976c65f-43b3-4550-9002-174c2253601b": {
    bron: "e9fa1572-376b-476d-8cae-037089410d6b",
    engineer: "8512cd5c-a1b1-4bfe-bfb1-be6b4bc379ad",
  },
};

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
            const portret = ENGINEER_PORTRETTEN[m.id];
            const engineerSrc = portret && m.fotoUrl === mediaUrl(portret.bron) ? mediaUrl(portret.engineer) : undefined;
            return (
              <article key={m.id} className="team__lid">
                <div className="team__foto">
                  {m.fotoUrl && engineerSrc ? (
                    <PortretWissel
                      key={m.fotoUrl}
                      src={m.fotoUrl}
                      engineerSrc={engineerSrc}
                      naam={naam}
                      label={taal === "en" ? `Switch between ${naam}'s portrait and engineer photo` : `Wissel tussen het portret en de engineerfoto van ${naam}`}
                    />
                  ) : m.fotoUrl ? (
                    <Image src={m.fotoUrl} alt={naam} fill sizes="(min-width: 900px) 50vw, 100vw" />
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
