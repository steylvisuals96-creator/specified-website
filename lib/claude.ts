import Anthropic from "@anthropic-ai/sdk";

const client = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function analyseerLead(lead: {
  naam: string;
  email: string;
  telefoon?: string;
  bericht?: string;
  bron?: string;
}): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) return "";

  const response = await client().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    messages: [{
      role: "user",
      content: `Je bent een assistent voor een Belgisch vastgoedkantoor. Analyseer deze lead en geef een korte samenvatting in het Nederlands.

Lead info:
- Naam: ${lead.naam}
- Bron: ${lead.bron || "website"}
- Bericht: ${lead.bericht || "(geen bericht)"}

Geef in max 3 zinnen:
1. Wat zoekt de klant precies?
2. Hoe urgent lijkt dit?
3. Aanbevolen eerste actie voor de makelaar.

Wees direct en praktisch. Geen opsommingstekens, gewone tekst.`,
    }],
  });

  return (response.content[0] as any).text || "";
}

export async function genereerPandBeschrijving(pand: {
  titel: string;
  type: string;
  gemeente?: string;
  prijs?: number;
  slaapkamers?: number;
  badkamers?: number;
  bewoonbare_opp?: number;
  perceelgrootte?: number;
  bouwjaar?: number;
  epc?: string;
  garage?: boolean;
  tuin?: boolean;
  terras?: boolean;
  transactie?: string;
}): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) return "";

  const kenmerken = [
    pand.slaapkamers && `${pand.slaapkamers} slaapkamers`,
    pand.badkamers && `${pand.badkamers} badkamers`,
    pand.bewoonbare_opp && `${pand.bewoonbare_opp} m² bewoonbaar`,
    pand.perceelgrootte && `${pand.perceelgrootte} m² perceel`,
    pand.bouwjaar && `bouwjaar ${pand.bouwjaar}`,
    pand.epc && `EPC ${pand.epc}`,
    pand.garage && "garage",
    pand.tuin && "tuin",
    pand.terras && "terras",
  ].filter(Boolean).join(", ");

  const response = await client().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [{
      role: "user",
      content: `Schrijf een professionele vastgoedbeschrijving in het Nederlands voor:

${pand.titel}
Type: ${pand.type} | ${pand.transactie === "huur" ? "Te huur" : "Te koop"} | ${pand.gemeente || ""} | ${pand.prijs ? `€${pand.prijs.toLocaleString("nl-BE")}` : ""}
Kenmerken: ${kenmerken || "geen extra info"}

Schrijf 2-3 aantrekkelijke alinea's voor Immoweb/Zimmo. Zakelijk maar warm, geen overdrijving. Geen vermelding van prijs in de tekst.`,
    }],
  });

  return (response.content[0] as any).text || "";
}
