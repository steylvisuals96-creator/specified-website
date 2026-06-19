import type { CollectionConfig } from "payload";

export const Panden: CollectionConfig = {
  slug: "panden",
  labels: {
    singular: "Pand",
    plural: "Panden",
  },
  admin: {
    useAsTitle: "titel",
    group: "Vastgoed",
    defaultColumns: ["titel", "type", "prijs", "status", "updatedAt"],
  },
  fields: [
    {
      name: "titel",
      type: "text",
      label: "Titel",
      required: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "select",
          label: "Type",
          required: true,
          options: [
            { label: "Woning", value: "woning" },
            { label: "Appartement", value: "appartement" },
            { label: "Grond", value: "grond" },
            { label: "Commercieel", value: "commercieel" },
            { label: "Nieuwbouw", value: "nieuwbouw" },
          ],
        },
        {
          name: "transactie",
          type: "select",
          label: "Transactie",
          required: true,
          options: [
            { label: "Te koop", value: "koop" },
            { label: "Te huur", value: "huur" },
          ],
        },
        {
          name: "status",
          type: "select",
          label: "Status",
          defaultValue: "beschikbaar",
          options: [
            { label: "Beschikbaar", value: "beschikbaar" },
            { label: "Onder bod", value: "onder_bod" },
            { label: "Verkocht", value: "verkocht" },
            { label: "Verhuurd", value: "verhuurd" },
          ],
        },
      ],
    },
    {
      name: "prijs",
      type: "number",
      label: "Prijs (€)",
      required: true,
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Locatie",
          fields: [
            {
              name: "adres",
              type: "text",
              label: "Adres",
            },
            {
              type: "row",
              fields: [
                {
                  name: "gemeente",
                  type: "text",
                  label: "Gemeente",
                },
                {
                  name: "postcode",
                  type: "text",
                  label: "Postcode",
                },
              ],
            },
          ],
        },
        {
          label: "Details",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "slaapkamers",
                  type: "number",
                  label: "Slaapkamers",
                },
                {
                  name: "badkamers",
                  type: "number",
                  label: "Badkamers",
                },
                {
                  name: "bewoonbare_opp",
                  type: "number",
                  label: "Bewoonbare opp. (m²)",
                },
                {
                  name: "perceelgrootte",
                  type: "number",
                  label: "Perceelgrootte (m²)",
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "bouwjaar",
                  type: "number",
                  label: "Bouwjaar",
                },
                {
                  name: "epc",
                  type: "text",
                  label: "EPC-label",
                },
                {
                  name: "garage",
                  type: "checkbox",
                  label: "Garage",
                },
                {
                  name: "tuin",
                  type: "checkbox",
                  label: "Tuin",
                },
                {
                  name: "terras",
                  type: "checkbox",
                  label: "Terras",
                },
              ],
            },
            {
              name: "beschrijving",
              type: "richText",
              label: "Beschrijving",
            },
          ],
        },
        {
          label: "Media",
          fields: [
            {
              name: "hoofdfoto",
              type: "upload",
              relationTo: "media",
              label: "Hoofdfoto",
            },
            {
              name: "fotos",
              type: "array",
              label: "Foto's",
              fields: [
                {
                  name: "foto",
                  type: "upload",
                  relationTo: "media",
                  label: "Foto",
                },
              ],
            },
            {
              name: "video_url",
              type: "text",
              label: "Video URL (Instagram Reel / YouTube)",
            },
          ],
        },
      ],
    },
    {
      name: "uitgelicht",
      type: "checkbox",
      label: "Uitgelicht op homepage",
      defaultValue: false,
    },
  ],
};
