"use client";

import {
  CONTRACT_OPTIES, NIVEAU_OPTIES, OPLEIDING_OPTIES, STATUS_OPTIES, TAAL_OPTIES, UREN_OPTIES, VAKGEBIED_OPTIES,
  type VacatureVorm,
} from "@/lib/vacatureVorm";

/**
 * De velden van een vacature, gedeeld door "Nieuwe vacature" en "Bewerken".
 * Alles wat op de website staat, vul je hier in: kenmerken, tekst en lijsten.
 */
const invoer: React.CSSProperties = {
  background: "var(--ink-800)", border: "1px solid var(--olive-600)", borderRadius: "2px",
  color: "var(--bone-100)", fontSize: "0.875rem", padding: "0.45rem 0.65rem",
  fontFamily: "inherit", width: "100%",
};
const rij: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" };
const kop: React.CSSProperties = {
  fontSize: "0.9375rem", fontWeight: 700, color: "var(--bone-100)", marginTop: "0.75rem",
  paddingTop: "1rem", borderTop: "1px solid var(--line)",
};

function Veld({ label, hint, verplicht, children }: { label: string; hint?: string; verplicht?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)" }}>
        {label}
        {verplicht && <span style={{ color: "#dffd7b", marginLeft: "0.25rem" }}>*</span>}
      </span>
      {children}
      {hint && <span style={{ fontSize: "0.75rem", color: "var(--bone-400)" }}>{hint}</span>}
    </label>
  );
}

function Keuze({ waarde, opties, leeg, onChange }: { waarde: string; opties: { label: string; value: string }[]; leeg?: string; onChange: (v: string) => void }) {
  return (
    <select style={{ ...invoer, cursor: "pointer" }} value={waarde} onChange={(e) => onChange(e.target.value)}>
      {leeg !== undefined && <option value="">{leeg}</option>}
      {opties.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function VacatureVelden({ form, set }: { form: VacatureVorm; set: <K extends keyof VacatureVorm>(k: K, v: VacatureVorm[K]) => void }) {
  const tekstvak = (k: "beschrijving" | "vereisten" | "nice_to_have" | "aanbod", rows: number, placeholder?: string) => (
    <textarea style={{ ...invoer, resize: "vertical", lineHeight: 1.5 }} rows={rows} value={form[k]} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} />
  );

  return (
    <>
      <Veld label="Functietitel" verplicht>
        <input style={invoer} value={form.titel} onChange={(e) => set("titel", e.target.value)} placeholder="bv. Mechanical Engineer" />
      </Veld>
      <div style={rij}>
        <Veld label="Vakgebied" verplicht>
          <Keuze waarde={form.sector} opties={VAKGEBIED_OPTIES} leeg="Kies een vakgebied" onChange={(v) => set("sector", v)} />
        </Veld>
        <Veld label="Locatie of regio">
          <input style={invoer} value={form.locatie} onChange={(e) => set("locatie", e.target.value)} placeholder="bv. Antwerpen" />
        </Veld>
      </div>
      <div style={rij}>
        <Veld label="Uren">
          <Keuze waarde={form.uren} opties={UREN_OPTIES} leeg="Niet vermeld" onChange={(v) => set("uren", v)} />
        </Veld>
        <Veld label="Contract">
          <Keuze waarde={form.type} opties={CONTRACT_OPTIES} onChange={(v) => set("type", v)} />
        </Veld>
      </div>
      <div style={rij}>
        <Veld label="Ervaringsniveau">
          <Keuze waarde={form.ervaringsniveau} opties={NIVEAU_OPTIES} leeg="Niet vermeld" onChange={(v) => set("ervaringsniveau", v)} />
        </Veld>
        <Veld label="Opleidingsniveau">
          <Keuze waarde={form.opleidingsniveau} opties={OPLEIDING_OPTIES} leeg="Niet vermeld" onChange={(v) => set("opleidingsniveau", v)} />
        </Veld>
      </div>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)", marginBottom: "0.4rem" }}>Talen</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.25rem" }}>
          {TAAL_OPTIES.map((t) => (
            <label key={t.value} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", color: "var(--bone-100)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.talen.includes(t.value)}
                onChange={(e) => set("talen", e.target.checked ? [...form.talen, t.value] : form.talen.filter((x) => x !== t.value))}
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div style={kop}>Tekst op de website</div>
      <Veld label="Jobomschrijving" hint="Een lege regel begint een nieuwe alinea.">
        {tekstvak("beschrijving", 7)}
      </Veld>
      <Veld label="Jouw profiel" hint="Eén punt per regel.">
        {tekstvak("vereisten", 4)}
      </Veld>
      <Veld label="Nice to have" hint="Eén punt per regel.">
        {tekstvak("nice_to_have", 3)}
      </Veld>
      <Veld label="Wat we bieden" hint="Eén punt per regel.">
        {tekstvak("aanbod", 4)}
      </Veld>

      <div style={kop}>Publicatie</div>
      <div style={rij}>
        <Veld label="Status">
          <Keuze waarde={form.status} opties={STATUS_OPTIES} onChange={(v) => set("status", v)} />
        </Veld>
        <Veld label="Plaatsingsdatum" hint="Leeg = vandaag.">
          <input type="date" style={{ ...invoer, colorScheme: "dark" }} value={form.gepubliceerd_op} onChange={(e) => set("gepubliceerd_op", e.target.value)} />
        </Veld>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--bone-100)", cursor: "pointer" }}>
        <input type="checkbox" checked={form.zichtbaar_op_website} onChange={(e) => set("zichtbaar_op_website", e.target.checked)} />
        Toon op de website
      </label>
      <Veld label="Salaris (intern)" hint="Alleen voor intern gebruik: de website toont geen salaris.">
        <input style={invoer} value={form.salaris} onChange={(e) => set("salaris", e.target.value)} />
      </Veld>
    </>
  );
}
