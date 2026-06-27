import type { GlobalConfig } from "payload";

export const Instellingen: GlobalConfig = {
  slug: "instellingen",
  label: "Specified — Instellingen",
  admin: {
    group: "Instellingen",
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
      ],
    },

    {
      type: "collapsible",
      label: "Homepage — Hero sectie",
      fields: [
        {
          name: "hero_tagline",
          type: "text",
          label: "Tagline (klein boven titel)",
          defaultValue: "Engineering recruitment",
        },
        {
          name: "hero_titel",
          type: "text",
          label: "Titel regel 1",
          defaultValue: "De juiste engineer.",
        },
        {
          name: "hero_titel_accent",
          type: "text",
          label: "Titel regel 2 (lime accent kleur)",
          defaultValue: "Elke keer.",
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
