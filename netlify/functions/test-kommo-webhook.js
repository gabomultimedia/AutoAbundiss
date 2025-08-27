import { createClient } from '@supabase/supabase-js';

// Configuración hardcodeada para evitar problemas de variables de entorno
const supabaseUrl = 'https://fcvwqwjsypossdqochde.supabase.co';
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdndxd2pzeXBvc3NkcW9jaGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MTgxNjA4N30.6P-J5cQbnSBGYP27jJ33JVCO23z_JcoTFgqmGZDgPXE';

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function handler(event) {
  console.log('🧪 test-kommo-webhook recibió request:', {
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
    const { testType, message, chat_id } = JSON.parse(event.body || '{}');
    
    if (!testType || !message) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'testType y message son requeridos' }),
      };
    }

    console.log('🧪 Ejecutando prueba:', { testType, message: message.substring(0, 100), chat_id });

    // Simular mensaje de Kommo
    const mockKommoMessage = {
      message: {
        text: message,
        created_at: Math.floor(Date.now() / 1000),
        id: `test_${Date.now()}`
      },
      lead: {
        id: chat_id || 'test_lead_123',
        name: 'Cliente de Prueba',
        phone: '+525512345678',
        email: 'test@example.com'
      }
    };

    console.log('📥 Mensaje simulado de Kommo:', mockKommoMessage);

    // 1. Insertar en msg_buffer
    const { error: bufferError } = await supabase
      .from('msg_buffer')
      .insert({
        chat_id: chat_id || 'test_lead_123',
        message: message,
        sender: '+525512345678',
        created_at: new Date().toISOString(),
        intent: 'pending'
      });

    if (bufferError) {
      console.error('❌ Error insertando en buffer:', bufferError);
      throw new Error('Error en buffer');
    }

    console.log('✅ Mensaje insertado en buffer');

    // 2. Clasificar intención
    let intent = 'conversacion';
    try {
      const routerResponse = await fetch(`${process.env.URL || 'https://abundiss-console.netlify.app'}/.netlify/functions/deepseek-router`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          chat_id: chat_id || 'test_lead_123'
        })
      });

      if (routerResponse.ok) {
        const routerData = await routerResponse.json();
        intent = routerData.intent;
        console.log('✅ Intención clasificada:', intent);
      }
    } catch (routerError) {
      console.error('⚠️ Error en router, usando conversación por defecto:', routerError);
    }

    // 3. Procesar según la intención
    let aiResponse = '';
    let shouldSendToKommo = true;

    try {
      switch (intent) {
        case 'cotiza':
          console.log('💰 Generando cotización de prueba...');
          const quoteResponse = await fetch(`${process.env.URL || 'https://abundiss-console.netlify.app'}/.netlify/functions/deepseek-quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: message,
              chat_id: chat_id || 'test_lead_123'
            })
          });
          
          if (quoteResponse.ok) {
            const quoteData = await quoteResponse.json();
            aiResponse = quoteData.quote;
          }
          break;

        case 'agenda':
          console.log('📅 Procesando solicitud de agenda de prueba...');
          aiResponse = 'Perfecto, te ayudo con la agenda. ¿Podrías decirme qué día y hora te gustaría programar? Puedo sugerirte horarios disponibles entre 8:00 AM y 7:00 PM.';
          break;

        case 'molesto':
          console.log('😤 Cliente molesto de prueba, preparando handoff...');
          aiResponse = 'Entiendo tu frustración y lamento que hayas tenido esta experiencia. Te voy a conectar inmediatamente con un representante de nuestro equipo para resolver tu situación de la manera más rápida posible.';
          shouldSendToKommo = false;
          break;

        default: // conversacion
          console.log('💬 Generando respuesta conversacional de prueba...');
          const replyResponse = await fetch(`${process.env.URL || 'https://abundiss-console.netlify.app'}/.netlify/functions/deepseek-reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: message,
              chat_id: chat_id || 'test_lead_123'
            })
          });
          
          if (replyResponse.ok) {
            const replyData = await replyResponse.json();
            aiResponse = replyData.reply;
          }
          break;
      }
    } catch (aiError) {
      console.error('❌ Error en procesamiento de IA:', aiError);
      aiResponse = 'Gracias por tu mensaje de prueba. Un representante de nuestro equipo se pondrá en contacto contigo pronto.';
    }

    // 4. Guardar conversación completa
    if (aiResponse) {
      const { error: convError } = await supabase
        .from('conversations')
        .insert({
          chat_id: chat_id || 'test_lead_123',
          intent,
          message: message,
          reply: aiResponse,
          created_at: new Date().toISOString(),
        });

      if (convError) {
        console.error('⚠️ Error guardando conversación:', convError);
      } else {
        console.log('✅ Conversación guardada en Supabase');
      }
    }

    // 5. Limpiar buffer
    await supabase
      .from('msg_buffer')
      .delete()
      .eq('chat_id', chat_id || 'test_lead_123');

    console.log('✅ Pipeline de prueba completado');

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Prueba del pipeline completada exitosamente',
        test_results: {
          test_type: testType,
          message_processed: message.substring(0, 100),
          intent_classified: intent,
          ai_response_generated: aiResponse ? 'sí' : 'no',
          response_length: aiResponse?.length || 0,
          should_send_to_kommo: shouldSendToKommo,
          chat_id: chat_id || 'test_lead_123'
        },
        ai_response: aiResponse,
        timestamp: new Date().toISOString(),
        note: 'Esta es una prueba del sistema. Los datos se guardan en la base de datos para verificación.'
      }),
    };

  } catch (error) {
    console.error('❌ Error en test-kommo-webhook:', error);
    
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Error ejecutando prueba del pipeline',
        timestamp: new Date().toISOString()
      }),
    };
  }
}
