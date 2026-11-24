"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Ricarica i dati della pagina ogni pochi secondi: il riepilogo si aggiorna mentre arrivano le risposte.
export function AggiornaDaSolo({ secondi = 10 }: { secondi?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, secondi * 1000);
    return () => clearInterval(t);
  }, [router, secondi]);
  return null;
}
