"use client";

import { useState, useTransition } from "react";
import { Markdown } from "./markdown";

type Props = {
  initial: string;
  save: (value: string) => Promise<{ error?: string; ok?: boolean } | undefined>;
  placeholder?: string;
};

export function MarkdownEditor({ initial, save, placeholder }: Props) {
  const [value, setValue] = useState(initial);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4">
        <div className="flex">
          {(["write", "preview"] as const).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-[12px] uppercase tracking-[0.14em] font-semibold transition ${
                  active
                    ? "text-[var(--deep)] border-b-2 border-[var(--deep)] -mb-px"
                    : "text-[var(--muted)] hover:text-[var(--deep)]"
                }`}
              >
                {t === "write" ? "Écrire" : "Aperçu"}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-[11px] text-[var(--teal)]">Enregistré ✓</span>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await save(value);
                if (!res?.error) setSaved(true);
              })
            }
            className="btn-primary text-[11px] py-1.5 px-3"
          >
            {pending ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          rows={16}
          placeholder={placeholder}
          className="w-full bg-[color:#FBFBF7] p-5 text-[14px] leading-relaxed font-mono text-[var(--ink)] outline-none resize-y"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
          spellCheck={false}
        />
      ) : (
        <div className="p-6 bg-[color:#FBFBF7] min-h-[240px]">
          <Markdown>{value}</Markdown>
        </div>
      )}
    </div>
  );
}
