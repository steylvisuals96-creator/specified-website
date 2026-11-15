import { buildConfig } from "payload";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "path";
import { fileURLToPath } from "url";

import { Vacatures } from "./collections/Vacatures";
import { Kandidaten } from "./collections/Kandidaten";
import { Bedrijven } from "./collections/Bedrijven";
import { Sollicitaties } from "./collections/Sollicitaties";
import { Team } from "./collections/Team";
import { Blog } from "./collections/Blog";
import { Media } from "./collections/Media";
import { Documenten } from "./collections/Documenten";
import { Gebruikers } from "./collections/Gebruikers";
import { Activiteiten } from "./collections/Activiteiten";
import { Instellingen } from "./globals/Instellingen";
import { Website } from "./globals/Website";
import { isCreator } from "./lib/access";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function requireEnv(naam: string): string {
  const waarde = process.env[naam];
  if (!waarde) {
    throw new Error(
      `${naam} ontbreekt. Zet deze omgevingsvariabele in .env.local en in Vercel (alle omgevingen) voor de app start.`
    );
  }
  return waarde;
}

// De website waarin het live voorbeeld van een artikel getoond wordt.
const WEBSITE_URL = process.env.WEBSITE_URL ?? "https://specified-website.vercel.app";

// Payloads eigen beheer is voor de bouwer. Klanten bewerken hun inhoud in het
// dashboard (inclusief het live voorbeeld). Alles verdwijnt daarom uit
// navigatie én routes voor wie geen creator is. Dat is naast de
// toegangsregels en de middleware een derde laag.
const ALLEEN_CREATOR = { hidden: ({ user }: { user?: any }) => !isCreator(user) };
const VOOR_REDACTIE: string[] = [];
const metBeperking = <T extends { slug: string; admin?: any }>(c: T): T =>
  VOOR_REDACTIE.includes(c.slug) ? c : { ...c, admin: { ...c.admin, ...ALLEEN_CREATOR } };

const r2Enabled = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET
);

export default buildConfig({
  plugins: r2Enabled
    ? [
        s3Storage({
          // Niets in de bucket is rechtstreeks opvraagbaar. Alle bestanden
          // lopen via Payload, dat de toegangsregels toepast — anders zou een
          // publieke bucket-URL elke regel hierboven omzeilen.
          acl: "private",
          collections: {
            media: true,
            // Cv's en kandidaatfoto's: korte, ondertekende links in plaats van
            // een permanent adres dat blijft werken zodra iemand het kent.
            documenten: { signedDownloads: { expiresIn: 300 } },
          },
          bucket: process.env.R2_BUCKET!,
          config: {
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID!,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
            },
            region: "auto",
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          },
        }),
      ]
    : [],
  cors: [
    "https://specified-website.vercel.app",
    "https://specified.be",
    "http://localhost:3000",
    "http://localhost:3003",
  ],
  admin: {
    user: "gebruikers",
    livePreview: {
      collections: ["blog", "team"],
      globals: ["website"],
      // De pagina's op de website luisteren naar de berichten van Payload en
      // tonen wat er in het formulier staat, ook niet-bewaarde wijzigingen.
      url: ({ collectionConfig, globalConfig, data }) => {
        if (globalConfig?.slug === "website") return `${WEBSITE_URL}/voorbeeld/home`;
        if (collectionConfig?.slug === "team") return `${WEBSITE_URL}/voorbeeld/team${data?.id ? `?id=${data.id}` : ""}`;
        return `${WEBSITE_URL}/blog/voorbeeld`;
      },
      openByDefault: true,
      breakpoints: [
        { name: "mobiel", label: "Mobiel", width: 390, height: 844 },
        { name: "tablet", label: "Tablet", width: 768, height: 1024 },
      ],
    },
    // Niet automatisch: lokaal staat R2 uit en dan zou de dev-server de
    // S3-uploadcomponent uit de map halen. Nieuwe admin-componenten?
    // `npx tsx scripts/db-migratie.ts importmap`
    importMap: { autoGenerate: false },
    meta: {
      titleSuffix: "— Specified CMS",
      // Zelfde favicon als /dashboard en de website (app/icon.svg): het groene beeldmerk.
      icons: [
        { rel: "icon", type: "image/svg+xml", url: "/icon.svg" },
        { rel: "apple-touch-icon", url: "/apple-icon.png" },
      ],
    },
    components: {
      graphics: {
        Logo: "@/components/SpecifiedLogo#SpecifiedLogo",
        Icon: "@/components/SpecifiedLogo#SpecifiedIcon",
      },
      // Zelfde menu als /dashboard (lib/menu.ts), boven Payloads collectielijst.
      beforeNavLinks: ["@/components/admin/AdminMenu#AdminMenu"],
    },
  },
  collections: [
    // Recruitment
    Vacatures,
    Kandidaten,
    Bedrijven,
    Sollicitaties,
    Activiteiten,
    // Inhoud
    Team,
    Blog,
    // Systeem
    Media,
    Documenten,
    Gebruikers,
  ].map(metBeperking),
  globals: [metBeperking(Instellingen), Website],
  editor: lexicalEditor(),
  // Geen fallback. Deze sleutel ondertekent de sessie-JWT's; een standaard-
  // waarde die in de repo staat, betekent dat iedereen met de broncode een
  // geldig beheerderstoken kan maken zodra een omgeving de variabele mist.
  // Liever meteen stuk bij het opstarten dan stil onveilig draaien.
  secret: requireEnv("PAYLOAD_SECRET"),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  // Database: Supabase (Postgres) zodra DATABASE_URI gezet is, anders nog de
  // oude MongoDB. Dat laatste bestaat alleen voor de overstap en het
  // migratiescript (scripts/migreer-naar-supabase.ts) en verdwijnt daarna.
  db: process.env.DATABASE_URI
    ? postgresAdapter({
        pool: {
          connectionString: process.env.DATABASE_URI,
          // Serverless (Vercel): kleine pool, de Supabase-pooler doet de rest.
          max: 5,
        },
        // Eigen schema: Supabase stelt alleen "public" open via zijn Data API,
        // dus deze tabellen zijn niet via de publieke Supabase-API bereikbaar.
        schemaName: "payload",
        idType: "uuid",
        // Schema-wijzigingen alleen via migraties, nooit stil automatisch.
        push: false,
        migrationDir: path.resolve(dirname, "migrations"),
      })
    : mongooseAdapter({
        url: process.env.MONGODB_URI || "",
      }),
  upload: {
    limits: {
      fileSize: 10000000,
    },
  },
});
