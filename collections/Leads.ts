import type { CollectionConfig } from "payload";
import { emailNieuweLead } from "../lib/emailNieuweLead";
import { emailBevestigingLead } from "../lib/emailBevestigingLead";
import { triggerWebhook } from "../lib/webhook";
import { analyseerLead } from "../lib/claude";
import { getPayload } from "payload";
import LeadsActiesCell from "../components/LeadsActiesCell";
import LeadsDuplicatePanel from "../components/LeadsDuplicatePanel";

export const Leads: CollectionConfig = {
  slug: "leads",
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        if (operation === "create") {
          // E-mail notificatie naar SOM Vastgoed
          emailNieuweLead({
            naam: doc.naam,
            email: doc.email,
            telefoon: doc.telefoon,
            bericht: doc.bericht,
            bron: doc.bron,
          }).catch(() => {});

          // Bevestigingsmail naar de lead zelf
          emailBevestigingLead({
            naam: doc.naam,
            email: doc.email,
            bericht: doc.bericht,
          }).catch(() => {});

          // Automatisch opvolgingstaak aanmaken, toegewezen aan makelaar met minste open taken
          try {
            const { default: configPromise } = await import("@payload-config");
            const config = await configPromise;
            const p = await getPayload({ config: config as any });

            // Haal alle makelaars op
            const gebruikers = await p.find({
              collection: "gebruikers",
              limit: 50,
            });

            let toegewezenAan: string | undefined;
            if (gebruikers.docs.length > 0) {
              // Tel open taken per gebruiker, kies degene met de minste
              const taakTelling = await Promise.all(
                gebruikers.docs.map(async (g) => {
                  const taken = await p.find({
                    collection: "taken",
                    where: {
                      and: [
                        { toegewezen_aan: { equals: g.id } },
                        { status: { equals: "open" } },
                      ],
                    },
                    limit: 0,
                  });
                  return { id: g.id as string, count: taken.totalDocs };
                })
              );
              taakTelling.sort((a, b) => a.count - b.count);
              toegewezenAan = taakTelling[0].id;
            }

            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 1);
            await p.create({
              collection: "taken",
              data: {
                titel: `Contacteer lead: ${doc.naam}`,
                status: "open",
                prioriteit: "hoog",
                deadline: deadline.toISOString(),
                lead: doc.id,
                toegewezen_aan: toegewezenAan,
                beschrijving: `Nieuwe lead binnengekomen via ${doc.bron || "website"}. Contacteer zo snel mogelijk.`,
              } as any,
            });
          } catch {}

          // Claude analyse — sla op als notitie
          analyseerLead({
            naam: doc.naam, email: doc.email,
            telefoon: doc.telefoon, bericht: doc.bericht, bron: doc.bron,
          }).then(async (analyse) => {
            if (!analyse) return;
            try {
              const { default: configPromise } = await import("@payload-config");
              const config = await configPromise;
              const p = await getPayload({ config: config as any });
              const bestaand = doc.notities ? `${doc.notities}\n\n` : "";
              await p.update({
                collection: "leads", id: doc.id,
                data: { notities: `${bestaand}🤖 AI-analyse:\n${analyse}` } as any,
              });
            } catch {}
          }).catch(() => {});

          // Zapier/Make webhook
          triggerWebhook("lead.created", {
            id: doc.id, naam: doc.naam, email: doc.email,
            telefoon: doc.telefoon, bron: doc.bron, status: doc.status,
          });
        }

        if (operation === "update") {
          triggerWebhook("lead.updated", {
            id: doc.id, naam: doc.naam, status: doc.status,
          });
        }
      },
    ],
  },
  labels: {
    singular: "Lead",
    plural: "Leads",
  },
  admin: {
    useAsTitle: "naam",
    group: "CRM",
    defaultColumns: ["naam", "email", "telefoon", "pand", "status", "createdAt", "acties"],
    components: {
      beforeListTable: [LeadsDuplicatePanel as any],
    },
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "naam",
          type: "text",
          label: "Naam",
          required: true,
        },
        {
          name: "email",
          type: "email",
          label: "E-mail",
          required: true,
        },
        {
          name: "telefoon",
          type: "text",
          label: "Telefoon",
        },
      ],
    },
    {
      name: "pand",
      type: "relationship",
      relationTo: "panden",
      label: "Geïnteresseerd in pand",
    },
    {
      name: "bericht",
      type: "textarea",
      label: "Bericht",
    },
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          label: "Status",
          defaultValue: "nieuw",
          options: [
            { label: "🆕 Nieuw", value: "nieuw" },
            { label: "📞 Gecontacteerd", value: "gecontacteerd" },
            { label: "📅 Bezoek gepland", value: "bezoek_gepland" },
            { label: "💬 In onderhandeling", value: "onderhandeling" },
            { label: "✅ Afgerond", value: "afgerond" },
            { label: "❌ Niet geïnteresseerd", value: "niet_geinteresseerd" },
          ],
        },
        {
          name: "bron",
          type: "select",
          label: "Bron",
          defaultValue: "website",
          options: [
            { label: "Contactformulier website", value: "contactformulier" },
            { label: "Website", value: "website" },
            { label: "Instagram", value: "instagram" },
            { label: "Immoweb", value: "immoweb" },
            { label: "Telefoon", value: "telefoon" },
            { label: "Doorverwijzing", value: "doorverwijzing" },
          ],
        },
      ],
    },
    {
      name: "toegewezen_aan",
      type: "relationship",
      relationTo: "gebruikers",
      label: "Toegewezen aan",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "notities",
      type: "textarea",
      label: "Interne notities",
    },
    {
      name: "opvolging",
      type: "date",
      label: "Datum opvolging",
      admin: {
        date: {
          pickerAppearance: "dayOnly",
        },
      },
    },
    {
      name: "acties",
      type: "ui",
      admin: {
        components: {
          Cell: LeadsActiesCell as any,
          Field: (() => null) as any,
        },
      },
    },
  ],
  timestamps: true,
};
