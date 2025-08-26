import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { method, path, data } = JSON.parse(event.body || '{}');

    if (!method || !path) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Método y path son requeridos' }),
      };
    }

    let result;

    switch (method.toLowerCase()) {
      case 'get':
        result = await supabase.from(path).select('*');
        break;
      
      case 'post':
        result = await supabase.from(path).insert(data);
        break;
      
      case 'put':
        result = await supabase.from(path).update(data).eq('id', data.id);
        break;
      
      case 'delete':
        result = await supabase.from(path).delete().eq('id', data.id);
        break;
      
      default:
        return {
          statusCode: 400,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: 'Método no soportado' }),
        };
    }

    if (result.error) {
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
        data: result.data
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
