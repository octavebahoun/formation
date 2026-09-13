"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function setStatut(seanceId: number, statut: "a_venir" | "faite" | "annulee") {
  const { supabase, role } = await requireUser();
  if (role !== "formateur") return { error: "Réservé au formateur." };

  const patch: Record<string, unknown> = { statut, updated_at: new Date().toISOString() };
  if (statut === "faite") patch.date_faite = new Date().toISOString();
  if (statut === "a_venir") patch.date_faite = null;

  const { error } = await supabase.from("seances").update(patch).eq("id", seanceId);
  if (error) return { error: error.message };

  revalidatePath(`/seance/${seanceId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function setDatePrevue(seanceId: number, date: string | null) {
  const { supabase, role } = await requireUser();
  if (role !== "formateur") return { error: "Réservé au formateur." };

  const { error } = await supabase
    .from("seances")
    .update({ date_prevue: date, updated_at: new Date().toISOString() })
    .eq("id", seanceId);
  if (error) return { error: error.message };

  revalidatePath(`/seance/${seanceId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function saveNotesFormateur(seanceId: number, notes: string) {
  const { supabase, role } = await requireUser();
  if (role !== "formateur") return { error: "Réservé au formateur." };

  const { error } = await supabase
    .from("seances")
    .update({ notes_formateur: notes, updated_at: new Date().toISOString() })
    .eq("id", seanceId);
  if (error) return { error: error.message };

  revalidatePath(`/seance/${seanceId}`);
  return { ok: true };
}

export async function saveEleveFeedback(
  seanceId: number,
  compris: number | null,
  questions: string
) {
  const { supabase, role } = await requireUser();
  if (role !== "eleve") return { error: "Réservé à l'apprenant." };

  const { error } = await supabase
    .from("seances")
    .update({
      compris_niveau: compris,
      questions_eleve: questions,
      updated_at: new Date().toISOString(),
    })
    .eq("id", seanceId);
  if (error) return { error: error.message };

  revalidatePath(`/seance/${seanceId}`);
  return { ok: true };
}
