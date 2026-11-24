import { leggiRichiesta } from "../dati";

// File .ics: toccandolo, il telefono propone di aggiungere l'evento al calendario.
const pulisci = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const giorno = (iso: string) => iso.replace(/-/g, "");
const ora = (hhmm: string) => hhmm.slice(0, 5).replace(":", "") + "00";

function giornoDopo(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
function unOraDopo(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${String(Math.min(h + 1, 23)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export async function GET(_richiesta: Request, { params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params;
  const r = await leggiRichiesta(codice);
  if (!r || !r.data_evento) return new Response("Evento non trovato", { status: 404 });

  const quando = r.ora_inizio
    ? [`DTSTART;TZID=Europe/Rome:${giorno(r.data_evento)}T${ora(r.ora_inizio)}`, `DTEND;TZID=Europe/Rome:${giorno(r.data_evento)}T${ora(r.ora_fine ?? unOraDopo(r.ora_inizio))}`]
    : [`DTSTART;VALUE=DATE:${giorno(r.data_evento)}`, `DTEND;VALUE=DATE:${giorno(giornoDopo(r.data_evento))}`];

  const righe = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Progetto Danza Bergamo//Conferme//IT", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE", "TZID:Europe/Rome",
    "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "TZNAME:CEST", "DTSTART:19700329T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
    "BEGIN:STANDARD", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "TZNAME:CET", "DTSTART:19701025T030000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${codice}@progettodanzabergamo`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    ...quando,
    `SUMMARY:${pulisci(r.titolo)}`,
    r.luogo ? `LOCATION:${pulisci(r.luogo)}` : "",
    r.messaggio ? `DESCRIPTION:${pulisci(r.messaggio)}` : "",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean);

  return new Response(righe.join("\r\n") + "\r\n", {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="evento-${codice}.ics"` },
  });
}
