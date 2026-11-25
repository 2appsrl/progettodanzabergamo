"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CHIAVE = "pdb-cookie-visto";

// Avviso cookie in versione minima: il sito usa solo cookie tecnici, quindi basta informare.
export function BannerCookie() {
  const [visibile, setVisibile] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try { setVisibile(localStorage.getItem(CHIAVE) !== "1"); } catch { setVisibile(true); }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  if (!visibile) return null;
  return (
    <div role="region" aria-label="Avviso sui cookie" className="su-scuro fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-card border-[3px] border-white bg-nero p-4 text-white sm:p-5">
      <p className="text-[15px] font-medium">Questo sito usa solo cookie tecnici, necessari per farlo funzionare. Niente pubblicità, niente tracciamento. <Link href="/cookie" className="font-bold underline">Leggi di più</Link></p>
      <button
        type="button"
        onClick={() => { try { localStorage.setItem(CHIAVE, "1"); } catch {} setVisibile(false); }}
        className="mt-3 min-h-[48px] w-full rounded-full bg-giallo px-6 font-titolo text-[20px] font-extrabold uppercase text-nero sm:w-auto"
      >
        Ho capito
      </button>
    </div>
  );
}
