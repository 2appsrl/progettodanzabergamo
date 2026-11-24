"use client";

import { useEffect, useState } from "react";
import { attivaNotifiche, disattivaNotifiche } from "@/app/genitori/azioni";

type Stato = "controllo" | "non-supportate" | "spente" | "accese" | "bloccate";

function chiaveInBytes(base64: string) {
  const pulita = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(pulita), (c) => c.charCodeAt(0));
}
const inBase64 = (buffer: ArrayBuffer | null) => (buffer ? btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : "");

// Interruttore delle notifiche su QUESTO telefono.
export function Notifiche({ chiavePubblica }: { chiavePubblica: string }) {
  const [stato, setStato] = useState<Stato>("controllo");
  const [occupato, setOccupato] = useState(false);
  const [errore, setErrore] = useState("");

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setStato("non-supportate");
      if (Notification.permission === "denied") return setStato("bloccate");
      const registrazione = await navigator.serviceWorker.register("/sw.js");
      setStato((await registrazione.pushManager.getSubscription()) ? "accese" : "spente");
    })().catch(() => setStato("non-supportate"));
  }, []);

  async function accendi() {
    setOccupato(true); setErrore("");
    try {
      const permesso = await Notification.requestPermission();
      if (permesso !== "granted") { setStato(permesso === "denied" ? "bloccate" : "spente"); return; }
      const registrazione = await navigator.serviceWorker.ready;
      const iscrizione = await registrazione.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chiaveInBytes(chiavePubblica) });
      const ok = await attivaNotifiche({ endpoint: iscrizione.endpoint, p256dh: inBase64(iscrizione.getKey("p256dh")), auth: inBase64(iscrizione.getKey("auth")) });
      if (!ok) { await iscrizione.unsubscribe(); throw new Error(); }
      setStato("accese");
    } catch {
      setErrore("Non siamo riusciti ad attivarle. Riprova.");
    } finally { setOccupato(false); }
  }

  async function spegni() {
    setOccupato(true); setErrore("");
    try {
      const iscrizione = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
      if (iscrizione) { await disattivaNotifiche(iscrizione.endpoint); await iscrizione.unsubscribe(); }
      setStato("spente");
    } catch { setErrore("Non siamo riusciti a disattivarle. Riprova."); } finally { setOccupato(false); }
  }

  const pulsante = "mt-4 inline-flex min-h-[56px] items-center justify-center rounded-full px-6 font-titolo text-[22px] font-extrabold uppercase disabled:opacity-60";
  return (
    <div>
      {stato === "controllo" && <p className="font-medium">Controllo…</p>}
      {stato === "non-supportate" && (
        <p className="font-medium">Su questo telefono le notifiche non sono disponibili dal browser. <strong>Su iPhone</strong>: apri il sito con Safari, tocca Condividi e poi &quot;Aggiungi a Home&quot;; apri l&apos;app dalla schermata Home e torna qui.</p>
      )}
      {stato === "bloccate" && <p className="font-medium">Le notifiche sono bloccate nelle impostazioni del telefono per questo sito. Riattivale da lì e ricarica la pagina.</p>}
      {stato === "spente" && (
        <>
          <p className="font-medium">Ricevi un avviso sul telefono quando la scuola pubblica una comunicazione.</p>
          <button type="button" disabled={occupato} onClick={accendi} className={`${pulsante} bg-magenta text-white`}>Attiva le notifiche</button>
        </>
      )}
      {stato === "accese" && (
        <>
          <p className="font-bold">Notifiche attive su questo telefono.</p>
          <button type="button" disabled={occupato} onClick={spegni} className={`${pulsante} border-[3px] border-nero`}>Disattiva</button>
        </>
      )}
      {errore && <p role="alert" className="mt-3 rounded-[18px] bg-nero px-4 py-3 font-bold text-white">{errore}</p>}
    </div>
  );
}
