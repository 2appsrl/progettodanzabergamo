import type { ReactNode } from "react";

// Fascia colorata in cima alle pagine interne, con il titolo gigante.
export function TestataPagina({ titolo, children, colore = "magenta" }: { titolo: ReactNode; children?: ReactNode; colore?: "magenta" | "giallo" | "nero" | "rosa" }) {
  const stile = {
    magenta: "bg-magenta text-white su-scuro",
    giallo: "bg-giallo text-nero",
    nero: "bg-nero text-white su-scuro",
    rosa: "bg-rosa text-nero",
  }[colore];
  return (
    <section className={`px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-16 ${stile}`}>
      <div className="mx-auto max-w-7xl">
        <h1 className="titolo titolo-sezione">{titolo}</h1>
        {children && <div className="mt-4 max-w-2xl text-[19px] font-medium">{children}</div>}
      </div>
    </section>
  );
}
