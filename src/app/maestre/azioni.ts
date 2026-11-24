"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

// Tutte le azioni dell'area maestre. La sicurezza vera è nel database (RLS):
// se chi chiama non è una maestra, Supabase rifiuta la modifica.

const testo = (f: FormData, nome: string) => String(f.get(nome) ?? "").trim();
const aggiornaSito = () => revalidatePath("/", "layout");

function slugDa(nome: string) {
  return nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export type EsitoLogin = { stato: "inizio" | "inviato" | "errore"; messaggio?: string };

export async function inviaLinkAccesso(_prima: EsitoLogin, form: FormData): Promise<EsitoLogin> {
  const email = testo(form, "email").toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { stato: "errore", messaggio: "Controlla l'indirizzo email." };
  const h = await headers();
  const origine = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origine}/auth/callback?next=/maestre` },
  });
  if (error) {
    return { stato: "errore", messaggio: error.status === 429 ? "Troppi tentativi: riprova tra qualche minuto." : "Non siamo riusciti a inviare l'email. Riprova." };
  }
  return { stato: "inviato" };
}

export async function esci() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/maestre/accedi");
}

export async function salvaCorso(form: FormData) {
  const id = testo(form, "id");
  const nome = testo(form, "nome");
  const etaMax = testo(form, "eta_max");
  const dati = {
    nome,
    slug: slugDa(testo(form, "slug") || nome),
    disciplina: testo(form, "disciplina"),
    insegnante: testo(form, "insegnante"),
    eta_min: Number(testo(form, "eta_min")),
    eta_max: etaMax === "" ? null : Number(etaMax),
    sede_id: testo(form, "sede_id") || null,
    colore: testo(form, "colore") || "magenta",
    descrizione: testo(form, "descrizione"),
    da_confermare: form.get("da_confermare") === "on",
    pubblicato: form.get("pubblicato") === "on",
  };
  const supabase = await supabaseServer();
  const ritorno = `/maestre/corsi/${id || "nuovo"}`;
  if (!dati.nome || !dati.disciplina || !dati.slug) redirect(`${ritorno}?errore=${encodeURIComponent("Nome e disciplina sono obbligatori.")}`);
  if (dati.eta_max !== null && dati.eta_max < dati.eta_min) redirect(`${ritorno}?errore=${encodeURIComponent("L'età massima non può essere più bassa della minima.")}`);

  const risultato = id
    ? await supabase.from("corsi").update(dati).eq("id", id).select("id")
    : await supabase.from("corsi").insert(dati).select("id");
  if (risultato.error || !risultato.data?.length) {
    const msg = risultato.error?.code === "23505" ? "Esiste già un corso con questo nome nell'indirizzo: cambialo leggermente." : "Salvataggio non riuscito.";
    redirect(`${ritorno}?errore=${encodeURIComponent(msg)}`);
  }
  aggiornaSito();
  redirect(`/maestre/corsi/${risultato.data[0].id}?salvato=1`);
}

export async function eliminaCorso(form: FormData) {
  const supabase = await supabaseServer();
  await supabase.from("corsi").delete().eq("id", testo(form, "id"));
  aggiornaSito();
  redirect("/maestre/corsi");
}

export async function aggiungiLezione(form: FormData) {
  const corso_id = testo(form, "corso_id");
  const inizio = testo(form, "ora_inizio");
  const fine = testo(form, "ora_fine");
  const ritorno = `/maestre/corsi/${corso_id}`;
  if (!inizio || !fine || fine <= inizio) redirect(`${ritorno}?errore=${encodeURIComponent("L'orario di fine deve venire dopo l'inizio.")}`);
  const supabase = await supabaseServer();
  const { error } = await supabase.from("lezioni_settimanali").insert({ corso_id, giorno: Number(testo(form, "giorno")), ora_inizio: inizio, ora_fine: fine });
  if (error) redirect(`${ritorno}?errore=${encodeURIComponent("Non siamo riusciti ad aggiungere la lezione.")}`);
  aggiornaSito();
  redirect(`${ritorno}?salvato=1`);
}

export async function eliminaLezione(form: FormData) {
  const supabase = await supabaseServer();
  await supabase.from("lezioni_settimanali").delete().eq("id", testo(form, "id"));
  aggiornaSito();
  redirect(`/maestre/corsi/${testo(form, "corso_id")}?salvato=1`);
}

export async function aggiornaRichiesta(form: FormData) {
  const supabase = await supabaseServer();
  await supabase.from("richieste_prova")
    .update({ stato: testo(form, "stato"), note_maestre: testo(form, "note_maestre") })
    .eq("id", testo(form, "id"));
  revalidatePath("/maestre", "layout");
  redirect("/maestre/prove");
}

export async function salvaScuola(form: FormData) {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("scuola").update({
    whatsapp: testo(form, "whatsapp").replace(/\D/g, ""),
    instagram: testo(form, "instagram").replace(/^@/, ""),
    email: testo(form, "email"),
    dati_di_esempio: form.get("dati_di_esempio") === "on",
  }).eq("id", true);
  aggiornaSito();
  redirect(error ? "/maestre/impostazioni?errore=Salvataggio%20non%20riuscito." : "/maestre/impostazioni?salvato=1");
}

export async function salvaSede(form: FormData) {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("sedi")
    .update({ nome: testo(form, "nome"), indirizzo: testo(form, "indirizzo") })
    .eq("id", testo(form, "id"));
  aggiornaSito();
  redirect(error ? "/maestre/impostazioni?errore=Salvataggio%20non%20riuscito." : "/maestre/impostazioni?salvato=1");
}

export async function salvaProdotto(form: FormData) {
  const prezzo = testo(form, "prezzo").replace(",", ".");
  const numero = prezzo === "" ? null : Number(prezzo);
  if (numero !== null && (!Number.isFinite(numero) || numero < 0 || numero > 9999)) {
    redirect(`/maestre/merch?errore=${encodeURIComponent("Controlla il prezzo: usa solo numeri, per esempio 25 oppure 19,50.")}`);
  }
  const supabase = await supabaseServer();
  const { error } = await supabase.from("prodotti").update({
    nome: testo(form, "nome"),
    descrizione: testo(form, "descrizione"),
    prezzo: numero,
    pubblicato: form.get("pubblicato") === "on",
  }).eq("id", testo(form, "id"));
  aggiornaSito();
  redirect(error ? "/maestre/merch?errore=Salvataggio%20non%20riuscito." : "/maestre/merch?salvato=1");
}
