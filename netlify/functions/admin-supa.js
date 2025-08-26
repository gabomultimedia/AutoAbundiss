import { createClient } from '@supabase/supabase-js';

// VERSION: 3.1 - Lógica de parseo corregida y placeholder para API key
const supabaseUrl = 'https://fcvwqwjsypossdqochde.supabase.co';
// JULES: Usando la nueva clave secreta (equivalente a service_role) proporcionada por el usuario.
const supabaseServiceRole = 'sb_secret_NvlzgPG5fvSb1pfuy_TVBw_n7v9RHmy';

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function handler(event) {
  console.log('🔍 admin-supa recibió request (V3 - Claves hardcodeadas):', {
    method: event.httpMethod,
    body: event.body,
    headers: event.headers
  });

  // Test simple de conexión a Supabase
  try {
    console.log('🔌 Probando conexión a Supabase...');
    const { data: testData, error: testError } = await supabase.from('app_settings').select('count').limit(1);
    console.log('✅ Conexión a Supabase OK:', { testData, error: testError?.message });
  } catch (testErr) {
    console.error('❌ Error conectando a Supabase:', testErr);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        error: 'Error de conexión a Supabase',
        details: testErr.message 
      }),
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ Respondiendo a OPTIONS');
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    console.log('📥 Procesando request...');
    
    // Para DELETE, el body puede estar vacío, así que manejamos ambos casos
    let action, data, id;
    
    if (event.httpMethod === 'DELETE') {
      console.log('🗑️ Procesando DELETE...');
      // Para DELETE, intentar parsear el body o usar query parameters
      try {
        const bodyData = JSON.parse(event.body || '{}');
        action = bodyData.action;
        data = bodyData.data;
        id = bodyData.id;
        console.log('✅ DELETE body parseado:', { action, data, id });
      } catch (parseError) {
        console.log('⚠️ No se pudo parsear DELETE body, usando query params');
        // Si no se puede parsear, usar query parameters
        action = event.queryStringParameters?.action;
        data = event.queryStringParameters?.data ? JSON.parse(event.queryStringParameters.data) : {};
        id = event.queryStringParameters?.id;
        console.log('✅ DELETE query params:', { action, data, id });
      }
    } else {
      console.log('📝 Procesando método:', event.httpMethod);
      // Para otros métodos, parsear el body normalmente
      const bodyData = JSON.parse(event.body || '{}');
      action = bodyData.action;
      id = bodyData.id;

      // FIX: La acción 'update_setting' envía los datos en el nivel superior, no anidados.
      if (action === 'update_setting') {
        data = { key: bodyData.key, value: bodyData.value };
      } else {
        data = bodyData.data;
      }
      console.log('✅ Body parseado (lógica corregida):', { action, data, id });
    }
    
    console.log('📝 Datos finales:', { action, data, id, method: event.httpMethod });

    if (!action) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Acción es requerida' }),
      };
    }

    let result;

    switch (action) {
      // Promociones
      case 'create_promotion':
        console.log('Creando promoción:', { 
          title: data.title, 
          discount_percent: data.discount_percent, 
          discount_amount: data.discount_amount 
        });
        result = await supabase.from('promotions').insert(data).select().single();
        console.log('Resultado create_promotion:', result);
        break;
      
      case 'update_promotion':
        console.log('📝 Actualizando promoción:', { id, title: data.title });
        result = await supabase.from('promotions').update(data).eq('id', id).select().single();
        console.log('✅ Resultado update_promotion:', result);
        break;
      
      case 'delete_promotion':
        console.log('🗑️ Eliminando promoción:', { id, method: event.httpMethod });
        if (!id) {
          throw new Error('ID es requerido para eliminar promoción');
        }
        result = await supabase.from('promotions').delete().eq('id', id);
        console.log('✅ Resultado delete_promotion:', result);
        break;

      // Knowledge Base
      case 'create_kb_entry':
        console.log('📚 Creando entrada KB:', { title: data.title, content: data.content?.substring(0, 50) });
        result = await supabase.from('kb_entries').insert(data).select().single();
        console.log('✅ Resultado create_kb_entry:', result);
        break;
      
      case 'update_kb_entry':
        console.log('📝 Actualizando entrada KB:', { id, title: data.title });
        result = await supabase.from('kb_entries').update(data).eq('id', id).select().single();
        console.log('✅ Resultado update_kb_entry:', result);
        break;
      
      case 'delete_kb_entry':
        console.log('🗑️ Eliminando entrada KB:', { id });
        result = await supabase.from('kb_entries').delete().eq('id', id);
        console.log('✅ Resultado delete_kb_entry:', result);
        break;

      // Google Calendar
      case 'create_gcal_event':
        console.log('Creando evento de calendario:', { 
          title: data.title, 
          start_time: data.start_time, 
          end_time: data.end_time 
        });
        result = await supabase.from('gcal_events').insert(data).select().single();
        console.log('Resultado create_gcal_event:', result);
        break;

      // Settings
      case 'update_setting':
        console.log('Actualizando setting:', { key: data.key, value: data.value ? 'presente' : 'ausente' });
        // Usar upsert para insertar o actualizar
        result = await supabase
          .from('app_settings')
          .upsert({ key: data.key, value: data.value }, { onConflict: 'key' })
          .select()
          .single();
        console.log('Resultado update_setting:', result);
        break;

      // Archivos (si se necesita en el futuro)
      case 'upload_file':
        result = await supabase.from('files_log').insert(data).select().single();
        break;
      
      case 'delete_file':
        result = await supabase.from('files_log').delete().eq('id', id);
        break;
      
      default:
        return {
          statusCode: 400,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: `Acción '${action}' no soportada` }),
        };
    }

    if (result.error) {
      console.error('❌ Error en operación Supabase:', result.error);
      throw new Error(result.error.message);
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        data: result.data || result
      }),
    };

  } catch (error) {
    console.error('Error en admin-supa:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      }),
    };
  }
}
