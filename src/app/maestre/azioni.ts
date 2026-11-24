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

// ---------- Fase 3: conferme ----------

export async function creaRichiesta(form: FormData) {
  const destinatari = testo(form, "destinatari"); // "tutti" oppure l'id di un corso
  const opzioni = testo(form, "opzioni").split(/\r?\n/).map((o) => o.trim()).filter(Boolean).slice(0, 5);
  const titolo = testo(form, "titolo");
  const errore = (msg: string) => redirect(`/maestre/richieste/nuova?errore=${encodeURIComponent(msg)}`);
  if (titolo.length < 2) errore("Scrivi un titolo.");
  if (!destinatari) errore("Scegli a chi è rivolta la richiesta.");
  if (opzioni.length < 2) errore("Servono almeno due risposte possibili, una per riga.");
  if (new Set(opzioni).size !== opzioni.length) errore("Le risposte possibili devono essere diverse tra loro.");
  const inizio = testo(form, "ora_inizio") || null;
  const fine = testo(form, "ora_fine") || null;
  if (inizio && fine && fine <= inizio) errore("L'orario di fine deve venire dopo l'inizio.");

  const { codiceCasuale } = await import("@/lib/richieste");
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("richieste").insert({
    codice: codiceCasuale(),
    titolo,
    messaggio: testo(form, "messaggio"),
    firma: testo(form, "firma"),
    tutta_la_scuola: destinatari === "tutti",
    corso_id: destinatari === "tutti" ? null : destinatari,
    opzioni,
    scadenza: testo(form, "scadenza") || null,
    data_evento: testo(form, "data_evento") || null,
    ora_inizio: inizio,
    ora_fine: fine,
    luogo: testo(form, "luogo"),
  }).select("id").single();
  if (error || !data) errore("Non siamo riusciti a creare la richiesta.");
  redirect(`/maestre/richieste/${data!.id}?creata=1`);
}

export async function chiudiRiapriRichiesta(form: FormData) {
  const id = testo(form, "id");
  const supabase = await supabaseServer();
  await supabase.from("richieste").update({ chiusa: form.get("chiusa") === "si" }).eq("id", id);
  redirect(`/maestre/richieste/${id}`);
}

export async function eliminaRichiesta(form: FormData) {
  const supabase = await supabaseServer();
  await supabase.from("richieste").delete().eq("id", testo(form, "id"));
  redirect("/maestre/richieste");
}

// ---------- Allieve e famiglie ----------

// "+39 333 123 4567" -> "3331234567": così la stessa famiglia si riconosce dal telefono.
function telefonoPulito(t: string) {
  const cifre = t.replace(/\D/g, "").replace(/^00/, "");
  return cifre.length > 10 && cifre.startsWith("39") ? cifre.slice(2) : cifre;
}

type Db = Awaited<ReturnType<typeof supabaseServer>>;

// Trova la famiglia con quel telefono (fratelli e sorelle finiscono insieme) oppure la crea.
async function famigliaPer(db: Db, genitore: string, telefono: string) {
  const tel = telefonoPulito(telefono);
  if (tel) {
    const { data } = await db.from("famiglie").select("id").eq("telefono", tel).limit(1);
    if (data?.length) {
      if (genitore) await db.from("famiglie").update({ nome_genitore: genitore }).eq("id", data[0].id);
      return data[0].id as string;
    }
  }
  const { data, error } = await db.from("famiglie").insert({ nome_genitore: genitore, telefono: tel }).select("id").single();
  if (error || !data) throw new Error("Impossibile creare la famiglia");
  return data.id as string;
}

export async function salvaAllieva(form: FormData) {
  const id = testo(form, "id");
  const nome = testo(form, "nome");
  const cognome = testo(form, "cognome");
  const ritorno = id ? `/maestre/allieve/${id}` : "/maestre/allieve";
  if (!nome || !cognome) redirect(`${ritorno}?errore=${encodeURIComponent("Nome e cognome sono obbligatori.")}`);

  const supabase = await supabaseServer();
  let allievoId = id;
  try {
    const famiglia_id = await famigliaPer(supabase, testo(form, "genitore"), testo(form, "telefono"));
    const dati = { nome, cognome, famiglia_id, data_nascita: testo(form, "data_nascita") || null, attivo: id ? form.get("attivo") === "on" : true };
    if (id) {
      const { error } = await supabase.from("allievi").update(dati).eq("id", id);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("allievi").insert(dati).select("id").single();
      if (error || !data) throw error;
      allievoId = data.id;
    }
    const corsi = form.getAll("corsi").map(String);
    await supabase.from("iscrizioni").delete().eq("allievo_id", allievoId);
    if (corsi.length) await supabase.from("iscrizioni").insert(corsi.map((corso_id) => ({ allievo_id: allievoId, corso_id })));
  } catch {
    redirect(`${ritorno}?errore=${encodeURIComponent("Salvataggio non riuscito.")}`);
  }
  redirect("/maestre/allieve?salvato=1");
}

export async function eliminaAllieva(form: FormData) {
  const supabase = await supabaseServer();
  await supabase.from("allievi").delete().eq("id", testo(form, "id"));
  redirect("/maestre/allieve");
}

// Importazione da elenco: una riga per allieva, colonne separate da ; (o tabulazione, o virgola)
//   nome ; cognome ; genitore ; telefono ; corsi (separati da |)
export async function importaAllieve(form: FormData) {
  const righe = testo(form, "elenco").split(/\r?\n/).map((r) => r.trim()).filter(Boolean);
  const supabase = await supabaseServer();
  const { data: corsi } = await supabase.from("corsi").select("id, nome");
  const perNome = new Map((corsi ?? []).map((c) => [c.nome.toLowerCase().trim(), c.id as string]));
  let importate = 0;
  const saltate: number[] = [];

  for (const [i, riga] of righe.entries()) {
    const sep = riga.includes(";") ? ";" : riga.includes("\t") ? "\t" : ",";
    const [nome = "", cognome = "", genitore = "", telefono = "", elencoCorsi = ""] = riga.split(sep).map((c) => c.trim());
    if (i === 0 && nome.toLowerCase() === "nome") continue; // riga di intestazione
    if (!nome || !cognome) { saltate.push(i + 1); continue; }
    try {
      const famiglia_id = await famigliaPer(supabase, genitore, telefono);
      const { data, error } = await supabase.from("allievi").insert({ nome, cognome, famiglia_id }).select("id").single();
      if (error || !data) throw error;
      const ids = elencoCorsi.split("|").map((c) => perNome.get(c.toLowerCase().trim())).filter((x): x is string => Boolean(x));
      if (ids.length) await supabase.from("iscrizioni").insert([...new Set(ids)].map((corso_id) => ({ allievo_id: data.id, corso_id })));
      importate++;
    } catch {
      saltate.push(i + 1);
    }
  }
  const msg = `Importate ${importate} allieve.` + (saltate.length ? ` Righe saltate: ${saltate.join(", ")}.` : "");
  redirect(`/maestre/allieve?messaggio=${encodeURIComponent(msg)}`);
}
