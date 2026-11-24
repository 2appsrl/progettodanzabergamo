-- Interruttore per la striscia gialla "dati di esempio" sul sito pubblico.
alter table public.scuola add column dati_di_esempio boolean not null default true;
comment on column public.scuola.dati_di_esempio is 'Se vero, il sito mostra la striscia gialla "dati di esempio".';
