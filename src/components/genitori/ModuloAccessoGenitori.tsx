"use client";

import { useActionState } from "react";
import { inviaAccessoGenitore, verificaCodiceGenitore, type EsitoAccesso } from "@/app/genitori/azioni";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";

// Accesso senza password: email -> link da toccare, oppure codice da scrivere qui.
export function ModuloAccessoGenitori() {
  const [esito, invia, invio] = useActionState<EsitoAccesso, FormData>(inviaAccessoGenitore, { stato: "inizio" });
  const [verifica, controlla, controllo] = useActionState<EsitoAccesso, FormData>(verificaCodiceGenitore, { stato: "inizio" });

  if (esito.stato === "inviato") {
    return (
      <div className="rounded-card bg-white p-6 text-left text-nero">
        <h2 className="titolo text-[44px]">Controlla la posta</h2>
        <p className="mt-2 text-[17px] font-medium">Abbiamo scritto a <strong>{esito.email}</strong>. Tocca il link nell&apos;email, oppure scrivi qui il codice che trovi nel messaggio.</p>
        <form action={controlla} className="mt-5">
          <input type="hidden" name="email" value={esito.email} />
          <label className="block font-bold">Codice
            <input name="codice" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" maxLength={10} required className={`${campo} text-center font-titolo text-[34px] font-extrabold tracking-[0.2em]`} />
          </label>
          {verifica.messaggio && <p role="alert" className="mt-4 rounded-[18px] bg-nero px-4 py-3 font-bold text-white">{verifica.messaggio}</p>}
          <button type="submit" disabled={controllo} className={classiBottone("magenta", "mt-5 min-h-[60px] w-full text-[24px] disabled:opacity-60")}>{controllo ? "Controllo…" : "Entra"}</button>
        </form>
      </div>
    );
  }
  return (
    <form action={invia} className="rounded-card bg-white p-6 text-left text-nero">
      <label className="block font-bold">La tua email
        <input name="email" type="email" required autoComplete="email" inputMode="email" className={campo} />
      </label>
      <p className="mt-2 text-[15px] font-medium">Usa l&apos;email che hai dato alla scuola.</p>
      {esito.stato === "errore" && <p role="alert" className="mt-4 rounded-[18px] bg-nero px-4 py-3 font-bold text-white">{esito.messaggio}</p>}
      <button type="submit" disabled={invio} className={classiBottone("nero", "mt-5 min-h-[60px] w-full text-[24px] disabled:opacity-60")}>{invio ? "Invio…" : "Mandami il codice"}</button>
    </form>
  );
}
