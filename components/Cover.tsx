import Image from "next/image";
import { CMS_URL } from "@/lib/settings";

// Hosts die via next/image mogen: dan komt het beeld van ons eigen domein, in
// de juiste maat en als AVIF/WebP, zonder extra verbinding naar buiten.
// Moet overeenkomen met images.remotePatterns in next.config.ts.
const TOEGESTAAN = new Set(["images.unsplash.com", safeHost(CMS_URL)]);

function safeHost(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/** Coverbeeld van een blogartikel; vult zijn (relatieve) ouder. */
export default function Cover({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  if (TOEGESTAAN.has(safeHost(src))) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={70}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className="foto-grade object-cover"
      />
    );
  }
  // Onbekende host: gewoon laden, zonder optimalisatie.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className="foto-grade"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}
