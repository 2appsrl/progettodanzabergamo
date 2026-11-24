"use server";

import { supabasePubblico } from "@/lib/supabase/pubblico";

export type EsitoProva = { stato: "inizio" | "ok" | "errore"; messaggio?: string };

// Salva la richiesta di prova nel database. La vedranno solo le maestre.
export async function inviaRichiestaProva(_prima: EsitoProva, form: FormData): Promise<EsitoProva> {
  // Campo trappola: le persone non lo vedono, i programmi automatici lo compilano.
  if (form.get("sito")) return { stato: "ok" };

  const testo = (nome: string) => String(form.get(nome) ?? "").trim();
  const nome_genitore = testo("genitore");
  const telefono = testo("telefono");
  const nome_allievo = testo("allievo");
  const eta = Number(testo("eta"));
  const corso = testo("corso");

  if (nome_genitore.length < 2 || nome_allievo.length < 2) return { stato: "errore", messaggio: "Controlla i nomi inseriti." };
  if (telefono.replace(/\D/g, "").length < 6 || telefono.length > 20) return { stato: "errore", messaggio: "Controlla il numero di telefono." };
  if (!Number.isInteger(eta) || eta < 3 || eta > 99) return { stato: "errore", messaggio: "Inserisci un'età tra 3 e 99 anni." };

  const { error } = await supabasePubblico().from("richieste_prova").insert({
    nome_genitore, telefono, nome_allievo, eta,
    corso_id: /^[0-9a-f-]{36}$/.test(corso) ? corso : null,
  });
  if (error) return { stato: "errore", messaggio: "Non siamo riusciti a salvare la richiesta. Riprova tra poco o scrivici su WhatsApp." };
  return { stato: "ok" };
}
