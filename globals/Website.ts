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
        { name: "prefix", type: "text", maxLength: 20, label: "Eerste woord", defaultValue: "We" },
        { name: "woord", type: "text", maxLength: 24, label: "Accentwoord (in limoen)", defaultValue: "engineer" },
        { name: "suffix", type: "text", maxLength: 30, label: "Tweede regel", defaultValue: "possibilities." },
        { name: "ctaBedrijven", type: "text", maxLength: 40, label: "Knop voor bedrijven", defaultValue: "Zet onze consultants in" },
        { name: "ctaEngineers", type: "text", maxLength: 40, label: "Knop voor engineers", defaultValue: "Word consultant" },
      ],
    },
    {
      name: "tekening",
      type: "group",
      label: "Technische tekening",
      admin: { description: "De tekst bij de tekening van het woord SPECIFIED. De tekening wordt opnieuw opgebouwd als je even stopt met typen." },
      fields: [
        { name: "intro", type: "text", maxLength: 140, label: "Inleiding", defaultValue: "Engineering consultancy uit Antwerpen: onze eigen consultants versterken jouw projecten." },
        { name: "scrollHint", type: "text", maxLength: 60, label: "Scrollhint", defaultValue: "Scroll om de specificatie te openen." },
        { name: "project", type: "text", maxLength: 40, label: "Titelblok: project", defaultValue: "We are here to stay" },
        { name: "locatie", type: "text", maxLength: 40, validate: (v: string | null | undefined) => (!v || v.includes(", ") ? true : "Schrijf stad en regio gescheiden door een komma en spatie, bv. Kontich, Antwerpen."), label: "Titelblok: locatie (stad, regio)", defaultValue: "Kontich, Antwerpen" },
        { name: "waarden", type: "text", maxLength: 40, label: "Titelblok: waarden", defaultValue: "Drive en verantwoordelijkheid" },
        { name: "akkoord", type: "text", maxLength: 40, label: "Titelblok: goedkeuring", defaultValue: "Goedgekeurd door Specified" },
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
        { name: "label", type: "text", maxLength: 24, label: "Label", required: true },
        { name: "tekst", type: "text", maxLength: 44, label: "Toelichting", required: true },
      ],
    },
    {
      name: "consultants",
      type: "group",
      label: "Onze consultants",
      fields: [
        { name: "titel", type: "text", maxLength: 20, label: "Titel", defaultValue: "Onze" },
        { name: "accent", type: "text", maxLength: 24, label: "Accentwoord (in limoen)", defaultValue: "consultants." },
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
          fields: [{ name: "naam", type: "text", maxLength: 36, label: "Profiel", required: true }],
        },
      ],
    },
    {
      name: "diensten_bedrijven",
      type: "group",
      label: "Blok: voor bedrijven",
      fields: [
        { name: "kop", type: "text", maxLength: 30, label: "Kop", defaultValue: "Voor bedrijven" },
        { name: "titel", type: "text", maxLength: 60, label: "Titel", defaultValue: "We design & support projects" },
        {
          name: "tekst",
          type: "textarea",
          label: "Tekst",
          defaultValue:
            "Tijdelijke versterking nodig voor een project, onderhoud of een studie? Wij zetten een eigen consultant in: de juiste persoon op de juiste plek, op het juiste moment. Van projectontwikkeling en systeemintegratie tot het optimaliseren van bestaande processen.",
        },
        { name: "cta", type: "text", maxLength: 40, label: "Knop", defaultValue: "Zet onze consultants in" },
      ],
    },
    {
      name: "diensten_engineers",
      type: "group",
      label: "Blok: voor engineers",
      fields: [
        { name: "kop", type: "text", maxLength: 30, label: "Kop", defaultValue: "Voor engineers" },
        { name: "titel", type: "text", maxLength: 60, label: "Titel", defaultValue: "We engineer possibilities" },
        {
          name: "tekst",
          type: "textarea",
          label: "Tekst",
          defaultValue:
            "Als consultant bij Specified ontdek je verschillende projecten en sectoren zonder je hele carrière op één pad vast te leggen. We begeleiden je keuzes, blijven in gesprek over wat je wil en laten je groeien tot expert of veelzijdige generalist.",
        },
        { name: "cta", type: "text", maxLength: 40, label: "Knop", defaultValue: "Word consultant" },
      ],
    },
    {
      name: "jobs",
      type: "group",
      label: "Vacatures op de homepage",
      fields: [
        { name: "titel", type: "text", maxLength: 40, label: "Titel", defaultValue: "Word consultant." },
        { name: "linkTekst", type: "text", maxLength: 40, label: "Link naar alle vacatures", defaultValue: "Alle vacatures" },
      ],
    },
    {
      // Verhuisd uit Instellingen (2026-10-27). Leeg = de waarde uit Instellingen,
      // en anders de standaard van de website.
      name: "contact",
      type: "group",
      label: "Contact en footer",
      admin: { description: "Getoond in het contactblok en de footer van elke pagina." },
      fields: [
        { name: "email", type: "email", label: "Contact-e-mail" },
        {
          name: "telefoon",
          type: "text",
          maxLength: 30,
          label: "Telefoon",
          validate: (v: string | null | undefined) =>
            !v || /^\+?[0-9 ()./-]{6,30}$/.test(v) ? true : "Alleen cijfers, spaties en + ( ) . / -, bv. +32 3 123 45 67.",
        },
        {
          name: "linkedin",
          type: "text",
          maxLength: 200,
          label: "LinkedIn-pagina",
          validate: (v: string | null | undefined) =>
            !v || /^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(v) ? true : "Plak het volledige adres, beginnend met https://www.linkedin.com/",
        },
        { name: "footerTekst", type: "text", maxLength: 120, label: "Regel onderaan (footer)" },
      ],
    },
  ],
};
