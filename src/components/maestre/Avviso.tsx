// Messaggio di esito dopo un salvataggio.
export function Avviso({ salvato, errore }: { salvato?: string; errore?: string }) {
  if (errore) return <p role="alert" className="mb-5 rounded-[18px] bg-nero px-4 py-3 font-bold text-white">{errore}</p>;
  if (salvato) return <p role="status" className="mb-5 rounded-[18px] bg-giallo px-4 py-3 font-bold text-nero">Salvato. Il sito è già aggiornato.</p>;
  return null;
}
