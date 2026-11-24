import { DATI_DI_ESEMPIO } from "@/lib/dati";

// Striscia che avvisa che i contenuti sono dimostrativi. Sparisce coi dati veri.
export function BannerEsempio() {
  if (!DATI_DI_ESEMPIO) return null;
  return (
    <p className="bg-giallo px-4 py-2 text-center text-[14px] font-bold text-nero">
      Versione dimostrativa: corsi, orari, indirizzi ed eventi sono <span className="uppercase">dati di esempio</span>.
    </p>
  );
}
