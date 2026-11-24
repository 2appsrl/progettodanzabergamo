import Link from "next/link";
import type { ReactNode } from "react";

// Pulsante grande (min 52px di altezza), sempre comodo da toccare col dito.
const varianti = {
  nero: "bg-nero text-white hover:bg-black",
  magenta: "bg-magenta text-white hover:bg-magenta-scuro",
  giallo: "bg-giallo text-nero hover:bg-[#f5c400]",
  bianco: "bg-white text-nero hover:bg-rosa",
  contorno: "bg-transparent text-nero border-[3px] border-nero hover:bg-nero hover:text-white",
};

export const classiBottone = (variante: keyof typeof varianti = "nero", extra = "") =>
  `inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3 font-titolo text-[22px] font-extrabold uppercase leading-none tracking-wide transition-colors ${varianti[variante]} ${extra}`;

export function Bottone({
  href, variante = "nero", className = "", children, esterno,
}: { href: string; variante?: keyof typeof varianti; className?: string; children: ReactNode; esterno?: boolean }) {
  if (esterno) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={classiBottone(variante, className)}>{children}</a>;
  }
  return <Link href={href} className={classiBottone(variante, className)}>{children}</Link>;
}
