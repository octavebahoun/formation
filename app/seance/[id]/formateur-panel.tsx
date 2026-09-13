"use client";

import { useState, useTransition } from "react";
import { setStatut, setDatePrevue, saveNotesFormateur } from "./actions";

type Seance = {
  id: number;
  statut: "a_venir" | "faite" | "annulee";
  date_prevue: string | null;
  notes_formateur: string | null;
};

const STATUTS: Array<{ v: Seance["statut"]; label: string }> = [
  { v: "a_venir", label: "À venir" },
  { v: "faite", label: "Faite" },
  { v: "annulee", label: "Annulée" },
];

export function FormateurPanel({ seance }: { seance: Seance }) {
  const [notes, setNotes] = useState(seance.notes_formateur ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-10">
      {/* Statut */}
      <div>
        <div className="eyebrow mb-3">Statut de la séance</div>
        <div className="inline-flex border border-[var(--line-strong)] rounded-sm overflow-hidden">
          {STATUTS.map((s) => {
            const active = seance.statut === s.v;
            return (
              <button
                key={s.v}
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await setStatut(seance.id, s.v);
                  })
                }
                className={`px-4 py-2 text-[13px] font-medium transition ${
                  active
                    ? "bg-[var(--deep)] text-[var(--paper)]"
                    : "bg-transparent text-[var(--muted)] hover:text-[var(--deep)]"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date prévue */}
      <div>
        <label className="eyebrow block mb-3" htmlFor="date-prevue">
          Date prévue
        </label>
        <input
          id="date-prevue"
          type="date"
          defaultValue={seance.date_prevue ?? ""}
          disabled={pending}
          onBlur={(e) =>
            startTransition(async () => {
              await setDatePrevue(seance.id, e.target.value || null);
            })
          }
          className="field max-w-[220px]"
        />
      </div>

      {/* Notes formateur */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <label className="eyebrow" htmlFor="notes">
            Notes de préparation / debrief
          </label>
          {saved && (
            <span className="text-[11px] text-[var(--teal)]">Enregistré ✓</span>
          )}
        </div>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          onBlur={() =>
            startTransition(async () => {
              const res = await saveNotesFormateur(seance.id, notes);
              if (!res?.error) setSaved(true);
            })
          }
          rows={6}
          placeholder="Points clés, exemples, ce qui a bien fonctionné…"
          className="w-full bg-[color:#FBFBF7] border border-[var(--line-strong)] rounded-sm p-4 text-[14px] font-body text-[var(--ink)] outline-none focus:border-[var(--deep)] resize-y"
        />
      </div>
    </div>
  );
}
