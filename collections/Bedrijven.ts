import type { CollectionConfig } from "payload";
import { alleenIngelogd } from "@/lib/access";

export const Bedrijven: CollectionConfig = {
  slug: "bedrijven",
  // Stond publiek leesbaar en gaf zo contactpersoon, e-mailadres en de
  // interne relatiestatus van elke klant prijs. De website heeft deze
  // collectie niet nodig; het dashboard leest via de Local API.
  access: {
    read: alleenIngelogd,
    create: alleenIngelogd,
    update: alleenIngelogd,
    delete: alleenIngelogd,
  },
  labels: { singular: "Bedrijf", plural: "Bedrijven" },
  admin: {
    useAsTitle: "naam",
    group: "Ruwe gegevens",
    defaultColumns: ["naam", "sector", "contactpersoon", "updatedAt"],
  },
  fields: [
    { name: "naam", type: "text", label: "Bedrijfsnaam", required: true },
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
          ],
        },
        {
          name: "grootte",
          type: "select",
          label: "Bedrijfsgrootte",
          options: [
            { label: "Startup (< 10)", value: "startup" },
            { label: "KMO (10–50)", value: "kmo" },
            { label: "Middelgroot (50–250)", value: "middelgroot" },
            { label: "Groot (250+)", value: "groot" },
          ],
        },
      ],
    },
    {
      name: "contactpersoon",
      type: "text",
      label: "Contactpersoon",
    },
    {
      type: "row",
      fields: [
        { name: "email", type: "email", label: "E-mail" },
        { name: "telefoon", type: "text", label: "Telefoon" },
      ],
    },
    {
      name: "website",
      type: "text",
      label: "Website",
    },
    {
      name: "locatie",
      type: "text",
      label: "Locatie / Regio",
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      label: "Logo",
    },
    {
      name: "notities",
      type: "textarea",
      label: "Notities",
    },
    {
      name: "relatiestatus",
      type: "select",
      label: "Relatiestatus",
      defaultValue: "prospect",
      options: [
        { label: "Prospect", value: "prospect" },
        { label: "Actieve klant", value: "actief" },
        { label: "Slapende klant", value: "slapend" },
        { label: "Voormalige klant", value: "voormalig" },
      ],
    },
  ],
};
