"use client";

import { useState, useTransition } from "react";
import { saveEleveFeedback } from "./actions";

type Seance = {
  id: number;
  statut: "a_venir" | "faite" | "annulee";
  compris_niveau: number | null;
  questions_eleve: string | null;
};

export function ElevePanel({ seance }: { seance: Seance }) {
  const [compris, setCompris] = useState<number | null>(seance.compris_niveau);
  const [questions, setQuestions] = useState(seance.questions_eleve ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const disabled = seance.statut !== "faite";

  const save = (nextCompris: number | null, nextQuestions: string) =>
    startTransition(async () => {
      const res = await saveEleveFeedback(seance.id, nextCompris, nextQuestions);
      if (!res?.error) setSaved(true);
    });

  return (
    <div className="space-y-10">
      {disabled ? (
        <div className="card p-6">
          <p className="text-[14px] text-[var(--muted)]">
            Cette séance n&apos;a pas encore eu lieu. Tu pourras noter ta
            compréhension et poser tes questions une fois qu&apos;elle sera
            marquée faite par Octave.
          </p>
        </div>
      ) : (
        <>
          {/* Compris */}
          <div>
            <div className="eyebrow mb-4">Comment tu te sens là-dessus ?</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = compris === n;
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setCompris(n);
                      setSaved(false);
                      save(n, questions);
                    }}
                    className={`w-11 h-11 rounded-full font-display text-[16px] font-semibold border transition ${
                      active
                        ? "bg-[var(--deep)] text-[var(--paper)] border-[var(--deep)]"
                        : "bg-transparent text-[var(--muted)] border-[var(--line-strong)] hover:border-[var(--deep)] hover:text-[var(--deep)]"
                    }`}
                    aria-label={`Niveau ${n} sur 5`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-[var(--muted)] mt-3 max-w-[300px]">
              <span>Perdu</span>
              <span>Tout clair</span>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <label className="eyebrow" htmlFor="questions">
                Ce que je veux revoir / mes questions
              </label>
              {saved && (
                <span className="text-[11px] text-[var(--teal)]">
                  Enregistré ✓
                </span>
              )}
            </div>
            <textarea
              id="questions"
              value={questions}
              onChange={(e) => {
                setQuestions(e.target.value);
                setSaved(false);
              }}
              onBlur={() => save(compris, questions)}
              rows={6}
              placeholder="Une notion que tu n'as pas comprise, un truc à approfondir…"
              className="w-full bg-[color:#FBFBF7] border border-[var(--line-strong)] rounded-sm p-4 text-[14px] font-body text-[var(--ink)] outline-none focus:border-[var(--deep)] resize-y"
            />
          </div>
        </>
      )}
    </div>
  );
}
