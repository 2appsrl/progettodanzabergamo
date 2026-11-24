// SEGNAPOSTO del logo: cerchio magenta con scritta bianca.
// Verrà sostituito dal file ufficiale appena disponibile.
export function Logo({ misura = 56 }: { misura?: number }) {
  return (
    <span
      className="inline-flex shrink-0 flex-col items-center justify-center rounded-full border-[3px] border-white bg-magenta text-center font-titolo font-extrabold uppercase text-white"
      style={{ width: misura, height: misura, fontSize: misura * 0.17, lineHeight: 1 }}
      aria-hidden="true"
    >
      <span>Progetto</span>
      <span>Danza</span>
      <span>Bergamo</span>
    </span>
  );
}
