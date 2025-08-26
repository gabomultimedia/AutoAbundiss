import { Handler } from '@netlify/functions';

const KOMMO_CLIENT_ID = process.env.KOMMO_CLIENT_ID;
const KOMMO_CLIENT_SECRET = process.env.KOMMO_CLIENT_SECRET;
const KOMMO_REDIRECT_URI = process.env.KOMMO_REDIRECT_URI || 'https://abundiss-console.netlify.app/.netlify/functions/kommo-oauth-callback';

export const handler: Handler = async (event) => {
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
        headers,
        body: JSON.stringify({ error: 'Método no permitido' }),
      };
    }

    // Obtener el código de autorización de la URL
    const queryParams = event.queryStringParameters || {};
    const { code, state, error } = queryParams;

    // Si hay un error en la autorización
    if (error) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: 'Error en autorización de Kommo',
          details: error
        }),
      };
    }

    // Si no hay código de autorización
    if (!code) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: 'Código de autorización no recibido',
        }),
      };
    }

    try {
      // Intercambiar el código por un token de acceso
      const tokenResponse = await fetch('https://new1645892779.kommo.com/oauth2/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: KOMMO_CLIENT_ID!,
          client_secret: KOMMO_CLIENT_SECRET!,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: KOMMO_REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Error obteniendo token: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();

      // Redirigir a la aplicación con el token
      const redirectUrl = `https://abundiss-console.netlify.app/oauth/success?access_token=${tokenData.access_token}&refresh_token=${tokenData.refresh_token}`;

      return {
        statusCode: 302,
        headers: {
          ...headers,
          'Location': redirectUrl,
        },
        body: '',
      };

    } catch (tokenError) {
      console.error('Error obteniendo token de acceso:', tokenError);
      return {
        statusCode: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: 'Error obteniendo token de acceso',
        }),
      };
    }

  } catch (error) {
    console.error('Error en kommo-oauth-callback:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
      }),
    };
  }
};
