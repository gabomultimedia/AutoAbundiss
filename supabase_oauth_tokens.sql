-- Crear tabla para almacenar tokens OAuth de Kommo
create table if not exists public.oauth_tokens (
  provider text primary key,       -- 'kommo'
  access_token text,
  refresh_token text,
  expires_at timestamptz,          -- instante exacto en UTC
  updated_at timestamptz default now()
);

-- Habilitar RLS (Row Level Security)
alter table public.oauth_tokens enable row level security;

-- Política para permitir solo acceso desde el servidor (Netlify Functions)
create policy "server-only" on public.oauth_tokens
  for all to authenticated using (false) with check (false);

-- Crear índice para mejorar performance
create index if not exists idx_oauth_tokens_provider on public.oauth_tokens(provider);

-- Insertar token inicial si es necesario (opcional)
-- insert into public.oauth_tokens (provider, access_token, refresh_token, expires_at)
-- values ('kommo', null, null, null)
-- on conflict (provider) do nothing;
