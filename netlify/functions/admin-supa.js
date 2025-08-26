import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

const supabaseUrl = config.supabase.url;
const supabaseServiceRole = config.supabase.serviceRole;

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function handler(event) {
  console.log('🔍 admin-supa recibió request:', {
    method: event.httpMethod,
    body: event.body,
    headers: event.headers
  });

  // Verificar conexión a Supabase
  try {
    const { data: testData, error: testError } = await supabase.from('app_settings').select('count').limit(1);
    console.log('✅ Conexión a Supabase OK:', { testData, testError });
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
    const { action, data, id } = JSON.parse(event.body || '{}');
    console.log('📝 Datos parseados:', { action, data, id });

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
        console.log('🗑️ Eliminando promoción:', { id });
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
          .upsert({ key: data.key, value: data.value })
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
