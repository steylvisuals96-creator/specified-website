import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";

// Tijdelijke route — verwijder na gebruik
// Gebruik: GET /api/seed-covers

const COVERS: { blogId: string; titel: string; url: string }[] = [
  {
    blogId: "6a5e93ebd24d78341fc21015",
    titel: "Zo vind je als engineer de job die écht bij je past",
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
  },
  {
    blogId: "6a5e93ecd24d78341fc2102d",
    titel: "5 signalen dat het tijd is voor een nieuwe stap",
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
  },
  {
    blogId: "6a5e93ecd24d78341fc21034",
    titel: "Waarom bedrijven kiezen voor gespecialiseerde recruitment",
    url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80",
  },
];

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const resultaten: any[] = [];

  for (const item of COVERS) {
    try {
      await payload.update({
        collection: "blog" as any,
        id: item.blogId,
        data: { cover_url: item.url },
      });
      resultaten.push({ titel: item.titel, ok: true });
    } catch (err) {
      resultaten.push({ titel: item.titel, fout: String(err), ok: false });
    }
  }

  return NextResponse.json({ resultaten });
}
