import type { SupabaseClient } from "@supabase/supabase-js";
import type { Richiesta } from "@/lib/richieste";

export type RigaAllieva = {
  id: string; nome: string; cognome: string; genitore: string; telefono: string;
  scelta: string | null; risposta_il: string | null;
};

// Richiesta + elenco delle allieve destinatarie, ognuna con la sua risposta (se c'è).
export async function caricaDettaglio(db: SupabaseClient, id: string) {
  const { data: richiesta } = await db.from("richieste").select("*, corsi(nome)").eq("id", id).maybeSingle();
  if (!richiesta) return null;
  const r = richiesta as Richiesta & { corsi: { nome: string } | null };

  const [{ data: allievi }, { data: risposte }] = await Promise.all([
    db.from("allievi").select("id, nome, cognome, famiglie(nome_genitore, telefono), iscrizioni(corso_id)").eq("attivo", true).order("cognome").order("nome"),
    db.from("risposte").select("allievo_id, scelta, risposta_il").eq("richiesta_id", id),
  ]);
  const perAllievo = new Map((risposte ?? []).map((x) => [x.allievo_id as string, x]));

  type Grezza = { id: string; nome: string; cognome: string; famiglie: { nome_genitore: string; telefono: string } | null; iscrizioni: { corso_id: string }[] };
  const righe: RigaAllieva[] = ((allievi ?? []) as unknown as Grezza[])
    .filter((a) => r.tutta_la_scuola || a.iscrizioni.some((i) => i.corso_id === r.corso_id))
    .map((a) => ({
      id: a.id, nome: a.nome, cognome: a.cognome,
      genitore: a.famiglie?.nome_genitore ?? "", telefono: a.famiglie?.telefono ?? "",
      scelta: perAllievo.get(a.id)?.scelta ?? null, risposta_il: perAllievo.get(a.id)?.risposta_il ?? null,
    }));
  return { richiesta: r, righe };
}
