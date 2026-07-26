import type { CollectionConfig } from "payload";
import { alleenIngelogd, publiekMits } from "@/lib/access";

export const Vacatures: CollectionConfig = {
  slug: "vacatures",
  // Publiek, maar alleen wat ook echt op de site hoort te staan. Voorheen
  // gaf de API ook ingevulde, on-hold en verborgen vacatures terug: de
  // website filterde die weg, de API niet.
  access: {
    read: publiekMits({
      and: [{ status: { equals: "actief" } }, { zichtbaar_op_website: { not_equals: false } }],
    }),
    create: alleenIngelogd,
    update: alleenIngelogd,
    delete: alleenIngelogd,
  },
  labels: { singular: "Vacature", plural: "Vacatures" },
  admin: {
    useAsTitle: "titel",
    group: "Recruitment",
    defaultColumns: ["titel", "sector", "type", "status", "updatedAt"],
  },
  fields: [
    {
      name: "titel",
      type: "text",
      label: "Functietitel",
      required: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "sector",
          type: "select",
          label: "Sector",
          required: true,
          options: [
            { label: "Civiele techniek", value: "civiel" },
            { label: "Elektrotechniek", value: "elektro" },
            { label: "Werktuigbouwkunde", value: "werktuig" },
            { label: "IT & Software", value: "it" },
            { label: "Bouw & Infrastructuur", value: "bouw" },
            { label: "Energie & Utilities", value: "energie" },
            { label: "Industrie & Productie", value: "industrie" },
            { label: "Projectmanagement", value: "projectmanagement" },
          ],
        },
        {
          name: "type",
          type: "select",
          label: "Contract type",
          required: true,
          options: [
            { label: "Vast contract", value: "vast" },
            { label: "Freelance / Zelfstandige", value: "freelance" },
            { label: "Interim", value: "interim" },
            { label: "Studentenjob", value: "student" },
          ],
        },
        {
          name: "status",
          type: "select",
          label: "Status",
          defaultValue: "actief",
          options: [
            { label: "Actief", value: "actief" },
            { label: "On hold", value: "on_hold" },
            { label: "Ingevuld", value: "ingevuld" },
            { label: "Geannuleerd", value: "geannuleerd" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "locatie",
          type: "text",
          label: "Locatie",
          defaultValue: "België",
        },
        {
          name: "ervaringsniveau",
          type: "select",
          label: "Ervaringsniveau",
          options: [
            { label: "Junior (0–2 jaar)", value: "junior" },
            { label: "Medior (2–5 jaar)", value: "medior" },
            { label: "Senior (5+ jaar)", value: "senior" },
            { label: "Lead / Expert", value: "lead" },
          ],
        },
        {
          name: "salaris",
          type: "text",
          label: "Salaris (indicatie)",
          admin: { description: "bv. €3.500–€4.500/maand of €600/dag" },
        },
      ],
    },
    {
      name: "opdrachtgever",
      type: "relationship",
      relationTo: "bedrijven",
      label: "Opdrachtgever",
    },
    {
      name: "beschrijving",
      type: "richText",
      label: "Jobomschrijving",
    },
    {
      name: "vereisten",
      type: "array",
      label: "Vereisten / Must-haves",
      fields: [
        { name: "punt", type: "text", label: "Vereiste", required: true },
      ],
    },
    {
      name: "nice_to_have",
      type: "array",
      label: "Nice-to-haves",
      fields: [
        { name: "punt", type: "text", label: "Punt", required: true },
      ],
    },
    {
      name: "aanbod",
      type: "array",
      label: "Wat bieden wij?",
      fields: [
        { name: "punt", type: "text", label: "Voordeel", required: true },
      ],
    },
    {
      name: "gepubliceerd_op",
      type: "date",
      label: "Gepubliceerd op",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "zichtbaar_op_website",
      type: "checkbox",
      label: "Toon op website",
      defaultValue: true,
    },
  ],
};
