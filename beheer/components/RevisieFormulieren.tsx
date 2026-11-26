"use client";

import { useActionState, useState } from "react";
import { maakRevisie, volgRevisieOp, reageerOpRevisie } from "@/lib/acties/revisies";
import { STATUS, PRIORITEIT, APPARAAT } from "@/lib/revisies";
import { LEEG, type Resultaat } from "@/lib/formulier";

function Melding({ staat }: { staat: Resultaat }) {
  return staat.melding ? <p role={staat.ok ? "status" : "alert"} className={staat.ok ? "text-[var(--goed)]" : "veld-fout"}>{staat.melding}</p> : null;
}

export function NieuweRevisie({ naam, pagina }: { naam: string; pagina: string }) {
  const [staat, actie, bezig] = useActionState(maakRevisie, LEEG);
  const [invoer, setInvoer] = useState({ titel: "", pagina, beschrijving: "", apparaat: "alle", prioriteit: "normaal" });
  const wijzig = (sleutel: keyof typeof invoer, waarde: string) => setInvoer(v => ({ ...v, [sleutel]: waarde }));
  return <form action={actie} className="paneel max-w-[780px] space-y-6">
    <p className="stil">Je meldt deze revisie als <strong className="text-[var(--tekst)]">{naam}</strong>. Je naam wordt automatisch bewaard.</p>
    <div><label htmlFor="titel" className="veld-label">Wat moet er veranderen?</label>
      <input id="titel" name="titel" value={invoer.titel} onChange={e => wijzig("titel", e.target.value)} className="invoer" required maxLength={160} placeholder="Bijvoorbeeld: contactnummer aanpassen in de footer" aria-invalid={!!staat.velden?.titel} aria-describedby={staat.velden?.titel ? "titel-fout" : undefined} />
      {staat.velden?.titel && <p id="titel-fout" className="veld-fout">{staat.velden.titel}</p>}</div>
    <div><label htmlFor="pagina" className="veld-label">Pagina of onderdeel</label>
      <input id="pagina" name="pagina" className="invoer" value={invoer.pagina} onChange={e => wijzig("pagina", e.target.value)} required maxLength={600} placeholder="/voor-bedrijven#sectoren" aria-invalid={!!staat.velden?.pagina} aria-describedby="pagina-hulp pagina-fout" />
      <p id="pagina-hulp" className="stil text-sm mt-2">Gebruik / voor de homepage. Voor een Engelse pagina begint het pad met /en.</p>
      <p id="pagina-fout" className="veld-fout">{staat.velden?.pagina}</p></div>
    <div><label htmlFor="beschrijving" className="veld-label">Beschrijf de gewenste correctie</label>
      <textarea id="beschrijving" name="beschrijving" value={invoer.beschrijving} onChange={e => wijzig("beschrijving", e.target.value)} className="invoer min-h-44" rows={7} required maxLength={6000} placeholder="Waar zie je het probleem? Wat staat er nu, en wat moet het worden?" aria-invalid={!!staat.velden?.beschrijving} aria-describedby={staat.velden?.beschrijving ? "beschrijving-fout" : undefined} />
      {staat.velden?.beschrijving && <p id="beschrijving-fout" className="veld-fout">{staat.velden.beschrijving}</p>}</div>
    <div className="grid gap-5 sm:grid-cols-2">
      <div><label htmlFor="apparaat" className="veld-label">Op welk toestel?</label><select id="apparaat" name="apparaat" className="invoer" value={invoer.apparaat} onChange={e => wijzig("apparaat", e.target.value)}>{Object.entries(APPARAAT).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>{staat.velden?.apparaat && <p className="veld-fout">{staat.velden.apparaat}</p>}</div>
      <div><label htmlFor="prioriteit" className="veld-label">Prioriteit</label><select id="prioriteit" name="prioriteit" className="invoer" value={invoer.prioriteit} onChange={e => wijzig("prioriteit", e.target.value)}>{Object.entries(PRIORITEIT).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>{staat.velden?.prioriteit && <p className="veld-fout">{staat.velden.prioriteit}</p>}</div>
    </div>
    <Melding staat={staat} />
    <button type="submit" className="knop" disabled={bezig}>{bezig ? "Revisie toevoegen…" : "Revisie toevoegen"}</button>
  </form>;
}

export function RevisieOpvolgen({ id, status, prioriteit, gewijzigd }: { id: string; status: string; prioriteit: string; gewijzigd: string }) {
  const [staat, actie, bezig] = useActionState(volgRevisieOp, LEEG);
  return <form action={actie} className="space-y-5">
    <input type="hidden" name="id" value={id} /><input type="hidden" name="gewijzigd" value={staat.opgeslagen ?? gewijzigd} />
    <div><label htmlFor="status" className="veld-label">Status</label><select id="status" name="status" className="invoer" defaultValue={status}>{Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
    <div><label htmlFor="prioriteit" className="veld-label">Prioriteit</label><select id="prioriteit" name="prioriteit" className="invoer" defaultValue={prioriteit}>{Object.entries(PRIORITEIT).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
    <Melding staat={staat} />
    <button className="knop knop-stil" disabled={bezig}>{bezig ? "Opslaan…" : "Opvolging opslaan"}</button>
  </form>;
}

export function RevisieReactie({ id, naam }: { id: string; naam: string }) {
  const [reactie, setReactie] = useState("");
  const [staat, actie, bezig] = useActionState(async (vorige: Resultaat, fd: FormData) => {
    const resultaat = await reageerOpRevisie(vorige, fd);
    if (resultaat.ok) setReactie("");
    return resultaat;
  }, LEEG);
  return <form action={actie} className="space-y-4 mt-7">
    <input type="hidden" name="id" value={id} />
    <label htmlFor="reactie" className="veld-label">Reageren als {naam}</label>
    <textarea id="reactie" name="tekst" value={reactie} onChange={e => setReactie(e.target.value)} className="invoer" rows={4} required maxLength={4000} placeholder="Voeg context toe of laat weten wat er aangepast is." />
    <Melding staat={staat} />
    <button className="knop knop-stil" disabled={bezig}>{bezig ? "Reactie toevoegen…" : "Reactie toevoegen"}</button>
  </form>;
}
