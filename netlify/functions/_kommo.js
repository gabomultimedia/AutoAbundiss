import fetch from "node-fetch";
import { config } from "./config.js";

export const env = {
  baseUrl: config.kommo.baseUrl,
  clientId: config.kommo.clientId,
  clientSecret: config.kommo.clientSecret,
  redirectUri: config.kommo.redirectUri,
  supabaseUrl: config.supabase.url,
  supabaseServiceRole: config.supabase.serviceRole,
};

const supabaseFetch = async (path, init = {}) => {
  const url = `${env.supabaseUrl}/rest/v1${path}`;
  const headers = {
    apikey: env.supabaseServiceRole,
    Authorization: `Bearer ${env.supabaseServiceRole}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    ...(init.headers || {})
  };
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  return res;
};

export async function getStoredToken() {
  const res = await supabaseFetch(`/oauth_tokens?provider=eq.kommo&select=*`);
  const arr = await res.json();
  return arr[0] || null;
}

export async function upsertToken({ access_token, refresh_token, expires_in }) {
  const expires_at = new Date(Date.now() + (expires_in * 1000)).toISOString();
  const body = JSON.stringify([{
    provider: "kommo",
    access_token,
    refresh_token,
    expires_at
  }]);
  
  // Usar UPSERT (INSERT ... ON CONFLICT)
  await supabaseFetch(`/oauth_tokens`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates"
    },
    body,
  });
  
  return { access_token, refresh_token, expires_at };
}

export async function refreshWithKommo(refresh_token) {
  const url = `${env.baseUrl}/oauth2/access_token`;
  const payload = {
    client_id: env.clientId,
    client_secret: env.clientSecret,
    grant_type: "refresh_token",
    refresh_token
  };
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kommo refresh failed ${res.status}: ${text}`);
  }
  
  return res.json(); // { access_token, refresh_token, expires_in, ... }
}

export function isExpiringSoon(expires_at_iso, marginSec = 300) {
  if (!expires_at_iso) return true;
  const expiresAt = new Date(expires_at_iso).getTime();
  const nowPlusMargin = Date.now() + marginSec * 1000;
  return expiresAt <= nowPlusMargin;
}

// Función para actualizar el timestamp de updated_at
export async function updateTimestamp() {
  await supabaseFetch(`/oauth_tokens?provider=eq.kommo`, {
    method: "PATCH",
    body: JSON.stringify({
      updated_at: new Date().toISOString()
    })
  });
}
