// SEGNAPOSTO del logo: cerchio magenta con scritta bianca.
// Verrà sostituito dal file ufficiale appena disponibile.
// Senza "misura" la grandezza si decide con le classi (utile per cambiare tra telefono e computer).
// "invertito" = cerchio bianco con scritta magenta, per farlo risaltare sugli sfondi magenta.
export function Logo({ misura, invertito = false, className = "" }: { misura?: number; invertito?: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 flex-col items-center justify-center rounded-full text-center font-titolo font-black uppercase ${
        invertito ? "bg-white text-magenta" : "border-[3px] border-white bg-magenta text-white"
      } ${className}`}
      style={misura ? { width: misura, height: misura, fontSize: misura * 0.18, lineHeight: 0.95 } : { lineHeight: 0.95 }}
      aria-hidden="true"
    >
      <span>Progetto</span>
      <span>Danza</span>
      <span>Bergamo</span>
    </span>
  );
}
