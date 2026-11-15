import "server-only";
import { AwsClient } from "aws4fetch";

/**
 * Cloudflare R2: de bucket is privé. Niets is rechtstreeks opvraagbaar; beelden
 * gaan naar buiten via /m/[id], dat een kortlevende ondertekende link geeft.
 */
const ACCOUNT = process.env.R2_ACCOUNT_ID ?? "";
const BUCKET = process.env.R2_BUCKET ?? "";

export const r2Ingesteld = () =>
  Boolean(ACCOUNT && BUCKET && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);

let client: AwsClient | null = null;
function r2() {
  if (!r2Ingesteld()) throw new Error("R2 is niet ingesteld (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET).");
  client ??= new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: "auto",
  });
  return client;
}

const adres = (sleutel: string) =>
  `https://${ACCOUNT}.r2.cloudflarestorage.com/${BUCKET}/${sleutel.split("/").map(encodeURIComponent).join("/")}`;

export async function zetBestand(sleutel: string, inhoud: ArrayBuffer, type: string, signal?: AbortSignal) {
  const res = await r2().fetch(adres(sleutel), {
    method: "PUT",
    body: inhoud,
    signal,
    headers: { "content-type": type, "cache-control": "public, max-age=31536000, immutable" },
  });
  if (!res.ok) throw new Error(`R2 weigerde de upload (${res.status}).`);
}

export async function verwijderBestand(sleutel: string, signal?: AbortSignal) {
  const res = await r2().fetch(adres(sleutel), { method: "DELETE", signal });
  if (!res.ok && res.status !== 404) throw new Error(`R2 weigerde het verwijderen (${res.status}).`);
}

/** Ondertekende leeslink, standaard een uur geldig. */
export async function ondertekendeLink(sleutel: string, seconden = 3600): Promise<string> {
  const url = new URL(adres(sleutel));
  url.searchParams.set("X-Amz-Expires", String(seconden));
  const ondertekend = await r2().sign(url.toString(), { method: "GET", aws: { signQuery: true } });
  return ondertekend.url;
}
