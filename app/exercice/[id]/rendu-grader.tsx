"use client";

import { useState, useTransition } from "react";
import { gradeRendu } from "./actions";

type Props = {
  renduId: number;
  exerciceId: number;
  initialNote: number | null;
  initialFeedback: string | null;
};

export function RenduGrader({
  renduId,
  exerciceId,
  initialNote,
  initialFeedback,
}: Props) {
  const [note, setNote] = useState<string>(initialNote !== null ? String(initialNote) : "");
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-4 pt-4 border-t border-dashed border-[var(--line)] space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor={`note-${renduId}`} className="eyebrow">
          Note / 20
        </label>
        <input
          id={`note-${renduId}`}
          type="number"
          min={0}
          max={20}
          step={0.5}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setSaved(false);
          }}
          className="w-24 field !border-b !border-[var(--line-strong)] focus:!border-[var(--deep)] text-center font-display text-lg"
        />
        {saved && (
          <span className="text-[11px] text-[var(--teal)] ml-auto">
            Enregistré ✓
          </span>
        )}
      </div>

      <div>
        <label htmlFor={`fb-${renduId}`} className="eyebrow block mb-2">
          Feedback
        </label>
        <textarea
          id={`fb-${renduId}`}
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value);
            setSaved(false);
          }}
          rows={3}
          placeholder="Ce qui est bien, ce qu'il faut retravailler…"
          className="w-full bg-transparent border border-[var(--line-strong)] rounded-sm p-3 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--deep)] resize-y"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const parsed = note === "" ? null : Number(note);
              const res = await gradeRendu(renduId, exerciceId, parsed, feedback);
              if (!res?.error) setSaved(true);
            })
          }
          className="btn-primary text-[12px] py-2 px-4"
        >
          {pending ? "…" : "Enregistrer la note"}
        </button>
      </div>
    </div>
  );
}
