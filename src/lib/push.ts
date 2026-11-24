import type { SupabaseClient } from "@supabase/supabase-js";
import webpush from "web-push";

// Chiave PUBBLICA delle notifiche (può stare nel sito). Quella privata sta solo
// nelle impostazioni di Netlify (variabile VAPID_PRIVATE_KEY), mai nel codice.
export const VAPID_PUBBLICA =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "BO86-6hmdp2kQZTvR2l1aQmRLjwdUKPigjF5t1ZySSMbO-p3LjFIEcjDRNwUibzbYwHxNIIVe0nQQo2Wyd4m-00";

// Manda una notifica ai telefoni delle famiglie indicate (null = tutte).
// Restituisce quante ne sono partite; se la chiave privata manca non fa nulla.
export async function inviaPush(db: SupabaseClient, famiglie: string[] | null, messaggio: { titolo: string; testo: string; url: string }) {
  const privata = process.env.VAPID_PRIVATE_KEY;
  if (!privata) return { inviate: 0, configurato: false };
  if (famiglie && famiglie.length === 0) return { inviate: 0, configurato: true };
  webpush.setVapidDetails("https://progettodanza.2app.it", VAPID_PUBBLICA, privata);

  let domanda = db.from("push_iscrizioni").select("id, endpoint, p256dh, auth");
  if (famiglie) domanda = domanda.in("famiglia_id", famiglie);
  const { data } = await domanda;
  const iscrizioni = data ?? [];
  const scadute: string[] = [];
  const esiti = await Promise.allSettled(iscrizioni.map(async (i) => {
    try {
      await webpush.sendNotification({ endpoint: i.endpoint, keys: { p256dh: i.p256dh, auth: i.auth } }, JSON.stringify(messaggio), { TTL: 60 * 60 * 24 });
    } catch (e) {
      const stato = (e as { statusCode?: number }).statusCode;
      if (stato === 404 || stato === 410) scadute.push(i.id); // telefono che ha tolto le notifiche
      throw e;
    }
  }));
  if (scadute.length) await db.from("push_iscrizioni").delete().in("id", scadute);
  return { inviate: esiti.filter((e) => e.status === "fulfilled").length, configurato: true };
}
