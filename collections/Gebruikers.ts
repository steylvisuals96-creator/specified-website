import type { CollectionConfig } from "payload";

export const Gebruikers: CollectionConfig = {
  slug: "gebruikers",
  auth: true,
  labels: {
    singular: "Gebruiker",
    plural: "Gebruikers",
  },
  admin: {
    useAsTitle: "naam",
    group: "Instellingen",
  },
  fields: [
    {
      name: "naam",
      type: "text",
      label: "Naam",
      required: true,
    },
    {
      name: "rol",
      type: "select",
      label: "Rol",
      defaultValue: "makelaar",
      options: [
        { label: "Beheerder", value: "beheerder" },
        { label: "Makelaar", value: "makelaar" },
      ],
    },
  ],
};
