import { notFound } from "next/navigation";

// Elk adres zonder eigen pagina: de 404 van de taal (app/[taal]/not-found.tsx), met menu en footer.
export default function Onbekend() {
  notFound();
}
