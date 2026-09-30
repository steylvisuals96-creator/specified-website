import T from "@/components/T";

// De afsluiter: het e-mailadres is zelf de actie, dus geen extra knop ernaast.
export default function CTA({ titel, email, telefoon }: { titel?: string; email?: string; telefoon?: string }) {
  const mail = email || "info@specified.be";

  return (
    <section id="contact" className="cta">
      <div className="wrap cta__inner">
        <h2 className="display display-l">
          <T k="cta.titel" d={titel || "Laten we kennismaken."} accent />
        </h2>
        <a href={`mailto:${mail}`} className="cta__mail">
          {mail}
        </a>
        {telefoon && (
          <a href={`tel:${telefoon.replace(/\s/g, "")}`} className="text-link cta__tel">
            {telefoon}
          </a>
        )}
      </div>
    </section>
  );
}
