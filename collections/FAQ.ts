import type { CollectionConfig } from "payload";

export const FAQ: CollectionConfig = {
  slug: "faq",
  labels: { singular: "FAQ vraag", plural: "FAQ" },
  admin: {
    useAsTitle: "vraag",
    group: "Inhoud",
    defaultColumns: ["vraag", "categorie", "volgorde"],
  },
  fields: [
    {
      name: "vraag",
      type: "text",
      label: "Vraag",
      required: true,
    },
    {
      name: "antwoord",
      type: "richText",
      label: "Antwoord",
      required: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "categorie",
          type: "select",
          label: "Categorie",
          options: [
            { label: "Kopen", value: "kopen" },
            { label: "Verkopen", value: "verkopen" },
            { label: "Huren", value: "huren" },
            { label: "Verhuren", value: "verhuren" },
            { label: "Schatting", value: "schatting" },
            { label: "Algemeen", value: "algemeen" },
          ],
        },
        {
          name: "volgorde",
          type: "number",
          label: "Volgorde",
          defaultValue: 99,
        },
      ],
    },
  ],
};
