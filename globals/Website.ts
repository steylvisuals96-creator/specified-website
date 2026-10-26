import type { GlobalConfig } from "payload";
import { alleenBeheerder } from "@/lib/access";

/**
 * De teksten van de homepage. De standaardwaarden zijn de teksten die nu op de
 * site staan (ze staan ook in lib/inhoud.ts van de website, als terugval).
 * Een leeg veld betekent: de standaardtekst van de website.
 */
export const Website: GlobalConfig = {
  slug: "website",
  label: "Homepage",
  access: {
    // Publiek leesbaar: de website haalt hier haar teksten uit.
    read: () => true,
    update: alleenBeheerder,
  },
  admin: { group: "Ruwe gegevens" },
  fields: [
    {
      name: "hero",
      type: "group",
      label: "Kop bovenaan",
      admin: { description: "De grote titel en de twee knoppen. Voorbeeld: 'We engineer possibilities.'" },
      fields: [
        { name: "prefix", type: "text", label: "Eerste woord", defaultValue: "We" },
        { name: "woord", type: "text", label: "Accentwoord (in limoen)", defaultValue: "engineer" },
        { name: "suffix", type: "text", label: "Tweede regel", defaultValue: "possibilities." },
        { name: "ctaBedrijven", type: "text", label: "Knop voor bedrijven", defaultValue: "Zet onze consultants in" },
        { name: "ctaEngineers", type: "text", label: "Knop voor engineers", defaultValue: "Word consultant" },
      ],
    },
    {
      name: "tekening",
      type: "group",
      label: "Technische tekening",
      admin: { description: "De tekst bij de tekening van het woord SPECIFIED. De tekening wordt opnieuw opgebouwd als je even stopt met typen." },
      fields: [
        { name: "intro", type: "text", label: "Inleiding", defaultValue: "Engineering consultancy uit Antwerpen: onze eigen consultants versterken jouw projecten." },
        { name: "scrollHint", type: "text", label: "Scrollhint", defaultValue: "Scroll om de specificatie te openen." },
        { name: "project", type: "text", label: "Titelblok: project", defaultValue: "We are here to stay" },
        { name: "locatie", type: "text", label: "Titelblok: locatie (stad, regio)", defaultValue: "Kontich, Antwerpen" },
        { name: "waarden", type: "text", label: "Titelblok: waarden", defaultValue: "Drive en verantwoordelijkheid" },
        { name: "akkoord", type: "text", label: "Titelblok: goedkeuring", defaultValue: "Goedgekeurd door Specified" },
      ],
    },
    {
      name: "callouts",
      type: "array",
      label: "Letters van SPECIFIED",
      minRows: 9,
      maxRows: 9,
      admin: {
        description: "Negen regels, één per letter van SPECIFIED, in die volgorde. Het label begint met de letter.",
        initCollapsed: true,
      },
      defaultValue: [
        { label: "Studies", tekst: "tijdelijke ondersteuning" },
        { label: "Projecten", tekst: "en onderhoud" },
        { label: "Elektromechanica", tekst: "onze specialisatie" },
        { label: "Consultants", tekst: "eigen engineers, bij jou ingezet" },
        { label: "Industrie", tekst: "onze partners" },
        { label: "Focus", tekst: "energie, fun en passie" },
        { label: "Integratie", tekst: "systemen en processen" },
        { label: "Extra mile", tekst: "we run the extra mile" },
        { label: "Drive", tekst: "en verantwoordelijkheid" },
      ],
      fields: [
        { name: "label", type: "text", label: "Label", required: true },
        { name: "tekst", type: "text", label: "Toelichting", required: true },
      ],
    },
    {
      name: "consultants",
      type: "group",
      label: "Onze consultants",
      fields: [
        { name: "titel", type: "text", label: "Titel", defaultValue: "Onze" },
        { name: "accent", type: "text", label: "Accentwoord (in limoen)", defaultValue: "consultants." },
        {
          name: "tekst",
          type: "textarea",
          label: "Tekst",
          defaultValue: "Eigen engineers, in dienst van Specified, tijdelijk ingezet bij jouw projecten, onderhoud en studies.",
        },
        {
          name: "profielen",
          type: "array",
          label: "Profielen (schuiven mee met de scroll)",
          defaultValue: [
            { naam: "Civil Engineer" },
            { naam: "Electrical Engineer" },
            { naam: "Automation Engineer" },
            { naam: "Mechanical Engineer" },
            { naam: "Engineering Consultant" },
          ],
          fields: [{ name: "naam", type: "text", label: "Profiel", required: true }],
        },
      ],
    },
    {
      name: "diensten_bedrijven",
      type: "group",
      label: "Blok: voor bedrijven",
      fields: [
        { name: "kop", type: "text", label: "Kop", defaultValue: "Voor bedrijven" },
        { name: "titel", type: "text", label: "Titel", defaultValue: "We design & support projects" },
        {
          name: "tekst",
          type: "textarea",
          label: "Tekst",
          defaultValue:
            "Tijdelijke versterking nodig voor een project, onderhoud of een studie? Wij zetten een eigen consultant in: de juiste persoon op de juiste plek, op het juiste moment. Van projectontwikkeling en systeemintegratie tot het optimaliseren van bestaande processen.",
        },
        { name: "cta", type: "text", label: "Knop", defaultValue: "Zet onze consultants in" },
      ],
    },
    {
      name: "diensten_engineers",
      type: "group",
      label: "Blok: voor engineers",
      fields: [
        { name: "kop", type: "text", label: "Kop", defaultValue: "Voor engineers" },
        { name: "titel", type: "text", label: "Titel", defaultValue: "We engineer possibilities" },
        {
          name: "tekst",
          type: "textarea",
          label: "Tekst",
          defaultValue:
            "Als consultant bij Specified ontdek je verschillende projecten en sectoren zonder je hele carrière op één pad vast te leggen. We begeleiden je keuzes, blijven in gesprek over wat je wil en laten je groeien tot expert of veelzijdige generalist.",
        },
        { name: "cta", type: "text", label: "Knop", defaultValue: "Word consultant" },
      ],
    },
    {
      name: "jobs",
      type: "group",
      label: "Vacatures op de homepage",
      fields: [
        { name: "titel", type: "text", label: "Titel", defaultValue: "Word consultant." },
        { name: "linkTekst", type: "text", label: "Link naar alle vacatures", defaultValue: "Alle vacatures" },
      ],
    },
  ],
};
