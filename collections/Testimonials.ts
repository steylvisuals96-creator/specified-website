import type { CollectionConfig } from "payload";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  labels: { singular: "Getuigenis", plural: "Getuigenissen" },
  access: { read: () => true },
  admin: {
    useAsTitle: "naam",
    group: "Inhoud",
    defaultColumns: ["naam", "type", "beoordeling", "goedgekeurd", "createdAt"],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "naam",
          type: "text",
          label: "Naam klant",
          required: true,
        },
        {
          name: "type",
          type: "select",
          label: "Type klant",
          options: [
            { label: "Koper", value: "koper" },
            { label: "Verkoper", value: "verkoper" },
            { label: "Huurder", value: "huurder" },
            { label: "Verhuurder", value: "verhuurder" },
          ],
        },
      ],
    },
    {
      name: "tekst",
      type: "textarea",
      label: "Getuigenis",
      required: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "beoordeling",
          type: "select",
          label: "Beoordeling",
          defaultValue: "5",
          options: [
            { label: "⭐⭐⭐⭐⭐ — 5 sterren", value: "5" },
            { label: "⭐⭐⭐⭐ — 4 sterren", value: "4" },
            { label: "⭐⭐⭐ — 3 sterren", value: "3" },
          ],
        },
        {
          name: "pand",
          type: "relationship",
          relationTo: "panden",
          label: "Gekoppeld pand",
        },
      ],
    },
    {
      name: "goedgekeurd",
      type: "checkbox",
      label: "Goedgekeurd voor publicatie",
      defaultValue: false,
    },
  ],
  timestamps: true,
};
