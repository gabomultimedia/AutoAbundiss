# 🔐 Sistema de Gestión de Tokens de Kommo

## 📋 Descripción

Sistema completo para gestionar tokens OAuth de Kommo con Node.js ESM en Netlify Functions. Incluye:

- **Persistencia automática** de `access_token` y `refresh_token` en Supabase
- **Refresh automático** cuando faltan ≤5 minutos para expirar
- **Refresh programado** cada 12 horas
- **Endpoints REST** para obtener tokens válidos

## 🏗️ Arquitectura

```
netlify/functions/
├── _kommo.js                    # Utilidades compartidas
├── kommo-oauth-callback.js      # OAuth callback inicial
├── kommo-token.js              # Obtener token válido
├── kommo-refresh.js            # Refresh manual
└── kommo-scheduled-refresh.js  # Refresh automático (12h)
```

## 🚀 Instalación

### 1. Dependencias

```bash
npm install node-fetch@^3.3.2
```

### 2. Variables de Entorno

Configura estas variables en tu dashboard de Netlify:

```bash
# Kommo
KOMMO_BASE_URL=https://new1645892779.kommo.com
KOMMO_CLIENT_ID=286a8f30-a82c-44d5-8902-8930732547ca
KOMMO_CLIENT_SECRET=JouGbECArhejdEBYufuakREQBqH8fTTDq83SMKLd8rr929Auyzbadrw5DtOHqAHq
KOMMO_REDIRECT_URI=https://abundiss-console.netlify.app/.netlify/functions/kommo-oauth-callback

# Supabase
SUPABASE_URL=https://fcvwqwjsypossdqochde.supabase.co
SUPABASE_SERVICE_ROLE=tu-service-role-key
```

### 3. Base de Datos

Ejecuta este SQL en Supabase:

```sql
create table if not exists public.oauth_tokens (
  provider text primary key,       -- 'kommo'
  access_token text,
  refresh_token text,
  expires_at timestamptz,          -- instante exacto en UTC
  updated_at timestamptz default now()
);

alter table public.oauth_tokens enable row level security;
create policy "server-only" on public.oauth_tokens
  for all to authenticated using (false) with check (false);
```

## 🔄 Flujo de Uso

### 1. Autenticación Inicial

Visita esta URL para iniciar OAuth:

```
https://www.kommo.com/oauth?client_id=286a8f30-a82c-44d5-8902-8930732547ca&redirect_uri=https://abundiss-console.netlify.app/.netlify/functions/kommo-oauth-callback&response_type=code
```

### 2. Obtener Token Válido

```bash
GET https://abundiss-console.netlify.app/.netlify/functions/kommo-token
```

**Respuesta:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "expires_at": "2024-01-15T10:30:00.000Z",
  "expires_in_seconds": 3600,
  "token_type": "Bearer"
}
```

### 3. Refresh Manual

```bash
POST https://abundiss-console.netlify.app/.netlify/functions/kommo-refresh
```

### 4. Refresh Automático

Se ejecuta cada 12 horas automáticamente.

## 📡 Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/.netlify/functions/kommo-oauth-callback` | GET | OAuth callback inicial |
| `/.netlify/functions/kommo-token` | GET | Obtener token válido |
| `/.netlify/functions/kommo-refresh` | POST | Refresh manual |
| `/.netlify/functions/kommo-scheduled-refresh` | AUTO | Refresh automático (12h) |

## 🔧 Configuración de Netlify

### netlify.toml

```toml
[functions]
  node_bundler = "esbuild"

[[scheduled.functions]]
  schedule = "0 */12 * * *"
  path = "/.netlify/functions/kommo-scheduled-refresh"
```

## 🚨 Manejo de Errores

### Token No Encontrado
```json
{
  "error": "No hay tokens almacenados",
  "message": "Ejecuta el flujo OAuth primero visitando la URL de autorización de Kommo"
}
```

### Error de Refresh
```json
{
  "error": "Error refrescando token",
  "message": "El token ha expirado y no se pudo refrescar. Re-autentica con Kommo."
}
```

## 📝 Logs

El sistema registra todas las operaciones:

- Refresh automático de tokens
- Errores de autenticación
- Operaciones de base de datos
- Estado de tokens

## 🔒 Seguridad

- **RLS habilitado** en Supabase
- **Solo acceso servidor** (Netlify Functions)
- **Tokens encriptados** en base de datos
- **CORS configurado** apropiadamente

## 🧪 Testing

### 1. Verificar Estado de Tokens

```bash
curl https://abundiss-console.netlify.app/.netlify/functions/kommo-token
```

### 2. Forzar Refresh

```bash
curl -X POST https://abundiss-console.netlify.app/.netlify/functions/kommo-refresh
```

### 3. Verificar Base de Datos

```sql
SELECT * FROM oauth_tokens WHERE provider = 'kommo';
```

## 🚀 Despliegue

1. **Subir código** a GitHub
2. **Netlify detecta** cambios automáticamente
3. **Configurar variables** de entorno
4. **Ejecutar SQL** en Supabase
5. **Probar endpoints** con Postman/curl

## 📞 Soporte

Si encuentras problemas:

1. Verifica **variables de entorno** en Netlify
2. Revisa **logs** en Netlify Functions
3. Confirma **tabla oauth_tokens** en Supabase
4. Verifica **permisos** de RLS

---

**¡Sistema listo para producción! 🎉**
