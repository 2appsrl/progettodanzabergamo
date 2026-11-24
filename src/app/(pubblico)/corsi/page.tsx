import type { Metadata } from "next";
import { CardCorso } from "@/components/pubblico/CardCorso";
import { TestataPagina } from "@/components/pubblico/TestataPagina";
import { getCorsi, getSedi } from "@/lib/dati";

export const metadata: Metadata = { title: "Corsi" };

export default async function Corsi() {
  const [corsi, sedi] = await Promise.all([getCorsi(), getSedi()]);
  const discipline = [...new Set(corsi.map((c) => c.disciplina))];
  return (
    <>
      <TestataPagina titolo={<>I nostri <span className="text-giallo">corsi</span></>}>Dai 3 anni in su, a Gorle e Torre Boldone.</TestataPagina>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {discipline.map((d) => (
          <section key={d} className="mb-14">
            <h2 className="titolo text-[52px] sm:text-[72px]">{d}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {corsi.filter((c) => c.disciplina === d).map((c, i) => (
                <CardCorso key={c.id} corso={c} sede={sedi.find((s) => s.id === c.sede_id)} indice={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
