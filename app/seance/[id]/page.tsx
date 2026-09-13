import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { FormateurPanel } from "./formateur-panel";
import { ElevePanel } from "./eleve-panel";
import { ContenuEditor, GuideEditor } from "./contenu-editor";
import { Markdown } from "@/components/markdown";
import { createExercice } from "@/app/exercice/[id]/actions";
import Link from "next/link";
import { notFound } from "next/navigation";

const STATUT_LABEL = {
  a_venir: "À venir",
  faite: "Faite",
  annulee: "Annulée",
} as const;

export default async function SeancePage({ params }: PageProps<"/seance/[id]">) {
  const { id } = await params;
  const seanceId = Number(id);
  if (!Number.isFinite(seanceId)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, seanceRes, allRes, exosRes] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).single(),
    supabase.from("seances").select("*").eq("id", seanceId).single(),
    supabase.from("seances").select("id, mois, semaine").order("mois").order("semaine"),
    supabase
      .from("exercices")
      .select("id, titre")
      .eq("seance_id", seanceId)
      .order("id"),
  ]);

  const profile = profileRes.data;
  const seance = seanceRes.data;
  if (!seance) notFound();

  const list = allRes.data ?? [];
  const idx = list.findIndex((s) => s.id === seance.id);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx < list.length - 1 ? list[idx + 1] : null;

  const isFormateur = profile?.role === "formateur";

  return (
    <div className="min-h-screen">
      <SiteHeader fullName={profile?.full_name} role={profile?.role} />

      <main className="max-w-5xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <Link href="/" className="btn-ghost mb-10 inline-flex">
          <span aria-hidden>←</span> Retour au carnet
        </Link>

        {/* Hero */}
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-start mb-14">
          <div>
            <div className="eyebrow mb-4">
              Mois {seance.mois} · Séance {seance.semaine}
            </div>
            <h1 className="font-display text-4xl lg:text-[52px] font-semibold text-[var(--deep)] leading-[1.05] max-w-[20ch]">
              {seance.titre}
            </h1>
            {seance.sous_titre && (
              <p className="text-[16px] text-[var(--muted)] mt-4 max-w-[52ch]">
                {seance.sous_titre}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3">
            <StatusBadge statut={seance.statut} />
            <div className="text-[12px] text-[var(--muted)]">
              Durée : {seance.duree_min / 60}h
            </div>
            {seance.date_prevue && (
              <div className="text-[12px] text-[var(--muted)]">
                Prévue le{" "}
                {new Date(seance.date_prevue).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rule mb-14" />

        {/* Guide pédagogique (formateur uniquement) */}
        {isFormateur && (
          <section
            className="mb-16 rounded-sm p-6 lg:p-8"
            style={{
              background: "rgba(184, 134, 47, 0.05)",
              border: "1px solid rgba(184, 134, 47, 0.25)",
            }}
          >
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <div className="eyebrow" style={{ color: "var(--gold)" }}>
                  Guide privé du formateur
                </div>
                <h2 className="font-display text-xl font-semibold text-[var(--deep)] mt-1">
                  Plan pédagogique de la séance
                </h2>
              </div>
              <span className="text-[11px] text-[var(--muted)] italic">
                Christian ne voit pas cette section
              </span>
            </div>
            <GuideEditor
              seanceId={seance.id}
              initial={seance.guide_md ?? ""}
            />
          </section>
        )}

        {/* Contenu de séance (markdown) */}
        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-[var(--deep)]">
              Contenu de la séance
            </h2>
            {!isFormateur && (
              <span className="text-[11px] text-[var(--muted)]">
                Rédigé par Octave
              </span>
            )}
          </div>
          {isFormateur ? (
            <ContenuEditor
              seanceId={seance.id}
              initial={seance.contenu_md ?? ""}
            />
          ) : (
            <div className="card p-6 lg:p-8">
              <Markdown>{seance.contenu_md}</Markdown>
            </div>
          )}
        </section>

        {/* Panneau selon rôle */}
        <section className="mb-16">
          {isFormateur ? (
            <FormateurPanel seance={seance} />
          ) : (
            <ElevePanel seance={seance} />
          )}
        </section>

        {/* Vue croisée : chaque rôle voit l'autre en lecture */}
        {isFormateur ? (
          <ReadOnlyEleveView
            compris={seance.compris_niveau}
            questions={seance.questions_eleve}
          />
        ) : (
          <ReadOnlyFormateurView notes={seance.notes_formateur} />
        )}

        {/* Exercices liés */}
        <section className="mt-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-[var(--deep)]">
              Exercices
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-[var(--muted)]">
                {exosRes.data?.length ?? 0} exercice
                {(exosRes.data?.length ?? 0) > 1 ? "s" : ""}
              </span>
              {isFormateur && (
                <form
                  action={async () => {
                    "use server";
                    await createExercice(seance.id);
                  }}
                >
                  <button type="submit" className="btn-primary text-[12px] py-2 px-3">
                    + Nouvel exercice
                  </button>
                </form>
              )}
            </div>
          </div>
          {(exosRes.data?.length ?? 0) === 0 ? (
            <p className="text-[14px] text-[var(--muted)] italic">
              Aucun exercice pour cette séance.
            </p>
          ) : (
            <ul className="border-t border-[var(--line)]">
              {exosRes.data!.map((e) => (
                <li key={e.id} className="border-b border-[var(--line)]">
                  <Link
                    href={`/exercice/${e.id}`}
                    className="flex items-center justify-between py-4 group"
                  >
                    <span className="text-[15px] text-[var(--ink)] font-medium">
                      {e.titre}
                    </span>
                    <span className="text-[var(--muted)] group-hover:text-[var(--deep)] transition">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Navigation prev/next */}
        <nav className="mt-20 pt-8 border-t border-[var(--line)] flex justify-between gap-6">
          {prev ? (
            <Link href={`/seance/${prev.id}`} className="group max-w-[45%]">
              <div className="eyebrow mb-1">← Séance précédente</div>
              <div className="text-[13px] text-[var(--deep)] group-hover:text-[var(--teal)] transition">
                Mois {prev.mois} · Séance {prev.semaine}
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/seance/${next.id}`}
              className="group text-right max-w-[45%]"
            >
              <div className="eyebrow mb-1">Séance suivante →</div>
              <div className="text-[13px] text-[var(--deep)] group-hover:text-[var(--teal)] transition">
                Mois {next.mois} · Séance {next.semaine}
              </div>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
    </div>
  );
}

function StatusBadge({ statut }: { statut: keyof typeof STATUT_LABEL }) {
  const map = {
    a_venir: { bg: "transparent", fg: "var(--muted)", border: "var(--line-strong)" },
    faite: { bg: "var(--deep)", fg: "var(--paper)", border: "var(--deep)" },
    annulee: { bg: "transparent", fg: "var(--danger)", border: "var(--danger)" },
  }[statut];
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.14em] font-semibold border"
      style={{ background: map.bg, color: map.fg, borderColor: map.border }}
    >
      {STATUT_LABEL[statut]}
    </span>
  );
}

function ReadOnlyFormateurView({ notes }: { notes: string | null }) {
  return (
    <section className="card p-8">
      <div className="eyebrow mb-3">Notes du formateur</div>
      {notes ? (
        <p className="text-[14.5px] text-[var(--ink)] whitespace-pre-wrap leading-relaxed">
          {notes}
        </p>
      ) : (
        <p className="text-[13px] text-[var(--muted)] italic">
          Pas encore de notes.
        </p>
      )}
    </section>
  );
}

function ReadOnlyEleveView({
  compris,
  questions,
}: {
  compris: number | null;
  questions: string | null;
}) {
  return (
    <section className="card p-8 space-y-6">
      <div>
        <div className="eyebrow mb-3">Compréhension de Christian</div>
        {compris ? (
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-[var(--deep)]">
              {compris}
            </span>
            <span className="font-display text-lg text-[var(--muted)]">/ 5</span>
          </div>
        ) : (
          <p className="text-[13px] text-[var(--muted)] italic">
            Pas encore renseigné.
          </p>
        )}
      </div>

      <div>
        <div className="eyebrow mb-3">Ses questions</div>
        {questions ? (
          <p className="text-[14.5px] text-[var(--ink)] whitespace-pre-wrap leading-relaxed">
            {questions}
          </p>
        ) : (
          <p className="text-[13px] text-[var(--muted)] italic">
            Aucune question pour l&apos;instant.
          </p>
        )}
      </div>
    </section>
  );
}
