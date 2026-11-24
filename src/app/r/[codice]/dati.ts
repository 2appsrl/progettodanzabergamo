import { cache } from "react";
import type { RichiestaPubblica } from "@/lib/richieste";
import { supabasePubblico } from "@/lib/supabase/pubblico";

// Legge la richiesta tramite il codice del link (una sola volta per pagina).
export const leggiRichiesta = cache(async (codice: string): Promise<RichiestaPubblica | null> => {
  if (!/^[a-z0-9]{8,16}$/.test(codice)) return null;
  const { data, error } = await supabasePubblico().rpc("richiesta_pubblica", { p_codice: codice });
  if (error) throw new Error("Errore nel leggere la richiesta: " + error.message);
  return (data as RichiestaPubblica | null) ?? null;
});
