import webpush from "web-push";
import { dataBreve } from "@/lib/certificati";
import { VAPID_PUBBLICA } from "@/lib/push";
import { supabasePubblico } from "@/lib/supabase/pubblico";

// Promemoria automatico: chiamato una volta al giorno (vedi netlify/functions/promemoria.mts).
// Manda una notifica ai genitori quando il certificato medico scade entro 30 giorni.
// Funziona solo con il codice segreto giusto (variabile PROMEMORIA_SEGRETO).
type Riga = { nome: string; scadenza: string; telefoni: { endpoint: string; p256dh: string; auth: string }[] };

export async function POST(richiesta: Request) {
  const segreto = process.env.PROMEMORIA_SEGRETO;
  if (!segreto || richiesta.headers.get("authorization") !== `Bearer ${segreto}`) return new Response("Non autorizzato", { status: 401 });
  const privata = process.env.VAPID_PRIVATE_KEY;
  if (!privata) return Response.json({ errore: "Notifiche non configurate" }, { status: 503 });

  const { data, error } = await supabasePubblico().rpc("promemoria_certificati", { p_segreto: segreto });
  if (error || data === null) return new Response("Non autorizzato", { status: 401 });
  webpush.setVapidDetails("https://progettodanza.2app.it", VAPID_PUBBLICA, privata);

  let inviate = 0;
  for (const r of data as Riga[]) {
    const messaggio = JSON.stringify({ titolo: "Certificato medico in scadenza", testo: `Quello di ${r.nome} scade il ${dataBreve(r.scadenza)}. Tocca per caricare il nuovo.`, url: "/genitori/documenti" });
    const esiti = await Promise.allSettled(r.telefoni.map((t) => webpush.sendNotification({ endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } }, messaggio, { TTL: 60 * 60 * 48 })));
    inviate += esiti.filter((e) => e.status === "fulfilled").length;
  }
  return Response.json({ certificati: (data as Riga[]).length, notifiche: inviate });
}
