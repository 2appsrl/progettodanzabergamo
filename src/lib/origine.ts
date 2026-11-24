import { headers } from "next/headers";

// Indirizzo del sito da cui arriva la richiesta (es. https://progettodanza.2app.it).
// Serve per costruire i link da condividere: così funzionano su qualsiasi dominio.
export async function origineSito() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "progettodanza.2app.it";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
