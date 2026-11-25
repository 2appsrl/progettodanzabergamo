import { oggiRoma } from "./genitori";

export type Certificato = { id: string; allievo_id: string; scadenza: string; file_nome: string | null; caricato_il: string };
export type StatoCertificato = "mancante" | "scaduto" | "in_scadenza" | "valido";

// Versione dell'informativa privacy mostrata quando il genitore dà il consenso.
// Va cambiata ogni volta che si modifica il testo dell'informativa.
export const VERSIONE_INFORMATIVA = "2026-11";

export const GIORNI_PREAVVISO = 30;

export function giorniAllaScadenza(scadenza: string) {
  return Math.round((Date.parse(scadenza + "T00:00:00Z") - Date.parse(oggiRoma() + "T00:00:00Z")) / 86400000);
}

export function statoCertificato(c?: Pick<Certificato, "scadenza"> | null): StatoCertificato {
  if (!c) return "mancante";
  const giorni = giorniAllaScadenza(c.scadenza);
  return giorni < 0 ? "scaduto" : giorni <= GIORNI_PREAVVISO ? "in_scadenza" : "valido";
}

// Per ogni allieva vale il certificato con la scadenza più lontana.
export function ultimoPerAllieva<T extends { allievo_id: string; scadenza: string }>(certificati: T[]) {
  const mappa = new Map<string, T>();
  for (const c of certificati) {
    const attuale = mappa.get(c.allievo_id);
    if (!attuale || c.scadenza > attuale.scadenza) mappa.set(c.allievo_id, c);
  }
  return mappa;
}

export const etichettaStato: Record<StatoCertificato, string> = {
  mancante: "Manca", scaduto: "Scaduto", in_scadenza: "In scadenza", valido: "Valido",
};
export const coloreStato: Record<StatoCertificato, string> = {
  mancante: "bg-giallo text-nero", scaduto: "bg-nero text-white", in_scadenza: "bg-magenta text-white", valido: "bg-white text-nero",
};

export function dataBreve(iso: string) {
  return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));
}
