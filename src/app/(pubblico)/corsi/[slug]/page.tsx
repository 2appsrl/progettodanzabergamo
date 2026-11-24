import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bottone } from "@/components/ui/Bottone";
import { FotoSegnaposto } from "@/components/ui/FotoSegnaposto";
import { IconaFreccia, IconaLuogo, IconaOrologio, IconaPersona } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { stileCard } from "@/lib/colori";
import { getCorsi, getCorso, getSedi } from "@/lib/dati";
import { etichettaEta, GIORNI } from "@/lib/formato";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCorsi()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const corso = await getCorso((await params).slug);
  return corso ? { title: corso.nome, description: corso.descrizione } : {};
}

export default async function DettaglioCorso({ params }: Props) {
  const corso = await getCorso((await params).slug);
  if (!corso) notFound();
  const sede = (await getSedi()).find((s) => s.id === corso.sede_id);
  const s = stileCard[corso.colore];

  return (
    <>
      <section className={`overflow-hidden px-4 py-10 sm:px-6 sm:py-16 ${s.card} ${s.scuro ? "su-scuro" : ""}`}>
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2">
          <div>
            <div className="flex flex-wrap gap-2">
              <Pill className={`text-[17px] ${s.pillAccento}`} ruota={-3}>{etichettaEta(corso)}</Pill>
              <Pill className={s.pill}>{corso.disciplina}</Pill>
              {corso.da_confermare && <Pill className={s.pill} ruota={3}>Da confermare</Pill>}
            </div>
            <h1 className="titolo titolo-sezione mt-5">{corso.nome}</h1>
            <p className="mt-4 max-w-lg text-[20px] font-medium">{corso.descrizione}</p>
          </div>
          <div className="mx-auto w-full max-w-md border-[8px] border-white bg-white shadow-[0_10px_0_rgba(26,26,26,0.18)]" style={{ transform: "rotate(3deg)" }}>
            <FotoSegnaposto colore={corso.colore === "rosa" ? "nero" : "rosa"} variante={2} className="aspect-[4/3] w-full" />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="rounded-card bg-rosa p-6">
          <IconaPersona width={32} height={32} />
          <h2 className="titolo-card mt-3">Insegnante</h2>
          <p className="mt-2 text-[20px] font-bold">{corso.insegnante}</p>
        </div>
        <div className="rounded-card bg-giallo p-6">
          <IconaLuogo width={32} height={32} />
          <h2 className="titolo-card mt-3">Sede</h2>
          <p className="mt-2 text-[20px] font-bold">{sede?.nome}</p>
          <p className="font-medium">{sede?.indirizzo}</p>
        </div>
        <div className="su-scuro rounded-card bg-nero p-6 text-white">
          <IconaOrologio width={32} height={32} />
          <h2 className="titolo-card mt-3">Giorni e orari</h2>
          <ul className="mt-2 space-y-1 text-[20px] font-bold">
            {corso.lezioni.map((l) => (
              <li key={l.giorno} className="flex justify-between gap-3">
                <span>{GIORNI[l.giorno]}</span><span className="tabular-nums text-giallo">{l.inizio}–{l.fine}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 pb-16 sm:flex-row sm:px-6">
        <Bottone href={`/prenota-una-prova?corso=${corso.slug}`} variante="magenta" className="min-h-[60px] text-[26px]">
          Prenota una prova <IconaFreccia />
        </Bottone>
        <Bottone href="/corsi" variante="contorno" className="min-h-[60px]">Tutti i corsi</Bottone>
      </div>
    </>
  );
}
