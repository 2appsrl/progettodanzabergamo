import { Hero } from "@/components/pubblico/Hero";
import { SelettoreEta } from "@/components/pubblico/SelettoreEta";
import { Bottone } from "@/components/ui/Bottone";
import { FotoSegnaposto } from "@/components/ui/FotoSegnaposto";
import { IconaFreccia } from "@/components/ui/Icone";
import { stileCard } from "@/lib/colori";
import { GrigliaProdotti } from "@/components/pubblico/GrigliaProdotti";
import { getCorsi, getFasce, getMaestre, getProdotti, getScuola, getSedi } from "@/lib/dati";

export default async function Home() {
  const [fasce, corsi, sedi, maestre, prodotti, scuola] = await Promise.all([
    getFasce(), getCorsi(), getSedi(), getMaestre(), getProdotti(), getScuola(),
  ]);
  return (
    <>
      <Hero />
      <SelettoreEta fasce={fasce} corsi={corsi} sedi={sedi} />

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="titolo titolo-sezione">Le <span className="text-magenta">maestre</span></h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {maestre.map((m, i) => (
              <article key={m.id} className={`grid overflow-hidden rounded-card sm:grid-cols-[42%_1fr] ${stileCard[m.colore].card}`}>
                <FotoSegnaposto colore={i ? "nero" : "rosa"} variante={i + 1} className="aspect-[4/3] sm:aspect-auto sm:min-h-[260px]" />
                <div className="p-6">
                  <h3 className="titolo text-[56px]">{m.nome}</h3>
                  <p className="mt-2 text-[19px] font-bold">{m.discipline}</p>
                </div>
              </article>
            ))}
          </div>
          <Bottone href="/chi-siamo" variante="contorno" className="mt-7">Chi siamo <IconaFreccia /></Bottone>
        </div>
      </section>

      {prodotti.length > 0 && (
        <section className="bg-giallo px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="titolo titolo-sezione">Il nostro <span className="text-magenta">merch</span></h2>
            <p className="mb-7 mt-3 text-[19px] font-medium">Porta la scuola con te, in sala e fuori.</p>
            <GrigliaProdotti prodotti={prodotti.slice(0, 4)} whatsapp={scuola.whatsapp} />
            <Bottone href="/merchandising" variante="nero" className="mt-7">Tutto il merchandising <IconaFreccia /></Bottone>
          </div>
        </section>
      )}

      <section className="su-scuro bg-nero px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="titolo titolo-hero">Vieni a <span className="text-giallo">provare</span></h2>
          <p className="mt-4 max-w-xl text-[20px] font-medium">Scegli il corso e lascia il tuo numero: ti ricontattiamo noi.</p>
          <Bottone href="/prenota-una-prova" variante="magenta" className="mt-8 min-h-[60px] text-[26px]">
            Prenota una prova <IconaFreccia />
          </Bottone>
        </div>
      </section>
    </>
  );
}
