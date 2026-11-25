// Funzione programmata di Netlify: ogni mattina chiama il sito per mandare
// i promemoria dei certificati medici in scadenza.
const promemoria = async () => {
  const sito = process.env.URL;
  const segreto = process.env.PROMEMORIA_SEGRETO;
  if (!sito || !segreto) return new Response("Promemoria non configurato", { status: 200 });
  const risposta = await fetch(`${sito}/api/promemoria`, { method: "POST", headers: { authorization: `Bearer ${segreto}` } });
  return new Response(await risposta.text(), { status: 200 });
};

export default promemoria;

export const config = { schedule: "0 7 * * *" };
