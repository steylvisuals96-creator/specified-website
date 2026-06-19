import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Bestand",
    plural: "Media",
  },
  admin: {
    group: "Instellingen",
  },
  upload: true,
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alt tekst",
    },
  ],
};
