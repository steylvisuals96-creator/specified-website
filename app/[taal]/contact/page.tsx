import { paginaMetadata } from "@/lib/seo-metadata";
import type { Metadata } from "next";
import { ContactWeergave } from "@/components/paginas/Weergaven";
import { getPagina } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";
import { CONTACT } from "@/lib/inhoud";
import { huidigeTaal } from "@/lib/taal-server";
import { lokaalPad, taalAlternates } from "@/lib/taal";

export const revalidate = 60;

const META = {
  nl: { title: "Contact | Specified", description: "Neem contact op met Specified, engineering consultancy in Kontich. Mail, bel of stuur een bericht." },
  en: { title: "Contact | Specified", description: "Get in touch with Specified, engineering consultancy in Kontich. Email, call or send a message." },
};

export async function generateMetadata(): Promise<Metadata> {
  const taal = await huidigeTaal();
  return paginaMetadata(lokaalPad(taal, "/contact"), { ...META[taal], alternates: taalAlternates(taal, "/contact") });
}

// Teksten uit het beheer (Pagina's > Contact); e-mail, telefoon en LinkedIn uit Homepage > Contact en footer.
export default async function ContactPagina() {
  const taal = await huidigeTaal();
  const [t, s] = await Promise.all([getPagina("contact", taal), getSettings(taal)]);
  return (
    <ContactWeergave
      t={t}
      taal={taal}
      footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }}
      mail={s.contact_email || CONTACT.email}
      telefoon={s.telefoon || CONTACT.telefoon}
      linkedin={s.linkedin || CONTACT.linkedin}
    />
  );
}
