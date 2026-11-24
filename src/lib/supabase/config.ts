// Indirizzo e chiave PUBBLICA del database Supabase.
// La chiave "publishable" è fatta per stare nel sito: i dati sono protetti
// dalle regole di sicurezza (RLS) nel database, non dalla segretezza di questa chiave.
// Per spostare il sito su un altro progetto Supabase basta cambiare questi due valori
// (o impostare le variabili d'ambiente con lo stesso nome).
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://qsablomwuiubkgovpnyj.supabase.co";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_d6e1G6c6TZJ6jfBYkoTYDw_pf_7IIwW";
