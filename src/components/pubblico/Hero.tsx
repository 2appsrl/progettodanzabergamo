import { Bottone } from "@/components/ui/Bottone";
import { FotoSegnaposto } from "@/components/ui/FotoSegnaposto";
import { IconaFreccia, IconaLuogo } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import type { Colore } from "@/lib/tipi";

function FotoInclinata({ colore, variante, gradi, didascalia, className = "" }: {
  colore: Colore; variante: number; gradi: number; didascalia: string; className?: string;
}) {
  return (
    <figure className={`border-[8px] border-white bg-white shadow-[0_10px_0_rgba(26,26,26,0.18)] ${className}`} style={{ transform: `rotate(${gradi}deg)` }}>
      <FotoSegnaposto colore={colore} variante={variante} className="aspect-[4/5] w-full" etichetta="Foto" />
      <figcaption className="pt-2 text-center font-titolo text-[18px] font-extrabold uppercase leading-none text-nero">{didascalia}</figcaption>
    </figure>
  );
}

export function Hero() {
  return (
    <section className="su-scuro overflow-hidden bg-magenta px-4 pb-16 pt-8 text-white sm:px-6 sm:pb-24 sm:pt-12">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-2.5">
            <Pill className="bg-giallo text-[17px] text-nero" ruota={-4}>Corsi dai 3 anni</Pill>
            <Pill className="bg-white text-[17px] text-nero"><IconaLuogo width={17} height={17} />Gorle</Pill>
            <Pill className="bg-nero text-[17px] text-white" ruota={3}><IconaLuogo width={17} height={17} />Torre Boldone</Pill>
          </div>
          <h1 className="titolo titolo-motto mt-6">
            Una scuola.<br />
            <span className="text-giallo">Tante storie</span><br />
            in movimento.
          </h1>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Bottone href="/prenota-una-prova" variante="nero" className="min-h-[60px] text-[26px]">
              Prenota una prova <IconaFreccia />
            </Bottone>
            <Bottone href="/#eta" variante="bianco" className="min-h-[60px] text-[26px]">Trova il corso</Bottone>
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-[520px] grid-cols-2 gap-3 px-2 sm:gap-5 lg:max-w-none">
          <FotoInclinata colore="giallo" variante={0} gradi={-4} didascalia="Valentina · Classica" />
          <FotoInclinata colore="nero" variante={1} gradi={4} didascalia="Roberta · Hip hop" className="mt-10" />
          <FotoInclinata colore="rosa" variante={2} gradi={3} didascalia="I corsi" className="col-span-2 mx-auto mt-1 w-[54%]" />
          <span
            className="absolute right-0 top-[50%] flex h-[104px] w-[104px] items-center justify-center rounded-full bg-giallo text-center font-titolo text-[22px] font-black uppercase leading-[0.9] text-nero sm:h-[124px] sm:w-[124px] sm:text-[26px]"
            style={{ transform: "rotate(12deg)" }}
          >
            Vieni<br />a<br />provare!
          </span>
        </div>
      </div>
    </section>
  );
}
