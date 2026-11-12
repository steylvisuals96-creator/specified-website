import type { Metadata } from "next";
import Pagina from "@/components/Pagina";
import Formulier from "@/components/Formulier";
import { BEDRIJF, CONTACT } from "@/lib/inhoud";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact — Specified",
  description: "Neem contact op met Specified, engineering consultancy in Kontich. Mail, bel of stuur een bericht.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPagina() {
  const s = await getSettings();
  const mail = s.contact_email || CONTACT.email;
  const telefoon = s.telefoon || CONTACT.telefoon;
  const linkedin = s.linkedin || CONTACT.linkedin;

  return (
    <Pagina titel="Laten we kennismaken" inleiding="Een vraag over een project, een samenwerking of een job? Stuur een bericht, mail of bel ons.">
      <section className="blok">
        <div className="wrap contact__grid">
          <address className="contact__gegevens">
            <div>
              <h2 className="contact__label">E-mail</h2>
              <a href={`mailto:${mail}`} className="text-link">
                {mail}
              </a>
            </div>
            <div>
              <h2 className="contact__label">Telefoon</h2>
              <a href={`tel:${telefoon.replace(/\s/g, "")}`} className="text-link">
                {telefoon}
              </a>
            </div>
            <div>
              <h2 className="contact__label">Adres</h2>
              <p>
                {BEDRIJF.naam}
                <br />
                {CONTACT.straat}
                <br />
                {CONTACT.postcode}
              </p>
            </div>
            <div>
              <h2 className="contact__label">Volg ons</h2>
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-link">
                LinkedIn
              </a>
            </div>
            <p className="meta">Ondernemingsnummer {BEDRIJF.ondernemingsnummer}</p>
          </address>
          <div>
            <Formulier soort="contact" />
          </div>
        </div>
      </section>
    </Pagina>
  );
}
