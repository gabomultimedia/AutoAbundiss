import { upsertToken, env } from "./_kommo.js";
import fetch from "node-fetch";

export async function handler(event) {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Método no permitido' }),
      };
    }

    const url = new URL(event.rawUrl);
    const code = url.searchParams.get("code");
    
    if (!code) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Código de autorización no recibido' }),
      };
    }

    // Intercambiar código por tokens
    const tokenUrl = `${env.baseUrl}/oauth2/access_token`;
    const payload = {
      client_id: env.clientId,
      client_secret: env.clientSecret,
      grant_type: "authorization_code",
      redirect_uri: env.redirectUri,
      code
    };

    const resp = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await resp.json();
    
    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Error obteniendo tokens de Kommo',
          details: data
        }),
      };
    }

    // Guardar tokens en Supabase
    await upsertToken({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in
    });

    // Redirigir a la página de éxito
    const redirectUrl = `https://abundiss-console.netlify.app/oauth/success?access_token=${data.access_token}&refresh_token=${data.refresh_token}`;

    return {
      statusCode: 302,
      headers: {
        ...headers,
        'Location': redirectUrl,
      },
      body: '',
    };

  } catch (e) {
    console.error('Error en kommo-oauth-callback:', e);
    
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: e.message
      }),
    };
  }
}
