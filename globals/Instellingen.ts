import type { GlobalConfig } from "payload";

export const Instellingen: GlobalConfig = {
  slug: "instellingen",
  label: "Kantoor instellingen",
  admin: {
    group: "Instellingen",
  },
  fields: [
    {
      name: "naam",
      type: "text",
      label: "Naam kantoor",
      required: true,
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      label: "Logo",
    },
    {
      type: "row",
      fields: [
        {
          name: "kleur_primair",
          type: "text",
          label: "Primaire kleur (hex)",
          defaultValue: "#B8843A",
        },
        {
          name: "kleur_donker",
          type: "text",
          label: "Donkere kleur (hex)",
          defaultValue: "#0A0A0A",
        },
      ],
    },
    {
      name: "contact_email",
      type: "email",
      label: "Contact e-mail",
    },
    {
      name: "contact_telefoon",
      type: "text",
      label: "Telefoonnummer",
    },
    {
      name: "adres",
      type: "text",
      label: "Adres kantoor",
    },
    {
      type: "row",
      fields: [
        {
          name: "instagram",
          type: "text",
          label: "Instagram URL",
        },
        {
          name: "facebook",
          type: "text",
          label: "Facebook URL",
        },
        {
          name: "linkedin",
          type: "text",
          label: "LinkedIn URL",
        },
      ],
    },
  ],
};
