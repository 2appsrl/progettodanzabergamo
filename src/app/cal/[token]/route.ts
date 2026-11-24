import { aggiungiGiorni, giornoSettimana, oggiRoma } from "@/lib/genitori";
import { supabasePubblico } from "@/lib/supabase/pubblico";

// Feed calendario personale (.ics): Google Calendar e iPhone lo rileggono da soli ogni tanto.
// Contiene le lezioni settimanali dei figli (fino a fine giugno) e gli eventi della scuola.
type Dati = {
  lezioni: { id: string; corso: string; giorno: number; inizio: string; fine: string; sede: string | null; chi: string | null }[];
  eventi: { id: string; titolo: string; tipo: string; data: string; inizio: string | null; fine: string | null; luogo: string; descrizione: string }[];
};

const pulisci = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const giorno = (iso: string) => iso.replace(/-/g, "");
const ora = (hhmm: string) => hhmm.slice(0, 5).replace(":", "") + "00";

export async function GET(_richiesta: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token.replace(/\.ics$/, "");
  if (!/^[a-f0-9]{32,64}$/.test(token)) return new Response("Calendario non trovato", { status: 404 });
  const { data, error } = await supabasePubblico().rpc("calendario_famiglia", { p_token: token });
  if (error || !data) return new Response("Calendario non trovato", { status: 404 });
  const dati = data as Dati;

  const oggi = oggiRoma();
  const [anno, mese] = oggi.split("-").map(Number);
  const fineAnno = `${mese >= 7 ? anno + 1 : anno}0630T215959Z`; // le lezioni si ripetono fino al 30 giugno
  const timbro = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

  const righe = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Progetto Danza Bergamo//Calendario//IT", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:Progetto Danza Bergamo", "X-WR-TIMEZONE:Europe/Rome", "REFRESH-INTERVAL;VALUE=DURATION:PT6H", "X-PUBLISHED-TTL:PT6H",
    "BEGIN:VTIMEZONE", "TZID:Europe/Rome",
    "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "TZNAME:CEST", "DTSTART:19700329T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
    "BEGIN:STANDARD", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "TZNAME:CET", "DTSTART:19701025T030000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
    "END:VTIMEZONE",
  ];

  for (const l of dati.lezioni) {
    // Prima data utile da oggi per quel giorno della settimana.
    let prima = oggi;
    while (giornoSettimana(prima) !== l.giorno) prima = aggiungiGiorni(prima, 1);
    righe.push(
      "BEGIN:VEVENT", `UID:lezione-${l.id}@progettodanzabergamo`, `DTSTAMP:${timbro}`,
      `DTSTART;TZID=Europe/Rome:${giorno(prima)}T${ora(l.inizio)}`, `DTEND;TZID=Europe/Rome:${giorno(prima)}T${ora(l.fine)}`,
      `RRULE:FREQ=WEEKLY;UNTIL=${fineAnno}`,
      `SUMMARY:${pulisci(l.corso + (l.chi ? ` (${l.chi})` : ""))}`,
      l.sede ? `LOCATION:${pulisci("Sede di " + l.sede)}` : "",
      "END:VEVENT",
    );
  }
  for (const e of dati.eventi) {
    const quando = e.inizio
      ? [`DTSTART;TZID=Europe/Rome:${giorno(e.data)}T${ora(e.inizio)}`, `DTEND;TZID=Europe/Rome:${giorno(e.data)}T${ora(e.fine ?? e.inizio)}`]
      : [`DTSTART;VALUE=DATE:${giorno(e.data)}`, `DTEND;VALUE=DATE:${giorno(aggiungiGiorni(e.data, 1))}`];
    righe.push(
      "BEGIN:VEVENT", `UID:evento-${e.id}@progettodanzabergamo`, `DTSTAMP:${timbro}`, ...quando,
      `SUMMARY:${pulisci(e.tipo === "Evento" ? e.titolo : `${e.tipo}: ${e.titolo}`)}`,
      e.luogo ? `LOCATION:${pulisci(e.luogo)}` : "", e.descrizione ? `DESCRIPTION:${pulisci(e.descrizione)}` : "",
      "END:VEVENT",
    );
  }
  righe.push("END:VCALENDAR");

  return new Response(righe.filter(Boolean).join("\r\n") + "\r\n", {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, max-age=900" },
  });
}
