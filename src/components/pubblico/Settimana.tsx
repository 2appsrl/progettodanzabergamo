import Link from "next/link";
import { stileCard } from "@/lib/colori";
import { GIORNI } from "@/lib/formato";
import type { Corso, Sede } from "@/lib/tipi";

// Calendario settimanale Lun–Sab. Su telefono i giorni vanno uno sotto l'altro,
// su tablet 2–3 colonne, su computer 6 colonne.
export function Settimana({ corsi, sedi }: { corsi: Corso[]; sedi: Sede[] }) {
  const nomeSede = (id: string) => sedi.find((s) => s.id === id)?.nome ?? "";
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {[1, 2, 3, 4, 5, 6].map((giorno) => {
        const lezioni = corsi
          .flatMap((c) => c.lezioni.filter((l) => l.giorno === giorno).map((l) => ({ ...l, corso: c })))
          .sort((a, b) => a.inizio.localeCompare(b.inizio));
        return (
          <section key={giorno} className="rounded-card bg-white p-3" aria-label={GIORNI[giorno]}>
            <h3 className="px-2 pb-2 pt-1 font-titolo text-[30px] font-extrabold uppercase leading-none">{GIORNI[giorno]}</h3>
            {lezioni.length === 0 ? (
              <p className="rounded-[18px] border-2 border-dashed border-nero/25 px-3 py-4 text-[15px] font-semibold text-nero/60">Nessuna lezione</p>
            ) : (
              <ul className="space-y-2">
                {lezioni.map((l) => (
                  <li key={l.corso.id + l.inizio}>
                    <Link
                      href={`/corsi/${l.corso.slug}`}
                      className={`block rounded-[18px] px-3.5 py-3 transition-transform hover:-translate-y-0.5 ${stileCard[l.corso.colore].card}`}
                    >
                      <span className="block text-[15px] font-bold tabular-nums">{l.inizio}–{l.fine}</span>
                      <span className="block font-titolo text-[24px] font-extrabold uppercase leading-none">{l.corso.nome}</span>
                      <span className="mt-1 block text-[14px] font-semibold opacity-90">{nomeSede(l.corso.sede_id)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
