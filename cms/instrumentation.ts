import type { Instrumentation } from "next";
import { meldFout, zonderQuery } from "@/lib/foutmelding";

// Elke serverfout die niet zelf opgevangen wordt (server actions, route
// handlers, server components) gaat via Resend naar de beheerder.
// Opgevangen fouten melden met meldFout() in het catch-blok.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  await meldFout(err, {
    bron: context.routeType,
    route: context.routePath,
    pad: zonderQuery(request.path),
    methode: request.method,
  });
};
