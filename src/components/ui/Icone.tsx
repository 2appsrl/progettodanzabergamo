// Icone SVG a linea (niente emoji). Ereditano il colore dal testo.
import type { SVGProps } from "react";

function Base({ children, ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}
    >
      {children}
    </svg>
  );
}
type P = SVGProps<SVGSVGElement>;

export const IconaMenu = (p: P) => <Base {...p}><path d="M3 6h18M3 12h18M3 18h18" /></Base>;
export const IconaChiudi = (p: P) => <Base {...p}><path d="M5 5l14 14M19 5L5 19" /></Base>;
export const IconaFreccia = (p: P) => <Base {...p}><path d="M4 12h16M13 5l7 7-7 7" /></Base>;
export const IconaLuogo = (p: P) => (
  <Base {...p}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.500C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></Base>
);
export const IconaOrologio = (p: P) => <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Base>;
export const IconaCalendario = (p: P) => (
  <Base {...p}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></Base>
);
export const IconaPersona = (p: P) => (
  <Base {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.500 8-6.500s8 2.500 8 6.500" /></Base>
);
export const IconaFoto = (p: P) => (
  <Base {...p}><rect x="3" y="6" width="18" height="14" rx="3" /><circle cx="12" cy="13" r="3.500" /><path d="M8 6l1.500-2.500h5L16 6" /></Base>
);
export const IconaInstagram = (p: P) => (
  <Base {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.500 6.500h.01" /></Base>
);
export const IconaWhatsApp = (p: P) => (
  <Base {...p}>
    <path d="M3.500 20.500l1.300-4.600A8.500 8.500 0 1 1 8.200 19.200L3.500 20.500z" />
    <path d="M9 8.500c0 3.500 3 6.500 6.500 6.500l1-1.800-2-1-1 .9c-1-.4-2.200-1.600-2.600-2.600l.9-1-1-2L9 8.500z" />
  </Base>
);
export const IconaSpunta = (p: P) => <Base {...p}><path d="M4 12.500l5 5L20 6.500" /></Base>;
export const IconaCasa = (p: P) => <Base {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></Base>;
export const IconaDocumento = (p: P) => <Base {...p}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></Base>;
export const IconaCampana = (p: P) => <Base {...p}><path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z" /><path d="M10 21h4" /></Base>;
export const IconaGraffetta = (p: P) => <Base {...p}><path d="M20 11l-8 8a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7" /></Base>;
