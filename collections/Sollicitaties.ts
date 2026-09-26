import type { CollectionConfig } from "payload";
import { alleenIngelogd } from "@/lib/access";

export const Sollicitaties: CollectionConfig = {
  slug: "sollicitaties",
  access: {
    read: alleenIngelogd,
    create: alleenIngelogd,
    update: alleenIngelogd,
    delete: alleenIngelogd,
  },
  labels: { singular: "Sollicitatie", plural: "Sollicitaties" },
  admin: {
    useAsTitle: "titel",
    group: "Ruwe gegevens",
    defaultColumns: ["titel", "kandidaat", "vacature", "status", "updatedAt"],
  },
  fields: [
    {
      name: "titel",
      type: "text",
      label: "Titel",
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          () => "Sollicitatie",
        ],
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "kandidaat",
          type: "relationship",
          relationTo: "kandidaten",
          label: "Kandidaat",
          required: true,
        },
        {
          name: "vacature",
          type: "relationship",
          relationTo: "vacatures",
          label: "Vacature",
          required: true,
        },
      ],
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      defaultValue: "nieuw",
      options: [
        { label: "Nieuw", value: "nieuw" },
        { label: "In screening", value: "screening" },
        { label: "Telefonisch gescreend", value: "tel_gescreend" },
        { label: "Voorgesteld aan klant", value: "voorgesteld" },
        { label: "Interview gepland", value: "interview_gepland" },
        { label: "Interview afgerond", value: "interview_afgerond" },
        { label: "Aanbod uitgebracht", value: "aanbod" },
        { label: "Geplaatst", value: "geplaatst" },
        { label: "Niet weerhouden", value: "afgewezen" },
        { label: "Teruggetrokken", value: "teruggetrokken" },
      ],
    },
    {
      name: "datum_sollicitatie",
      type: "date",
      label: "Datum sollicitatie",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "datum_interview",
      type: "date",
      label: "Interview datum",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "consultant",
      type: "relationship",
      relationTo: "gebruikers",
      label: "Verantwoordelijke consultant",
    },
    {
      name: "notities",
      type: "textarea",
      label: "Notities / Feedback",
    },
    {
      name: "startdatum",
      type: "date",
      label: "Startdatum (bij plaatsing)",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
  ],
};
