import type { ReactNode } from "react";

// Etichetta arrotondata per età, sede, giorni. "ruota" la inclina leggermente.
export function Pill({ children, className = "", ruota = 0 }: { children: ReactNode; className?: string; ruota?: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[15px] font-bold leading-tight ${className}`}
      style={ruota ? { transform: `rotate(${ruota}deg)` } : undefined}
    >
      {children}
    </span>
  );
}
