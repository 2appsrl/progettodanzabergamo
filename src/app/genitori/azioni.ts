"use server";

import { redirect } from "next/navigation";
import { origineSito } from "@/lib/origine";
import { supabaseServer } from "@/lib/supabase/server";

// Azioni dell'area genitori. La sicurezza vera è nel database (RLS):
// ogni genitore può toccare solo i dati della propria famiglia.

const testo = (f: FormData, nome: string) => String(f.get(nome) ?? "").trim();

export type EsitoAccesso = { stato: "inizio" | "inviato" | "errore"; email?: string; messaggio?: string };

// Passo 1: manda l'email con il link e il codice.
export async function inviaAccessoGenitore(_prima: EsitoAccesso, form: FormData): Promise<EsitoAccesso> {
  const email = testo(form, "email").toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { stato: "errore", messaggio: "Controlla l'indirizzo email." };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${await origineSito()}/auth/callback?next=/genitori` },
  });
  if (error) {
    return { stato: "errore", messaggio: error.status === 429 ? "Troppi tentativi: riprova tra qualche minuto." : "Non siamo riusciti a inviare l'email. Riprova." };
  }
  return { stato: "inviato", email };
}

// Passo 2 (alternativa al link): il genitore scrive il codice ricevuto via email.
export async function verificaCodiceGenitore(_prima: EsitoAccesso, form: FormData): Promise<EsitoAccesso> {
  const email = testo(form, "email").toLowerCase();
  const codice = testo(form, "codice").replace(/\D/g, "");
  if (codice.length < 6) return { stato: "inviato", email, messaggio: "Scrivi tutte le cifre del codice." };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.verifyOtp({ email, token: codice, type: "email" });
  if (error) return { stato: "inviato", email, messaggio: "Codice non valido o scaduto. Controlla o richiedine uno nuovo." };
  redirect("/genitori");
}

export async function esciGenitori() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/genitori/accedi");
}

export async function salvaProfilo(form: FormData) {
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("aggiorna_mio_profilo", { p_nome: testo(form, "nome"), p_telefono: testo(form, "telefono") });
  redirect(error ? "/genitori/profilo?errore=Salvataggio%20non%20riuscito." : "/genitori/profilo?salvato=1");
}

// Notifiche: il telefono ci consegna il suo "indirizzo" per le notifiche e lo salviamo.
export async function attivaNotifiche(iscrizione: { endpoint: string; p256dh: string; auth: string }): Promise<boolean> {
  if (!/^https:\/\//.test(iscrizione.endpoint) || !iscrizione.p256dh || !iscrizione.auth) return false;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;
  const { caricaFamiglia } = await import("@/lib/genitori");
  const { famiglie } = await caricaFamiglia(supabase, user.email);
  if (!famiglie.length) return false;
  await supabase.from("push_iscrizioni").delete().eq("endpoint", iscrizione.endpoint);
  const { error } = await supabase.from("push_iscrizioni").insert({ famiglia_id: famiglie[0].id, ...iscrizione });
  return !error;
}

export async function disattivaNotifiche(endpoint: string): Promise<boolean> {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("push_iscrizioni").delete().eq("endpoint", endpoint);
  return !error;
}
