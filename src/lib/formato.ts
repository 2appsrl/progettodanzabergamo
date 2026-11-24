import type { Corso, Fascia, Lezione } from "./tipi";

export const GIORNI = ["", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
export const GIORNI_BREVI = ["", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

export function etichettaEta(corso: Pick<Corso, "eta_min" | "eta_max">) {
  return corso.eta_max === null ? `${corso.eta_min}+ anni` : `${corso.eta_min}–${corso.eta_max} anni`;
}

// Raggruppa le lezioni con lo stesso orario: "Lun · Gio 16:30–17:15"
export function riassuntoLezioni(lezioni: Lezione[]) {
  const gruppi = new Map<string, number[]>();
  for (const l of lezioni) {
    const chiave = `${l.inizio}–${l.fine}`;
    gruppi.set(chiave, [...(gruppi.get(chiave) ?? []), l.giorno]);
  }
  return [...gruppi.entries()].map(([orario, giorni]) => ({
    giorni: giorni.sort((a, b) => a - b).map((g) => GIORNI_BREVI[g]).join(" · "),
    orario,
  }));
}

export function dataEstesa(iso: string) {
  return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso + "T00:00:00Z"),
  );
}

export function linkWhatsApp(numero: string, testo: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(testo)}`;
}

// Un corso è adatto a una fascia se le due età si sovrappongono.
export function corsoAdattoAllaFascia(corso: Pick<Corso, "eta_min" | "eta_max">, fascia: Fascia) {
  const corsoMax = corso.eta_max ?? 99;
  const fasciaMax = fascia.eta_max ?? 99;
  return corso.eta_min <= fasciaMax && corsoMax >= fascia.eta_min;
}

// "333 1234567" -> "393331234567" (formato richiesto dai link wa.me)
export function numeroWhatsApp(telefono: string) {
  const cifre = telefono.replace(/\D/g, "").replace(/^00/, "");
  return cifre.startsWith("39") && cifre.length > 10 ? cifre : "39" + cifre;
}

export function dataOra(iso: string) {
  return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" }).format(new Date(iso));
}
