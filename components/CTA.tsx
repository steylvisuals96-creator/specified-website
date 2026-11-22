"use client";

import { metAccent } from "@/lib/accent";
import { useTaal } from "@/components/TaalContext";
import { ui } from "@/lib/teksten";

// De afsluiter: het e-mailadres is zelf de actie, dus geen extra knop ernaast.
export default function CTA({ titel, email, telefoon }: { titel?: string; email?: string; telefoon?: string }) {
  const mail = email || "info@specified.be";
  const standaardTitel = ui(useTaal()).cta.titel;

  return (
    <section id="contact" className="cta">
      <div className="wrap cta__inner">
        <h2 className="display display-l">{metAccent(titel || standaardTitel)}</h2>
        <a href={`mailto:${mail}`} className="cta__mail" data-bewerk="contact.email">
          {mail}
        </a>
        {telefoon && (
          <a href={`tel:${telefoon.replace(/\s/g, "")}`} className="text-link cta__tel" data-bewerk="contact.telefoon">
            {telefoon}
          </a>
        )}
      </div>
    </section>
  );
}
