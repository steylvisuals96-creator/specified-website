import type { CollectionConfig } from "payload";
import { alleenIngelogd, publiekMits } from "@/lib/access";

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
  // Concepten stonden publiek opvraagbaar via de API, ook al toonde de
  // website ze niet. Een nog niet afgewerkt artikel is nu echt privé.
  access: {
    read: publiekMits({ status: { equals: "gepubliceerd" } }),
    create: alleenIngelogd,
    update: alleenIngelogd,
    delete: alleenIngelogd,
  },
  labels: { singular: "Artikel", plural: "Blog" },
  admin: {
    useAsTitle: "titel",
    group: false,
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
      label: "Coverafbeelding (upload)",
      admin: { description: "Upload een afbeelding. Of gebruik het veld hieronder voor een externe URL." },
    },
    {
      name: "cover_url",
      type: "text",
      label: "Coverafbeelding URL (extern)",
      admin: {
        description: "Alternatief voor upload: plak een directe afbeeldings-URL (bv. van Unsplash).",
      },
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
