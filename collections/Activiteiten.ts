import type { CollectionConfig } from "payload";

export const Activiteiten: CollectionConfig = {
  slug: "activiteiten",
  labels: { singular: "Activiteit", plural: "Activiteiten" },
  admin: {
    useAsTitle: "onderwerp",
    group: "Recruitment",
    defaultColumns: ["onderwerp", "type", "kandidaat", "bedrijf", "datum"],
  },
  access: { read: () => true, create: () => true, update: () => true },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "select",
          label: "Type",
          defaultValue: "email",
          required: true,
          options: [
            { label: "📧 E-mail", value: "email" },
            { label: "📞 Telefoon", value: "telefoon" },
            { label: "📅 Meeting", value: "meeting" },
            { label: "📝 Notitie", value: "notitie" },
          ],
        },
        {
          name: "richting",
          type: "select",
          label: "Richting",
          defaultValue: "uitgaand",
          options: [
            { label: "Uitgaand", value: "uitgaand" },
            { label: "Inkomend", value: "inkomend" },
          ],
        },
        {
          name: "datum",
          type: "date",
          label: "Datum",
          required: true,
          defaultValue: () => new Date().toISOString(),
          admin: { date: { displayFormat: "dd/MM/yyyy HH:mm" } },
        },
      ],
    },
    {
      name: "onderwerp",
      type: "text",
      label: "Onderwerp",
      required: true,
    },
    {
      name: "inhoud",
      type: "textarea",
      label: "Inhoud / samenvatting",
    },
    {
      type: "row",
      fields: [
        { name: "van", type: "email", label: "Van" },
        { name: "naar", type: "email", label: "Naar" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "kandidaat",
          type: "relationship",
          relationTo: "kandidaten",
          label: "Kandidaat",
          hasMany: false,
        },
        {
          name: "bedrijf",
          type: "relationship",
          relationTo: "bedrijven",
          label: "Bedrijf",
          hasMany: false,
        },
      ],
    },
    {
      name: "emailId",
      type: "text",
      label: "E-mail ID (deduplicatie)",
      admin: { hidden: true },
    },
  ],
  timestamps: true,
};
