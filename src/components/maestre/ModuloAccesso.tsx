"use client";

import { useActionState } from "react";
import { inviaLinkAccesso, type EsitoLogin } from "@/app/maestre/azioni";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";

export function ModuloAccesso() {
  const [esito, invia, inCorso] = useActionState<EsitoLogin, FormData>(inviaLinkAccesso, { stato: "inizio" });
  if (esito.stato === "inviato") {
    return (
      <div className="rounded-card bg-giallo p-6 text-nero" role="status">
        <h2 className="titolo text-[44px]">Controlla la posta</h2>
        <p className="mt-2 text-[18px] font-medium">Ti abbiamo mandato un link: toccalo da questo stesso telefono o computer per entrare.</p>
      </div>
    );
  }
  return (
    <form action={invia} className="rounded-card bg-white p-6 text-left text-nero">
      <label className="block font-bold">La tua email
        <input name="email" type="email" required autoComplete="email" inputMode="email" className={campo} />
      </label>
      {esito.stato === "errore" && <p role="alert" className="mt-4 rounded-[18px] bg-nero px-4 py-3 font-bold text-white">{esito.messaggio}</p>}
      <button type="submit" disabled={inCorso} className={classiBottone("nero", "mt-5 min-h-[60px] w-full text-[24px] disabled:opacity-60")}>
        {inCorso ? "Invio…" : "Mandami il link"}
      </button>
    </form>
  );
}
