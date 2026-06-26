"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, DragOverlay, closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";

const COLUMNS = [
  { id: "nieuw",               label: "Nieuw",           kleur: "#facb04", bg: "rgba(250,203,4,0.08)" },
  { id: "gecontacteerd",       label: "Gecontacteerd",   kleur: "#60a5fa", bg: "rgba(96,165,250,0.08)" },
  { id: "bezoek_gepland",      label: "Bezoek gepland",  kleur: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
  { id: "onderhandeling",      label: "Onderhandeling",  kleur: "#f472b6", bg: "rgba(244,114,182,0.08)" },
  { id: "afgerond",            label: "Afgerond",        kleur: "#34d399", bg: "rgba(52,211,153,0.08)" },
  { id: "niet_geinteresseerd", label: "Niet interess.",  kleur: "#6b7280", bg: "rgba(107,114,128,0.08)" },
];

const DAYS_STALE = 7;

type Lead = {
  id: string;
  naam: string;
  email: string;
  telefoon?: string;
  status: string;
  bron?: string;
  budget?: number;
  pandPrijs?: number;
  createdAt: string;
  updatedAt: string;
  toegewezen_aan?: { id?: string; naam?: string } | null;
};

type Makelaar = { id: string; naam: string };

function fmtEuro(n: number) {
  return "€ " + Math.round(n).toLocaleString("nl-BE");
}

function isStale(updatedAt: string) {
  return (Date.now() - new Date(updatedAt).getTime()) > DAYS_STALE * 86400_000;
}

function LeadCard({ lead, kleur, isDragging }: { lead: Lead; kleur: string; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSorting } = useSortable({ id: lead.id });
  const stale = isStale(lead.updatedAt);
  const waarde = lead.budget ?? lead.pandPrijs;

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isSorting ? 0.4 : 1 }} {...attributes} {...listeners}>
      <div style={{
        background: "#1a1a1a",
        border: `1px solid ${isDragging ? kleur : stale ? "#7f1d1d" : "#2a2a2a"}`,
        borderRadius: 8,
        padding: "0.875rem 1rem",
        marginBottom: "0.625rem",
        cursor: "grab",
        boxShadow: isDragging ? `0 8px 24px rgba(0,0,0,0.4)` : "0 1px 4px rgba(0,0,0,0.3)",
        transition: "border-color 0.15s",
        position: "relative" as const,
      }}>
        {stale && (
          <div style={{ position: "absolute", top: 8, right: 8, background: "#ef4444", borderRadius: 4, padding: "1px 6px", fontSize: "0.6rem", fontWeight: 700, color: "#fff" }}>
            {Math.floor((Date.now() - new Date(lead.updatedAt).getTime()) / 86400_000)}d
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", paddingRight: stale ? 28 : 0 }}>
          <Link href={`/dashboard/leads/${lead.id}`} onClick={e => e.stopPropagation()}
            style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", lineHeight: 1.3 }}>
            {lead.naam}
          </Link>
          <span style={{ fontSize: "0.65rem", color: "#555", whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 }}>
            {new Date(lead.createdAt).toLocaleDateString("nl-BE", { day: "numeric", month: "short" })}
          </span>
        </div>
        <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.375rem" }}>{lead.email}</div>
        {waarde && (
          <div style={{ fontSize: "0.7rem", color: kleur, fontWeight: 700, marginTop: "0.375rem" }}>
            {fmtEuro(waarde)}
          </div>
        )}
        {lead.toegewezen_aan?.naam && (
          <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: kleur, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: "#000", flexShrink: 0 }}>
              {lead.toegewezen_aan.naam.charAt(0)}
            </div>
            <span style={{ fontSize: "0.7rem", color: "#666" }}>{lead.toegewezen_aan.naam}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ col, leads, isOver }: { col: typeof COLUMNS[0]; leads: Lead[]; isOver: boolean }) {
  const totaal = leads.reduce((sum, l) => sum + (l.budget ?? l.pandPrijs ?? 0), 0);
  const { setNodeRef } = useDroppable({ id: col.id });

  return (
    <div ref={setNodeRef} style={{
      flex: "0 0 260px", background: isOver ? col.bg : "#111",
      border: `1px solid ${isOver ? col.kleur : "#222"}`,
      borderRadius: 12, padding: "1rem", minHeight: 400,
      transition: "border-color 0.15s, background 0.15s",
    }}>
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.kleur, flexShrink: 0 }} />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: col.kleur, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {col.label}
          </span>
          <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#444", background: "#1a1a1a", padding: "1px 7px", borderRadius: 20, fontWeight: 600 }}>
            {leads.length}
          </span>
        </div>
        {totaal > 0 && (
          <div style={{ fontSize: "0.7rem", color: "#555", paddingLeft: 16 }}>
            {fmtEuro(totaal)} pipeline
          </div>
        )}
      </div>
      <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
        {leads.map(lead => <LeadCard key={lead.id} lead={lead} kleur={col.kleur} />)}
      </SortableContext>
      {leads.length === 0 && (
        <div style={{ color: "#333", fontSize: "0.75rem", textAlign: "center", paddingTop: "2rem" }}>
          Sleep een lead hierheen
        </div>
      )}
    </div>
  );
}

