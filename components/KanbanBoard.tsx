"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, useTransition } from "react";
import { moveSollicitatie } from "@/app/(app)/dashboard/pipeline/actions";

const LIME = "#dffd7b";
const DARK = "var(--ink-900)";
const S2 = "var(--olive-600)";
const S3 = "var(--olive-600)";
const BORDER = "var(--line)";
const MUTED = "var(--bone-400)";
const TEXT = "var(--bone-100)";

export type KanbanCard = {
  id: string;
  kandidaat: string;
  vacature: string;
  sector: string;
  dagen: number;
  status: string;
};

export type KanbanColumn = {
  id: string;
  label: string;
  kleur: string;
  cards: KanbanCard[];
};

const KOLOMMEN: { id: string; label: string; kleur: string }[] = [
  { id: "nieuw",            label: "Nieuw",         kleur: "#8fb3d9" },
  { id: "screening",        label: "Screening",      kleur: LIME },
  { id: "tel_gescreend",   label: "Gescreend",      kleur: "#b5a1d8" },
  { id: "voorgesteld",      label: "Voorgesteld",    kleur: "#d9a86c" },
  { id: "interview_gepland",label: "Interview",      kleur: "#d9a86c" },
  { id: "interview_afgerond", label: "Afgerond",    kleur: "#b5a1d8" },
  { id: "aanbod",           label: "Aanbod",         kleur: "#d9a86c" },
  { id: "geplaatst",        label: "Geplaatst",   kleur: "#9bd17f" },
];

function dagen(d: number) {
  if (d === 0) return "vandaag";
  if (d === 1) return "1 dag";
  return `${d} dagen`;
}

export default function KanbanBoard({ initialColumns }: { initialColumns: KanbanColumn[] }) {
  const [columns, setColumns] = useState(initialColumns);
  const [, startTransition] = useTransition();

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setColumns(prev => {
      const next = prev.map(col => ({ ...col, cards: [...col.cards] }));
      const srcCol = next.find(c => c.id === source.droppableId)!;
      const dstCol = next.find(c => c.id === destination.droppableId)!;
      const [card] = srcCol.cards.splice(source.index, 1);
      card.status = destination.droppableId;
      dstCol.cards.splice(destination.index, 0, card);
      return next;
    });

    startTransition(() => {
      moveSollicitatie(draggableId, destination.droppableId);
    });
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "1rem", alignItems: "flex-start" }}>
        {KOLOMMEN.map(kol => {
          const col = columns.find(c => c.id === kol.id) ?? { ...kol, cards: [] };
          return (
            <div key={kol.id} style={{ minWidth: 220, maxWidth: 220, flexShrink: 0 }}>
              {/* Column header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: TEXT }}>{kol.label}</span>
                </div>
                <span style={{ fontSize: "0.8125rem", background: S3, color: MUTED, borderRadius: 2, padding: "0.1rem 0.4rem", fontWeight: 600 }}>{col.cards.length}</span>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={kol.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: 120,
                      background: snapshot.isDraggingOver ? "rgba(223,253,123,0.04)" : "var(--ink-800)",
                      borderRadius: 2,
                      border: snapshot.isDraggingOver ? `1px solid rgba(223,253,123,0.2)` : `1px solid ${BORDER}`,
                      padding: "0.5rem",
                      transition: "all 0.15s",
                    }}
                  >
                    {col.cards.map((card, i) => (
                      <Draggable key={card.id} draggableId={card.id} index={i}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            style={{
                              background: snap.isDragging ? "var(--olive-600)" : S2,
                              border: `1px solid ${snap.isDragging ? "rgba(223,253,123,0.3)" : BORDER}`,
                              borderLeft: `3px solid ${kol.kleur}`,
                              borderRadius: 2,
                              padding: "0.7rem 0.75rem",
                              marginBottom: "0.5rem",
                              cursor: "grab",
                              boxShadow: snap.isDragging ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
                              ...prov.draggableProps.style,
                            }}
                          >
                            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: TEXT, marginBottom: "0.25rem", lineHeight: 1.3 }}>
                              {card.kandidaat}
                            </div>
                            <div style={{ fontSize: "0.8125rem", color: MUTED, marginBottom: "0.4rem", lineHeight: 1.3 }}>
                              {card.vacature}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              {card.sector && (
                                <span style={{ fontSize: "0.8125rem", color: "var(--bone-400)", border: "1px solid var(--olive-600)", padding: "0.1rem 0.45rem", borderRadius: 2 }}>
                                  {card.sector}
                                </span>
                              )}
                              <span style={{ fontSize: "0.8125rem", color: MUTED, marginLeft: "auto" }}>{dagen(card.dagen)}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {col.cards.length === 0 && (
                      <div style={{ textAlign: "center", padding: "1.5rem 0.5rem", color: "var(--olive-600)", fontSize: "0.8125rem" }}>Sleep hier</div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
