import type { Colore } from "@/lib/tipi";
import { IconaFoto } from "./Icone";

// SEGNAPOSTO per le foto: blocco colorato con forme geometriche.
// Quando ci saranno le foto vere (con consenso dei genitori) prenderanno il suo posto.
const sfondi: Record<Colore, { bg: string; a: string; b: string; testo: string }> = {
  magenta: { bg: "#d13583", a: "#ffd23f", b: "#f6c9dd", testo: "#ffffff" },
  giallo: { bg: "#ffd23f", a: "#d13583", b: "#1a1a1a", testo: "#1a1a1a" },
  nero: { bg: "#1a1a1a", a: "#d13583", b: "#ffd23f", testo: "#ffffff" },
  rosa: { bg: "#f6c9dd", a: "#d13583", b: "#ffd23f", testo: "#1a1a1a" },
};

export function FotoSegnaposto({
  colore, variante = 0, etichetta = "Foto in arrivo", className = "",
}: { colore: Colore; variante?: number; etichetta?: string; className?: string }) {
  const c = sfondi[colore];
  const forme = [
    <><circle cx="78" cy="30" r="34" fill={c.a} /><rect x="-10" y="62" width="70" height="70" rx="35" fill={c.b} /></>,
    <><path d="M0 100 A70 70 0 0 1 70 30 L70 100 Z" fill={c.a} /><circle cx="84" cy="22" r="16" fill={c.b} /></>,
    <><rect x="46" y="-12" width="76" height="76" rx="22" transform="rotate(14 84 26)" fill={c.a} /><circle cx="20" cy="84" r="30" fill={c.b} /></>,
    <><path d="M100 0 A80 80 0 0 1 20 80 L100 80 Z" fill={c.b} /><circle cx="22" cy="24" r="14" fill={c.a} /></>,
  ][variante % 4];

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: c.bg }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {forme}
      </svg>
      <span
        className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-nero"
      >
        <IconaFoto width={14} height={14} /> {etichetta}
      </span>
    </div>
  );
}
