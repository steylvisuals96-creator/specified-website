"use client";

import Image from "next/image";
import { useState } from "react";

export default function PortretWissel({
  src,
  engineerSrc,
  naam,
  label,
}: {
  src: string;
  engineerSrc: string;
  naam: string;
  label: string;
}) {
  const [klaar, setKlaar] = useState(false);
  const [gekozen, setGekozen] = useState(false);

  return (
    <button
      type="button"
      className="team__portret-wissel"
      aria-label={label}
      aria-pressed={gekozen}
      disabled={!klaar}
      data-engineer={gekozen && klaar}
      onClick={() => setGekozen((waarde) => !waarde)}
      onBlur={() => setGekozen(false)}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setGekozen(false);
      }}
    >
      <Image src={src} alt={naam} fill sizes="(min-width: 900px) 50vw, 100vw" />
      <Image
        src={engineerSrc}
        alt=""
        aria-hidden="true"
        className="team__portret-engineer"
        fill
        sizes="(min-width: 900px) 50vw, 100vw"
        onLoad={() => setKlaar(true)}
        onError={() => setKlaar(false)}
      />
    </button>
  );
}
