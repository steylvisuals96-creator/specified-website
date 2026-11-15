"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_ZIJDE = 2400;

/** Verkleint grote foto's in de browser tot hoogstens 2400 px en maakt er webp van. GIF blijft ongemoeid. */
async function voorbereiden(bestand: File): Promise<{ blob: Blob; naam: string; breedte?: number; hoogte?: number }> {
  if (bestand.type === "image/gif") return { blob: bestand, naam: bestand.name };
  const beeld = await createImageBitmap(bestand).catch(() => null);
  if (!beeld) return { blob: bestand, naam: bestand.name };
  const schaal = Math.min(1, MAX_ZIJDE / Math.max(beeld.width, beeld.height));
  const breedte = Math.round(beeld.width * schaal);
  const hoogte = Math.round(beeld.height * schaal);
  if (schaal === 1 && bestand.size < 1_500_000 && bestand.type !== "image/png") return { blob: bestand, naam: bestand.name, breedte, hoogte };
  const doek = new OffscreenCanvas(breedte, hoogte);
  doek.getContext("2d")!.drawImage(beeld, 0, 0, breedte, hoogte);
  const blob = await doek.convertToBlob({ type: "image/webp", quality: 0.86 });
  return { blob, naam: bestand.name.replace(/\.[a-z0-9]+$/i, "") + ".webp", breedte, hoogte };
}

export async function uploadBeeld(bestand: File, alt = ""): Promise<{ id?: string; fout?: string }> {
  const { blob, naam, breedte, hoogte } = await voorbereiden(bestand);
  const fd = new FormData();
  fd.set("bestand", blob, naam);
  fd.set("alt", alt);
  if (breedte) fd.set("breedte", String(breedte));
  if (hoogte) fd.set("hoogte", String(hoogte));
  const res = await fetch("/api/upload", { method: "POST", body: fd }).catch(() => null);
  if (!res) return { fout: "Geen verbinding. Probeer het opnieuw." };
  const json = await res.json().catch(() => ({}));
  return res.ok ? { id: json.id } : { fout: json.fout ?? "Uploaden lukte niet." };
}

/** Sleep foto's hierheen of kies ze; ze komen meteen in de mediabibliotheek. */
export default function MediaUpload({ onKlaar }: { onKlaar?: (id: string) => void }) {
  const router = useRouter();
  const kiezer = useRef<HTMLInputElement>(null);
  const [bezig, setBezig] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [erboven, setErboven] = useState(false);

  async function verwerk(lijst: FileList | null) {
    if (!lijst?.length) return;
    setFout(null);
    const bestanden = Array.from(lijst).slice(0, 12);
    for (const [i, b] of bestanden.entries()) {
      setBezig(`Uploaden ${i + 1} van ${bestanden.length}: ${b.name}`);
      const r = await uploadBeeld(b);
      if (r.fout) setFout(`${b.name}: ${r.fout}`);
      if (r.id) onKlaar?.(r.id);
    }
    setBezig(null);
    router.refresh();
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setErboven(true);
      }}
      onDragLeave={() => setErboven(false)}
      onDrop={(e) => {
        e.preventDefault();
        setErboven(false);
        verwerk(e.dataTransfer.files);
      }}
      className={`glas flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-5 border-dashed transition-colors ${erboven ? "!border-[var(--limoen)] bg-[var(--limoen-zacht)]" : ""}`}
    >
      <div>
        <p className="font-medium">{bezig ?? "Sleep foto's hierheen"}</p>
        <p className="text-[13px] zwak">jpg, png, webp, avif of gif. Grote foto&apos;s worden automatisch verkleind.</p>
        {fout && (
          <p role="alert" className="veld-fout">
            {fout}
          </p>
        )}
      </div>
      <input ref={kiezer} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple className="sr-only" onChange={(e) => verwerk(e.target.files)} />
      <button type="button" className="knop knop-stil" onClick={() => kiezer.current?.click()} disabled={Boolean(bezig)}>
        Bestanden kiezen
      </button>
    </div>
  );
}
