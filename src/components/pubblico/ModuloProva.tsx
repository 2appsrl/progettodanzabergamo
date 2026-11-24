"use client";

import { useState } from "react";
import { classiBottone } from "@/components/ui/Bottone";
import { IconaSpunta } from "@/components/ui/Icone";

const campo = "mt-1.5 block min-h-[56px] w-full rounded-[18px] border-[3px] border-nero bg-white px-4 text-[18px] font-medium text-nero placeholder:text-nero/40";

// Modulo "Prenota una prova".
// FASE 1: mostra solo la conferma, NON salva ancora. Dalla Fase 2 salverà in Supabase.
export function ModuloProva({ corsi, corsoIniziale }: { corsi: { slug: string; nome: string; eta: string }[]; corsoIniziale?: string }) {
  const [inviato, setInviato] = useState(false);

  if (inviato) {
    return (
      <div className="su-scuro rounded-card bg-magenta p-8 text-white" role="status">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-giallo text-nero"><IconaSpunta width={34} height={34} /></span>
        <h2 className="titolo mt-5 text-[64px]">Grazie!</h2>
        <p className="mt-3 text-[19px] font-medium">Ti ricontatteremo presto per fissare la prova.</p>
        <p className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-[14px] font-bold text-nero">
          Versione dimostrativa: la richiesta non è stata salvata.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setInviato(true); }} className="rounded-card bg-rosa p-5 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block font-bold">Nome del genitore
          <input name="genitore" required autoComplete="name" className={campo} />
        </label>
        <label className="block font-bold">Telefono
          <input name="telefono" required type="tel" inputMode="tel" autoComplete="tel" placeholder="333 1234567" className={campo} />
        </label>
        <label className="block font-bold">Nome di chi balla
          <input name="allievo" required className={campo} />
        </label>
        <label className="block font-bold">Età
          <input name="eta" required type="number" inputMode="numeric" min={3} max={99} className={campo} />
        </label>
        <label className="block font-bold sm:col-span-2">Corso
          <select name="corso" required defaultValue={corsoIniziale ?? ""} className={campo}>
            <option value="" disabled>Scegli un corso</option>
            {corsi.map((c) => <option key={c.slug} value={c.slug}>{c.nome} ({c.eta})</option>)}
            <option value="non-so">Non so, consigliatemi voi</option>
          </select>
        </label>
      </div>
      <button type="submit" className={classiBottone("nero", "mt-7 min-h-[60px] w-full text-[26px] sm:w-auto")}>Invia la richiesta</button>
      <p className="mt-4 text-[14px] font-medium">Usiamo questi dati solo per ricontattarti riguardo alla prova.</p>
    </form>
  );
}
