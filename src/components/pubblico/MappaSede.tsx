"use client";

import { useState } from "react";
import { IconaLuogo } from "@/components/ui/Icone";

// La mappa è un servizio esterno (OpenStreetMap): la carichiamo solo se il visitatore la chiede.
export function MappaSede({ nome, src }: { nome: string; src: string }) {
  const [aperta, setAperta] = useState(false);
  if (aperta) return <iframe title={`Mappa della sede di ${nome}`} src={src} className="h-[280px] w-full border-0 sm:h-[340px]" />;
  return (
    <div className="flex h-[200px] flex-col items-center justify-center gap-3 bg-nero px-4 text-center text-white sm:h-[260px]">
      <IconaLuogo width={36} height={36} className="text-giallo" />
      <button type="button" onClick={() => setAperta(true)} className="min-h-[52px] rounded-full bg-white px-6 font-titolo text-[22px] font-extrabold uppercase text-nero hover:bg-giallo">Mostra la mappa</button>
      <span className="text-[13px] font-medium text-white/70">La mappa è fornita da OpenStreetMap.</span>
    </div>
  );
}
