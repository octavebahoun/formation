"use client";

import { useState, type ReactNode } from "react";

type Section = { key: string; label: string; slot: ReactNode };

export function SeanceSections({
  sections,
}: {
  sections: Section[];
}) {
  const [active, setActive] = useState(sections[0]?.key);
  const current = sections.find((s) => s.key === active) ?? sections[0];

  return (
    <div className="grid lg:grid-cols-[180px_1fr] gap-8 lg:gap-14">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        {/* Mobile: horizontal chips */}
        <div className="flex lg:hidden gap-2 overflow-x-auto -mx-6 px-6 pb-2 border-b border-[var(--line)]">
          {sections.map((s) => {
            const on = s.key === active;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(s.key)}
                className={`shrink-0 px-3 py-1.5 text-[12px] rounded-full transition ${
                  on
                    ? "bg-[var(--deep)] text-[var(--paper)]"
                    : "bg-transparent text-[var(--muted)] border border-[var(--line-strong)]"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Desktop: vertical list */}
        <nav className="hidden lg:flex flex-col border-l border-[var(--line)]">
          {sections.map((s) => {
            const on = s.key === active;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(s.key)}
                className={`text-left pl-5 -ml-px py-3 text-[13px] transition border-l-2 ${
                  on
                    ? "border-[var(--deep)] text-[var(--deep)] font-semibold"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--deep)]"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Slot */}
      <div>{current?.slot}</div>
    </div>
  );
}
