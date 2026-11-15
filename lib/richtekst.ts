/**
 * Opgemaakte tekst uit het nieuwe beheer (Tiptap-document, JSON) naar veilige
 * HTML. Zelfde beperkte lijst als het beheer bij het opslaan
 * (beheer/lib/richtekst.ts): alles wat niet in de lijst staat valt weg, links
 * alleen naar veilige adressen. Koppen beginnen bij h2: h1 is de artikeltitel.
 */
type Knoop = { type?: string; text?: string; attrs?: Record<string, unknown>; content?: Knoop[]; marks?: { type?: string; attrs?: { href?: unknown } }[] };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const veiligeHref = (h: unknown) => {
  const v = typeof h === "string" ? h.trim() : "";
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(v) ? v : null;
};

function tekst(k: Knoop): string {
  let t = esc(k.text ?? "");
  for (const m of k.marks ?? []) {
    if (m.type === "bold") t = `<strong>${t}</strong>`;
    else if (m.type === "italic") t = `<em>${t}</em>`;
    else if (m.type === "underline") t = `<u>${t}</u>`;
    else if (m.type === "link") {
      const href = veiligeHref(m.attrs?.href);
      if (href) {
        const extern = /^https?:\/\//i.test(href);
        t = `<a href="${esc(href)}"${extern ? ' target="_blank" rel="noopener noreferrer"' : ""}>${t}</a>`;
      }
    }
  }
  return t;
}

function naarHtml(k: Knoop, diepte = 0): string {
  if (diepte > 12) return "";
  const binnen = () => (k.content ?? []).map((c) => naarHtml(c, diepte + 1)).join("");
  switch (k.type) {
    case "text":
      return tekst(k);
    case "hardBreak":
      return "<br>";
    case "horizontalRule":
      return "<hr>";
    case "paragraph": {
      const b = binnen();
      return b ? `<p>${b}</p>` : "";
    }
    case "heading": {
      const tag = k.attrs?.level === 3 ? "h3" : "h2";
      return `<${tag}>${binnen()}</${tag}>`;
    }
    case "bulletList":
      return `<ul>${binnen()}</ul>`;
    case "orderedList":
      return `<ol>${binnen()}</ol>`;
    case "listItem":
      // Een lijstitem bevat in Tiptap altijd een alinea; zonder <p> eromheen, zoals de oude CMS-weergave.
      return `<li>${(k.content ?? []).map((c) => (c.type === "paragraph" ? (c.content ?? []).map((t) => naarHtml(t, diepte + 2)).join("") : naarHtml(c, diepte + 1))).join("<br>")}</li>`;
    case "blockquote":
      return `<blockquote>${binnen()}</blockquote>`;
    default:
      return "";
  }
}

export const isTiptap = (d: unknown): d is Knoop => Boolean(d && typeof d === "object" && (d as Knoop).type === "doc");

export function tiptapNaarHtml(doc: unknown): string {
  return isTiptap(doc) ? (doc.content ?? []).map((k) => naarHtml(k)).join("") : "";
}

/** Platte tekst van één knoop, hoe diep genest ook. */
function plat(k: Knoop): string {
  if (k.type === "text") return k.text ?? "";
  return (k.content ?? []).map(plat).join(k.type === "bulletList" || k.type === "orderedList" ? "\n" : "");
}

/** Het document als losse alinea's platte tekst (vacatureomschrijving). */
export function tiptapAlineas(doc: unknown): string[] {
  return isTiptap(doc) ? (doc.content ?? []).map(plat).map((t) => t.trim()).filter(Boolean) : [];
}
