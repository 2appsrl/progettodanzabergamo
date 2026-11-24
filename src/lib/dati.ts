// Unico punto da cui le pagine leggono i contenuti.
// Fase 1: restituisce i dati di esempio. Fase 2: qui dentro leggeremo da Supabase,
// senza dover toccare le pagine.

import * as esempio from "@/dati-esempio/dati";
import type { Corso, Fascia } from "./tipi";

export const DATI_DI_ESEMPIO = esempio.DATI_DI_ESEMPIO;

export async function getScuola() { return esempio.scuola; }
export async function getSedi() { return esempio.sedi; }
export async function getMaestre() { return esempio.maestre; }
export async function getFasce() { return esempio.fasce; }
export async function getCorsi() { return esempio.corsi; }
export async function getEventi() { return esempio.eventi; }
export async function getCorso(slug: string) {
  return esempio.corsi.find((c) => c.slug === slug) ?? null;
}

// Un corso è adatto a una fascia se le due età si sovrappongono.
export function corsoAdattoAllaFascia(corso: Corso, fascia: Fascia) {
  const corsoMax = corso.eta_max ?? 99;
  const fasciaMax = fascia.eta_max ?? 99;
  return corso.eta_min <= fasciaMax && corsoMax >= fascia.eta_min;
}
