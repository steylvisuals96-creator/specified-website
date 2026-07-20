import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { htmlToLexical } from "@/lib/lexical";

export const dynamic = "force-dynamic";

const configPromise = import("@payload-config").then((m) => m.default);
const KEY = "specified-seed-2026";

const ARTIKELS = [
  {
    titel: "Zo vind je als engineer de job die écht bij je past",
    samenvatting:
      "Niet elke openstaande vacature is een goede match. Zo herken je de opdracht die past bij je ambities, je sterktes en de richting waarin je wil groeien.",
    html: `
<p>Als engineer heb je keuze genoeg. Maar de juiste job vinden is meer dan reageren op de eerste vacature die voorbijkomt. Het gaat om een match op inhoud, cultuur en groeipad. Hieronder lopen we door de belangrijkste dingen om op te letten.</p>
<h2>Begin bij jezelf, niet bij de vacature</h2>
<p>Voor je begint te zoeken, is het waardevol om helder te krijgen wat je zelf wil. Vraag jezelf af:</p>
<ul>
<li>Werk ik het liefst diep-technisch, of wil ik richting projectleiding groeien?</li>
<li>Zoek ik afwisseling in projecten, of net verdieping in één domein?</li>
<li>Hoe belangrijk zijn flexibiliteit, teamsfeer en opleidingskansen voor mij?</li>
</ul>
<p>Wie deze vragen scherp heeft, filtert veel sneller de ruis eruit.</p>
<h2>Kijk verder dan het functieprofiel</h2>
<p>Een vacaturetekst zegt lang niet alles. De echte vraag is: wat ga je dagelijks doen, met welke technologieën, en wie zijn je collega's? Een goede recruiter helpt je die context te begrijpen nog vóór je op gesprek gaat.</p>
<h2>Laat je begeleiden door een specialist</h2>
<p>Een gespecialiseerde partner kent de bedrijven van binnenuit en weet welke cultuur écht bij jou past. Zo vermijd je verrassingen en land je op een plek waar je wil blijven.</p>
<p>Klaar voor je volgende stap? Bekijk de openstaande vacatures of neem contact op — we luisteren eerst, en zoeken daarna.</p>
`,
  },
  {
    titel: "5 signalen dat het tijd is voor een nieuwe stap",
    samenvatting:
      "Twijfel je of je toe bent aan iets nieuws? Deze vijf signalen helpen je inschatten of het tijd is om verder te kijken in je engineeringcarrière.",
    html: `
<p>Van job veranderen is een grote beslissing. Soms is het gevoel er wel, maar mis je de bevestiging. Deze vijf signalen geven houvast.</p>
<h2>1. Je leert al een tijd niets nieuws meer</h2>
<p>Groei is voor engineers cruciaal. Als je maanden op dezelfde taken zit zonder nieuwe uitdaging, stagneert je ontwikkeling.</p>
<h2>2. Je ambitie botst met je huidige rol</h2>
<p>Wil je richting lead, expert of een ander domein, maar zie je die ruimte niet? Dan wordt het krap.</p>
<h2>3. De technologie loopt achter</h2>
<p>Werken met verouderde tools maakt je op termijn minder wendbaar op de arbeidsmarkt.</p>
<h2>4. Je herkent je niet meer in de cultuur</h2>
<p>Een team dat niet meer bij je past, weegt zwaarder door dan menigeen denkt.</p>
<h2>5. Je bent nieuwsgierig naar wat er buiten is</h2>
<p>Puur die nieuwsgierigheid is al een teken. Vrijblijvend verkennen mag altijd.</p>
<p>Herken je jezelf hierin? Een oriënterend gesprek verplicht tot niets — en geeft vaak verrassend veel helderheid.</p>
`,
  },
  {
    titel: "Waarom bedrijven kiezen voor gespecialiseerde recruitment",
    samenvatting:
      "Engineeringtalent vind je niet met een standaard vacature. Zo maakt gespecialiseerde recruitment het verschil voor bedrijven die écht de juiste mensen zoeken.",
    html: `
<p>De strijd om technisch talent is hevig. Bedrijven die opvallen, doen dat niet met een generieke aanpak, maar met recruitment die de sector door en door kent. Waarom werkt dat beter?</p>
<h2>Diep begrip van de functie</h2>
<p>Een gespecialiseerde recruiter begrijpt het verschil tussen profielen, technologieën en niveaus. Daardoor komen enkel kandidaten door die echt aansluiten.</p>
<h2>Toegang tot passief talent</h2>
<p>De sterkste engineers zijn vaak niet actief op zoek. Via het juiste netwerk bereik je net die mensen die je met een gewone vacature nooit ziet.</p>
<h2>Kwaliteit boven kwantiteit</h2>
<p>Geen stapel cv's, maar een korte lijst met kandidaten die passen bij jouw cultuur, stack en ambitie. Dat scheelt tijd én mislukte aanwervingen.</p>
<ul>
<li>Grondige screening en technische validatie</li>
<li>Persoonlijke opvolging voor kandidaat én bedrijf</li>
<li>Focus op een duurzame match, niet op snelle plaatsing</li>
</ul>
<p>Op zoek naar engineering talent dat het verschil maakt? Laten we kennismaken.</p>
`,
  },
];

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("key") !== KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await configPromise;
  const payload = await getPayload({ config: config as any });

  const resultaten: any[] = [];
  for (const a of ARTIKELS) {
    try {
      const doc = await payload.create({
        collection: "blog" as any,
        data: {
          titel: a.titel,
          samenvatting: a.samenvatting,
          status: "gepubliceerd",
          publicatiedatum: new Date().toISOString(),
          inhoud: htmlToLexical(a.html.trim()),
        } as any,
      });
      resultaten.push({ titel: a.titel, id: (doc as any).id, slug: (doc as any).slug });
    } catch (e: any) {
      resultaten.push({ titel: a.titel, fout: e.message });
    }
  }

  return NextResponse.json({ aangemaakt: resultaten });
}
