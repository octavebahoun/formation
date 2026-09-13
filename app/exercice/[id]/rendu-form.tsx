"use client";

import { useState, useTransition } from "react";
import { submitRendu } from "./actions";

export function RenduForm({ exerciceId }: { exerciceId: number }) {
  const [lien, setLien] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await submitRendu(exerciceId, lien, commentaire);
          if (res?.error) setError(res.error);
          else {
            setLien("");
            setCommentaire("");
          }
        });
      }}
      className="card p-6 space-y-5"
    >
      <div className="eyebrow">Déposer un rendu</div>

      <div>
        <label htmlFor="lien" className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[var(--muted)] block mb-2">
          Lien (GitHub, Drive, autre)
        </label>
        <input
          id="lien"
          type="url"
          required
          value={lien}
          onChange={(e) => setLien(e.target.value)}
          placeholder="https://github.com/…"
          className="field"
        />
      </div>

      <div>
        <label htmlFor="commentaire" className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[var(--muted)] block mb-2">
          Commentaire (facultatif)
        </label>
        <textarea
          id="commentaire"
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={3}
          placeholder="Ce que tu as fait, ce qui t'a bloqué…"
          className="w-full bg-transparent border border-[var(--line-strong)] rounded-sm p-3 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--deep)] resize-y"
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--danger)] border-l-2 border-[var(--danger)] pl-3">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Envoi…" : "Envoyer le rendu"}
        </button>
      </div>
    </form>
  );
}
