-- Merchandising: prodotti mostrati sul sito, gestiti dalle maestre.
create table public.prodotti (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descrizione text not null default '',
  prezzo numeric(6,2) check (prezzo is null or prezzo >= 0), -- vuoto = "chiedi il prezzo"
  foto text,
  colore text not null default 'magenta' check (colore in ('magenta','giallo','nero','rosa')),
  pubblicato boolean not null default true,
  ordine int not null default 0
);
alter table public.prodotti enable row level security;
create policy "lettura prodotti pubblicati" on public.prodotti
  for select to anon, authenticated using (pubblicato or (select privato.e_maestra()));
create policy "maestre inseriscono" on public.prodotti for insert to authenticated with check ((select privato.e_maestra()));
create policy "maestre modificano" on public.prodotti for update to authenticated using ((select privato.e_maestra())) with check ((select privato.e_maestra()));
create policy "maestre eliminano" on public.prodotti for delete to authenticated using ((select privato.e_maestra()));
