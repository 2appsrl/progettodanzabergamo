import type { SupabaseClient } from "@supabase/supabase-js";

const ESTENSIONI: Record<string, string> = {
  "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/x-m4a": "m4a",
};
export const TIPI_DOCUMENTO = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
export const TIPI_CON_AUDIO = [...TIPI_DOCUMENTO, "audio/mpeg", "audio/mp4", "audio/x-m4a"];

// Carica un file (max 5 MB) in uno spazio privato. Restituisce dove è finito oppure un messaggio d'errore.
export async function caricaFile(db: SupabaseClient, spazio: string, cartella: string, file: FormDataEntryValue | null, tipi = TIPI_DOCUMENTO) {
  if (!(file instanceof File) || file.size === 0) return { vuoto: true as const };
  if (file.size > 5 * 1024 * 1024) return { errore: "Il file è troppo grande: massimo 5 MB." };
  if (!tipi.includes(file.type)) return { errore: tipi.length > 4 ? "Il file deve essere un PDF, un'immagine o un audio MP3." : "Il file deve essere un PDF o una foto (JPG, PNG)." };
  const path = `${cartella ? cartella + "/" : ""}${crypto.randomUUID()}.${ESTENSIONI[file.type]}`;
  const { error } = await db.storage.from(spazio).upload(path, file, { contentType: file.type });
  if (error) return { errore: "Non siamo riusciti a caricare il file. Riprova." };
  return { path, nome: file.name.slice(0, 120) };
}
