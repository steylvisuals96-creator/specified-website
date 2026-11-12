/**
 * De vier formulieren van de site, op één plek beschreven. De browser
 * (components/Formulier.tsx) tekent de velden hieruit, de server
 * (app/api/formulier/route.ts) controleert met dezelfde lijst.
 */
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

const HERKOMST = ["LinkedIn", "Google", "Via een consultant of kennis", "Jobbeurs of event", "School of opleiding", "Anders"];

const naam: Veld = { naam: "naam", label: "Naam", type: "text", verplicht: true, autocomplete: "name", max: 120, half: true };
const email: Veld = { naam: "email", label: "E-mail", type: "email", verplicht: true, autocomplete: "email", max: 160, half: true };
const telefoon: Veld = { naam: "telefoon", label: "Telefoon", type: "tel", verplicht: true, autocomplete: "tel", max: 40, half: true };

const sollicitatie: Veld[] = [
  naam,
  email,
  telefoon,
  { naam: "woonplaats", label: "Woonplaats", type: "text", autocomplete: "address-level2", max: 120, half: true },
  { naam: "linkedin", label: "LinkedIn-profiel", type: "url", hint: "Bijvoorbeeld https://www.linkedin.com/in/jouwnaam", max: 300, half: true },
  { naam: "beschikbaar", label: "Beschikbaar vanaf", type: "date", half: true },
  { naam: "herkomst", label: "Hoe ben je bij ons terechtgekomen?", type: "select", opties: HERKOMST },
  { naam: "cv", label: "Cv", type: "file", verplicht: true, hint: "Pdf of Word, maximaal 4 MB." },
  { naam: "bericht", label: "Iets dat we moeten weten?", type: "textarea", max: 4000 },
];

export const FORMULIEREN: Record<Soort, { velden: Veld[]; knop: string; bedankt: string }> = {
  sollicitatie: {
    velden: sollicitatie,
    knop: "Verstuur sollicitatie",
    bedankt: "Bedankt voor je sollicitatie. We hebben ze goed ontvangen en nemen contact met je op.",
  },
  "open-sollicitatie": {
    velden: sollicitatie,
    knop: "Verstuur open sollicitatie",
    bedankt: "Bedankt voor je open sollicitatie. We hebben ze goed ontvangen en nemen contact met je op.",
  },
  contact: {
    velden: [
      naam,
      email,
      { ...telefoon, verplicht: false },
      { naam: "bedrijf", label: "Bedrijf", type: "text", autocomplete: "organization", max: 160, half: true },
      { naam: "bericht", label: "Je bericht", type: "textarea", verplicht: true, max: 4000 },
    ],
    knop: "Verstuur bericht",
    bedankt: "Bedankt voor je bericht. We antwoorden zo snel mogelijk.",
  },
  aanvraag: {
    velden: [
      naam,
      { naam: "bedrijf", label: "Bedrijf", type: "text", verplicht: true, autocomplete: "organization", max: 160, half: true },
      email,
      telefoon,
      {
        naam: "profiel",
        label: "Welk profiel zoek je?",
        type: "select",
        opties: ["Civil engineer", "Electrical engineer", "Automation engineer", "Mechanical engineer", "Engineering consultant", "Projectleider", "Weet ik nog niet"],
        half: true,
      },
      { naam: "start", label: "Gewenste start", type: "date", half: true },
      { naam: "bericht", label: "Omschrijf kort het project of de nood", type: "textarea", verplicht: true, max: 4000 },
    ],
    knop: "Vraag een consultant aan",
    bedankt: "Bedankt voor je aanvraag. We nemen contact met je op om ze te bespreken.",
  },
};

export const SOORT_TITEL: Record<Soort, string> = {
  sollicitatie: "Sollicitatie",
  "open-sollicitatie": "Open sollicitatie",
  contact: "Contactformulier",
  aanvraag: "Aanvraag consultant",
};

export const isSoort = (v: unknown): v is Soort => typeof v === "string" && v in FORMULIEREN;
