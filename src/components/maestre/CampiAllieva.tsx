import { campo } from "@/components/ui/campi";

type Valori = { nome?: string; cognome?: string; data_nascita?: string | null; genitore?: string; telefono?: string; corsi?: string[] };

// Campi comuni al modulo "nuova allieva" e "modifica allieva".
export function CampiAllieva({ valori = {}, corsi }: { valori?: Valori; corsi: { id: string; nome: string }[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="block font-bold">Nome<input name="nome" required maxLength={40} defaultValue={valori.nome} className={campo} /></label>
      <label className="block font-bold">Cognome<input name="cognome" required maxLength={40} defaultValue={valori.cognome} className={campo} /></label>
      <label className="block font-bold">Nome del genitore<input name="genitore" maxLength={80} defaultValue={valori.genitore} className={campo} /></label>
      <label className="block font-bold">Telefono del genitore
        <input name="telefono" type="tel" inputMode="tel" maxLength={20} defaultValue={valori.telefono} placeholder="333 1234567" className={campo} />
      </label>
      <label className="block font-bold">Data di nascita <span className="font-medium">(facoltativa)</span>
        <input name="data_nascita" type="date" defaultValue={valori.data_nascita ?? ""} className={campo} />
      </label>
      <fieldset className="sm:col-span-2">
        <legend className="font-bold">Corsi frequentati</legend>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {corsi.map((c) => (
            <label key={c.id} className="flex min-h-[48px] cursor-pointer items-center rounded-full border-[3px] border-nero bg-white px-4 font-bold has-[:checked]:bg-nero has-[:checked]:text-white">
              <input type="checkbox" name="corsi" value={c.id} defaultChecked={valori.corsi?.includes(c.id)} className="sr-only" />{c.nome}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
