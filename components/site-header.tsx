import Link from "next/link";
import { signOut } from "@/app/login/actions";

type Props = {
  fullName: string | null | undefined;
  role: "formateur" | "eleve" | null | undefined;
};

export function SiteHeader({ fullName, role }: Props) {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--paper)]">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center font-display text-[11px] text-[var(--paper)]"
            style={{ background: "var(--deep)" }}
          >
            C
          </div>
          <div>
            <div className="font-display text-[15px] leading-none text-[var(--deep)] font-semibold">
              Carnet de formation
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">
              Christian Akpaho · 2026
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {fullName && (
            <div className="text-right">
              <div className="text-[13px] text-[var(--deep)] font-medium">
                {fullName}
              </div>
              <div
                className={`chip mt-1 ${
                  role === "formateur" ? "chip-gold" : "chip-teal"
                }`}
              >
                {role === "formateur" ? "Formateur" : "Apprenant"}
              </div>
            </div>
          )}
          <form action={signOut}>
            <button type="submit" className="btn-ghost">
              Sortir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
