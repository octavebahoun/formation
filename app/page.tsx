import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

type Seance = {
  id: number;
  mois: number;
  semaine: number;
  titre: string;
  sous_titre: string | null;
  duree_min: number;
  statut: "a_venir" | "faite" | "annulee";
  date_prevue: string | null;
  date_faite: string | null;
  compris_niveau: number | null;
};

type Profile = { full_name: string; role: "formateur" | "eleve" };

const MOIS_TITRES: Record<number, string> = {
  1: "Développement web",
  2: "Intelligence artificielle",
  3: "Automatisation",
  4: "Mentorat projet",
};

const MOIS_DESC: Record<number, string> = {
  1: "Comprendre comment un site fonctionne : structure, style, interactivité.",
  2: "Démystifier l'IA et l'utiliser sur des cas de santé publique.",
  3: "Automatiser des tâches répétitives, sans écrire beaucoup de code.",
  4: "Accompagnement personnalisé sur un projet lié à son domaine.",
};

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null; // middleware devrait rediriger

  const [profileRes, seancesRes] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).single(),
    supabase.from("seances").select("*").order("mois").order("semaine"),
  ]);

  const profile = profileRes.data as Profile | null;
  const seances = (seancesRes.data ?? []) as Seance[];

  const faites = seances.filter((s) => s.statut === "faite").length;
  const total = seances.length;
  const prochaine = seances.find((s) => s.statut === "a_venir") ?? null;
  const pct = Math.round((faites / total) * 100);

  const byMois = new Map<number, Seance[]>();
  for (const s of seances) {
    if (!byMois.has(s.mois)) byMois.set(s.mois, []);
    byMois.get(s.mois)!.push(s);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader fullName={profile?.full_name} role={profile?.role} />

      <main className="max-w-5xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {/* Hero */}
        <section className="mb-16 lg:mb-20">
          <div className="eyebrow">Où en sommes-nous</div>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold text-[var(--deep)] leading-[1.1] mt-4 max-w-[22ch]">
            {faites === 0
              ? "La formation n'a pas encore commencé."
              : faites === total
              ? "Formation terminée. Bien joué."
              : `Séance ${faites + 1} sur ${total} à venir.`}
          </h1>

          <div className="mt-10 grid lg:grid-cols-[2fr_1fr] gap-8 items-stretch">
            {/* Prochaine séance */}
            <article className="card p-8 lg:p-10 relative">
              <div className="eyebrow">Prochaine séance</div>
              {prochaine ? (
                <>
                  <div className="flex items-baseline gap-3 mt-3">
                    <span
                      className="font-display text-sm font-semibold"
                      style={{ color: "var(--gold)" }}
                    >
                      Mois {prochaine.mois} · Séance {prochaine.semaine}
                    </span>
                    <span className="chip">{prochaine.duree_min / 60}h</span>
                  </div>
                  <h2 className="font-display text-2xl lg:text-[28px] font-semibold text-[var(--deep)] mt-3 leading-tight">
                    {prochaine.titre}
                  </h2>
                  {prochaine.sous_titre && (
                    <p className="text-[15px] text-[var(--muted)] mt-2">
                      {prochaine.sous_titre}
                    </p>
                  )}
                  <Link
                    href={`/seance/${prochaine.id}`}
                    className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-[var(--deep)] border-b border-[var(--deep)] pb-0.5"
                  >
                    Ouvrir la séance
                    <span aria-hidden>→</span>
                  </Link>
                </>
              ) : (
                <p className="text-[var(--muted)] mt-4">
                  Toutes les séances sont marquées faites.
                </p>
              )}
            </article>

            {/* Progression */}
            <article className="card p-8 flex flex-col justify-between">
              <div>
                <div className="eyebrow">Progression</div>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="font-display text-[64px] leading-none font-semibold text-[var(--deep)]">
                    {faites}
                  </span>
                  <span className="font-display text-2xl text-[var(--muted)]">
                    / {total}
                  </span>
                </div>
                <div className="text-[13px] text-[var(--muted)] mt-1">
                  séances faites
                </div>
              </div>

              <div className="mt-8">
                <div className="h-[3px] w-full bg-[var(--line)] relative overflow-hidden rounded-full">
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{ width: `${pct}%`, background: "var(--gold)" }}
                  />
                </div>
                <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[var(--muted)] mt-3">
                  {pct}%
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Programme */}
        <section>
          <div className="flex items-baseline justify-between mb-10">
            <h3 className="font-display text-2xl font-semibold text-[var(--deep)]">
              Programme complet
            </h3>
            <span className="text-xs text-[var(--muted)]">
              4 mois · 32 séances
            </span>
          </div>

          <div className="space-y-16">
            {[1, 2, 3, 4].map((m) => (
              <MoisSection
                key={m}
                mois={m}
                seances={byMois.get(m) ?? []}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] mt-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-8 flex justify-between text-[12px] text-[var(--muted)]">
          <span>50 000 FCFA · 2 séances / semaine</span>
          <span>Contact via WhatsApp</span>
        </div>
      </footer>
    </div>
  );
}

function MoisSection({ mois, seances }: { mois: number; seances: Seance[] }) {
  const isMentorat = mois === 4;
  return (
    <section>
      <header className="flex items-baseline gap-4 mb-2">
        <span
          className="font-display font-semibold text-sm"
          style={{ color: "var(--gold)" }}
        >
          MOIS {mois}
        </span>
        <h4 className="font-display text-[22px] font-semibold text-[var(--deep)]">
          {MOIS_TITRES[mois]}
        </h4>
      </header>
      <p className="text-[14px] text-[var(--muted)] max-w-[58ch] mb-6">
        {MOIS_DESC[mois]}
      </p>

      <ol className="border-l-2 border-[var(--line)]">
        {seances.map((s) => (
          <SeanceRow key={s.id} s={s} isMentorat={isMentorat} />
        ))}
      </ol>
    </section>
  );
}

function SeanceRow({ s, isMentorat }: { s: Seance; isMentorat: boolean }) {
  const done = s.statut === "faite";
  return (
    <li className="relative pl-6 pb-4 last:pb-0">
      <span
        className="absolute left-[-9px] top-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold"
        style={{
          background: done ? "var(--deep)" : "var(--paper)",
          border: `2px solid ${done ? "var(--deep)" : "var(--line-strong)"}`,
          color: done ? "var(--paper)" : "transparent",
        }}
      >
        ✓
      </span>
      <Link
        href={`/seance/${s.id}`}
        className="group flex items-baseline gap-4 hover:opacity-80 transition-opacity"
      >
        <span className="text-[11px] text-[var(--muted)] tabular-nums w-12 shrink-0">
          {String(s.semaine).padStart(2, "0")}
        </span>
        <div className="flex-1">
          <div className="text-[15px] text-[var(--ink)] font-medium leading-tight">
            {s.titre}
          </div>
          {s.sous_titre && (
            <div className="text-[13px] text-[var(--muted)] mt-0.5">
              {s.sous_titre}
            </div>
          )}
        </div>
        <span className="text-[11px] text-[var(--muted)] shrink-0">
          {s.duree_min / 60}h
        </span>
      </Link>
    </li>
  );
}
