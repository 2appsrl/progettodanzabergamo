import type { Colore } from "./tipi";

// Per ogni colore di card: sfondo + testo, e lo stile delle pill al suo interno.
export const stileCard: Record<Colore, { card: string; pill: string; pillAccento: string; scuro: boolean }> = {
  magenta: { card: "bg-magenta text-white", pill: "bg-white text-nero", pillAccento: "bg-giallo text-nero", scuro: true },
  giallo: { card: "bg-giallo text-nero", pill: "bg-white text-nero", pillAccento: "bg-nero text-white", scuro: false },
  nero: { card: "bg-nero text-white", pill: "bg-white text-nero", pillAccento: "bg-giallo text-nero", scuro: true },
  rosa: { card: "bg-rosa text-nero", pill: "bg-white text-nero", pillAccento: "bg-magenta text-white", scuro: false },
};
