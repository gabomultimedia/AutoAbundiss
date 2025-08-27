import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Configuración hardcodeada para evitar problemas de variables de entorno
const supabaseUrl = 'https://fcvwqwjsypossdqochde.supabase.co';
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdndxd2pzeXBvc3NkcW9jaGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MTgxNjA4N30.6P-J5cQbnSBGYP27jJ33JVCO23z_JcoTFgqmGZDgPXE';
const supabase = createClient(supabaseUrl, supabaseServiceRole);

// Configuración del debounce
const DEBOUNCE_MS = 12000; // 12 segundos

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

    const chatId = lead_id.toString();
    const messageText = text;
    const messageTime = new Date(created_at * 1000);

    console.log('📥 Kommo webhook recibió mensaje:', {
      chat_id: chatId,
      message: messageText.substring(0, 100),
      sender: phone || email || 'unknown',
      time: messageTime.toISOString()
    });

    // 1. Verificar debounce - si el último mensaje es muy reciente, solo guardar
    const { data: recentMessages } = await supabase
      .from('msg_buffer')
      .select('created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentMessages && recentMessages.length > 0) {
      const lastMessageTime = new Date(recentMessages[0].created_at);
      const timeDiff = messageTime.getTime() - lastMessageTime.getTime();
      
      if (timeDiff < DEBOUNCE_MS) {
        console.log('⏰ Debounce activo, solo guardando mensaje');
        
        // Solo guardar en buffer y responder "listening"
        await supabase.from('msg_buffer').insert({
          chat_id: chatId,
          message: messageText,
          sender: phone || email || 'unknown',
          created_at: messageTime.toISOString(),
          intent: 'pending'
        });

        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            status: 'listening',
            message: 'Mensaje recibido, procesando...',
            message_id: id
          }),
        };
      }
    }

    // 2. Insertar mensaje en buffer
    const { error: bufferError } = await supabase
      .from('msg_buffer')
      .insert({
        chat_id: chatId,
        message: messageText,
        sender: phone || email || 'unknown',
        created_at: messageTime.toISOString(),
        intent: 'pending'
      });

    if (bufferError) {
      console.error('❌ Error insertando en msg_buffer:', bufferError);
      throw new Error('Error en buffer');
    }

    // 3. Clasificar intención con Deepseek
    console.log('🧭 Clasificando intención del mensaje...');
    let intent = 'conversacion';
    
    try {
      const routerResponse = await fetch(`${process.env.URL || 'https://abundiss-console.netlify.app'}/.netlify/functions/deepseek-router`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          chat_id: chatId
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

    // 4. Procesar según la intención
    let aiResponse = '';
    let shouldSendToKommo = true;

    try {
      switch (intent) {
        case 'cotiza':
          console.log('💰 Generando cotización...');
          const quoteResponse = await fetch(`${process.env.URL || 'https://abundiss-console.netlify.app'}/.netlify/functions/deepseek-quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: messageText,
              chat_id: chatId
            })
          });
          
          if (quoteResponse.ok) {
            const quoteData = await quoteResponse.json();
            aiResponse = quoteData.quote;
          }
          break;

        case 'agenda':
          console.log('📅 Procesando solicitud de agenda...');
          // Por ahora, responder con información básica
          aiResponse = 'Perfecto, te ayudo con la agenda. ¿Podrías decirme qué día y hora te gustaría programar? Puedo sugerirte horarios disponibles entre 8:00 AM y 7:00 PM.';
          break;

        case 'molesto':
          console.log('😤 Cliente molesto, preparando handoff...');
          aiResponse = 'Entiendo tu frustración y lamento que hayas tenido esta experiencia. Te voy a conectar inmediatamente con un representante de nuestro equipo para resolver tu situación de la manera más rápida posible.';
          shouldSendToKommo = false; // No enviar automáticamente
          break;

        default: // conversacion
          console.log('💬 Generando respuesta conversacional...');
          const replyResponse = await fetch(`${process.env.URL || 'https://abundiss-console.netlify.app'}/.netlify/functions/deepseek-reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: messageText,
              chat_id: chatId
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
      aiResponse = 'Gracias por tu mensaje. Un representante de nuestro equipo se pondrá en contacto contigo pronto.';
    }

    // 5. Guardar conversación completa
    if (aiResponse) {
      await supabase.from('conversations').insert({
        chat_id: chatId,
        intent,
        message: messageText,
        reply: aiResponse,
        created_at: messageTime.toISOString(),
      });
    }

    // 6. Enviar respuesta a Kommo si es apropiado
    if (shouldSendToKommo && aiResponse) {
      try {
        const kommoResponse = await fetch(`${process.env.URL || 'https://abundiss-console.netlify.app'}/.netlify/functions/kommo-send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message: aiResponse
          })
        });

        if (kommoResponse.ok) {
          console.log('✅ Respuesta enviada a Kommo');
        } else {
          console.error('⚠️ Error enviando a Kommo:', kommoResponse.status);
        }
      } catch (sendError) {
        console.error('❌ Error en envío a Kommo:', sendError);
      }
    }

    // 7. Limpiar buffer de mensajes procesados
    await supabase
      .from('msg_buffer')
      .delete()
      .eq('chat_id', chatId);

    console.log('✅ Pipeline completo ejecutado para chat_id:', chatId);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        status: 'processed',
        intent,
        message: 'Mensaje procesado completamente',
        message_id: id,
        ai_response: aiResponse ? 'generada' : 'no_generada'
      }),
    };

  } catch (error) {
    console.error('❌ Error en kommo-webhook:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      }),
    };
  }
};
