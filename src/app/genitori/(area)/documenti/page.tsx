import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documenti" };

// Segnaposto: regolamento, moduli, liste costumi e musiche arrivano nella Fase 5.
export default function DocumentiGenitori() {
  return (
    <>
      <h1 className="titolo text-[48px] sm:text-[64px]">Documenti</h1>
      <p className="mt-4 rounded-card bg-rosa p-6 text-[18px] font-medium">In arrivo: regolamento, moduli, liste costumi e musiche, sempre a portata di mano.</p>
    </>
  );
}
