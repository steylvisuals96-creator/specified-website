/**
 * Opgemaakte tekst als Tiptap-document (JSON). Wat de editor stuurt wordt op de
 * server opnieuw opgebouwd uit een vaste lijst knopen en markeringen: geen
 * onbekende knopen, geen vreemde attributen, links alleen naar veilige adressen.
 * De website rendert met dezelfde beperkte lijst.
 */
export type Markering = { type: "bold" | "italic" | "underline" } | { type: "link"; attrs: { href: string } };
export type Knoop = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Knoop[];
  text?: string;
  marks?: Markering[];
};
export type Document = { type: "doc"; content: Knoop[] };

const BLOKKEN = new Set(["paragraph", "heading", "bulletList", "orderedList", "listItem", "blockquote", "horizontalRule"]);
const INLINE = new Set(["text", "hardBreak"]);

export const veiligeHref = (href: unknown): string | null => {
  const h = typeof href === "string" ? href.trim() : "";
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(h) && h.length <= 500 ? h : null;
};

function schoonMarkeringen(marks: unknown): Markering[] | undefined {
  if (!Array.isArray(marks)) return undefined;
  const uit: Markering[] = [];
  for (const m of marks) {
    const t = (m as { type?: unknown })?.type;
    if (t === "bold" || t === "italic" || t === "underline") uit.push({ type: t });
    if (t === "link") {
      const href = veiligeHref((m as { attrs?: { href?: unknown } }).attrs?.href);
      if (href) uit.push({ type: "link", attrs: { href } });
    }
  }
  return uit.length ? uit : undefined;
}

function schoonKnoop(k: unknown, diepte: number): Knoop | null {
  if (!k || typeof k !== "object" || diepte > 12) return null;
  const { type, attrs, content, text, marks } = k as Knoop;
  if (type === "text") {
    if (typeof text !== "string" || !text) return null;
    const m = schoonMarkeringen(marks);
    return m ? { type, text: text.slice(0, 20000), marks: m } : { type, text: text.slice(0, 20000) };
  }
  if (type === "hardBreak" || type === "horizontalRule") return { type };
  if (!BLOKKEN.has(type)) return null;
  const kinderen = Array.isArray(content)
    ? content.map((c) => schoonKnoop(c, diepte + 1)).filter((c): c is Knoop => c !== null)
    : [];
  const uit: Knoop = { type };
  if (type === "heading") uit.attrs = { level: attrs?.level === 3 ? 3 : 2 };
  if (type === "orderedList" && typeof attrs?.start === "number" && attrs.start > 1) uit.attrs = { start: Math.floor(attrs.start) };
  // Lijsten bevatten alleen lijstitems; een lijstitem alleen blokken.
  if (type === "bulletList" || type === "orderedList") {
    const items = kinderen.filter((c) => c.type === "listItem");
    if (!items.length) return null;
    uit.content = items;
    return uit;
  }
  if (type === "listItem" || type === "blockquote") {
    const blokken = kinderen.filter((c) => BLOKKEN.has(c.type) && c.type !== "listItem");
    uit.content = blokken.length ? blokken : [{ type: "paragraph" }];
    return uit;
  }
  const inline = kinderen.filter((c) => INLINE.has(c.type));
  if (inline.length) uit.content = inline;
  return uit;
}

/** Geeft een veilig document, of null als er geen tekst in staat. */
export function schoonDocument(invoer: unknown): Document | null {
  let d = invoer;
  if (typeof d === "string") {
    try {
      d = JSON.parse(d);
    } catch {
      return null;
    }
  }
  if (!d || typeof d !== "object" || (d as Knoop).type !== "doc") return null;
  const content = ((d as Knoop).content ?? [])
    .map((k) => schoonKnoop(k, 0))
    .filter((k): k is Knoop => k !== null && k.type !== "listItem");
  return tekstUit({ type: "doc", content }).trim() ? { type: "doc", content } : null;
}

/** Alle tekst achter elkaar, voor tellers en samenvattingen. */
export function tekstUit(k: Knoop | Document | null | undefined): string {
  if (!k) return "";
  if (k.type === "text") return (k as Knoop).text ?? "";
  const kinderen = (k.content ?? []) as Knoop[];
  const sep = k.type === "doc" || k.type === "bulletList" || k.type === "orderedList" ? "\n" : "";
  return kinderen.map((c) => tekstUit(c)).join(sep);
}
