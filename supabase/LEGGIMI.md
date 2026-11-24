# Database (Supabase)

- `migrations/`: le "ricette" che creano le tabelle e le regole di sicurezza, in ordine.
  Per ricreare il database su un altro progetto Supabase (es. quello della scuola) basta applicarle in ordine.
- I dati di esempio iniziali corrispondono a quelli in `src/dati-esempio/dati.ts`.
- Chi può entrare nell'area maestre è deciso dalla tabella `maestre` (elenco di email).
