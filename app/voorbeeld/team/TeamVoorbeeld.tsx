"use client";

import { useEffect, useMemo, useState } from "react";
import Team from "@/components/Team";
import { getTeam, CMS_URL, type TeamMember } from "@/lib/settings";
import { useVoorbeeld } from "@/lib/useVoorbeeld";

const RELATIES = { foto: "media" };

/**
 * Live voorbeeld van de teamsectie: de bestaande leden, met het teamlid dat je
 * bewerkt vervangen door wat er nu in het formulier staat (of erbij als het
 * nieuw is). Het CMS geeft het id mee in de URL (?id=).
 */
export default function TeamVoorbeeld() {
  const { data } = useVoorbeeld(RELATIES);
  const [leden, setLeden] = useState<TeamMember[] | null>(null);
  const id = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("id");

  useEffect(() => {
    getTeam().then(setLeden);
  }, []);

  const members = useMemo(() => {
    const lijst = leden ?? [];
    if (!data) return lijst;
    const url = data.foto?.url as string | undefined;
    const bewerkt: TeamMember = {
      id: id ?? "nieuw",
      voornaam: data.voornaam,
      achternaam: data.achternaam,
      rol: data.rol,
      bio: data.bio,
      linkedin: data.linkedin,
      fotoUrl: url ? (url.startsWith("http") ? url : `${CMS_URL}${url}`) : undefined,
    };
    const bestaand = lijst.some((m) => String(m.id) === String(id));
    return bestaand ? lijst.map((m) => (String(m.id) === String(id) ? bewerkt : m)) : [...lijst, bewerkt];
  }, [data, leden, id]);

  return <main>{members.length > 0 && <Team members={members} />}</main>;
}
