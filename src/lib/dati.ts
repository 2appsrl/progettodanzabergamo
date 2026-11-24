// Unico punto da cui le pagine leggono i contenuti: ora arrivano da Supabase.
import { supabasePubblico } from "./supabase/pubblico";
import type { Corso, Evento, Fascia, Maestra, Prodotto, Scuola, Sede } from "./tipi";
import type { SupabaseClient } from "@supabase/supabase-js";

function controlla<T>(risultato: { data: T | null; error: { message: string } | null }): T {
  if (risultato.error) throw new Error("Errore nel leggere i dati: " + risultato.error.message);
  return risultato.data as T;
}

type RigaCorso = Omit<Corso, "lezioni"> & {
  lezioni_settimanali: { id: string; giorno: number; ora_inizio: string; ora_fine: string }[];
};

function daRiga(r: RigaCorso): Corso {
  const { lezioni_settimanali, ...resto } = r;
  return {
    ...resto,
    lezioni: lezioni_settimanali
      .map((l) => ({ id: l.id, giorno: l.giorno, inizio: l.ora_inizio.slice(0, 5), fine: l.ora_fine.slice(0, 5) }))
      .sort((a, b) => a.giorno - b.giorno || a.inizio.localeCompare(b.inizio)),
  };
}

const CAMPI_CORSO = "*, lezioni_settimanali(id, giorno, ora_inizio, ora_fine)";

export async function getScuola(db: SupabaseClient = supabasePubblico()): Promise<Scuola> {
  return controlla(await db.from("scuola").select("*").single());
}
export async function getSedi(db: SupabaseClient = supabasePubblico()): Promise<Sede[]> {
  return controlla(await db.from("sedi").select("*").order("ordine"));
}
export async function getMaestre(): Promise<Maestra[]> {
  return controlla(await supabasePubblico().from("insegnanti").select("*").order("ordine"));
}
export async function getFasce(): Promise<Fascia[]> {
  return controlla(await supabasePubblico().from("fasce_eta").select("*").order("ordine"));
}
// Con il collegamento pubblico arrivano solo i corsi pubblicati; con quello di una maestra, tutti.
export async function getCorsi(db: SupabaseClient = supabasePubblico()) {
  const righe = controlla(await db.from("corsi").select(CAMPI_CORSO).order("ordine").order("nome")) as RigaCorso[];
  return righe.map(daRiga);
}
export async function getCorso(slug: string) {
  const riga = controlla(await supabasePubblico().from("corsi").select(CAMPI_CORSO).eq("slug", slug).maybeSingle()) as RigaCorso | null;
  return riga ? daRiga(riga) : null;
}
export async function getCorsoPerId(db: SupabaseClient, id: string) {
  const riga = controlla(await db.from("corsi").select(CAMPI_CORSO).eq("id", id).maybeSingle()) as RigaCorso | null;
  return riga ? daRiga(riga) : null;
}
export async function getEventi(): Promise<Evento[]> {
  return controlla(await supabasePubblico().from("eventi").select("*").order("data"));
}
export async function getProdotti(db: SupabaseClient = supabasePubblico()): Promise<Prodotto[]> {
  return controlla(await db.from("prodotti").select("*").order("ordine").order("nome"));
}
