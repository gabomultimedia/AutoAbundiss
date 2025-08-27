import { createClient } from '@supabase/supabase-js';

// Configuración hardcodeada para evitar problemas de variables de entorno
const supabaseUrl = 'https://fcvwqwjsypossdqochde.supabase.co';
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdndxd2pzeXBvc3NkcW9jaGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MTgxNjA4N30.6P-J5cQbnSBGYP27jJ33JVCO23z_JcoTFgqmGZDgPXE';
const deepseekApiKey = 'sk-94706e3233474ad081b6e2d199669311';

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function handler(event) {
  console.log('🧠 deepseek-reply recibió request:', {
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
    const { message, chat_id } = JSON.parse(event.body || '{}');
    
    if (!message) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Mensaje es requerido' }),
      };
    }

    console.log('📥 Procesando mensaje:', { message: message.substring(0, 100), chat_id });

    // 1. Obtener entradas relevantes de la base de conocimientos
    const { data: kbEntries, error: kbError } = await supabase
      .from('kb_entries')
      .select('title, content, tags')
      .eq('is_active', true)
      .limit(5);

    if (kbError) {
      console.error('❌ Error obteniendo KB:', kbError);
    }

    // 2. Obtener promociones activas
    const now = new Date().toISOString();
    const { data: promotions, error: promoError } = await supabase
      .from('promotions')
      .select('title, description, discount_percent, discount_amount')
      .eq('is_active', true)
      .gte('starts_at', now)
      .lte('ends_at', now)
      .limit(3);

    if (promoError) {
      console.error('❌ Error obteniendo promociones:', promoError);
    }

    // 3. Construir contexto para Deepseek
    let context = 'Eres un asistente virtual de Abundiss Services, una empresa de desarrollo web y servicios digitales. ';
    context += 'Responde de manera profesional, amigable y en español. Máximo 2 párrafos de 2 líneas cada uno.\n\n';

    if (kbEntries && kbEntries.length > 0) {
      context += 'Base de conocimientos disponible:\n';
      kbEntries.forEach(entry => {
        context += `- ${entry.title}: ${entry.content.substring(0, 100)}...\n`;
      });
      context += '\n';
    }

    if (promotions && promotions.length > 0) {
      context += 'Promociones activas:\n';
      promotions.forEach(promo => {
        if (promo.discount_percent) {
          context += `- ${promo.title}: ${promo.discount_percent}% de descuento\n`;
        } else if (promo.discount_amount) {
          context += `- ${promo.title}: $${promo.discount_amount} de descuento\n`;
        }
      });
      context += '\n';
    }

    context += `Mensaje del cliente: "${message}"\n\n`;
    context += 'Genera una respuesta útil que incluya información relevante de la base de conocimientos y promociones activas si es apropiado.';

    console.log('📚 Contexto construido:', context.substring(0, 200) + '...');

    // 4. Llamar a Deepseek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: context
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('❌ Error en Deepseek API:', deepseekResponse.status, errorText);
      throw new Error(`Error en Deepseek API: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    const aiResponse = deepseekData.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta en este momento.';

    console.log('✅ Respuesta de Deepseek generada:', aiResponse.substring(0, 100) + '...');

    // 5. Guardar la conversación en Supabase
    const { error: convError } = await supabase
      .from('conversations')
      .insert({
        chat_id,
        intent: 'conversacion',
        message,
        reply: aiResponse,
        created_at: new Date().toISOString(),
      });

    if (convError) {
      console.error('⚠️ Error guardando conversación:', convError);
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        reply: aiResponse,
        context: {
          kb_entries_used: kbEntries?.length || 0,
          promotions_used: promotions?.length || 0,
        }
      }),
    };

  } catch (error) {
    console.error('❌ Error en deepseek-reply:', error);
    
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        reply: 'Lo siento, hubo un error procesando tu mensaje. Por favor, intenta de nuevo.'
      }),
    };
  }
}
