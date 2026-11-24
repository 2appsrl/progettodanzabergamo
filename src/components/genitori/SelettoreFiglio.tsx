import Link from "next/link";
import type { Figlio } from "@/lib/genitori";

// Pulsanti per scegliere di quale figlia/figlio vedere le informazioni (solo se sono più di uno).
export function SelettoreFiglio({ figli, scelto, base }: { figli: Figlio[]; scelto?: string; base: string }) {
  if (figli.length < 2) return null;
  const attivo = figli.some((f) => f.id === scelto) ? scelto : undefined;
  const stile = (on: boolean) =>
    `inline-flex min-h-[48px] shrink-0 items-center rounded-full border-[3px] border-nero px-5 font-titolo text-[22px] font-extrabold uppercase ${on ? "bg-nero text-white" : "bg-white text-nero"}`;
  return (
    <nav aria-label="Scegli figlia o figlio" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
      <Link href={base} aria-current={!attivo ? "true" : undefined} className={stile(!attivo)}>Tutti</Link>
      {figli.map((f) => (
        <Link key={f.id} href={`${base}?figlio=${f.id}`} aria-current={attivo === f.id ? "true" : undefined} className={stile(attivo === f.id)}>{f.nome}</Link>
      ))}
    </nav>
  );
}
