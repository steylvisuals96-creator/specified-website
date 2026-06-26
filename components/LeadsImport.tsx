"use client";

import { useState, useRef } from "react";

const G = "#facb04";
const BORDER = "#252525";
const S2 = "#161616";
const S3 = "#1e1e1e";
const MUTED = "#666";
const TEXT = "#e8e8e8";

type LeadRij = {
  naam: string;
  email: string;
  telefoon: string;
  bron: string;
  bericht: string;
  status: "ok" | "fout" | "aangemeld";
  fout?: string;
};

// Immoweb CSV kolom mapping (flexibel — zoekt op naam)
const KOLOM_MAP: Record<string, keyof Pick<LeadRij, "naam" | "email" | "telefoon" | "bericht">> = {
  "naam": "naam", "name": "naam", "voornaam achternaam": "naam", "contact": "naam",
  "email": "email", "e-mail": "email", "emailadres": "email",
  "telefoon": "telefoon", "tel": "telefoon", "phone": "telefoon", "gsm": "telefoon",
  "bericht": "bericht", "message": "bericht", "opmerking": "bericht", "vraag": "bericht",
};

function parseCSV(tekst: string): string[][] {
  const regels = tekst.split(/\r?\n/).filter(r => r.trim());
  return regels.map(regel => {
    const cols: string[] = [];
    let huidig = "";
    let inQuotes = false;
    for (let i = 0; i < regel.length; i++) {
      const c = regel[i];
      if (c === '"') {
        if (inQuotes && regel[i + 1] === '"') { huidig += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if ((c === "," || c === ";") && !inQuotes) {
        cols.push(huidig.trim()); huidig = "";
      } else huidig += c;
    }
    cols.push(huidig.trim());
    return cols;
  });
}

export default function LeadsImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rijen, setRijen] = useState<LeadRij[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [bezig, setBezig] = useState(false);
  const [klaar, setKlaar] = useState(false);
  const [foutBericht, setFoutBericht] = useState("");

  function laadBestand(bestand: File) {
    setKlaar(false); setFoutBericht("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const tekst = e.target?.result as string;
      const raws = parseCSV(tekst);
      if (raws.length < 2) { setFoutBericht("Bestand bevat te weinig rijen."); return; }

      const hdrs = raws[0].map(h => h.toLowerCase().trim());
      setHeaders(hdrs);

      const kolomIndex: Record<keyof Pick<LeadRij, "naam" | "email" | "telefoon" | "bericht">, number> = {
        naam: -1, email: -1, telefoon: -1, bericht: -1,
      };
      hdrs.forEach((h, i) => {
        const mapped = KOLOM_MAP[h];
        if (mapped && kolomIndex[mapped] === -1) kolomIndex[mapped] = i;
      });

      if (kolomIndex.naam === -1 && kolomIndex.email === -1) {
        setFoutBericht("Kan geen naam- of e-mailkolom vinden. Controleer de kolomnamen.");
        return;
      }

      const verwerkt: LeadRij[] = raws.slice(1).filter(r => r.some(c => c)).map(r => {
        const naam = kolomIndex.naam >= 0 ? r[kolomIndex.naam] ?? "" : "";
        const email = kolomIndex.email >= 0 ? r[kolomIndex.email] ?? "" : "";
        const telefoon = kolomIndex.telefoon >= 0 ? r[kolomIndex.telefoon] ?? "" : "";
        const bericht = kolomIndex.bericht >= 0 ? r[kolomIndex.bericht] ?? "" : "";
        const fout = !naam && !email ? "Naam en e-mail ontbreken" : !email ? "E-mail ontbreekt" : !naam ? "Naam ontbreekt" : undefined;
        return { naam, email, telefoon, bron: "immoweb", bericht, status: fout ? "fout" : "ok", fout };
      });

      setRijen(verwerkt);
    };
    reader.readAsText(bestand, "utf-8");
  }

  async function importeer() {
    setBezig(true);
    const geldig = rijen.filter(r => r.status === "ok");
    const bijgewerkt = [...rijen];

    for (const rij of geldig) {
      const idx = bijgewerkt.findIndex(r => r.email === rij.email && r.naam === rij.naam);
      try {
        const res = await fetch("/api/leads/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ naam: rij.naam, email: rij.email, telefoon: rij.telefoon, bron: rij.bron, bericht: rij.bericht }),
        });
        bijgewerkt[idx] = { ...bijgewerkt[idx], status: res.ok ? "aangemeld" : "fout", fout: res.ok ? undefined : `HTTP ${res.status}` };
      } catch {
        bijgewerkt[idx] = { ...bijgewerkt[idx], status: "fout", fout: "Netwerk fout" };
      }
      setRijen([...bijgewerkt]);
    }
    setBezig(false);
    setKlaar(true);
  }

  const geldigCount = rijen.filter(r => r.status === "ok").length;
  const aangemeldCount = rijen.filter(r => r.status === "aangemeld").length;
  const foutCount = rijen.filter(r => r.status === "fout").length;

  return (
    <div>
      {/* Instructies */}
      <div style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: G, margin: "0 0 0.75rem" }}>Hoe te gebruiken</h3>
        <ol style={{ margin: 0, padding: "0 0 0 1.25rem", color: MUTED, fontSize: "0.82rem", lineHeight: 2 }}>
          <li>Exporteer leads vanuit Immoweb (of ander CRM) als CSV-bestand</li>
          <li>Zorg dat de kolommen <strong style={{ color: TEXT }}>naam</strong>, <strong style={{ color: TEXT }}>email</strong> en optioneel <strong style={{ color: TEXT }}>telefoon</strong>, <strong style={{ color: TEXT }}>bericht</strong> aanwezig zijn</li>
          <li>Upload het bestand hieronder en controleer de preview</li>
          <li>Klik op "Importeer leads" om ze toe te voegen aan het CRM</li>
        </ol>
        <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#555" }}>
          Ondersteunde scheidingstekens: komma (,) of puntkomma (;) · Encoding: UTF-8
        </div>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) laadBestand(f); }}
        style={{
          border: `2px dashed ${BORDER}`, borderRadius: 10, padding: "2.5rem",
          textAlign: "center", cursor: "pointer", marginBottom: "1.5rem",
          background: S2, transition: "border-color 0.15s",
        }}
      >
        <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) laadBestand(f); }} />
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📂</div>
        <div style={{ color: TEXT, fontWeight: 600, fontSize: "0.9rem" }}>Sleep een CSV-bestand of klik om te uploaden</div>
        <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.25rem" }}>Immoweb, Excel export of eigen CRM</div>
      </div>

      {foutBericht && (
        <div style={{ background: "#2d1010", border: "1px solid #7f1d1d", borderRadius: 8, padding: "0.875rem 1rem", color: "#fca5a5", fontSize: "0.82rem", marginBottom: "1rem" }}>
          {foutBericht}
        </div>
      )}

      {/* Preview tabel */}
      {rijen.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.8rem", color: MUTED }}>
              {rijen.length} rijen gevonden · <span style={{ color: "#34d399" }}>{geldigCount} geldig</span>
              {foutCount > 0 && <span style={{ color: "#ef4444" }}> · {foutCount} fouten</span>}
              {aangemeldCount > 0 && <span style={{ color: G }}> · {aangemeldCount} geïmporteerd</span>}
            </div>
            {!klaar && (
              <button
                onClick={importeer}
                disabled={bezig || geldigCount === 0}
                style={{
                  background: geldigCount > 0 && !bezig ? G : "#333",
                  color: geldigCount > 0 && !bezig ? "#111" : MUTED,
                  border: "none", borderRadius: 6, padding: "0.5rem 1.25rem",
                  fontWeight: 700, fontSize: "0.82rem", cursor: geldigCount > 0 && !bezig ? "pointer" : "not-allowed",
                }}
              >
                {bezig ? "Bezig met importeren…" : `Importeer ${geldigCount} leads`}
              </button>
            )}
            {klaar && (
              <div style={{ color: "#34d399", fontWeight: 600, fontSize: "0.82rem" }}>
                ✓ Import voltooid — {aangemeldCount} leads aangemeld
              </div>
            )}
          </div>

          <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${BORDER}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Status", "Naam", "E-mail", "Telefoon", "Bericht"].map(h => (
                    <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: MUTED, background: S2 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rijen.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#0f0f0f" : S2 }}>
                    <td style={{ padding: "0.5rem 0.875rem" }}>
                      {r.status === "aangemeld" && <span style={{ color: "#34d399", fontWeight: 700, fontSize: "0.72rem" }}>✓ Aangemeld</span>}
                      {r.status === "ok" && <span style={{ color: G, fontSize: "0.72rem" }}>✓ Geldig</span>}
                      {r.status === "fout" && <span style={{ color: "#ef4444", fontSize: "0.72rem" }} title={r.fout}>✗ {r.fout}</span>}
                    </td>
                    <td style={{ padding: "0.5rem 0.875rem", color: TEXT, fontWeight: 600 }}>{r.naam || <span style={{ color: MUTED }}>—</span>}</td>
                    <td style={{ padding: "0.5rem 0.875rem", color: MUTED }}>{r.email || <span style={{ color: "#ef4444" }}>Ontbreekt</span>}</td>
                    <td style={{ padding: "0.5rem 0.875rem", color: MUTED }}>{r.telefoon || "—"}</td>
                    <td style={{ padding: "0.5rem 0.875rem", color: MUTED, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.bericht || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
