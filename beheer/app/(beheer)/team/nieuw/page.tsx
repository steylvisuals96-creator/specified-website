import type { Metadata } from "next";
import Paginakop from "@/components/Paginakop";
import TeamFormulier from "@/components/TeamFormulier";
import { vereisSessie } from "@/lib/sessie";
import { media } from "@/lib/data";
import { BEHEER_URL, WEBSITE_URL } from "@/lib/website";

export const metadata: Metadata = { title: "Teamlid toevoegen" };

export default async function NieuwTeamlid() {
  await vereisSessie();
  return (
    <>
      <Paginakop titel="Nieuw" accent="teamlid" terug={{ href: "/team", label: "Heel het team" }} vul={8} />
      <TeamFormulier media={await media()} websiteUrl={WEBSITE_URL} beheerUrl={BEHEER_URL} />
    </>
  );
}
