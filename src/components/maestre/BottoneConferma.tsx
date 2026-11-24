"use client";

import type { ReactNode } from "react";

// Pulsante che chiede conferma prima di un'azione che non si può annullare.
export function BottoneConferma({ domanda, className, children }: { domanda: string; className?: string; children: ReactNode }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!window.confirm(domanda)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
