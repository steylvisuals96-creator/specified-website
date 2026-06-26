import type { CollectionConfig } from "payload";

export const Nieuwbouw: CollectionConfig = {
  slug: "nieuwbouw",
  labels: { singular: "Nieuwbouwproject", plural: "Nieuwbouw" },
  admin: {
    useAsTitle: "naam",
    group: "Vastgoed",
    defaultColumns: ["naam", "locatie", "status", "uitgelicht"],
  },
  fields: [
    // Basisinfo
    {
      type: "row",
      fields: [
        { name: "naam", type: "text", label: "Projectnaam", required: true },
        { name: "promotor", type: "text", label: "Promotor/Ontwikkelaar" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "slug",
          type: "text",
          label: "Slug (URL)",
          required: true,
          admin: { description: "Bijv. 'residentie-de-linde' → /nieuwbouw/residentie-de-linde" },
        },
        {
          name: "status",
          type: "select",
          label: "Status",
          required: true,
          defaultValue: "in_verkoop",
          options: [
            { label: "In verkoop", value: "in_verkoop" },
            { label: "In opbouw", value: "in_opbouw" },
            { label: "Opgeleverd", value: "opgeleverd" },
            { label: "Uitverkocht", value: "uitverkocht" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "locatie", type: "text", label: "Locatie (gemeente)", required: true },
        { name: "type", type: "text", label: "Type (bijv. Appartementen, Woningen)" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "aantal_eenheden", type: "number", label: "Aantal eenheden" },
        { name: "prijs_vanaf", type: "text", label: "Prijs vanaf (bijv. € 249.000)" },
        { name: "oplevering", type: "text", label: "Verwachte oplevering (bijv. Q3 2026)" },
      ],
    },

    // Afbeeldingen
    {
      name: "hoofdfoto",
      type: "upload",
      relationTo: "media",
      label: "Hoofdfoto",
    },
    {
      name: "fotos",
      type: "array",
      label: "Fotogalerij",
      fields: [
        { name: "foto", type: "upload", relationTo: "media", label: "Foto" },
      ],
    },

    // Beschrijving
    {
      name: "beschrijving",
      type: "richText",
      label: "Beschrijving",
    },

    // Instellingen
    {
      type: "row",
      fields: [
        {
          name: "uitgelicht",
          type: "checkbox",
          label: "Uitgelicht op homepage",
          defaultValue: false,
        },
        {
          name: "gepubliceerd",
          type: "checkbox",
          label: "Gepubliceerd",
          defaultValue: true,
        },
      ],
    },
  ],
  timestamps: true,
};
