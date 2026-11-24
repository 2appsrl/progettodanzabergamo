import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RispostaGenitore } from "@/components/risposta/RispostaGenitore";
import { IconaCalendario, IconaLuogo } from "@/components/ui/Icone";
import { Logo } from "@/components/ui/Logo";
import { Pill } from "@/components/ui/Pill";
import { giornoEsteso, quando } from "@/lib/richieste";
import { leggiRichiesta } from "./dati";

type Props = { params: Promise<{ codice: string }> };

// Titolo e descrizione dell'anteprima che WhatsApp mostra sotto il link.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await leggiRichiesta((await params).codice);
  if (!r) return { title: "Richiesta non trovata" };
  const descrizione = [quando(r), r.luogo, "Rispondi con un tocco."].filter(Boolean).join(" · ");
  return {
    title: r.titolo,
    description: descrizione,
    robots: { index: false, follow: false },
    openGraph: { title: r.titolo, description: descrizione, siteName: "Progetto Danza Bergamo", locale: "it_IT", type: "website" },
  };
}

export default async function PaginaRisposta({ params }: Props) {
  const { codice } = await params;
  const r = await leggiRichiesta(codice);
  if (!r) notFound();

  return (
    <main className="flex-1 bg-rosa px-4 pb-14 pt-5">
      <div className="mx-auto max-w-xl">
        <article className="su-scuro rounded-card bg-magenta p-5 text-white sm:p-7">
          <div className="flex items-center gap-3">
            <Logo misura={56} invertito />
            <span className="font-titolo text-[20px] font-extrabold uppercase leading-none">Progetto Danza<br />Bergamo</span>
          </div>
          <h1 className="titolo mt-5 text-[52px] sm:text-[64px]">{r.titolo}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {r.data_evento && <Pill className="bg-giallo text-[16px] text-nero" ruota={-2}><IconaCalendario width={17} height={17} />{quando(r)}</Pill>}
            {r.luogo && <Pill className="bg-white text-[16px] text-nero"><IconaLuogo width={17} height={17} />{r.luogo}</Pill>}
            {r.corso && <Pill className="bg-nero text-[16px] text-white">{r.corso}</Pill>}
          </div>
          {r.messaggio && <p className="mt-5 whitespace-pre-line text-[17px] font-medium leading-snug">{r.messaggio}</p>}
          {r.firma && <p className="mt-3 text-[18px] font-bold">{r.firma}</p>}
          {r.scadenza && r.aperta && <p className="mt-4 inline-block rounded-full bg-nero px-4 py-1.5 text-[15px] font-bold">Rispondi entro {giornoEsteso(r.scadenza)}</p>}
        </article>

        <div className="mt-6">
          <RispostaGenitore codice={codice} opzioni={r.opzioni} destinatari={r.destinatari} aperta={r.aperta} haData={Boolean(r.data_evento)} />
        </div>
      </div>
    </main>
  );
}
