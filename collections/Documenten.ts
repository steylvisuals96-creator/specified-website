import type { CollectionConfig } from "payload";
import { alleenIngelogd } from "@/lib/access";

/**
 * Privé-uploads: cv's en alles wat aan een kandidaat hangt.
 *
 * Deze collectie bestaat omdat "media" publiek leesbaar is — dat moet ook,
 * want daar staan blogafbeeldingen, teamfoto's en logo's in. Een cv hoort
 * niet in diezelfde bak: dan is het opvraagbaar én downloadbaar door
 * iedereen die de API kent. Voor een kandidaat die in dienst is en stil
 * rondkijkt, is dat het ergste wat er kan gebeuren.
 */
export const Documenten: CollectionConfig = {
  slug: "documenten",
  access: {
    read: alleenIngelogd,
    create: alleenIngelogd,
    update: alleenIngelogd,
    delete: alleenIngelogd,
  },
  labels: { singular: "Document", plural: "Documenten (privé)" },
  admin: {
    group: "Recruitment",
    description: "Cv's en andere vertrouwelijke bestanden. Nooit publiek zichtbaar.",
  },
  upload: {
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      // Ook pasfoto's van kandidaten: even herleidbaar tot een persoon als
      // een cv, en dus even ongeschikt voor de publieke media-collectie.
      "image/*",
    ],
  },
  fields: [
    {
      name: "omschrijving",
      type: "text",
      label: "Omschrijving",
    },
  ],
};
