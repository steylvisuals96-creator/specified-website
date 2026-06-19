import type { CollectionConfig } from "payload";

export const Team: CollectionConfig = {
  slug: "team",
  labels: { singular: "Teamlid", plural: "Team" },
  admin: {
    useAsTitle: "naam",
    group: "Inhoud",
    defaultColumns: ["naam", "functie", "actief", "volgorde"],
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
          name: "functie",
          type: "select",
          label: "Functie",
          options: [
            { label: "Zaakvoerder", value: "zaakvoerder" },
            { label: "Senior makelaar", value: "senior_makelaar" },
            { label: "Makelaar", value: "makelaar" },
            { label: "Vastgoedconsulent", value: "consultant" },
            { label: "Administratie", value: "administratie" },
            { label: "Stagiair", value: "stagiair" },
          ],
        },
      ],
    },
    {
      name: "foto",
      type: "upload",
      relationTo: "media",
      label: "Foto",
    },
    {
      type: "row",
      fields: [
        {
          name: "email",
          type: "email",
          label: "E-mail",
        },
        {
          name: "telefoon",
          type: "text",
          label: "Telefoon",
        },
      ],
    },
    {
      name: "bio",
      type: "richText",
      label: "Bio",
    },
    {
      type: "row",
      fields: [
        {
          name: "volgorde",
          type: "number",
          label: "Volgorde",
          defaultValue: 99,
          admin: { description: "Lager = eerder getoond" },
        },
        {
          name: "actief",
          type: "checkbox",
          label: "Actief / zichtbaar",
          defaultValue: true,
        },
      ],
    },
  ],
  timestamps: true,
};
