import Link from "next/link";
import { FotoSegnaposto } from "@/components/ui/FotoSegnaposto";
import { IconaFreccia, IconaLuogo, IconaOrologio } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { stileCard } from "@/lib/colori";
import { etichettaEta, riassuntoLezioni } from "@/lib/formato";
import type { Corso, Sede } from "@/lib/tipi";

// Card di un corso: foto in alto, colore pieno, badge età/sede/giorni.
export function CardCorso({ corso, sede, indice = 0 }: { corso: Corso; sede?: Sede; indice?: number }) {
  const s = stileCard[corso.colore];
  return (
    <Link
      href={`/corsi/${corso.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-card transition-transform hover:-translate-y-1 ${s.card} ${s.scuro ? "su-scuro" : ""}`}
    >
      <div className="relative">
        <FotoSegnaposto colore={corso.colore === "nero" ? "magenta" : corso.colore === "magenta" ? "rosa" : "nero"} variante={indice} className="aspect-[16/10] w-full" />
        <Pill className={`absolute right-3 top-3 text-[17px] ${s.pillAccento}`} ruota={indice % 2 ? -4 : 4}>
          {etichettaEta(corso)}
        </Pill>
        {corso.da_confermare && (
          <Pill className="absolute left-3 top-3 bg-white text-nero" ruota={-3}>Da confermare</Pill>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="titolo-card">{corso.nome}</h3>
        <p className="mt-1 font-semibold opacity-90">con {corso.insegnante}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {sede && <Pill className={s.pill}><IconaLuogo width={16} height={16} />{sede.nome}</Pill>}
          {riassuntoLezioni(corso.lezioni).map((r) => (
            <Pill key={r.giorni + r.orario} className={s.pill}>
              <IconaOrologio width={16} height={16} />{r.giorni} {r.orario}
            </Pill>
          ))}
        </div>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 font-titolo text-[20px] font-extrabold uppercase">
          Scopri il corso <IconaFreccia className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
