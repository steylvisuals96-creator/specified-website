import type { CollectionConfig } from "payload";
import { alleenIngelogd } from "@/lib/access";

export const Media: CollectionConfig = {
  slug: "media",
  // Blijft publiek: hier staan blogafbeeldingen, teamfoto's en logo's die
  // de website moet kunnen tonen. Vertrouwelijke uploads horen daarom in
  // "documenten" — zie collections/Documenten.ts.
  access: {
    read: () => true,
    create: alleenIngelogd,
    update: alleenIngelogd,
    delete: alleenIngelogd,
  },
  labels: {
    singular: "Bestand",
    plural: "Media",
  },
  admin: {
    group: "Ruwe gegevens",
  },
  // Alleen rasterafbeeldingen. Geen SVG of HTML: die worden publiek vanaf het
  // CMS-domein geserveerd en kunnen script bevatten (stored XSS op de admins).
  upload: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alt tekst",
    },
  ],
};
