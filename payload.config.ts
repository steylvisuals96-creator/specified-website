import { buildConfig } from "payload";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "path";
import { fileURLToPath } from "url";

import { Vacatures } from "./collections/Vacatures";
import { Kandidaten } from "./collections/Kandidaten";
import { Bedrijven } from "./collections/Bedrijven";
import { Sollicitaties } from "./collections/Sollicitaties";
import { Team } from "./collections/Team";
import { Media } from "./collections/Media";
import { Gebruikers } from "./collections/Gebruikers";
import { Instellingen } from "./globals/Instellingen";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
          collections: {
            media: true,
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
    // Inhoud
    Team,
    // Systeem
    Media,
    Gebruikers,
  ],
  globals: [Instellingen],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "specified-cms-secret-change-this",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || "",
  }),
  upload: {
    limits: {
      fileSize: 10000000,
    },
  },
});
