import { initialen } from "@/lib/labels";

type Kandidaat = {
  naam?: string | null;
  voornaam?: string | null;
  achternaam?: string | null;
  foto?: { url?: string | null; sizes?: { thumbnail?: { url?: string | null } } } | string | null;
};

/** Vierkante pasfoto; zonder foto de initialen op een ink-800 vlak. */
export function KandidaatFoto({ kandidaat, grootte = 44 }: { kandidaat: Kandidaat; grootte?: number }) {
  const foto = typeof kandidaat.foto === "object" && kandidaat.foto ? kandidaat.foto : null;
  const url = foto?.sizes?.thumbnail?.url || foto?.url;
  const maat = { width: grootte, height: grootte };

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" style={maat} className="shrink-0 bg-ink-800 object-cover" loading="lazy" />;
  }
  return (
    <span
      aria-hidden
      style={{ ...maat, fontSize: grootte * 0.42 }}
      className="kop grid shrink-0 place-items-center bg-ink-700 leading-none text-bone-400"
    >
      {initialen(kandidaat)}
    </span>
  );
}
