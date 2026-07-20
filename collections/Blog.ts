import type { CollectionConfig } from "payload";

/** Maakt van "Zo vind je de juiste engineer" → "zo-vind-je-de-juiste-engineer" */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accenten weg (é → e)
    .replace(/[^a-z0-9]+/g, "-")        // niet-alfanumeriek → streepje
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const Blog: CollectionConfig = {
  slug: "blog",
  access: { read: () => true },
  labels: { singular: "Artikel", plural: "Blog" },
  admin: {
    useAsTitle: "titel",
    group: "Inhoud",
    defaultColumns: ["titel", "status", "publicatiedatum", "updatedAt"],
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
      label: "URL (slug)",
      unique: true,
      index: true,
      admin: {
        description: "Wordt automatisch gemaakt uit de titel. Laat leeg tenzij je een eigen URL wil.",
        position: "sidebar",
      },
      hooks: {
        beforeChange: [
          ({ data, value }: { data?: Record<string, any>; value?: string }) => {
            if (value) return slugify(value);
            return data?.titel ? slugify(data.titel) : value;
          },
        ],
      },
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      defaultValue: "concept",
      index: true,
      admin: { position: "sidebar" },
      options: [
        { label: "Concept", value: "concept" },
        { label: "Gepubliceerd", value: "gepubliceerd" },
      ],
    },
    {
      name: "publicatiedatum",
      type: "date",
      label: "Publicatiedatum",
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "auteur",
      type: "relationship",
      relationTo: "team" as any,
      label: "Auteur",
      admin: { position: "sidebar" },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Coverafbeelding",
      admin: { description: "Wordt gebruikt op de blogpagina én bij het delen op LinkedIn/WhatsApp." },
    },
    {
      name: "samenvatting",
      type: "textarea",
      label: "Korte samenvatting",
      admin: { description: "1 à 2 zinnen. Verschijnt in het overzicht en in Google-resultaten." },
    },
    {
      name: "inhoud",
      type: "richText",
      label: "Artikel",
    },
    {
      type: "collapsible",
      label: "SEO (optioneel)",
      admin: { description: "Laat leeg om automatisch de titel en samenvatting te gebruiken." },
      fields: [
        { name: "meta_titel", type: "text", label: "Meta titel" },
        { name: "meta_beschrijving", type: "textarea", label: "Meta beschrijving" },
      ],
    },
  ],
  timestamps: true,
};
