import type { CollectionConfig } from "payload";

export const Kandidaten: CollectionConfig = {
  slug: "kandidaten",
  labels: { singular: "Kandidaat", plural: "Kandidaten" },
  admin: {
    useAsTitle: "naam",
    group: "Recruitment",
    defaultColumns: ["naam", "functietitel", "sector", "status", "updatedAt"],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "voornaam", type: "text", label: "Voornaam", required: true },
        { name: "achternaam", type: "text", label: "Achternaam", required: true },
      ],
    },
    {
      name: "naam",
      type: "text",
      label: "Volledige naam",
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ data }) => `${data?.voornaam ?? ""} ${data?.achternaam ?? ""}`.trim(),
        ],
      },
    },
    {
      type: "row",
      fields: [
        { name: "email", type: "email", label: "E-mail", required: true },
        { name: "telefoon", type: "text", label: "Telefoon" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "sector",
          type: "select",
          label: "Sector",
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
          name: "ervaringsniveau",
          type: "select",
          label: "Niveau",
          options: [
            { label: "Junior (0–2 jaar)", value: "junior" },
            { label: "Medior (2–5 jaar)", value: "medior" },
            { label: "Senior (5+ jaar)", value: "senior" },
            { label: "Lead / Expert", value: "lead" },
          ],
        },
        {
          name: "beschikbaarheid",
          type: "select",
          label: "Beschikbaarheid",
          options: [
            { label: "Onmiddellijk", value: "onmiddellijk" },
            { label: "1 maand opzeg", value: "1_maand" },
            { label: "3 maanden opzeg", value: "3_maanden" },
            { label: "Passief zoekend", value: "passief" },
          ],
        },
      ],
    },
    {
      name: "functietitel",
      type: "text",
      label: "Huidige functietitel",
    },
    {
      name: "huidige_werkgever",
      type: "text",
      label: "Huidige werkgever",
    },
    {
      name: "jaren_ervaring",
      type: "number",
      label: "Jaren ervaring",
      min: 0,
      max: 50,
    },
    {
      name: "skills",
      type: "array",
      label: "Skills / Technologieën",
      fields: [
        { name: "skill", type: "text", label: "Skill", required: true },
      ],
    },
    {
      name: "linkedin",
      type: "text",
      label: "LinkedIn URL",
    },
    {
      name: "cv",
      type: "upload",
      relationTo: "media",
      label: "CV (PDF)",
    },
    {
      name: "status",
      type: "select",
      label: "Pipeline status",
      defaultValue: "nieuw",
      options: [
        { label: "Nieuw", value: "nieuw" },
        { label: "Gescreend", value: "gescreend" },
        { label: "In gesprek", value: "in_gesprek" },
        { label: "Voorgesteld aan klant", value: "voorgesteld" },
        { label: "Interview bij klant", value: "interview_klant" },
        { label: "Geplaatst", value: "geplaatst" },
        { label: "Niet weerhouden", value: "afgewezen" },
        { label: "On hold", value: "on_hold" },
      ],
    },
    {
      name: "gewenst_salaris",
      type: "text",
      label: "Gewenst salaris",
      admin: { description: "bv. €4.000/maand of €650/dag" },
    },
    {
      name: "notities",
      type: "textarea",
      label: "Interne notities",
    },
    {
      name: "foto",
      type: "upload",
      relationTo: "media",
      label: "Foto (optioneel)",
    },
    {
      name: "bron",
      type: "select",
      label: "Herkomst",
      options: [
        { label: "LinkedIn", value: "linkedin" },
        { label: "Website", value: "website" },
        { label: "Aanbeveling", value: "aanbeveling" },
        { label: "Netwerk", value: "netwerk" },
        { label: "Jobboard", value: "jobboard" },
        { label: "Spontane sollicitatie", value: "spontaan" },
      ],
    },
  ],
};
