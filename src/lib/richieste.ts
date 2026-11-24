// Tipi e piccoli aiuti per le richieste di conferma (Fase 3).

export type Richiesta = {
  id: string;
  codice: string;
  titolo: string;
  messaggio: string;
  corso_id: string | null;
  tutta_la_scuola: boolean;
  opzioni: string[];
  scadenza: string | null;
  data_evento: string | null;
  ora_inizio: string | null;
  ora_fine: string | null;
  luogo: string;
  firma: string;
  chiusa: boolean;
  creata_il: string;
};

// Quello che vede la pagina del genitore (arriva dalla funzione richiesta_pubblica).
export type RichiestaPubblica = {
  titolo: string;
  messaggio: string;
  firma: string;
  opzioni: string[];
  scadenza: string | null;
  data_evento: string | null;
  ora_inizio: string | null;
  ora_fine: string | null;
  luogo: string;
  corso: string | null;
  aperta: boolean;
  destinatari: { id: string; etichetta: string; gruppo: string }[];
};

export const OPZIONI_PREDEFINITE = ["Partecipo", "Non partecipo", "Forse"];

// "2026-12-11" -> "venerdì 11 dicembre"
export function giornoEsteso(iso: string) {
  return new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));
}

export function quando(r: { data_evento: string | null; ora_inizio: string | null; ora_fine: string | null }) {
  if (!r.data_evento) return "";
  const ora = r.ora_inizio ? `, ore ${r.ora_inizio.slice(0, 5)}${r.ora_fine ? `–${r.ora_fine.slice(0, 5)}` : ""}` : "";
  return giornoEsteso(r.data_evento) + ora;
}

export function scadenzaPassata(scadenza: string | null) {
  if (!scadenza) return false;
  const oggi = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
  return oggi > scadenza;
}

// Messaggio pronto da incollare nel gruppo WhatsApp del corso.
export function messaggioGruppo(r: Pick<Richiesta, "titolo" | "data_evento" | "ora_inizio" | "ora_fine" | "luogo" | "scadenza">, link: string) {
  const righe = [`*${r.titolo.toUpperCase()}*`];
  if (r.data_evento) righe.push(quando(r).replace(/^./, (c) => c.toUpperCase()));
  if (r.luogo) righe.push(r.luogo);
  righe.push("", "Confermate qui con un tocco:", link);
  if (r.scadenza) righe.push("", `Risposte entro ${giornoEsteso(r.scadenza)}. Grazie!`);
  return righe.join("\n");
}

export function messaggioSollecito(genitore: string, allieva: string, titolo: string, link: string) {
  const saluto = genitore ? `Ciao ${genitore.split(" ")[0]}` : "Ciao";
  return `${saluto}, ci manca la risposta di ${allieva} per "${titolo}". Bastano due tocchi:\n${link}\nGrazie!`;
}

export function codiceCasuale() {
  const lettere = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => lettere[b % lettere.length]).join("");
}
