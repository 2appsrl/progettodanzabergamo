"use client";

import { useEffect, useState, useTransition } from "react";
import { leggiRisposte, rispondi } from "@/app/r/[codice]/azioni";
import { IconaCalendario, IconaSpunta } from "@/components/ui/Icone";

type Destinatario = { id: string; etichetta: string; gruppo: string };
const CHIAVE = "pdb-figli"; // il telefono ricorda qui chi sono i figli

const coloriScelta = ["bg-magenta text-white border-magenta", "bg-nero text-white border-nero", "bg-giallo text-nero border-nero"];

function leggiRicordati(): string[] {
  try {
    const salvati = JSON.parse(localStorage.getItem(CHIAVE) ?? "[]");
    return Array.isArray(salvati) ? salvati.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function RispostaGenitore({ codice, opzioni, destinatari, aperta, haData }: {
  codice: string; opzioni: string[]; destinatari: Destinatario[]; aperta: boolean; haData: boolean;
}) {
  const [pronto, setPronto] = useState(false);
  const [ricordati, setRicordati] = useState<string[]>([]);
  const [risposte, setRisposte] = useState<Record<string, string>>({});
  const [appenaSalvato, setAppenaSalvato] = useState<string | null>(null);
  const [errore, setErrore] = useState("");
  const [inCorso, avvia] = useTransition();

  // Figli da mostrare: quelli ricordati + eventuali fratelli/sorelle destinatari della stessa richiesta.
  const gruppi = new Set(destinatari.filter((d) => ricordati.includes(d.id)).map((d) => d.gruppo));
  const miei = destinatari.filter((d) => gruppi.has(d.gruppo));

  // La memoria del telefono si può leggere solo dopo che la pagina è apparsa.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const salvati = leggiRicordati();
    setRicordati(salvati);
    setPronto(true);
    const gr = new Set(destinatari.filter((d) => salvati.includes(d.id)).map((d) => d.gruppo));
    const ids = destinatari.filter((d) => gr.has(d.gruppo)).map((d) => d.id);
    if (ids.length) leggiRisposte(codice, ids).then(setRisposte);
  }, [codice, destinatari]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function scegliFiglio(d: Destinatario) {
    const nuovi = [...new Set([...leggiRicordati(), d.id])];
    try { localStorage.setItem(CHIAVE, JSON.stringify(nuovi)); } catch {}
    setRicordati(nuovi);
    const ids = destinatari.filter((x) => x.gruppo === d.gruppo).map((x) => x.id);
    leggiRisposte(codice, ids).then((r) => setRisposte((prima) => ({ ...prima, ...r })));
  }

  function cambia() {
    const daTogliere = new Set(miei.map((d) => d.id));
    const nuovi = leggiRicordati().filter((id) => !daTogliere.has(id));
    try { localStorage.setItem(CHIAVE, JSON.stringify(nuovi)); } catch {}
    setRicordati(nuovi);
    setAppenaSalvato(null);
  }

  function tocca(d: Destinatario, scelta: string) {
    setErrore("");
    avvia(async () => {
      const esito = await rispondi(codice, d.id, scelta);
      if (esito === "ok") {
        setRisposte((prima) => ({ ...prima, [d.id]: scelta }));
        setAppenaSalvato(d.id);
      } else {
        setErrore(esito === "chiusa" ? "Le risposte per questa richiesta sono chiuse." : "Non siamo riusciti a salvare. Controlla la connessione e riprova.");
      }
    });
  }

  if (!pronto) return <p className="py-10 text-center font-bold">Un attimo…</p>;

  // Prima volta su questo telefono: scegli chi balla.
  if (miei.length === 0) {
    return (
      <section aria-labelledby="chi">
        <h2 id="chi" className="titolo text-[52px]">Per chi rispondi?</h2>
        <p className="mt-2 text-[17px] font-medium">Tocca il nome. Il telefono se lo ricorda: la prossima volta basta un tocco.</p>
        {destinatari.length === 0 && <p className="mt-5 rounded-card bg-white p-5 font-bold">Nessuna allieva in elenco per questa richiesta.</p>}
        <ul className="mt-5 grid grid-cols-2 gap-3">
          {destinatari.map((d) => (
            <li key={d.id}>
              <button
                type="button" onClick={() => scegliFiglio(d)}
                className="flex min-h-[68px] w-full items-center justify-center rounded-[22px] border-[3px] border-nero bg-white px-3 text-center font-titolo text-[26px] font-extrabold uppercase leading-none active:scale-95"
              >
                {d.etichetta}
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {errore && <p role="alert" className="rounded-[18px] bg-nero px-4 py-3 font-bold text-white">{errore}</p>}
      {miei.map((d) => {
        const data = risposte[d.id];
        return (
          <article key={d.id} className="rounded-card border-[3px] border-nero bg-white p-4 sm:p-5">
            <h2 className="titolo text-[48px]">{d.etichetta}</h2>
            {appenaSalvato === d.id && (
              <p role="status" className="mt-3 flex items-center gap-3 rounded-[18px] bg-giallo px-4 py-3 text-[18px] font-bold">
                <IconaSpunta className="shrink-0" /> Grazie! Risposta registrata.
              </p>
            )}
            {!aperta && <p className="mt-3 rounded-[18px] bg-rosa px-4 py-3 font-bold">Le risposte sono chiuse.{data ? ` Avevi risposto: ${data}.` : ""}</p>}
            <div className="mt-4 space-y-3">
              {opzioni.map((o, i) => {
                const scelta = data === o;
                return (
                  <button
                    key={o} type="button" disabled={!aperta || inCorso} aria-pressed={scelta} onClick={() => tocca(d, o)}
                    className={`flex min-h-[76px] w-full items-center justify-center gap-3 rounded-[24px] border-[3px] px-4 font-titolo text-[32px] font-black uppercase leading-none transition-transform active:scale-95 disabled:opacity-60 ${
                      scelta ? coloriScelta[i % coloriScelta.length] : "border-nero bg-white text-nero"
                    }`}
                  >
                    {scelta && <IconaSpunta width={30} height={30} />}{o}
                  </button>
                );
              })}
            </div>
            {data && aperta && <p className="mt-3 text-[15px] font-medium">Hai cambiato idea? Tocca un&apos;altra risposta.</p>}
          </article>
        );
      })}

      {haData && (
        <a href={`/r/${codice}/calendario`} className="flex min-h-[60px] items-center justify-center gap-2 rounded-full bg-nero px-6 font-titolo text-[24px] font-extrabold uppercase text-white">
          <IconaCalendario /> Aggiungi al calendario
        </a>
      )}
      <p className="text-center">
        <button type="button" onClick={cambia} className="min-h-[48px] font-bold underline underline-offset-4">
          Non {miei.length > 1 ? "sono i tuoi figli" : `è ${miei[0].etichetta}`}? Cambia
        </button>
      </p>
    </section>
  );
}
