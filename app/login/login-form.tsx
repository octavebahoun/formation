"use client";

import { useState, useTransition } from "react";
import { signIn } from "./actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const res = await signIn(formData);
          if (res?.error) setError(res.error);
        });
      }}
      className="space-y-8"
    >
      <div>
        <label
          htmlFor="email"
          className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[var(--muted)]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field mt-2"
          placeholder="prenom@formation.local"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[var(--muted)]"
        >
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field mt-2"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--danger)] border-l-2 border-[var(--danger)] pl-3">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Connexion…" : "Entrer dans le carnet"}
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}
