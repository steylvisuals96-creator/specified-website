import { CMS_URL } from "./settings";
import { LEEST_UIT_SUPABASE, mediaUrl, supabaseLees } from "./beheer";
import { isTiptap, tiptapNaarHtml } from "./richtekst";
import { LOCALE, type Taal } from "./taal";
import type { CmsArtikel, LexicalDocument, LexicalNode } from "./cms-vormen";

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

function nodeToHtml(node: LexicalNode): string {
  const children = (node.children || []).map((c) => nodeToHtml(c)).join("");
  switch (node.type) {
    case "text": {
      let t = escapeHtml(node.text || "");
      if ((node.format ?? 0) & 1) t = `<strong>${t}</strong>`;
      if ((node.format ?? 0) & 2) t = `<em>${t}</em>`;
      if ((node.format ?? 0) & 8) t = `<u>${t}</u>`;
      return t;
    }
    case "paragraph":
      return children ? `<p>${children}</p>` : "";
    case "heading": {
      // h1 blijft voor de artikeltitel; verlaag koppen in de tekst één niveau.
      // Alleen bekende koptags: node.tag komt uit de CMS en belandt letterlijk in de HTML.
      const tag = node.tag && ["h2", "h3", "h4", "h5", "h6"].includes(node.tag) ? node.tag : "h2";
      return `<${tag}>${children}</${tag}>`;
    }
    case "list":
      return node.listType === "bullet" ? `<ul>${children}</ul>` : `<ol>${children}</ol>`;
    case "listitem":
      return `<li>${children}</li>`;
    case "link": {
      // Alleen veilige adressen: http(s), mailto, tel of een pad/anker op de site.
      // Een javascript:-link zou code uitvoeren bij het klikken.
      const ruw = String(node.fields?.url ?? node.url ?? "#").trim();
      const veilig = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(ruw) ? ruw : "#";
      const url = veilig.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
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

export function lexicalToHtml(lexical: unknown): string {
  const doc = lexical as LexicalDocument | null | undefined;
  if (!doc?.root?.children) return "";
  return doc.root.children.map((n) => nodeToHtml(n)).join("");
}

/* ── Data ophalen ─────────────────────────────────────────── */

export function mapPost(d: CmsArtikel): BlogPost {
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
    // Nieuw beheer: Tiptap-document. Oude CMS: Lexical.
    inhoudHtml: d.inhoud ? (isTiptap(d.inhoud) ? tiptapNaarHtml(d.inhoud) : lexicalToHtml(d.inhoud)) : "",
    metaTitel: d.meta_titel,
    metaBeschrijving: d.meta_beschrijving,
  };
}

/* ── Nieuw beheer (Supabase) ─────────────────────────────── */

type SupabaseArtikel = {
  id: string;
  slug: string;
  titel: string;
  samenvatting: string;
  publicatiedatum: string;
  cover_id: string | null;
  cover_url: string | null;
  inhoud: unknown;
  meta_titel: string;
  meta_beschrijving: string;
  auteur: { voornaam: string; achternaam: string } | null;
};

const BLOG_KOLOMMEN = "id,slug,titel,samenvatting,publicatiedatum,cover_id,cover_url,inhoud,meta_titel,meta_beschrijving,auteur:auteur_id(voornaam,achternaam)";

function mapSupabase(a: SupabaseArtikel): BlogPost {
  return {
    id: a.id,
    titel: a.titel,
    slug: a.slug,
    samenvatting: a.samenvatting || undefined,
    publicatiedatum: a.publicatiedatum,
    coverUrl: mediaUrl(a.cover_id) ?? (a.cover_url && /^https:\/\//i.test(a.cover_url) ? a.cover_url : undefined),
    auteurNaam: a.auteur ? `${a.auteur.voornaam} ${a.auteur.achternaam}`.trim() : undefined,
    inhoudHtml: tiptapNaarHtml(a.inhoud),
    metaTitel: a.meta_titel || undefined,
    metaBeschrijving: a.meta_beschrijving || undefined,
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (LEEST_UIT_SUPABASE) {
    try {
      // RLS geeft anoniem alleen gepubliceerde artikels met een datum tot vandaag.
      return (await supabaseLees<SupabaseArtikel>(`blog?select=${BLOG_KOLOMMEN}&order=publicatiedatum.desc&limit=50`)).map(mapSupabase);
    } catch {
      return [];
    }
  }
  try {
    const res = await fetch(
      `${CMS_URL}/api/blog?where[status][equals]=gepubliceerd&sort=-publicatiedatum&limit=50&depth=1`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs ?? []).filter((d: CmsArtikel) => d.slug).map(mapPost);
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (LEEST_UIT_SUPABASE) {
    if (!/^[a-z0-9-]{1,140}$/.test(slug)) return null;
    try {
      const [a] = await supabaseLees<SupabaseArtikel>(`blog?select=${BLOG_KOLOMMEN}&slug=eq.${slug}&limit=1`);
      return a ? mapSupabase(a) : null;
    } catch {
      return null;
    }
  }
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

export function formatDatum(iso?: string, taal: Taal = "nl"): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(LOCALE[taal], { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

