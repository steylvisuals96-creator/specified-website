import Signature from "@/components/Signature";

// Typografische hero: de kop is het beeld. Het tweede woord kan uit de CMS komen
// (hero_woorden); het eerste daarvan wordt gebruikt, niet geroteerd.
export default function Hero({
  prefix,
  woorden,
  suffix,
  subtitle,
  ctaPrimary,
  ctaSecondary,
}: {
  prefix?: string;
  woorden?: { woord: string }[];
  suffix?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
} = {}) {
  const woord = woorden?.[0]?.woord || "engineer";
  const heroPrefix = prefix || "We";
  const heroSuffix = suffix || "possibilities.";
  const intro =
    subtitle?.split("\n\n")[0]?.trim() ||
    "Specified verbindt technische toptalenten met ambitieuze ingenieurbureaus en industriële bedrijven. Eerlijk, snel en persoonlijk.";

  return (
    <section className="hero" aria-labelledby="hero-titel">
      <div className="wrap hero__inner">
        <div className="hero__copy">
          <p className="lead">{intro}</p>
          <div className="hero__actions">
            <a href="/vacatures" className="btn btn-primary">
              {ctaPrimary || "Bekijk vacatures"}
            </a>
            <a href="#contact" className="btn btn-secondary">
              {ctaSecondary || "Neem contact op"}
            </a>
          </div>
        </div>

        <h1 id="hero-titel" className="display hero__title">
          <span className="hero__line">
            <span>
              {heroPrefix} <span className="hero__brand">{woord}</span>
            </span>
          </span>
          <span className="hero__line">
            <span>{heroSuffix}</span>
          </span>
        </h1>

        <Signature className="hero__signature" />
      </div>
    </section>
  );
}
