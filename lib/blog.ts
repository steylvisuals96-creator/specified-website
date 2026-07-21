import { CMS_URL } from "./settings";

export type BlogPost = {
  id: string;
  titel: string;
  slug: string;
  samenvatting?: string;
  publicatiedatum?: string;
  coverUrl?: string;
  auteurNaam?: string;
  inhoudHtml: string;
  metaTitel?: string;
  metaBeschrijving?: string;
};

/* ── Lexical → HTML ─────────────────────────────────────────
   Zet de opgemaakte tekst uit het CMS om naar veilige HTML,
   met behoud van koppen, vet/cursief, lijstjes en links. */

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function nodeToHtml(node: any): string {
  const children = (node.children || []).map((c: any) => nodeToHtml(c)).join("");
  switch (node.type) {
    case "text": {
      let t = escapeHtml(node.text || "");
      if (node.format & 1) t = `<strong>${t}</strong>`;
      if (node.format & 2) t = `<em>${t}</em>`;
      if (node.format & 8) t = `<u>${t}</u>`;
      return t;
    }
    case "paragraph":
      return children ? `<p>${children}</p>` : "";
    case "heading": {
      // h1 blijft voor de artikeltitel; verlaag koppen in de tekst één niveau
      const tag = node.tag === "h1" ? "h2" : node.tag || "h2";
      return `<${tag}>${children}</${tag}>`;
    }
    case "list":
      return node.listType === "bullet" ? `<ul>${children}</ul>` : `<ol>${children}</ol>`;
    case "listitem":
      return `<li>${children}</li>`;
    case "link": {
      const url = String(node.url || "#").replace(/"/g, "%22");
      const extern = /^https?:\/\//i.test(url);
      return `<a href="${url}"${extern ? ' target="_blank" rel="noopener noreferrer"' : ""}>${children}</a>`;
    }
    case "linebreak":
      return "<br>";
    case "horizontalrule":
      return "<hr>";
    default:
      return children;
  }
}

export function lexicalToHtml(lexical: any): string {
  if (!lexical?.root?.children) return "";
  return lexical.root.children.map((n: any) => nodeToHtml(n)).join("");
}

/* ── Data ophalen ─────────────────────────────────────────── */

function mapPost(d: any): BlogPost {
  const uploadUrl = d.cover?.url as string | undefined;
  const uploadFull = uploadUrl ? (uploadUrl.startsWith("http") ? uploadUrl : `${CMS_URL}${uploadUrl}`) : undefined;
  const coverUrl = uploadFull ?? (d.cover_url as string | undefined) ?? undefined;
  const auteur = typeof d.auteur === "object" && d.auteur
    ? [d.auteur.voornaam, d.auteur.achternaam].filter(Boolean).join(" ") || d.auteur.naam
    : undefined;

  return {
    id: d.id,
    titel: d.titel,
    slug: d.slug,
    samenvatting: d.samenvatting,
    publicatiedatum: d.publicatiedatum,
    coverUrl,
    auteurNaam: auteur,
    inhoudHtml: d.inhoud ? lexicalToHtml(d.inhoud) : "",
    metaTitel: d.meta_titel,
    metaBeschrijving: d.meta_beschrijving,
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/blog?where[status][equals]=gepubliceerd&sort=-publicatiedatum&limit=50&depth=1`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs ?? []).filter((d: any) => d.slug).map(mapPost);
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/blog?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=gepubliceerd&limit=1&depth=1`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const doc = (data.docs ?? [])[0];
    return doc ? mapPost(doc) : null;
  } catch {
    return null;
  }
}

export function formatDatum(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}
