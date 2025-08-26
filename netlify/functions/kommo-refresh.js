import { getStoredToken, refreshWithKommo, upsertToken } from "./_kommo.js";

export async function handler(event) {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Método no permitido' }),
      };
    }

    const current = await getStoredToken();
    
    if (!current?.refresh_token) {
      return {
        statusCode: 404,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'No hay refresh token almacenado',
          message: 'Ejecuta el flujo OAuth primero para obtener tokens iniciales'
        }),
      };
    }

    console.log('Iniciando refresh manual de tokens...');
    
    try {
      // Forzar refresh de tokens
      const data = await refreshWithKommo(current.refresh_token);
      
      // Guardar los nuevos tokens
      const saved = await upsertToken(data);
      
      console.log('Refresh manual completado exitosamente');
      
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: 'Tokens refrescados exitosamente',
          data: {
            access_token: saved.access_token,
            expires_at: saved.expires_at,
            expires_in_seconds: Math.floor((new Date(saved.expires_at).getTime() - Date.now()) / 1000),
            token_type: 'Bearer'
          }
        }, null, 2)
      };
      
    } catch (refreshError) {
      console.error('Error en refresh manual:', refreshError);
      
      return {
        statusCode: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Error refrescando tokens',
          message: 'No se pudieron refrescar los tokens. Re-autentica con Kommo.',
          details: refreshError.message
        }),
      };
    }

  } catch (e) {
    console.error('Error en kommo-refresh:', e);
    
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
