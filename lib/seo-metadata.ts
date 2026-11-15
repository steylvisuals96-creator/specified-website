import type { Metadata } from "next";
import { LEEST_UIT_SUPABASE, supabaseLees } from "./beheer";

export async function paginaMetadata(pad: string, standaard: Metadata): Promise<Metadata> {
  if (!LEEST_UIT_SUPABASE) return standaard;
  try {
    const [meta] = await supabaseLees<{ titel: string; beschrijving: string }>(
      `seo_metadata?select=titel,beschrijving&pad=eq.${encodeURIComponent(pad)}&limit=1`,
    );
    return meta ? { ...standaard, title: meta.titel, description: meta.beschrijving } : standaard;
  } catch {
    return standaard;
  }
}
