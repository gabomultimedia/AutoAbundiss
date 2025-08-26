import { getStoredToken, isExpiringSoon, refreshWithKommo, upsertToken } from "./_kommo.js";

export async function handler(event) {
  // Esta función se ejecuta automáticamente cada 12 horas
  // No necesita manejo de CORS ya que es llamada internamente por Netlify
  
  try {
    console.log('Ejecutando refresh programado de tokens de Kommo...');
    
    const current = await getStoredToken();
    
    if (!current?.refresh_token) {
      console.log('No hay refresh token almacenado, saltando refresh programado');
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: 'No hay refresh token almacenado'
        })
      };
    }

    // Solo refrescar si el token expira en las próximas 2 horas
    if (isExpiringSoon(current.expires_at, 7200)) {
      console.log('Token expirando pronto, ejecutando refresh programado...');
      
      try {
        // Refrescar tokens
        const data = await refreshWithKommo(current.refresh_token);
        
        // Guardar nuevos tokens
        const saved = await upsertToken(data);
        
        console.log('Refresh programado completado exitosamente');
        
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'Tokens refrescados exitosamente en refresh programado',
            data: {
              expires_at: saved.expires_at,
              expires_in_seconds: Math.floor((new Date(saved.expires_at).getTime() - Date.now()) / 1000)
            }
          })
        };
        
      } catch (refreshError) {
        console.error('Error en refresh programado:', refreshError);
        
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            error: 'Error en refresh programado',
            message: refreshError.message
          })
        };
      }
    } else {
      console.log('Token aún válido, no es necesario refrescar');
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Token aún válido, no se requiere refresh',
          data: {
            expires_at: current.expires_at,
            expires_in_seconds: Math.floor((new Date(current.expires_at).getTime() - Date.now()) / 1000)
          }
        })
      };
    }

  } catch (e) {
    console.error('Error en kommo-scheduled-refresh:', e);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        message: e.message
      })
    };
  }
}
