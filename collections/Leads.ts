import type { CollectionConfig } from "payload";

export const Leads: CollectionConfig = {
  slug: "leads",
  labels: {
    singular: "Lead",
    plural: "Leads",
  },
  admin: {
    useAsTitle: "naam",
    group: "CRM",
    defaultColumns: ["naam", "email", "telefoon", "pand", "status", "createdAt"],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "naam",
          type: "text",
          label: "Naam",
          required: true,
        },
        {
          name: "email",
          type: "email",
          label: "E-mail",
          required: true,
        },
        {
          name: "telefoon",
          type: "text",
          label: "Telefoon",
        },
      ],
    },
    {
      name: "pand",
      type: "relationship",
      relationTo: "panden",
      label: "Geïnteresseerd in pand",
    },
    {
      name: "bericht",
      type: "textarea",
      label: "Bericht",
    },
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          label: "Status",
          defaultValue: "nieuw",
          options: [
            { label: "🆕 Nieuw", value: "nieuw" },
            { label: "📞 Gecontacteerd", value: "gecontacteerd" },
            { label: "📅 Bezoek gepland", value: "bezoek_gepland" },
            { label: "💬 In onderhandeling", value: "onderhandeling" },
            { label: "✅ Afgerond", value: "afgerond" },
            { label: "❌ Niet geïnteresseerd", value: "niet_geinteresseerd" },
          ],
        },
        {
          name: "bron",
          type: "select",
          label: "Bron",
          defaultValue: "website",
          options: [
            { label: "Website", value: "website" },
            { label: "Instagram", value: "instagram" },
            { label: "Immoweb", value: "immoweb" },
            { label: "Telefoon", value: "telefoon" },
            { label: "Doorverwijzing", value: "doorverwijzing" },
          ],
        },
      ],
    },
    {
      name: "notities",
      type: "textarea",
      label: "Interne notities",
    },
    {
      name: "opvolging",
      type: "date",
      label: "Datum opvolging",
      admin: {
        date: {
          pickerAppearance: "dayOnly",
        },
      },
    },
  ],
  timestamps: true,
};
