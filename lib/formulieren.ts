/**
 * De vier formulieren van de site, op één plek beschreven. De browser
 * (components/Formulier.tsx) tekent de velden hieruit, de server
 * (app/api/formulier/route.ts) controleert met dezelfde lijst.
 */
import type { Taal } from "./taal";

export type Soort = "sollicitatie" | "open-sollicitatie" | "contact" | "aanvraag";

export type Veld = {
  naam: string;
  label: string;
  type: "text" | "email" | "tel" | "url" | "date" | "textarea" | "select" | "file";
  verplicht?: boolean;
  /** Voor de browser: helpt bij automatisch invullen. */
  autocomplete?: string;
  opties?: string[];
  hint?: string;
  max?: number;
  /** Halve breedte op brede schermen. */
  half?: boolean;
};

export const CV_MAX_BYTES = 4 * 1024 * 1024;
export const CV_EXTENSIES = [".pdf", ".doc", ".docx"];

type Formulieren = Record<Soort, { velden: Veld[]; knop: string; bedankt: string }>;

/**
 * Labels, keuzes en teksten per taal. De volgorde van velden en keuzes is in
 * beide talen dezelfde: zo zet de server een Engelse keuze om naar de
 * Nederlandse voor de melding aan Specified (app/api/formulier).
 */
function maak(taal: Taal): Formulieren {
  const en = taal === "en";
  const herkomst = en
    ? ["LinkedIn", "Google", "Through a consultant or acquaintance", "Job fair or event", "School or training", "Other"]
    : ["LinkedIn", "Google", "Via een consultant of kennis", "Jobbeurs of event", "School of opleiding", "Anders"];
  const profielen = en
    ? ["Civil engineer", "Electrical engineer", "Automation engineer", "Mechanical engineer", "Engineering consultant", "Project manager", "Not sure yet"]
    : ["Civil engineer", "Electrical engineer", "Automation engineer", "Mechanical engineer", "Engineering consultant", "Projectleider", "Weet ik nog niet"];

  const naam: Veld = { naam: "naam", label: en ? "Name" : "Naam", type: "text", verplicht: true, autocomplete: "name", max: 120, half: true };
  const email: Veld = { naam: "email", label: en ? "Email" : "E-mail", type: "email", verplicht: true, autocomplete: "email", max: 160, half: true };
  const telefoon: Veld = { naam: "telefoon", label: en ? "Phone" : "Telefoon", type: "tel", verplicht: true, autocomplete: "tel", max: 40, half: true };
  const bedrijf: Veld = { naam: "bedrijf", label: en ? "Company" : "Bedrijf", type: "text", autocomplete: "organization", max: 160, half: true };

  const sollicitatie: Veld[] = [
    naam,
    email,
    telefoon,
    { naam: "woonplaats", label: en ? "Place of residence" : "Woonplaats", type: "text", autocomplete: "address-level2", max: 120, half: true },
    {
      naam: "linkedin",
      label: en ? "LinkedIn profile" : "LinkedIn-profiel",
      type: "url",
      hint: en ? "For example https://www.linkedin.com/in/yourname" : "Bijvoorbeeld https://www.linkedin.com/in/jouwnaam",
      max: 300,
      half: true,
    },
    { naam: "beschikbaar", label: en ? "Available from" : "Beschikbaar vanaf", type: "date", half: true },
    { naam: "herkomst", label: en ? "How did you find us?" : "Hoe ben je bij ons terechtgekomen?", type: "select", opties: herkomst },
    { naam: "cv", label: en ? "CV" : "Cv", type: "file", verplicht: true, hint: en ? "PDF or Word, max. 4 MB." : "Pdf of Word, maximaal 4 MB." },
    { naam: "bericht", label: en ? "Anything we should know?" : "Iets dat we moeten weten?", type: "textarea", max: 4000 },
  ];

  return {
    sollicitatie: {
      velden: sollicitatie,
      knop: en ? "Send application" : "Verstuur sollicitatie",
      bedankt: en
        ? "Thank you for your application. We have received it and will get back to you."
        : "Bedankt voor je sollicitatie. We hebben ze goed ontvangen en nemen contact met je op.",
    },
    "open-sollicitatie": {
      velden: sollicitatie,
      knop: en ? "Send open application" : "Verstuur open sollicitatie",
      bedankt: en
        ? "Thank you for your open application. We have received it and will get back to you."
        : "Bedankt voor je open sollicitatie. We hebben ze goed ontvangen en nemen contact met je op.",
    },
    contact: {
      velden: [
        naam,
        email,
        { ...telefoon, verplicht: false },
        bedrijf,
        { naam: "bericht", label: en ? "Your message" : "Je bericht", type: "textarea", verplicht: true, max: 4000 },
      ],
      knop: en ? "Send message" : "Verstuur bericht",
      bedankt: en ? "Thank you for your message. We will reply as soon as possible." : "Bedankt voor je bericht. We antwoorden zo snel mogelijk.",
    },
    aanvraag: {
      velden: [
        naam,
        { ...bedrijf, verplicht: true },
        email,
        telefoon,
        { naam: "profiel", label: en ? "Which profile are you looking for?" : "Welk profiel zoek je?", type: "select", opties: profielen, half: true },
        { naam: "start", label: en ? "Desired start date" : "Gewenste start", type: "date", half: true },
        {
          naam: "bericht",
          label: en ? "Briefly describe the project or need" : "Omschrijf kort het project of de nood",
          type: "textarea",
          verplicht: true,
          max: 4000,
        },
      ],
      knop: en ? "Request a consultant" : "Vraag een consultant aan",
      bedankt: en
        ? "Thank you for your request. We will contact you to discuss it."
        : "Bedankt voor je aanvraag. We nemen contact met je op om ze te bespreken.",
    },
  };
}

const PER_TAAL: Record<Taal, Formulieren> = { nl: maak("nl"), en: maak("en") };
export const formulieren = (taal: Taal) => PER_TAAL[taal];
export const FORMULIEREN = PER_TAAL.nl;

export const SOORT_TITEL: Record<Soort, string> = {
  sollicitatie: "Sollicitatie",
  "open-sollicitatie": "Open sollicitatie",
  contact: "Contactformulier",
  aanvraag: "Aanvraag consultant",
};

export const isSoort = (v: unknown): v is Soort => typeof v === "string" && v in FORMULIEREN;
