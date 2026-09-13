import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { EnonceEditor } from "./enonce-editor";
import { RenduForm } from "./rendu-form";
import { RenduGrader } from "./rendu-grader";
import { Markdown } from "@/components/markdown";
import Link from "next/link";
import { notFound } from "next/navigation";

type Exercice = {
  id: number;
  seance_id: number;
  titre: string;
  enonce: string;
  created_at: string;
};

type Rendu = {
  id: number;
  exercice_id: number;
  lien: string;
  commentaire_eleve: string | null;
  note_sur_20: number | null;
  feedback_formateur: string | null;
  soumis_le: string;
  note_le: string | null;
};

export default async function ExercicePage({
  params,
}: PageProps<"/exercice/[id]">) {
  const { id } = await params;
  const exerciceId = Number(id);
  if (!Number.isFinite(exerciceId)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, exoRes, rendusRes] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).single(),
    supabase.from("exercices").select("*").eq("id", exerciceId).single(),
    supabase
      .from("rendus")
      .select("*")
      .eq("exercice_id", exerciceId)
      .order("soumis_le", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const exo = exoRes.data as Exercice | null;
  if (!exo) notFound();

  const { data: seance } = await supabase
    .from("seances")
    .select("mois, semaine, titre")
    .eq("id", exo.seance_id)
    .single();

  const rendus = (rendusRes.data ?? []) as Rendu[];
  const isFormateur = profile?.role === "formateur";
  const dernierRendu = rendus[0];
  const dejaNote = dernierRendu?.note_sur_20 !== null && dernierRendu?.note_sur_20 !== undefined;

  return (
    <div className="min-h-screen">
      <SiteHeader fullName={profile?.full_name} role={profile?.role} />

      <main className="max-w-5xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {/* Breadcrumb vers séance */}
        {seance && (
          <Link href={`/seance/${exo.seance_id}`} className="btn-ghost mb-10 inline-flex">
            <span aria-hidden>←</span>
            Séance : Mois {seance.mois} · {seance.titre}
          </Link>
        )}

        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="eyebrow">Exercice</span>
            {rendus.length > 0 && (
              <span className={`chip ${dejaNote ? "chip-gold" : "chip-teal"}`}>
                {dejaNote
                  ? `Noté ${dernierRendu.note_sur_20}/20`
                  : `${rendus.length} rendu${rendus.length > 1 ? "s" : ""}`}
              </span>
            )}
          </div>

          {isFormateur ? (
            <EnonceEditor
              exerciceId={exo.id}
              seanceId={exo.seance_id}
              initialTitre={exo.titre}
              initialEnonce={exo.enonce}
            />
          ) : (
            <>
              <h1 className="font-display text-4xl lg:text-[44px] font-semibold text-[var(--deep)] leading-[1.1] max-w-[24ch]">
                {exo.titre}
              </h1>
              {exo.enonce ? (
                <div className="mt-6 card p-6 lg:p-8">
                  <div className="eyebrow mb-4">Énoncé</div>
                  <Markdown>{exo.enonce}</Markdown>
                </div>
              ) : (
                <p className="text-[13px] text-[var(--muted)] italic mt-6">
                  L&apos;énoncé n&apos;est pas encore prêt.
                </p>
              )}
            </>
          )}
        </div>

        <div className="rule mb-12" />

        {/* Zone rendu (élève) */}
        {!isFormateur && exo.enonce && (
          <section className="mb-14">
            <RenduForm exerciceId={exo.id} />
          </section>
        )}

        {/* Historique des rendus */}
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-[var(--deep)]">
              {isFormateur ? "Rendus de Christian" : "Mes rendus"}
            </h2>
            <span className="text-[11px] text-[var(--muted)]">
              {rendus.length} rendu{rendus.length > 1 ? "s" : ""}
            </span>
          </div>

          {rendus.length === 0 ? (
            <p className="text-[14px] text-[var(--muted)] italic">
              Pas encore de rendu.
            </p>
          ) : (
            <ol className="space-y-6">
              {rendus.map((r, i) => (
                <RenduCard
                  key={r.id}
                  rendu={r}
                  isFormateur={isFormateur}
                  latest={i === 0}
                  exerciceId={exo.id}
                />
              ))}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}

function RenduCard({
  rendu,
  isFormateur,
  latest,
  exerciceId,
}: {
  rendu: Rendu;
  isFormateur: boolean;
  latest: boolean;
  exerciceId: number;
}) {
  const noted = rendu.note_sur_20 !== null;
  return (
    <li className="card p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {latest && <span className="chip chip-teal">Dernier</span>}
            {noted && (
              <span className="chip chip-gold">
                {rendu.note_sur_20}/20
              </span>
            )}
          </div>
          <div className="text-[12px] text-[var(--muted)]">
            Déposé le{" "}
            {new Date(rendu.soumis_le).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <a
          href={rendu.lien}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-medium text-[var(--deep)] border-b border-[var(--deep)] pb-0.5 shrink-0"
        >
          Ouvrir →
        </a>
      </div>

      <div className="text-[13px] text-[var(--muted)] break-all mb-2">
        {rendu.lien}
      </div>

      {rendu.commentaire_eleve && (
        <div className="mt-4">
          <div className="eyebrow mb-2">Commentaire</div>
          <p className="text-[14px] text-[var(--ink)] whitespace-pre-wrap">
            {rendu.commentaire_eleve}
          </p>
        </div>
      )}

      {rendu.feedback_formateur && !isFormateur && (
        <div className="mt-4 pt-4 border-t border-dashed border-[var(--line)]">
          <div className="eyebrow mb-2">Feedback d&apos;Octave</div>
          <p className="text-[14px] text-[var(--ink)] whitespace-pre-wrap leading-relaxed">
            {rendu.feedback_formateur}
          </p>
        </div>
      )}

      {isFormateur && (
        <RenduGrader
          renduId={rendu.id}
          exerciceId={exerciceId}
          initialNote={rendu.note_sur_20}
          initialFeedback={rendu.feedback_formateur}
        />
      )}
    </li>
  );
}
