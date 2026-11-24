"use client";

import { useState } from "react";

export function CopiaLink({ link, className }: { link: string; className?: string }) {
  const [copiato, setCopiato] = useState(false);
  return (
    <button
      type="button" className={className}
      onClick={async () => { try { await navigator.clipboard.writeText(link); setCopiato(true); setTimeout(() => setCopiato(false), 2500); } catch {} }}
    >
      {copiato ? "Link copiato" : "Copia link"}
    </button>
  );
}
