import type { CollectionConfig } from "payload";

export const Paginas: CollectionConfig = {
  slug: "paginas",
  labels: { singular: "Pagina", plural: "Pagina's" },
  admin: {
    useAsTitle: "titel",
    group: "Inhoud",
    defaultColumns: ["titel", "slug", "gepubliceerd", "updatedAt"],
  },
  fields: [
    {
      name: "titel",
      type: "text",
      label: "Titel",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: "Slug (URL)",
      required: true,
      admin: { description: "Bijv. 'over-ons' → somvastgoed.be/over-ons" },
    },
    {
      name: "inhoud",
      type: "richText",
      label: "Inhoud",
    },
    {
      type: "collapsible",
      label: "SEO",
      fields: [
        {
          name: "seo_titel",
          type: "text",
          label: "SEO Titel",
        },
        {
          name: "seo_beschrijving",
          type: "textarea",
          label: "Meta beschrijving",
          admin: { description: "Max. 160 tekens" },
        },
        {
          name: "seo_afbeelding",
          type: "upload",
          relationTo: "media",
          label: "Social share afbeelding",
        },
      ],
    },
    {
      name: "gepubliceerd",
      type: "checkbox",
      label: "Gepubliceerd",
      defaultValue: false,
    },
  ],
  timestamps: true,
};
