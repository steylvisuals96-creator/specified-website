import type { CollectionConfig } from "payload";
import { alleenIngelogd, publiekMits } from "@/lib/access";

export const Team: CollectionConfig = {
  slug: "team",
  labels: { singular: "Teamlid", plural: "Team" },
  // Publieke sitecontent, maar alleen de teamleden die ook getoond worden.
  access: {
    read: publiekMits({ actief: { not_equals: false } }),
    create: alleenIngelogd,
    update: alleenIngelogd,
    delete: alleenIngelogd,
  },
  admin: {
    useAsTitle: "naam",
    group: "Ruwe gegevens",
    defaultColumns: ["naam", "rol", "actief", "volgorde"],
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
          ({ data }: { data?: Record<string, string> }) =>
            `${data?.voornaam ?? ""} ${data?.achternaam ?? ""}`.trim(),
        ],
      },
    },
    {
      name: "rol",
      type: "select",
      label: "Rol",
      options: [
        { label: "Managing Partner", value: "managing_partner" },
        { label: "Senior Recruitment Consultant", value: "senior_consultant" },
        { label: "Recruitment Consultant", value: "consultant" },
        { label: "Talent Acquisition Specialist", value: "talent" },
        { label: "Office Manager", value: "office" },
      ],
    },
    {
      name: "bio",
      type: "textarea",
      label: "Bio",
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
        { name: "email", type: "email", label: "E-mail" },
        { name: "linkedin", type: "text", label: "LinkedIn URL" },
      ],
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
