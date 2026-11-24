"use client";

import { useState } from "react";
import { corsoAdattoAllaFascia } from "@/lib/dati";
import type { Corso, Fascia, Sede } from "@/lib/tipi";
import { CardCorso } from "./CardCorso";
import { Settimana } from "./Settimana";

// "QUANTI ANNI HA?": toccando una fascia si filtrano subito
// le card dei corsi e il calendario "LA SUA SETTIMANA".
export function SelettoreEta({ fasce, corsi, sedi }: { fasce: Fascia[]; corsi: Corso[]; sedi: Sede[] }) {
  const [scelta, setScelta] = useState<string | null>(null);
  const fascia = fasce.find((f) => f.id === scelta) ?? null;
  const filtrati = fascia ? corsi.filter((c) => corsoAdattoAllaFascia(c, fascia)) : corsi;

  return (
    <>
      <section id="eta" className="scroll-mt-20 bg-white px-4 pb-14 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="titolo titolo-sezione">Quanti anni <span className="text-magenta">ha?</span></h2>
          <p className="mt-3 max-w-xl text-[19px] font-medium">Tocca l&apos;età: ti mostriamo solo i corsi giusti e la sua settimana.</p>

          <div className="mt-7 grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3" role="group" aria-label="Scegli la fascia d'età">
            {fasce.map((f) => {
              const attiva = f.id === scelta;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={attiva}
                  onClick={() => setScelta(attiva ? null : f.id)}
                  className={`flex min-h-[92px] flex-col items-center justify-center rounded-card border-[3px] border-nero px-2 py-3 transition-transform active:scale-95 sm:min-h-[120px] ${
                    attiva ? "bg-magenta text-white" : "bg-white text-nero [@media(hover:hover)]:hover:bg-giallo"
                  }`}
                  style={attiva ? { transform: "rotate(-3deg)" } : undefined}
                >
                  <span className="font-titolo text-[44px] font-black leading-none sm:text-[64px]">{f.etichetta}</span>
                  <span className="text-[14px] font-bold uppercase">anni</span>
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-[17px] font-bold" aria-live="polite">
            {fascia
              ? `${filtrati.length} ${filtrati.length === 1 ? "corso" : "corsi"} per ${fascia.etichetta} anni`
              : `Tutti i ${corsi.length} corsi`}
            {fascia && (
              <button type="button" onClick={() => setScelta(null)} className="ml-3 min-h-[44px] underline underline-offset-4">
                Mostra tutti
              </button>
            )}
          </p>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtrati.map((c, i) => (
              <CardCorso key={c.id} corso={c} sede={sedi.find((s) => s.id === c.sede_id)} indice={i} />
            ))}
          </div>
        </div>
      </section>

      <section id="settimana" className="scroll-mt-20 bg-rosa px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="titolo titolo-sezione">La sua <span className="text-magenta">settimana</span></h2>
          <p className="mb-7 mt-3 text-[19px] font-medium">
            {fascia ? `Le lezioni per ${fascia.etichetta} anni, da lunedì a sabato.` : "Tutte le lezioni, da lunedì a sabato. Scegli un'età per filtrarle."}
          </p>
          <Settimana corsi={filtrati} sedi={sedi} />
        </div>
      </section>
    </>
  );
}
