import type { Metadata } from "next";
import { ContactWeergave } from "@/components/paginas/Weergaven";
import { getPagina } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";
import { CONTACT } from "@/lib/inhoud";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact — Specified",
  description: "Neem contact op met Specified, engineering consultancy in Kontich. Mail, bel of stuur een bericht.",
  alternates: { canonical: "/contact" },
};

// Teksten uit het beheer (Pagina's > Contact); e-mail, telefoon en LinkedIn uit Homepage > Contact en footer.
export default async function ContactPagina() {
  const [t, s] = await Promise.all([getPagina("contact"), getSettings()]);
  return (
    <ContactWeergave
      t={t}
      footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }}
      mail={s.contact_email || CONTACT.email}
      telefoon={s.telefoon || CONTACT.telefoon}
      linkedin={s.linkedin || CONTACT.linkedin}
    />
  );
}
