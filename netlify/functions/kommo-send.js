import { createClient } from '@supabase/supabase-js';

// Configuración hardcodeada para evitar problemas de variables de entorno
const supabaseUrl = 'https://fcvwqwjsypossdqochde.supabase.co';
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdndxd2pzeXBvc3NkcW9jaGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MTgxNjA4N30.6P-J5cQbnSBGYP27jJ33JVCO23z_JcoTFgqmGZDgPXE';

// Configuración de Kommo
const KOMMO_BASE_URL = 'https://new1645892779.kommo.com';
const KOMMO_BEARER = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjY1ZWRmMDY2YTIwYThiNGY4YzA2ZDBmZjFlMmE1ZGRlODExMzcxOWJjNThhNTNkMjRjNjRiMDA2YjI2Y2E1YjBkY2ZmZTc3OGFkMDMwYTg5In0.eyJhdWQiOiIyODZhOGYzMC1hODJjLTQ0ZDUtODkwMi04OTMwNzMyNTQ3Y2EiLCJqdGkiOiI2NWVkZjA2NmEyMGE4YjRmOGMwNmQwZmYxZTJhNWRkZTgxMTM3MTliYzU4YTUzZDI2YjAwNmIyNmNhNWIwZGNmZmU3NzhhZDAzMGE4OSIsImlhdCI6MTc1NjI0NTY2NiwibmJmIjoxNzU2MjQ1NjY2LCJleHAiOjE5MTI1NTA0MDAsInN1YiI6IjgwNjIxMjEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzAwMzE5NTIsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiI4NzA4ZGFmYi1lMmJjLTQ5MzctOWVlYi1jOWQ3OGQwMDg2NTkiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.bxanI1UgwWefUu5ne5vjCurRRogtQmykP8zCGUw1dSAQPrPK_5WUgpAsYojnrx0evUfbaMJIpFepYgExigftGsKE6XJjas-PAC5b187pdHQP11g5nb3AUasBfnzbeTdQIpqTczdIes0FtPA0P8VGD_ALQNLcvJT7p665E5t_B_10923iTWX4XC3ih2eKftA7aqDbiGzhbaiEEOUM8ai2oYyi37ymsmZO4RTduw_V20HDLy-wFJWy0jrtkq-KFf9iKPDuCfeFykWBDWUE_kq2bn2kOfHPCIGrhu7DA1ofOBVMc5HUV3vZEUuMh4NBFoou_SinsqapAELkDZBiCBHHIA';

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function handler(event) {
  console.log('📤 kommo-send recibió request:', {
    method: event.httpMethod,
    body: event.body
  });

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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método no permitido' }),
    };
  }

  try {
    const { chat_id, message } = JSON.parse(event.body || '{}');
    
    if (!chat_id || !message) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'chat_id y message son requeridos' }),
      };
    }

    console.log('📤 Enviando mensaje a Kommo:', {
      chat_id,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      kommo_url: KOMMO_BASE_URL
    });

    // 1. Obtener información del chat desde Supabase
    const { data: chatInfo, error: chatError } = await supabase
      .from('conversations')
      .select('chat_id, intent, created_at')
      .eq('chat_id', chat_id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (chatError) {
      console.error('⚠️ Error obteniendo info del chat:', chatError);
    }

    // 2. Enviar mensaje a Kommo via API
    const kommoResponse = await fetch(`${KOMMO_BASE_URL}/ajax/v1/chats/session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KOMMO_BEARER}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chat_id,
        message: message,
        // Opcional: agregar metadata
        metadata: {
          source: 'abundiss-console',
          intent: chatInfo?.[0]?.intent || 'unknown',
          timestamp: new Date().toISOString(),
          ai_generated: true
        }
      }),
    });

    if (!kommoResponse.ok) {
      const errorText = await kommoResponse.text();
      console.error('❌ Error enviando a Kommo:', kommoResponse.status, errorText);
      
      // Intentar obtener más detalles del error
      let errorDetails = 'Error desconocido';
      try {
        const errorData = JSON.parse(errorText);
        errorDetails = errorData.message || errorData.error || errorText;
      } catch (parseError) {
        errorDetails = errorText;
      }

      throw new Error(`Error en Kommo API: ${kommoResponse.status} - ${errorDetails}`);
    }

    const kommoData = await kommoResponse.json();
    console.log('✅ Mensaje enviado exitosamente a Kommo:', {
      status: kommoResponse.status,
      response_id: kommoData.id || 'unknown',
      chat_id
    });

    // 3. Actualizar el registro de conversación con el ID de respuesta de Kommo
    if (kommoData.id) {
      try {
        await supabase
          .from('conversations')
          .update({ 
            kommo_response_id: kommoData.id,
            sent_at: new Date().toISOString()
          })
          .eq('chat_id', chat_id)
          .order('created_at', { ascending: false })
          .limit(1);
      } catch (updateError) {
        console.error('⚠️ Error actualizando conversación:', updateError);
      }
    }

    // 4. Registrar el envío en el log
    try {
      await supabase.from('msg_buffer').insert({
        chat_id,
        message: `[ENVIADO] ${message}`,
        sender: 'system',
        created_at: new Date().toISOString(),
        intent: 'sent',
        metadata: {
          kommo_response_id: kommoData.id,
          kommo_status: 'success'
        }
      });
    } catch (logError) {
      console.error('⚠️ Error registrando envío:', logError);
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Mensaje enviado exitosamente a Kommo',
        kommo_response_id: kommoData.id,
        chat_id,
        timestamp: new Date().toISOString(),
        details: {
          intent: chatInfo?.[0]?.intent || 'unknown',
          message_length: message.length,
          kommo_status: kommoResponse.status
        }
      }),
    };

  } catch (error) {
    console.error('❌ Error en kommo-send:', error);
    
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Error enviando mensaje a Kommo',
        timestamp: new Date().toISOString()
      }),
    };
  }
}
