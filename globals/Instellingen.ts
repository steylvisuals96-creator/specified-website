import type { GlobalConfig } from "payload";
import { alleenBeheerder } from "@/lib/access";

export const Instellingen: GlobalConfig = {
  slug: "instellingen",
  label: "Specified — Instellingen",
  access: {
    // Publiek leesbaar: de website haalt hier haar teksten uit.
    read: () => true,
    // Wijzigen alleen door beheerders (en de creator), niet door consultants.
    update: alleenBeheerder,
  },
  admin: {
    group: false,
  },
  fields: [
    {
      name: "naam",
      type: "text",
      label: "Naam",
      defaultValue: "Specified",
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      label: "Logo",
    },

    {
      type: "collapsible",
      label: "E-mail logging (BCC)",
      fields: [
        {
          name: "bcc_logging_email",
          type: "email",
          label: "BCC logging adres",
          admin: {
            description: "BCC dit adres op elke mail naar een kandidaat of bedrijf zodat ze automatisch als activiteit worden gelogd. Bv. log@inbound.specified.be (Postmark inbound adres).",
          },
        },
      ],
    },

    {
      type: "collapsible",
      label: "Contact informatie",
      fields: [
        {
          name: "contact_email",
          type: "email",
          label: "E-mail",
          defaultValue: "info@specified.be",
        },
        {
          name: "telefoon",
          type: "text",
          label: "Telefoon",
        },
        {
          name: "adres",
          type: "text",
          label: "Adres",
          defaultValue: "Kontich, België",
        },
        {
          name: "linkedin",
          type: "text",
          label: "LinkedIn URL",
          defaultValue: "https://www.linkedin.com/company/specified-be",
        },
        {
          name: "footer_tekst",
          type: "text",
          label: "Footer — bedrijfsregel",
          defaultValue: "© 2026 Specified BV — Kontich, België",
        },
      ],
    },

    {
      type: "collapsible",
      label: "Homepage — Hero sectie",
      fields: [
        {
          name: "hero_prefix",
          type: "text",
          label: "Titel — vast woord vóór",
          defaultValue: "We",
          admin: { description: "Bv. 'We' in 'We engineer possibilities'." },
        },
        {
          name: "hero_woorden",
          type: "array",
          label: "Titel — wisselende woorden (lime, animeren)",
          admin: { description: "Deze woorden wisselen elkaar automatisch af in de accentkleur." },
          fields: [{ name: "woord", type: "text", label: "Woord", required: true }],
        },
        {
          name: "hero_suffix",
          type: "text",
          label: "Titel — vast woord ná",
          defaultValue: "possibilities.",
          admin: { description: "Bv. 'possibilities.' in 'We engineer possibilities'." },
        },
        {
          name: "hero_tagline",
          type: "text",
          label: "Tagline (klein boven titel)",
          defaultValue: "Engineering recruitment",
        },
        {
          name: "hero_subtitel",
          type: "textarea",
          label: "Subtitel",
          defaultValue: "Specified verbindt technische toptalenten met ambitieuze ingenieurbureaus en industriële bedrijven. Eerlijk, snel en persoonlijk.",
        },
        {
          name: "hero_cta_tekst",
          type: "text",
          label: "CTA knop tekst",
          defaultValue: "Bekijk vacatures",
        },
        {
          name: "hero_cta_2_tekst",
          type: "text",
          label: "Secundaire CTA tekst",
          defaultValue: "Neem contact op",
        },
      ],
    },

    {
      type: "collapsible",
      label: "Homepage — Diensten (twee blokken)",
      fields: [
        {
          type: "row",
          fields: [
            { name: "kandidaten_tag", type: "text", label: "Blok 1 — label", defaultValue: "Voor kandidaten" },
            { name: "bedrijven_tag", type: "text", label: "Blok 2 — label", defaultValue: "Voor bedrijven" },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "kandidaten_titel", type: "text", label: "Blok 1 — titel", defaultValue: "Jouw carrière verdient een echte partner" },
            { name: "bedrijven_titel", type: "text", label: "Blok 2 — titel", defaultValue: "Engineering talent dat echt het verschil maakt" },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "kandidaten_tekst", type: "textarea", label: "Blok 1 — tekst", defaultValue: "We luisteren eerst. Pas daarna zoeken we. Samen bepalen we welke stap écht past bij wie jij bent en waar je naartoe wil groeien als engineer." },
            { name: "bedrijven_tekst", type: "textarea", label: "Blok 2 — tekst", defaultValue: "Geen CV-schieten. Wij screenen diep, valideren technisch en leveren enkel kandidaten die passen bij jouw cultuur, stack en ambitie." },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "kandidaten_cta", type: "text", label: "Blok 1 — knop", defaultValue: "Bekijk openstaande jobs" },
            { name: "bedrijven_cta", type: "text", label: "Blok 2 — knop", defaultValue: "Vertel ons wat je zoekt" },
          ],
        },
      ],
    },

    {
      type: "collapsible",
      label: "Homepage — Sectietitels & sectorbalk",
      fields: [
        { name: "jobs_titel", type: "text", label: "Jobs — sectietitel", defaultValue: "Vind jouw volgende stap." },
        { name: "jobs_link_tekst", type: "text", label: "Jobs — link tekst", defaultValue: "Alle vacatures" },
        { name: "contact_titel", type: "text", label: "Contact — sectietitel", defaultValue: "Laten we kennismaken." },
        { name: "vacatures_titel", type: "text", label: "Vacaturepagina — titel", defaultValue: "Jouw volgende stap." },
        {
          name: "sectoren",
          type: "array",
          label: "Sectorbalk (scrollende woorden)",
          admin: { description: "De sectoren die onderaan de hero voorbijscrollen." },
          fields: [{ name: "naam", type: "text", label: "Sector", required: true }],
        },
      ],
    },

    {
      name: "statistieken",
      type: "array",
      label: "Statistieken (homepage)",
      maxRows: 4,
      fields: [
        { name: "waarde", type: "text", label: "Waarde (bv. 150+)", required: true },
        { name: "label", type: "text", label: "Label", required: true },
      ],
    },

    {
      type: "collapsible",
      label: "Homepage — Over ons sectie",
      fields: [
        {
          name: "over_titel",
          type: "text",
          label: "Titel",
          defaultValue: "Twee founders.",
        },
        {
          name: "over_titel_accent",
          type: "text",
          label: "Accent deel",
          defaultValue: "Eén missie.",
        },
        {
          name: "over_tekst",
          type: "textarea",
          label: "Introductietekst",
        },
      ],
    },

    {
      type: "collapsible",
      label: "SEO & Meta",
      fields: [
        {
          name: "meta_titel",
          type: "text",
          label: "Meta titel",
          defaultValue: "Specified — Engineering Recruitment",
        },
        {
          name: "meta_beschrijving",
          type: "textarea",
          label: "Meta beschrijving",
          defaultValue: "Specified verbindt technische toptalenten met ingenieurbureaus en industriële bedrijven in België.",
        },
      ],
    },
  ],
};
