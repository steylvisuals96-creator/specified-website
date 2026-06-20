import type { CollectionConfig } from "payload";

export const Taken: CollectionConfig = {
  slug: "taken",
  labels: {
    singular: "Taak",
    plural: "Taken",
  },
  admin: {
    useAsTitle: "titel",
    group: "CRM",
    defaultColumns: ["titel", "status", "prioriteit", "deadline", "toegewezen_aan", "lead"],
  },
  fields: [
    {
      name: "titel",
      type: "text",
      label: "Taak",
      required: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          label: "Status",
          defaultValue: "open",
          options: [
            { label: "⏳ Open", value: "open" },
            { label: "🔄 Bezig", value: "bezig" },
            { label: "✅ Afgerond", value: "afgerond" },
          ],
        },
        {
          name: "prioriteit",
          type: "select",
          label: "Prioriteit",
          defaultValue: "normaal",
          options: [
            { label: "🔴 Hoog", value: "hoog" },
            { label: "🟡 Normaal", value: "normaal" },
            { label: "🟢 Laag", value: "laag" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "deadline",
          type: "date",
          label: "Deadline",
          admin: {
            date: { pickerAppearance: "dayAndTime" },
          },
        },
        {
          name: "toegewezen_aan",
          type: "relationship",
          relationTo: "gebruikers",
          label: "Toegewezen aan",
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "lead",
          type: "relationship",
          relationTo: "leads",
          label: "Gekoppeld aan lead",
        },
        {
          name: "pand",
          type: "relationship",
          relationTo: "panden",
          label: "Gekoppeld aan pand",
        },
      ],
    },
    {
      name: "beschrijving",
      type: "textarea",
      label: "Beschrijving",
    },
  ],
  timestamps: true,
};
