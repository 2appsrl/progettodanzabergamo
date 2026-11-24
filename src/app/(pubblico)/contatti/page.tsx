import type { Metadata } from "next";
import { TestataPagina } from "@/components/pubblico/TestataPagina";
import { Bottone } from "@/components/ui/Bottone";
import { IconaInstagram, IconaLuogo, IconaWhatsApp } from "@/components/ui/Icone";
import { getScuola, getSedi } from "@/lib/dati";
import { linkWhatsApp } from "@/lib/formato";

export const metadata: Metadata = { title: "Contatti" };

export default async function Contatti() {
  const [scuola, sedi] = await Promise.all([getScuola(), getSedi()]);
  return (
    <>
      <TestataPagina colore="nero" titolo={<>Vieni a <span className="text-giallo">trovarci</span></>}>Due sedi, a pochi minuti da Bergamo.</TestataPagina>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Bottone esterno href={linkWhatsApp(scuola.whatsapp, "Ciao! Vorrei informazioni sui corsi.")} variante="magenta" className="min-h-[60px]">
            <IconaWhatsApp /> Scrivici su WhatsApp
          </Bottone>
          <Bottone esterno href={`https://www.instagram.com/${scuola.instagram}/`} variante="contorno" className="min-h-[60px]">
            <IconaInstagram /> Instagram
          </Bottone>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {sedi.map((s, i) => {
            if (s.lat === null || s.lon === null) return null;
            const d = 0.012;
            const mappa = `https://www.openstreetmap.org/export/embed.html?bbox=${s.lon - d},${s.lat - d * 0.6},${s.lon + d},${s.lat + d * 0.6}&layer=mapnik`;
            return (
              <article key={s.id} className={`overflow-hidden rounded-card ${i ? "bg-giallo" : "bg-rosa"}`}>
                <iframe title={`Mappa della sede di ${s.nome}`} src={mappa} loading="lazy" className="h-[280px] w-full border-0 sm:h-[340px]" />
                <div className="p-6">
                  <h2 className="titolo text-[56px]">{s.nome}</h2>
                  <p className="mt-2 flex items-start gap-2 text-[18px] font-bold"><IconaLuogo className="mt-0.5 shrink-0" />{s.indirizzo}</p>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lon}#map=16/${s.lat}/${s.lon}`}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-[48px] items-center rounded-full bg-nero px-6 font-titolo text-[20px] font-extrabold uppercase text-white hover:bg-black"
                  >
                    Apri la mappa
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
