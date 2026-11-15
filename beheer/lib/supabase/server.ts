import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/**
 * Supabase als de ingelogde gebruiker (sessie uit de cookies). Alles wat het
 * beheer leest en schrijft loopt hierlangs, zodat RLS in de database de laatste
 * controle doet, ook als een check in de code ooit vergeten wordt.
 */
export async function supabaseServer() {
  const winkel = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => winkel.getAll(),
      setAll: (lijst) => {
        try {
          for (const { name, value, options } of lijst) winkel.set(name, value, options);
        } catch {
          // In een servercomponent mogen cookies niet gezet worden; de proxy ververst de sessie dan.
        }
      },
    },
  });
}

/**
 * Supabase met de geheime sleutel: omzeilt RLS. Alleen voor gebruikersbeheer
 * (accounts aanmaken, rollen geven), en altijd pas na een rolcontrole.
 */
export function supabaseAdmin() {
  const geheim = process.env.SUPABASE_SECRET_KEY;
  if (!geheim) throw new Error("SUPABASE_SECRET_KEY ontbreekt: gebruikersbeheer werkt niet zonder.");
  return createClient(SUPABASE_URL, geheim, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const adminIngesteld = () => Boolean(process.env.SUPABASE_SECRET_KEY);
