/**
 * Het publieke adres van de site. Eén plek: sitemap, robots, canonical-links en
 * Open Graph lezen dit. Verhuist de site naar specified.be, zet dan
 * NEXT_PUBLIC_SITE_URL in Vercel; de code hoeft niet te veranderen.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://specified-website.vercel.app").replace(/\/$/, "");
