import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

const POSTS = [
  {
    titel: "De vastgoedmarkt in Limburg: trends en verwachtingen voor 2025",
    slug: "vastgoedmarkt-limburg-trends-2025",
    samenvatting:
      "De Limburgse vastgoedmarkt bleef in 2024 veerkrachtig ondanks stijgende rentevoeten. Wat mogen kopers en verkopers verwachten in 2025? SOM Vastgoed blikt vooruit.",
    categorie: "marktnieuws",
    publicatiedatum: "2025-03-10",
    gepubliceerd: true,
    seo_titel: "Vastgoedmarkt Limburg 2025 — trends & prijzen | SOM Vastgoed",
    seo_beschrijving:
      "Ontdek de nieuwste trends op de Limburgse vastgoedmarkt: prijsevolutie, rentevoeten en kooptips voor 2025 van de experts van SOM Vastgoed.",
    inhoud: {
      root: {
        type: "root",
        children: [
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "Hoe presteerde de markt in 2024?" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Ondanks de rentestijgingen van de voorbije jaren bleef de vastgoedmarkt in Limburg stabiel. De gemiddelde verkoopprijs van een woning steeg licht met 2,3%, terwijl het aantal transacties met zo'n 8% afnam in vergelijking met het recordjaar 2022. Dit geeft kopers meer onderhandelingsruimte dan de voorbije jaren.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "Wat verwachten we in 2025?" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "De Europese Centrale Bank verlaagde de rentevoeten al tweemaal in de tweede helft van 2024. Experts verwachten dat hypotheekleningen in 2025 verder zullen dalen richting 3,2 à 3,5%. Dit maakt kopen opnieuw toegankelijker voor jonge gezinnen.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Specifiek voor Limburg zien we een groeiende interesse in gemeentes als Hasselt, Genk en de Maasregio. De combinatie van groene omgeving, goede bereikbaarheid en lagere prijzen ten opzichte van Brussel of Antwerpen trekt steeds meer jonge gezinnen aan.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "Praktisch advies voor kopers" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Wacht niet te lang. Zodra de rentes verder dalen, zal de vraag opnieuw stijgen en zullen prijzen volgen. Wie nu koopt, profiteert nog van een rustiger markt met meer keuze. Zorg wel dat uw dossier klaar is: pre-goedkeuring bij uw bank, EPC-attest in orde en een vastgoedmakelaar die u vertrouwt.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Bij vragen over de markt in uw gemeente? Onze makelaars in Hasselt en Genk staan dagelijks klaar voor een vrijblijvend gesprek.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      },
    },
  },
  {
    titel: "5 bewezen tips om uw woning sneller te verkopen in Limburg",
    slug: "5-tips-woning-sneller-verkopen-limburg",
    samenvatting:
      "Een snelle verkoop tegen de beste prijs: het is geen toeval. Met deze 5 praktische tips van SOM Vastgoed maakt u uw woning onweerstaanbaar voor kopers.",
    categorie: "verkooptips",
    publicatiedatum: "2025-04-22",
    gepubliceerd: true,
    seo_titel: "5 tips om uw woning sneller te verkopen | SOM Vastgoed Limburg",
    seo_beschrijving:
      "Wilt u uw woning snel en aan de beste prijs verkopen in Limburg? Ontdek 5 bewezen tips van de experts van SOM Vastgoed.",
    inhoud: {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "De eerste indruk is alles in vastgoed. Kopers beslissen vaak binnen de eerste minuut of ze interesse hebben — nog voor ze de slaapkamers hebben gezien. Met deze tips zet u uw woning optimaal in de markt.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "1. Investeer in professionele foto's" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Meer dan 90% van de kopers begint hun zoektocht online. Kwalitatieve foto's met correcte belichting en bewuste compositie verhogen het aantal bezichtigingen drastisch. SOM Vastgoed werkt standaard met professionele vastgoedfotografen — dit is geen extra kost maar een investering die zichzelf terugverdient.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "2. Ruim op en depersonaliseer" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Kopers willen zich kunnen inbeelden dat ze in de woning wonen. Persoonlijke foto's, drukke boekenrekken en rommelige werkhoeken staan dat in de weg. Een neutrale, opgeruimde ruimte laat de architectuur spreken. Huur desnoods een kleine opslagruimte voor overtollige meubels tijdens de verkoop.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "3. Zorg voor een onberispelijke eerste indruk" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "De voortuin, de voordeur en de inkomhal zijn de eerste drie dingen die een koper ziet. Maai het gras, schilder de voordeur op, verander de deurmat en zorg voor een frisse geur binnen. Kleine ingrepen met groot effect.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "4. Kies de juiste vraagprijs" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Te hoog inzetten is de meest gemaakte fout. Een woning die te duur staat, blijft lang online staan — en dat wekt wantrouwen. Een correcte marktwaarde, bepaald door een ervaren makelaar met kennis van de lokale markt, levert gemiddeld een hogere uiteindelijke verkoopprijs op dan zelf te hoog beginnen.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "5. Laat uw makelaar onderhandelen" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Emotioneel betrokken verkopers onderhandelen zelden in hun eigen voordeel. Een professionele makelaar kent de markt, bewaakt de timing en haalt het maximale uit elke bieding. Wil je weten wat jouw woning waard is? Vraag een gratis schatting aan bij SOM Vastgoed.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      },
    },
  },
  {
    titel: "Nieuwbouw of bestaande woning? De voor- en nadelen op een rij",
    slug: "nieuwbouw-of-bestaande-woning-voor-en-nadelen",
    samenvatting:
      "Twijfelt u tussen een nieuwbouwproject en een bestaande woning? Beide hebben hun voordelen. SOM Vastgoed zet de belangrijkste verschillen voor u op een rij.",
    categorie: "kooptips",
    publicatiedatum: "2025-05-15",
    gepubliceerd: true,
    seo_titel: "Nieuwbouw vs bestaande woning: wat kiezen? | SOM Vastgoed",
    seo_beschrijving:
      "Nieuwbouw of bestaande woning kopen in Limburg? Ontdek de voor- en nadelen van beide opties en maak een weloverwogen keuze met hulp van SOM Vastgoed.",
    inhoud: {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Een van de eerste grote keuzes bij het kopen van een woning is: nieuwbouw of bestaand vastgoed? Het antwoord hangt af van uw budget, prioriteiten en levensstijl. Hier zijn de belangrijkste overwegingen.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "Voordelen van nieuwbouw" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Een nieuwbouwwoning is energiezuinig per definitie. Met verplichte EPC-normen A of beter, vloerverwarming, warmtepomp en driedubbele beglazing zijn uw energiefacturen een fractie van die bij een oudere woning. Bovendien geniet u van een tienjarige garantie op verborgen gebreken en hoeft u de eerste jaren niets te renoveren.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Financieel gezien betaalt u bij nieuwbouw 21% btw in plaats van 12,5% registratierechten — wat in de meeste gevallen iets meer kost. Maar de lagere energiekosten en afwezigheid van renovatiekosten compenseren dit op termijn ruimschoots.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "Nadelen van nieuwbouw" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "De wachttijd is het grootste nadeel: gemiddeld 12 tot 24 maanden tussen ondertekening en oplevering. Tijdens die periode betaalt u huur én aflossingen op het reeds gestorte kapitaal. Bovendien zijn nieuwbouwpercelen kleiner en liggen projecten vaker in nieuwere wijken met minder karakter.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "Voordelen van een bestaande woning" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Bestaande woningen liggen vaak in gevestigde buurten met volwassen groen, scholen en winkels op wandelafstand. U kunt de woning bezichtigen zoals ze is, en u bent er snel in. Historische karakter, hogere plafonds en grotere tuinen zijn typisch voor oudere woningen.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "Nadelen van een bestaande woning" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Renovatiekosten kunnen oplopen. Een woning met EPC-label D of slechter moet tegen 2040 gerenoveerd zijn tot minimum label D. Reken op €30.000 tot €80.000 voor een grondige renovatie. Vraag altijd het EPC-attest op voor u een bod uitbrengt.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "Onze conclusie" }],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Er is geen universeel juist antwoord. Voor jonge kopers die energie-efficiëntie en onderhoudsgemak prioriteren, wint nieuwbouw. Voor wie karakter, ligging en onmiddellijke beschikbaarheid belangrijker vindt, is bestaand vastgoed interessanter. SOM Vastgoed heeft expertise in beide segmenten en helpt u graag met een persoonlijk advies.",
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      },
    },
  },
];

export async function GET(req: NextRequest) {
  const payload = await getPayload({ config });
  const results: string[] = [];

  for (const post of POSTS) {
    const existing = await payload.find({
      collection: "nieuws",
      where: { slug: { equals: post.slug } },
    });

    if (existing.docs.length > 0) {
      results.push(`⏭️  Overgeslagen (bestaat al): ${post.titel}`);
      continue;
    }

    await payload.create({ collection: "nieuws", data: post as any });
    results.push(`✅ Aangemaakt: ${post.titel}`);
  }

  return NextResponse.json({ ok: true, results });
}
