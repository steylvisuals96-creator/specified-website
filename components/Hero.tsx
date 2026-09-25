import Image from "next/image";
import HeroRotator from "@/components/HeroRotator";

// Typografische hero: de kop is het beeld. Het tweede woord wisselt (rotator);
// de woorden komen uit de CMS (hero_woorden) of uit de standaardlijst.
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
  const lijst = woorden?.map((w) => w.woord).filter(Boolean);
  const woord = lijst?.[0] || "engineer";
  const heroPrefix = prefix || "We";
  const heroSuffix = suffix || "possibilities.";
  const intro =
    subtitle?.split("\n\n")[0]?.trim() ||
    "Specified verbindt technische toptalenten met ambitieuze ingenieurbureaus en industriële bedrijven. Eerlijk, snel en persoonlijk.";

  return (
    <section className="hero" aria-labelledby="hero-titel">
      {/* Sfeerbeeld (AI-gegenereerd, geen mensen): turbine rechtsboven, kop in de donkere ruimte. */}
      <div className="hero__beeld" aria-hidden="true">
        <Image src="/images/beeld/hero-turbine.jpg" alt="" fill priority sizes="100vw" />
      </div>
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
          <span className="sr-only">
            {heroPrefix} {woord} {heroSuffix}
          </span>
          <HeroRotator prefix={heroPrefix} suffix={heroSuffix} woorden={lijst} />
        </h1>
      </div>
    </section>
  );
}
