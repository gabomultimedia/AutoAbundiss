import { getStoredToken, isExpiringSoon, refreshWithKommo, upsertToken } from "./_kommo.js";

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

    const stored = await getStoredToken();
    
    if (!stored) {
      return {
        statusCode: 404,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'No hay tokens almacenados',
          message: 'Ejecuta el flujo OAuth primero visitando la URL de autorización de Kommo'
        }),
      };
    }

    let { access_token, refresh_token, expires_at } = stored;

    // Verificar si el token va a expirar en los próximos 5 minutos
    if (isExpiringSoon(expires_at, 300)) {
      try {
        console.log('Token expirando pronto, refrescando...');
        
        // Refrescar el token
        const refreshed = await refreshWithKommo(refresh_token);
        
        // Guardar los nuevos tokens
        const saved = await upsertToken(refreshed);
        
        // Actualizar variables locales
        access_token = saved.access_token;
        refresh_token = saved.refresh_token;
        expires_at = saved.expires_at;
        
        console.log('Token refrescado exitosamente');
        
      } catch (refreshError) {
        console.error('Error refrescando token:', refreshError);
        
        return {
          statusCode: 500,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: 'Error refrescando token',
            message: 'El token ha expirado y no se pudo refrescar. Re-autentica con Kommo.',
            details: refreshError.message
          }),
        };
      }
    }

    // Devolver el token válido
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token,
        expires_at,
        expires_in_seconds: Math.floor((new Date(expires_at).getTime() - Date.now()) / 1000),
        token_type: 'Bearer'
      }, null, 2)
    };

  } catch (e) {
    console.error('Error en kommo-token:', e);
    
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
