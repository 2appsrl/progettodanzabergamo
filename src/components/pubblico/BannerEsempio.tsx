import { getScuola } from "@/lib/dati";

// Striscia che avvisa che i contenuti sono dimostrativi.
// Si spegne dall'area maestre (Impostazioni) quando i dati sono quelli veri.
export async function BannerEsempio() {
  const scuola = await getScuola();
  if (!scuola.dati_di_esempio) return null;
  return (
    <p className="bg-giallo px-4 py-2 text-center text-[14px] font-bold text-nero">
      Versione dimostrativa: corsi, orari, indirizzi ed eventi sono <span className="uppercase">dati di esempio</span>.
    </p>
  );
}
