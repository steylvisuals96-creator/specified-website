import type { GlobalConfig } from "payload";

export const Instellingen: GlobalConfig = {
  slug: "instellingen",
  label: "Kantoor instellingen",
  admin: {
    group: "Instellingen",
  },
  fields: [
    // --- Algemeen ---
    {
      name: "naam",
      type: "text",
      label: "Naam kantoor",
      required: true,
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      label: "Logo",
    },
    {
      type: "row",
      fields: [
        {
          name: "kleur_primair",
          type: "text",
          label: "Primaire kleur (hex)",
          defaultValue: "#facb04",
        },
        {
          name: "kleur_donker",
          type: "text",
          label: "Donkere kleur (hex)",
          defaultValue: "#111111",
        },
      ],
    },

    // --- Contact ---
    {
      type: "collapsible",
      label: "Contact informatie",
      fields: [
        {
          name: "contact_email",
          type: "email",
          label: "E-mail",
        },
        {
          type: "row",
          fields: [
            {
              name: "telefoon_hasselt",
              type: "text",
              label: "Telefoon Hasselt",
            },
            {
              name: "telefoon_genk",
              type: "text",
              label: "Telefoon Genk",
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "adres_hasselt",
              type: "text",
              label: "Adres Hasselt",
            },
            {
              name: "adres_genk",
              type: "text",
              label: "Adres Genk",
            },
          ],
        },
      ],
    },

    // --- Hero sectie ---
    {
      type: "collapsible",
      label: "Homepage — Hero sectie",
      fields: [
        {
          name: "hero_tagline",
          type: "text",
          label: "Tagline (klein boven titel)",
          defaultValue: "Vastgoed in Hasselt & omgeving",
        },
        {
          name: "hero_titel",
          type: "text",
          label: "Titel regel 1",
          defaultValue: "Uw droomwoning",
        },
        {
          name: "hero_titel_cursief",
          type: "text",
          label: "Titel regel 2 (cursief/geel)",
          defaultValue: "gevonden.",
        },
        {
          name: "hero_subtitel",
          type: "textarea",
          label: "Subtitel",
          defaultValue: "Gevestigd makelaarskantoor met vestigingen in Hasselt en Genk. Persoonlijke begeleiding van A tot Z.",
        },
      ],
    },

    // --- Over ons sectie ---
    {
      type: "collapsible",
      label: "Homepage — Over ons sectie",
      fields: [
        {
          name: "over_titel",
          type: "text",
          label: "Titel",
          defaultValue: "Over",
        },
        {
          name: "over_titel_cursief",
          type: "text",
          label: "Cursief deel van titel",
          defaultValue: "SOM Vastgoed",
        },
        {
          name: "over_tekst_1",
          type: "textarea",
          label: "Alinea 1",
          defaultValue: "Met SOM Vastgoed kiest u voor een gevestigd professioneel kantoor met vestigingen in de provincie Limburg in Hasselt en Genk. Wij begeleiden u persoonlijk — van eerste bezichtiging tot sleuteloverdracht.",
        },
        {
          name: "over_tekst_2",
          type: "textarea",
          label: "Alinea 2",
        },
        {
          name: "over_foto",
          type: "upload",
          relationTo: "media",
          label: "Foto (optioneel)",
        },
      ],
    },

    // --- Statistieken ---
    {
      name: "statistieken",
      type: "array",
      label: "Statistieken (homepage)",
      maxRows: 4,
      fields: [
        { name: "waarde", type: "text", label: "Waarde", required: true },
        { name: "label", type: "text", label: "Label", required: true },
      ],
    },

    // --- Social media ---
    {
      type: "collapsible",
      label: "Social media",
      fields: [
        {
          type: "row",
          fields: [
            { name: "instagram", type: "text", label: "Instagram URL" },
            { name: "facebook", type: "text", label: "Facebook URL" },
            { name: "linkedin", type: "text", label: "LinkedIn URL" },
          ],
        },
      ],
    },
  ],
};
