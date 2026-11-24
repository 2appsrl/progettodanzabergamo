import { IconaWhatsApp } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { stileCard } from "@/lib/colori";
import { linkWhatsApp, prezzoEuro } from "@/lib/formato";
import type { Prodotto } from "@/lib/tipi";

// Card dei prodotti: foto in alto, colore pieno, pulsante per chiedere info su WhatsApp.
export function GrigliaProdotti({ prodotti, whatsapp }: { prodotti: Prodotto[]; whatsapp: string }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {prodotti.map((p, i) => {
        const s = stileCard[p.colore];
        return (
          <li key={p.id} className={`flex flex-col overflow-hidden rounded-card ${s.card} ${s.scuro ? "su-scuro" : ""}`}>
            <div className="relative">
              {p.foto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.foto} alt={`${p.nome} Progetto Danza Bergamo`} width={900} height={1125} loading="lazy" className="aspect-[4/5] w-full object-cover" />
              )}
              <Pill className={`absolute right-2.5 top-2.5 sm:text-[17px] ${s.pillAccento}`} ruota={i % 2 ? -4 : 4}>
                {p.prezzo === null ? "Chiedi il prezzo" : prezzoEuro(p.prezzo)}
              </Pill>
            </div>
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h3 className="font-titolo text-[28px] font-extrabold uppercase leading-none sm:text-[36px]">{p.nome}</h3>
              {p.descrizione && <p className="mb-4 mt-2 text-[15px] font-medium sm:text-[16px]">{p.descrizione}</p>}
              <a
                href={linkWhatsApp(whatsapp, `Ciao! Vorrei informazioni su: ${p.nome}`)}
                target="_blank" rel="noopener noreferrer"
                className={`mt-auto inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-4 font-titolo text-[19px] font-extrabold uppercase ${s.pill}`}
              >
                <IconaWhatsApp width={20} height={20} /> Chiedi info
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
