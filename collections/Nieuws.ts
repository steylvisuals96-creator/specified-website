import type { CollectionConfig } from "payload";

export const Nieuws: CollectionConfig = {
  slug: "nieuws",
  labels: { singular: "Nieuwsbericht", plural: "Nieuws" },
  access: { read: () => true },
  admin: {
    useAsTitle: "titel",
    group: "Inhoud",
    defaultColumns: ["titel", "categorie", "gepubliceerd", "publicatiedatum"],
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
      label: "Slug",
      required: true,
    },
    {
      name: "samenvatting",
      type: "textarea",
      label: "Samenvatting",
      admin: { description: "Korte intro — verschijnt in overzichten" },
    },
    {
      name: "afbeelding",
      type: "upload",
      relationTo: "media",
      label: "Uitgelichte afbeelding",
    },
    {
      name: "inhoud",
      type: "richText",
      label: "Inhoud",
    },
    {
      type: "row",
      fields: [
        {
          name: "categorie",
          type: "select",
          label: "Categorie",
          options: [
            { label: "Marktnieuws", value: "marktnieuws" },
            { label: "Kooptips", value: "kooptips" },
            { label: "Verkooptips", value: "verkooptips" },
            { label: "Vastgoed nieuws", value: "vastgoednieuws" },
            { label: "Bedrijfsnieuws", value: "bedrijfsnieuws" },
          ],
        },
        {
          name: "publicatiedatum",
          type: "date",
          label: "Publicatiedatum",
          admin: { date: { pickerAppearance: "dayOnly" } },
        },
      ],
    },
    {
      name: "gepubliceerd",
      type: "checkbox",
      label: "Gepubliceerd",
      defaultValue: false,
    },
    {
      type: "collapsible",
      label: "SEO",
      fields: [
        { name: "seo_titel", type: "text", label: "SEO Titel" },
        { name: "seo_beschrijving", type: "textarea", label: "Meta beschrijving" },
      ],
    },
  ],
  timestamps: true,
};
