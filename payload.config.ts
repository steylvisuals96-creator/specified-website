import { buildConfig } from "payload";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";

import { Panden } from "./collections/Panden";
import { Leads } from "./collections/Leads";
import { Media } from "./collections/Media";
import { Gebruikers } from "./collections/Gebruikers";
import { Paginas } from "./collections/Paginas";
import { Nieuws } from "./collections/Nieuws";
import { Team } from "./collections/Team";
import { Testimonials } from "./collections/Testimonials";
import { FAQ } from "./collections/FAQ";
import { Afspraken } from "./collections/Afspraken";
import { Taken } from "./collections/Taken";
import { Instellingen } from "./globals/Instellingen";
import { SomLogo, SomIcon } from "./components/SomLogo";
import Dashboard from "./components/Dashboard";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "gebruikers",
    meta: {
      titleSuffix: "— Som Vastgoed CMS",
    },
    components: {
      graphics: {
        Logo: SomLogo as any,
        Icon: SomIcon as any,
      },
      views: {
        dashboard: {
          Component: Dashboard as any,
          path: "/",
        },
      },
    },
  },
  collections: [
    // Vastgoed
    Panden,
    Afspraken,
    // CRM
    Leads,
    Taken,
    // Inhoud
    Paginas,
    Nieuws,
    Team,
    Testimonials,
    FAQ,
    // Systeem
    Media,
    Gebruikers,
  ],
  globals: [Instellingen],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "vastgoed-cms-secret-change-this",
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
