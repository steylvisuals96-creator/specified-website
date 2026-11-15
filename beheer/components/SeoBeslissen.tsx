"use client";

import { useFormStatus } from "react-dom";
import { beslisSeo } from "@/lib/acties/seo";

function Keuzes() {
  const { pending } = useFormStatus();
  return (
    <>
      <button className="knop knop-klein" name="keuze" value="toepassen" type="submit" disabled={pending}>
        {pending ? "Bezig…" : "Metadata toepassen"}
      </button>
      <button className="knop knop-stil knop-klein" name="keuze" value="verwerpen" type="submit" disabled={pending}>
        Verwerpen
      </button>
    </>
  );
}

export default function SeoBeslissen({ id }: { id: string }) {
  return (
    <form action={beslisSeo} className="flex flex-wrap gap-2">
      <input type="hidden" name="id" value={id} />
      <Keuzes />
    </form>
  );
}