export default function LeadsKanban({ initialLeads, makelaars }: { initialLeads: Lead[]; makelaars: Makelaar[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [filterMakelaar, setFilterMakelaar] = useState<string>("alle");
  const [filterStale, setFilterStale] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const visibleLeads = useMemo(() => leads.filter(l => {
    if (filterMakelaar !== "alle" && l.toegewezen_aan?.id !== filterMakelaar) return false;
    if (filterStale && !isStale(l.updatedAt)) return false;
    return true;
  }), [leads, filterMakelaar, filterStale]);

  const getColId = useCallback((id: string | null | undefined) => {
    if (!id) return null;
    if (COLUMNS.find(c => c.id === id)) return id;
    return leads.find(l => l.id === id)?.status ?? null;
  }, [leads]);

  function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id as string); }
  function handleDragOver(e: DragOverEvent) { setOverId(getColId(e.over?.id as string ?? null)); }

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null); setOverId(null);
    if (!over) return;
    const leadId = active.id as string;
    const targetCol = getColId(over.id as string ?? null);
    if (!targetCol) return;
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === targetCol) return;

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: targetCol, updatedAt: new Date().toISOString() } : l));
    setSaving(s => new Set(s).add(leadId));
    try {
      await fetch("/api/leads/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: targetCol }),
      });
    } catch {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: lead.status } : l));
    } finally {
      setSaving(s => { const n = new Set(s); n.delete(leadId); return n; });
    }
  }

  const activeLead = leads.find(l => l.id === activeId);
  const activeCol = COLUMNS.find(c => c.id === activeLead?.status);
  const staleCount = leads.filter(l => isStale(l.updatedAt) && l.status !== "afgerond" && l.status !== "niet_geinteresseerd").length;

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={filterMakelaar}
          onChange={e => setFilterMakelaar(e.target.value)}
          style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "#fff", padding: "0.4rem 0.75rem", fontSize: "0.8rem", cursor: "pointer" }}
        >
          <option value="alle">Alle makelaars</option>
          {makelaars.map(m => <option key={m.id} value={m.id}>{m.naam}</option>)}
        </select>
        <button
          onClick={() => setFilterStale(f => !f)}
          style={{
            background: filterStale ? "#ef4444" : "#1a1a1a",
            border: `1px solid ${filterStale ? "#ef4444" : "#333"}`,
            borderRadius: 6, color: "#fff", padding: "0.4rem 0.75rem",
            fontSize: "0.8rem", cursor: "pointer",
          }}
        >
          {filterStale ? "✕ " : ""}Verlopen leads {staleCount > 0 && `(${staleCount})`}
        </button>
        <div style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#555" }}>
          Totale pipeline:{" "}
          <span style={{ color: "#facb04", fontWeight: 700 }}>
            {fmtEuro(visibleLeads.reduce((s, l) => s + (l.budget ?? l.pandPrijs ?? 0), 0))}
          </span>
        </div>
      </div>

      {saving.size > 0 && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "0.6rem 1rem", fontSize: "0.8rem", color: "#facb04", zIndex: 999 }}>
          Opslaan…
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1.5rem" }}>
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              col={col}
              leads={visibleLeads.filter(l => l.status === col.id)}
              isOver={overId === col.id}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead && activeCol ? (
            <div style={{ width: 260 }}>
              <LeadCard lead={activeLead} kleur={activeCol.kleur} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
