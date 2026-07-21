import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";

// Tijdelijke route — verwijder na gebruik
// Gebruik: GET /api/seed-covers

const COVERS = [
  {
    blogId: "6a5e93ebd24d78341fc21015",
    titel: "Zo vind je als engineer de job die écht bij je past",
    // Engineer aan het werk, blauwdrukken
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
    filename: "cover-engineer-job.jpg",
    alt: "Engineer aan het werk",
  },
  {
    blogId: "6a5e93ecd24d78341fc2102d",
    titel: "5 signalen dat het tijd is voor een nieuwe stap",
    // Persoon kijkt naar horizon / nieuwe richting
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
    filename: "cover-nieuwe-stap.jpg",
    alt: "Nieuwe carrièrestap",
  },
  {
    blogId: "6a5e93ecd24d78341fc21034",
    titel: "Waarom bedrijven kiezen voor gespecialiseerde recruitment",
    // Professionele meeting / samenwerking
    url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80",
    filename: "cover-recruitment.jpg",
    alt: "Recruitment gesprek",
  },
];

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const resultaten: any[] = [];

  for (const item of COVERS) {
    try {
      // Download afbeelding
      const res = await fetch(item.url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Download mislukt: ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());

      // Upload naar media-collectie
      const media = await payload.create({
        collection: "media",
        data: { alt: item.alt },
        file: {
          data: buffer,
          mimetype: "image/jpeg",
          name: item.filename,
          size: buffer.length,
        },
      });

      // Koppel aan blogartikel
      await payload.update({
        collection: "blog" as any,
        id: item.blogId,
        data: { cover: (media as any).id },
      });

      resultaten.push({ titel: item.titel, media_id: (media as any).id, ok: true });
    } catch (err) {
      resultaten.push({ titel: item.titel, fout: String(err), ok: false });
    }
  }

  return NextResponse.json({ resultaten });
}
