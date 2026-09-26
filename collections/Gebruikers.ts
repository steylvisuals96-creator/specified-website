import type { Access, AccessResult, CollectionConfig, FieldAccess } from "payload";
import { isBeheerder, isCreator } from "@/lib/access";

// Wie mag welke gebruiker lezen? Iedereen die ingelogd is ziet de collega's
// (namen bij activiteiten, toewijzingen), maar het creator-account is alleen
// zichtbaar voor de creator zelf.
const lezen: Access = ({ req }): AccessResult => {
  if (!req.user) return false;
  if (isCreator(req.user)) return true;
  return { rol: { not_equals: "creator" } };
};

// Aanmaken: alleen beheerders. Welke rol ze mogen geven, bewaakt het rol-veld.
const aanmaken: Access = ({ req }) => isBeheerder(req.user);

// Bijwerken: iedereen zijn eigen account (naam, wachtwoord); beheerders ook de
// anderen, behalve het creator-account.
const bijwerken: Access = ({ req }): AccessResult => {
  if (!req.user) return false;
  if (isCreator(req.user)) return true;
  if (isBeheerder(req.user)) return { rol: { not_equals: "creator" } };
  return { id: { equals: req.user.id } };
};

// Verwijderen: beheerders, nooit het creator-account en nooit zichzelf.
const verwijderen: Access = ({ req }): AccessResult => {
  if (!req.user) return false;
  if (isCreator(req.user)) return { id: { not_equals: req.user.id } };
  if (isBeheerder(req.user)) {
    return { and: [{ rol: { not_equals: "creator" } }, { id: { not_equals: req.user.id } }] };
  }
  return false;
};

// Het rol-veld: alleen beheerders mogen een rol toekennen of wijzigen, zodat
// een consultant zichzelf geen beheerder kan maken. "creator" toekennen kan
// enkel de creator; de beforeValidate-hook hieronder dwingt dat af.
const rolWijzigen: FieldAccess = ({ req }) => isBeheerder(req.user);

export const Gebruikers: CollectionConfig = {
  slug: "gebruikers",
  auth: {
    // Na 5 foute pogingen 15 minuten geblokkeerd (brute force op wachtwoorden).
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    // Sessie verloopt na 8 uur: een werkdag, niet langer.
    tokenExpiration: 8 * 60 * 60,
    cookies: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    },
  },
  labels: {
    singular: "Gebruiker",
    plural: "Gebruikers",
  },
  admin: {
    useAsTitle: "naam",
    group: "Ruwe gegevens",
  },
  access: {
    read: lezen,
    create: aanmaken,
    update: bijwerken,
    delete: verwijderen,
  },
  hooks: {
    beforeValidate: [
      ({ data, req, originalDoc }) => {
        // Zonder req.user is het vertrouwde servercode (seed-script); anonieme
        // REST-aanroepen komen hier nooit, die houdt de create-regel tegen.
        const nieuweRol = data?.rol;
        if (req.user && nieuweRol === "creator" && originalDoc?.rol !== "creator" && !isCreator(req.user)) {
          throw new Error("Alleen de creator kan de creator-rol toekennen.");
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "naam",
      type: "text",
      label: "Naam",
      required: true,
    },
    {
      name: "rol",
      type: "select",
      label: "Rol",
      defaultValue: "consultant",
      required: true,
      // In het JWT zodat middleware.ts /admin kan afschermen zonder DB-call.
      saveToJWT: true,
      access: {
        create: rolWijzigen,
        update: rolWijzigen,
      },
      options: [
        { label: "Creator (SteylVisuals)", value: "creator" },
        { label: "Beheerder", value: "beheerder" },
        { label: "Recruitment Consultant", value: "consultant" },
      ],
    },
  ],
};
