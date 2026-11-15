import { NextResponse, type NextRequest } from "next/server";
import { huidigeSessie } from "@/lib/sessie";
import { supabaseServer } from "@/lib/supabase/server";
import { r2Ingesteld, verwijderBestand, zetBestand } from "@/lib/r2";

// Vercel neemt hoogstens 4,5 MB per verzoek aan; de browser verkleint beelden
// vooraf (components/MediaUpload.tsx), dus 4 MB is ruim.
const MAX = 4 * 1024 * 1024;

/** Het echte bestandstype uit de eerste bytes, niet wat de browser beweert. */
function soort(b: Uint8Array): { mime: string; ext: string } | null {
  const ascii = (van: number, tot: number) => String.fromCharCode(...b.slice(van, tot));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (b[0] === 0x89 && ascii(1, 4) === "PNG") return { mime: "image/png", ext: "png" };
  if (ascii(0, 4) === "GIF8") return { mime: "image/gif", ext: "gif" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  if (ascii(4, 8) === "ftyp" && /^avi[fs]$/.test(ascii(8, 12))) return { mime: "image/avif", ext: "avif" };
  return null;
}

const geheelGetal = (v: FormDataEntryValue | null) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 && n < 20000 ? n : null;
};

export async function POST(req: NextRequest) {
  // Alleen vanuit het beheer zelf.
  const origin = req.headers.get("origin");
  if (!origin || new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ fout: "Niet toegestaan." }, { status: 403 });
  }
  const s = await huidigeSessie();
  if (!s || s.tweestapNodig) return NextResponse.json({ fout: "Je bent niet (meer) ingelogd." }, { status: 401 });
  if (!r2Ingesteld()) return NextResponse.json({ fout: "De mediaopslag (R2) is nog niet ingesteld." }, { status: 503 });

  const fd = await req.formData().catch(() => null);
  const bestand = fd?.get("bestand");
  if (!(bestand instanceof File)) return NextResponse.json({ fout: "Geen bestand ontvangen." }, { status: 400 });
  if (bestand.size > MAX) return NextResponse.json({ fout: "Dat bestand is groter dan 4 MB." }, { status: 413 });

  const inhoud = await bestand.arrayBuffer();
  const type = soort(new Uint8Array(inhoud.slice(0, 16)));
  if (!type) return NextResponse.json({ fout: "Alleen foto's: jpg, png, webp, avif of gif." }, { status: 415 });

  const nu = new Date();
  const sleutel = `media/${nu.getFullYear()}/${String(nu.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${type.ext}`;
  const naam = (bestand.name || "beeld").replace(/[^\p{L}\p{N} ._-]/gu, "").slice(0, 200) || "beeld";
  const alt = typeof fd?.get("alt") === "string" ? String(fd.get("alt")).trim().slice(0, 200) : "";

  try {
    await zetBestand(sleutel, inhoud, type.mime);
  } catch {
    return NextResponse.json({ fout: "Uploaden naar de opslag lukte niet. Probeer het opnieuw." }, { status: 502 });
  }

  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("media")
    .insert({
      sleutel,
      bestandsnaam: naam,
      mime: type.mime,
      grootte: bestand.size,
      breedte: geheelGetal(fd!.get("breedte")),
      hoogte: geheelGetal(fd!.get("hoogte")),
      alt,
      aangemaakt_door: s.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    await verwijderBestand(sleutel).catch(() => {});
    return NextResponse.json({ fout: "Opslaan in de mediabibliotheek lukte niet." }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
