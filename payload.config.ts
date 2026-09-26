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
    meta: {
      titleSuffix: "— Specified CMS",
    },
    components: {
      graphics: {
        Logo: "@/components/SpecifiedLogo#SpecifiedLogo",
        Icon: "@/components/SpecifiedLogo#SpecifiedIcon",
      },
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
  ],
  globals: [Instellingen],
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
