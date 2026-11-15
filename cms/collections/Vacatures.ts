import type { CollectionConfig } from "payload";
import { alleenIngelogd, publiekMits } from "@/lib/access";

/** "Automation Engineer" wordt "automation-engineer". */
function slugify(tekst: string): string {
  return tekst
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export const Vacatures: CollectionConfig = {
  slug: "vacatures",
  // Publiek, maar alleen wat ook echt op de site hoort te staan: actieve
  // vacatures, en ingevulde (die toont de website als "ingevuld", wens van
  // Specified, 2026-11-12). On hold, geannuleerd en verborgen blijven intern.
  access: {
    read: publiekMits({
      and: [{ status: { in: ["actief", "ingevuld"] } }, { zichtbaar_op_website: { not_equals: false } }],
    }),
    create: alleenIngelogd,
    update: alleenIngelogd,
    delete: alleenIngelogd,
  },
  labels: { singular: "Vacature", plural: "Vacatures" },
  admin: {
    useAsTitle: "titel",
    group: false,
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
      // Het adres van de vacature op de website (/vacatures/<slug>). Wordt
      // één keer uit de titel gemaakt en blijft daarna staan, zodat links
      // in Google en in mails niet breken als de titel wijzigt.
      name: "slug",
      type: "text",
      label: "Adres op de website",
      unique: true,
      index: true,
      admin: { readOnly: true, description: "Wordt automatisch gemaakt uit de titel." },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === "string" && value.trim()) return value;
            const basis = slugify(String(data?.titel ?? "")) || "vacature";
            return `${basis}-${Math.random().toString(36).slice(2, 6)}`;
          },
        ],
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "sector",
          type: "select",
          label: "Vakgebied",
          required: true,
          options: [
            { label: "Civiele techniek", value: "civiel" },
            { label: "Elektrotechniek", value: "elektro" },
            { label: "Automatisering", value: "automatisering" },
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
          label: "Salaris (intern)",
          admin: { description: "Alleen voor intern gebruik: de website toont geen salaris." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "uren",
          type: "select",
          label: "Uren",
          options: [
            { label: "Voltijds", value: "voltijds" },
            { label: "Deeltijds", value: "deeltijds" },
            { label: "Voltijds of deeltijds", value: "beide" },
          ],
        },
        {
          name: "opleidingsniveau",
          type: "select",
          label: "Opleidingsniveau",
          options: [
            { label: "Secundair onderwijs", value: "secundair" },
            { label: "Graduaat", value: "graduaat" },
            { label: "Bachelor", value: "bachelor" },
            { label: "Master", value: "master" },
            { label: "Geen diplomavereiste", value: "geen" },
          ],
        },
        {
          name: "talen",
          type: "select",
          label: "Talen",
          hasMany: true,
          options: [
            { label: "Nederlands", value: "nl" },
            { label: "Engels", value: "en" },
            { label: "Frans", value: "fr" },
            { label: "Duits", value: "de" },
          ],
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
      label: "Plaatsingsdatum",
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
