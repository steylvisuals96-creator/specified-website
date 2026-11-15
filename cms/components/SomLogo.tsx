"use client";

import Image from "next/image";

export function SomLogo() {
  return (
    <Image
      src="/som-logo.svg"
      alt="SOM Vastgoed"
      width={120}
      height={70}
      style={{ objectFit: "contain" }}
    />
  );
}

export function SomIcon() {
  return (
    <Image
      src="/som-logo.svg"
      alt="SOM"
      width={40}
      height={40}
      style={{ objectFit: "contain" }}
    />
  );
}
