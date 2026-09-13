"use client";

import { useState, useTransition } from "react";
import { MarkdownEditor } from "@/components/markdown-editor";
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
  const [titreSaved, setTitreSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  const saveTitre = () =>
    startTransition(async () => {
      const res = await updateExercice(exerciceId, { titre });
      if (!res?.error) setTitreSaved(true);
    });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="titre" className="eyebrow">
            Titre
          </label>
          {titreSaved && (
            <span className="text-[11px] text-[var(--teal)]">Enregistré ✓</span>
          )}
        </div>
        <input
          id="titre"
          value={titre}
          onChange={(e) => {
            setTitre(e.target.value);
            setTitreSaved(false);
          }}
          onBlur={saveTitre}
          className="w-full bg-transparent border-b border-[var(--line-strong)] focus:border-[var(--deep)] outline-none font-display text-3xl text-[var(--deep)] font-semibold py-2"
        />
      </div>

      <div>
        <div className="eyebrow mb-3">Énoncé</div>
        <MarkdownEditor
          initial={initialEnonce}
          save={async (value) => updateExercice(exerciceId, { enonce: value })}
          placeholder={`# Objectif
…

## Ce que tu dois faire
- …

## Livraison
GitHub ou Drive.

## Critères de notation (/20)
- Critère 1 : X pts
- Critère 2 : X pts`}
        />
      </div>

      <div className="flex justify-end pt-2 border-t border-[var(--line)]">
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
          className="text-[12px] text-[var(--danger)] hover:underline mt-4"
        >
          Supprimer l&apos;exercice
        </button>
      </div>
    </div>
  );
}
