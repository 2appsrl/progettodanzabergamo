import type { SupabaseClient } from "@supabase/supabase-js";

export type Figlio = { id: string; nome: string; cognome: string; famiglia_id: string; corsi: string[] };
export type Famiglia = { id: string; nome_genitore: string; telefono: string; email: string | null; token_calendario: string };

// La famiglia (o le famiglie) collegate all'email di chi è entrato, con i figli e i loro corsi.
export async function caricaFamiglia(db: SupabaseClient, email: string) {
  const sicura = email.toLowerCase().replace(/[%_\\]/g, (c) => "\\" + c);
  const { data: famiglie } = await db.from("famiglie").select("id, nome_genitore, telefono, email, token_calendario").ilike("email", sicura);
  const elenco = (famiglie ?? []) as Famiglia[];
  if (elenco.length === 0) return { famiglie: elenco, figli: [] as Figlio[] };
  const { data: allievi } = await db.from("allievi").select("id, nome, cognome, famiglia_id, iscrizioni(corso_id)")
    .in("famiglia_id", elenco.map((f) => f.id)).eq("attivo", true).order("nome");
  type Grezzo = Omit<Figlio, "corsi"> & { iscrizioni: { corso_id: string }[] };
  const figli = ((allievi ?? []) as unknown as Grezzo[]).map(({ iscrizioni, ...a }) => ({ ...a, corsi: iscrizioni.map((i) => i.corso_id) }));
  return { famiglie: elenco, figli };
}

// Se nell'indirizzo c'è ?figlio=..., si guarda solo quel figlio; altrimenti tutti.
export function figliScelti(figli: Figlio[], scelto?: string) {
  const uno = figli.filter((f) => f.id === scelto);
  return uno.length ? uno : figli;
}

// "Oggi" secondo l'orologio italiano, nel formato AAAA-MM-GG.
export function oggiRoma() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
}
export function aggiungiGiorni(iso: string, giorni: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + giorni);
  return d.toISOString().slice(0, 10);
}
// 1 = lunedì ... 6 = sabato, 0 = domenica
export const giornoSettimana = (iso: string) => new Date(iso + "T00:00:00Z").getUTCDay();

// A chi è rivolto qualcosa (avviso, evento, richiesta): tutta la scuola oppure un corso dei figli.
export function riguarda(cosa: { tutta_la_scuola?: boolean; corso_id?: string | null }, corsi: Set<string>, tuttiSeVuoto = false) {
  if (cosa.tutta_la_scuola) return true;
  if (!cosa.corso_id) return tuttiSeVuoto;
  return corsi.has(cosa.corso_id);
}
