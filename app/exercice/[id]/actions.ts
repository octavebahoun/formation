"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non connecté");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { supabase, user, role: profile?.role as "formateur" | "eleve" | undefined };
}

export async function createExercice(seanceId: number) {
  const { supabase, role } = await requireUser();
  if (role !== "formateur") return { error: "Réservé au formateur." };

  const { data, error } = await supabase
    .from("exercices")
    .insert({
      seance_id: seanceId,
      titre: "Nouvel exercice",
      enonce: "",
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Erreur" };

  revalidatePath(`/seance/${seanceId}`);
  redirect(`/exercice/${data.id}`);
}

export async function updateExercice(
  exerciceId: number,
  patch: { titre?: string; enonce?: string }
) {
  const { supabase, role } = await requireUser();
  if (role !== "formateur") return { error: "Réservé au formateur." };

  const { error } = await supabase.from("exercices").update(patch).eq("id", exerciceId);
  if (error) return { error: error.message };

  revalidatePath(`/exercice/${exerciceId}`);
  return { ok: true };
}

export async function deleteExercice(exerciceId: number, seanceId: number) {
  const { supabase, role } = await requireUser();
  if (role !== "formateur") return { error: "Réservé au formateur." };

  const { error } = await supabase.from("exercices").delete().eq("id", exerciceId);
  if (error) return { error: error.message };

  revalidatePath(`/seance/${seanceId}`);
  redirect(`/seance/${seanceId}`);
}

export async function submitRendu(
  exerciceId: number,
  lien: string,
  commentaire: string
) {
  const { supabase, role } = await requireUser();
  if (role !== "eleve") return { error: "Réservé à l'apprenant." };

  if (!lien.trim()) return { error: "Ajoute un lien vers ton rendu." };

  const { error } = await supabase.from("rendus").insert({
    exercice_id: exerciceId,
    lien: lien.trim(),
    commentaire_eleve: commentaire.trim() || null,
  });
  if (error) return { error: error.message };

  revalidatePath(`/exercice/${exerciceId}`);
  return { ok: true };
}

export async function gradeRendu(
  renduId: number,
  exerciceId: number,
  note: number | null,
  feedback: string
) {
  const { supabase, role } = await requireUser();
  if (role !== "formateur") return { error: "Réservé au formateur." };

  const { error } = await supabase
    .from("rendus")
    .update({
      note_sur_20: note,
      feedback_formateur: feedback.trim() || null,
      note_le: note !== null ? new Date().toISOString() : null,
    })
    .eq("id", renduId);

  if (error) return { error: error.message };
  revalidatePath(`/exercice/${exerciceId}`);
  return { ok: true };
}
