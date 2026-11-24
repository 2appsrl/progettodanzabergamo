import type { Metadata } from "next";
import { TestataPagina } from "@/components/pubblico/TestataPagina";
import { FotoSegnaposto } from "@/components/ui/FotoSegnaposto";
import { IconaCalendario, IconaLuogo } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { stileCard } from "@/lib/colori";
import { getEventi } from "@/lib/dati";
import { dataEstesa } from "@/lib/formato";
import type { Colore } from "@/lib/tipi";

export const metadata: Metadata = { title: "Saggi ed eventi" };

const galleria: Colore[] = ["magenta", "giallo", "nero", "rosa", "giallo", "magenta", "rosa", "nero"];

export default async function Eventi() {
  const eventi = await getEventi();
  return (
    <>
      <TestataPagina colore="giallo" titolo={<>Saggi ed <span className="text-magenta">eventi</span></>}>I prossimi appuntamenti e le foto dei nostri spettacoli.</TestataPagina>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {eventi.map((e, i) => {
            const s = stileCard[e.colore];
            return (
              <article key={e.id} className={`rounded-card p-6 ${s.card}`}>
                <Pill className={s.pillAccento} ruota={i % 2 ? 3 : -3}>{e.tipo}</Pill>
                <h2 className="titolo-card mt-4">{e.titolo}</h2>
                <p className="mt-3 flex items-center gap-2 font-bold"><IconaCalendario width={20} height={20} />{dataEstesa(e.data)}</p>
                <p className="mt-1 flex items-center gap-2 font-bold"><IconaLuogo width={20} height={20} />{e.luogo}</p>
                <p className="mt-3 font-medium">{e.descrizione}</p>
              </article>
            );
          })}
        </div>

        <h2 className="titolo titolo-sezione mt-16">Galleria</h2>
        <p className="mt-3 text-[17px] font-medium">Le foto vengono pubblicate solo con il consenso dei genitori.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {galleria.map((c, i) => (
            <FotoSegnaposto key={i} colore={c} variante={i} className={`rounded-[20px] ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`} />
          ))}
        </div>
      </div>
    </>
  );
}
