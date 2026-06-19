import type { CollectionConfig } from "payload";

export const Afspraken: CollectionConfig = {
  slug: "afspraken",
  labels: { singular: "Afspraak", plural: "Afspraken" },
  admin: {
    useAsTitle: "titel",
    group: "CRM",
    defaultColumns: ["titel", "type", "datum", "status", "lead"],
  },
  fields: [
    {
      name: "titel",
      type: "text",
      label: "Titel",
      required: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "select",
          label: "Type",
          required: true,
          options: [
            { label: "Bezichtiging", value: "bezichtiging" },
            { label: "Gratis schatting", value: "schatting" },
            { label: "Notariaat", value: "notariaat" },
            { label: "Kennismaking", value: "kennismaking" },
            { label: "Vergadering", value: "vergadering" },
            { label: "Andere", value: "andere" },
          ],
        },
        {
          name: "status",
          type: "select",
          label: "Status",
          defaultValue: "gepland",
          options: [
            { label: "📅 Gepland", value: "gepland" },
            { label: "✅ Bevestigd", value: "bevestigd" },
            { label: "❌ Geannuleerd", value: "geannuleerd" },
            { label: "✔️ Afgerond", value: "afgerond" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "datum",
          type: "date",
          label: "Datum & tijd",
          required: true,
          admin: { date: { pickerAppearance: "dayAndTime" } },
        },
        {
          name: "duur",
          type: "select",
          label: "Duur",
          defaultValue: "60",
          options: [
            { label: "30 minuten", value: "30" },
            { label: "1 uur", value: "60" },
            { label: "1,5 uur", value: "90" },
            { label: "2 uur", value: "120" },
          ],
        },
      ],
    },
    {
      name: "locatie",
      type: "text",
      label: "Locatie / adres",
    },
    {
      type: "row",
      fields: [
        {
          name: "lead",
          type: "relationship",
          relationTo: "leads",
          label: "Klant / lead",
        },
        {
          name: "pand",
          type: "relationship",
          relationTo: "panden",
          label: "Pand",
        },
      ],
    },
    {
      name: "notities",
      type: "textarea",
      label: "Notities",
    },
  ],
  timestamps: true,
};
