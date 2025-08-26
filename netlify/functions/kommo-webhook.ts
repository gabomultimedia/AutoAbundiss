import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

const supabaseUrl = config.supabase.url;
const supabaseServiceRole = config.supabase.serviceRole;
const supabase = createClient(supabaseUrl, supabaseServiceRole);

export const handler: Handler = async (event) => {
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
        headers,
        body: JSON.stringify({ error: 'Método no permitido' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    
    // Verificar que es un mensaje válido de Kommo
    if (!body.message || !body.lead) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Formato de mensaje inválido' }),
      };
    }

    // Extraer información del mensaje
    const {
      message: { text, created_at, id },
      lead: { id: lead_id, name, phone, email }
    } = body;

    // Insertar en msg_buffer para procesamiento
    const { data, error } = await supabase
      .from('msg_buffer')
      .insert({
        chat_id: lead_id.toString(),
        message: text,
        sender: phone || email || 'unknown',
        created_at: new Date(created_at * 1000).toISOString(),
        metadata: {
          kommo_message_id: id,
          lead_name: name,
          lead_phone: phone,
          lead_email: email
        }
      });

    if (error) {
      console.error('Error insertando en msg_buffer:', error);
      return {
        statusCode: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Error procesando mensaje' }),
      };
    }

    // Respuesta exitosa para Kommo
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'Mensaje recibido y procesado',
        message_id: id
      }),
    };

  } catch (error) {
    console.error('Error en kommo-webhook:', error);
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
