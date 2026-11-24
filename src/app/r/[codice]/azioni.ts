"use server";

import { supabasePubblico } from "@/lib/supabase/pubblico";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Registra (o cambia) la risposta di un'allieva. I controlli veri sono nel database.
export async function rispondi(codice: string, allievoId: string, scelta: string): Promise<"ok" | "chiusa" | "errore"> {
  if (!UUID.test(allievoId)) return "errore";
  const { data, error } = await supabasePubblico().rpc("rispondi_richiesta", { p_codice: codice, p_allievo: allievoId, p_scelta: scelta });
  if (error) return "errore";
  return data === "ok" ? "ok" : data === "chiusa" ? "chiusa" : "errore";
}

// Le risposte già date per i figli ricordati su questo telefono.
export async function leggiRisposte(codice: string, allievi: string[]): Promise<Record<string, string>> {
  const validi = allievi.filter((id) => UUID.test(id)).slice(0, 10);
  if (validi.length === 0) return {};
  const { data } = await supabasePubblico().rpc("risposte_richiesta", { p_codice: codice, p_allievi: validi });
  return (data as Record<string, string> | null) ?? {};
}
