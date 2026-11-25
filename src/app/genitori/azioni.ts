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

// ---------- Fase 5: certificati e consensi ----------

// Il genitore carica il nuovo certificato medico di una figlia o un figlio.
export async function caricaCertificato(form: FormData) {
  const errore = (msg: string) => redirect(`/genitori/documenti?errore=${encodeURIComponent(msg)}`);
  const allievo_id = testo(form, "allievo_id");
  const scadenza = testo(form, "scadenza");
  if (!/^[0-9a-f-]{36}$/.test(allievo_id) || !scadenza) errore("Indica la data di scadenza scritta sul certificato.");
  const supabase = await supabaseServer();
  const { caricaFile } = await import("@/lib/carica");
  const file = await caricaFile(supabase, "certificati", allievo_id, form.get("file"));
  if ("errore" in file) errore(file.errore!);
  if (!("path" in file)) errore("Scegli la foto o il PDF del certificato.");
  const { error } = await supabase.from("certificati").insert({ allievo_id, scadenza, file_path: (file as { path: string }).path, file_nome: (file as { nome: string }).nome });
  if (error) errore("Non siamo riusciti a salvare il certificato. Riprova.");
  redirect("/genitori/documenti?salvato=1");
}

// Consenso per foto e video: ogni scelta viene aggiunta allo storico con data e versione dell'informativa.
export async function registraConsenso(form: FormData) {
  const allievo_id = testo(form, "allievo_id");
  const supabase = await supabaseServer();
  const { data: allievo } = await supabase.from("allievi").select("famiglia_id").eq("id", allievo_id).maybeSingle();
  const { VERSIONE_INFORMATIVA } = await import("@/lib/certificati");
  const { error } = allievo
    ? await supabase.from("consensi").insert({ allievo_id, famiglia_id: allievo.famiglia_id, tipo: "foto_video", concesso: testo(form, "concesso") === "si", versione_informativa: VERSIONE_INFORMATIVA })
    : { error: true };
  redirect(error ? "/genitori/profilo?errore=Non%20siamo%20riusciti%20a%20salvare%20il%20consenso." : "/genitori/profilo?salvato=1#consensi");
}
