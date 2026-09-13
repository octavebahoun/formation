"use client";

import { useState, useTransition } from "react";
import { updateExercice, deleteExercice } from "./actions";

type Props = {
  exerciceId: number;
  seanceId: number;
  initialTitre: string;
  initialEnonce: string;
};

export function EnonceEditor({
  exerciceId,
  seanceId,
  initialTitre,
  initialEnonce,
}: Props) {
  const [titre, setTitre] = useState(initialTitre);
  const [enonce, setEnonce] = useState(initialEnonce);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await updateExercice(exerciceId, { titre, enonce });
      if (!res?.error) setSaved(true);
    });

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="titre"
          className="eyebrow block mb-2"
        >
          Titre
        </label>
        <input
          id="titre"
          value={titre}
          onChange={(e) => {
            setTitre(e.target.value);
            setSaved(false);
          }}
          onBlur={save}
          className="w-full bg-transparent border-b border-[var(--line-strong)] focus:border-[var(--deep)] outline-none font-display text-3xl text-[var(--deep)] font-semibold py-2"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="enonce" className="eyebrow">
            Énoncé
          </label>
          {saved && (
            <span className="text-[11px] text-[var(--teal)]">Enregistré ✓</span>
          )}
        </div>
        <textarea
          id="enonce"
          value={enonce}
          onChange={(e) => {
            setEnonce(e.target.value);
            setSaved(false);
          }}
          onBlur={save}
          rows={8}
          placeholder="Ce que tu attends de Christian, la contrainte, ce qui compte pour la note…"
          className="w-full bg-[color:#FBFBF7] border border-[var(--line-strong)] rounded-sm p-4 text-[15px] leading-relaxed text-[var(--ink)] outline-none focus:border-[var(--deep)] resize-y"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={deleting || pending}
          onClick={() => {
            if (confirm("Supprimer cet exercice définitivement ?")) {
              startDelete(async () => {
                await deleteExercice(exerciceId, seanceId);
              });
            }
          }}
          className="text-[12px] text-[var(--danger)] hover:underline"
        >
          Supprimer l&apos;exercice
        </button>
      </div>
    </div>
  );
}
