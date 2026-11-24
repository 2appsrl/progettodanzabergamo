"use client";

import { useActionState } from "react";
import { inviaRichiestaProva, type EsitoProva } from "@/app/(pubblico)/prenota-una-prova/azioni";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { IconaSpunta } from "@/components/ui/Icone";

// Modulo "Prenota una prova": salva la richiesta in Supabase, la vedono le maestre.
export function ModuloProva({ corsi, corsoIniziale }: { corsi: { id: string; nome: string; eta: string }[]; corsoIniziale?: string }) {
  const [esito, invia, inCorso] = useActionState<EsitoProva, FormData>(inviaRichiestaProva, { stato: "inizio" });

  if (esito.stato === "ok") {
    return (
      <div className="su-scuro rounded-card bg-magenta p-8 text-white" role="status">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-giallo text-nero"><IconaSpunta width={34} height={34} /></span>
        <h2 className="titolo mt-5 text-[64px]">Grazie!</h2>
        <p className="mt-3 text-[19px] font-medium">Abbiamo ricevuto la richiesta: ti ricontatteremo presto per fissare la prova.</p>
      </div>
    );
  }

  return (
    <form action={invia} className="rounded-card bg-rosa p-5 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block font-bold">Nome del genitore
          <input name="genitore" required minLength={2} maxLength={80} autoComplete="name" className={campo} />
        </label>
        <label className="block font-bold">Telefono
          <input name="telefono" required type="tel" inputMode="tel" maxLength={20} autoComplete="tel" placeholder="333 1234567" className={campo} />
        </label>
        <label className="block font-bold">Nome di chi balla
          <input name="allievo" required minLength={2} maxLength={80} className={campo} />
        </label>
        <label className="block font-bold">Età
          <input name="eta" required type="number" inputMode="numeric" min={3} max={99} className={campo} />
        </label>
        <label className="block font-bold sm:col-span-2">Corso
          <select name="corso" required defaultValue={corsoIniziale ?? ""} className={campo}>
            <option value="" disabled>Scegli un corso</option>
            {corsi.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.eta})</option>)}
            <option value="non-so">Non so, consigliatemi voi</option>
          </select>
        </label>
        {/* Campo trappola anti-spam, invisibile alle persone */}
        <input name="sito" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      </div>
      {esito.stato === "errore" && (
        <p role="alert" className="mt-5 rounded-[18px] bg-nero px-4 py-3 font-bold text-white">{esito.messaggio}</p>
      )}
      <button type="submit" disabled={inCorso} className={classiBottone("nero", "mt-7 min-h-[60px] w-full text-[26px] disabled:opacity-60 sm:w-auto")}>
        {inCorso ? "Invio in corso…" : "Invia la richiesta"}
      </button>
      <p className="mt-4 text-[14px] font-medium">Usiamo questi dati solo per ricontattarti riguardo alla prova.</p>
    </form>
  );
}
