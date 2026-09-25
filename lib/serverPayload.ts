import { getPayload } from "payload";
import { headers } from "next/headers";

const configPromise = import("@payload-config").then((m) => m.default);

/**
 * Voor server actions. Een server action is een publiek aanroepbaar endpoint:
 * een login-check op de pagina die hem toont beschermt de action zelf niet.
 * Daarom controleert elke action hier opnieuw wie er aanroept, en voert hij
 * zijn Payload-aanroepen uit ALS die gebruiker (`...als`), zodat de
 * toegangsregels uit lib/access.ts gelden in plaats van overgeslagen worden.
 */
export async function payloadAlsGebruiker() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) throw new Error("Niet ingelogd.");
  return { payload, user, als: { user, overrideAccess: false } as const };
}
