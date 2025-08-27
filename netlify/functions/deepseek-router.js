import { createClient } from '@supabase/supabase-js';

// Configuración hardcodeada para evitar problemas de variables de entorno
const supabaseUrl = 'https://fcvwqwjsypossdqochde.supabase.co';
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdndxd2pzeXBvc3NkcW9jaGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MTgxNjA4N30.6P-J5cQbnSBGYP27jJ33JVCO23z_JcoTFgqmGZDgPXE';
const deepseekApiKey = 'sk-94706e3233474ad081b6e2d199669311';

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function handler(event) {
  console.log('🧭 deepseek-router recibió request:', {
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

    console.log('📥 Clasificando mensaje:', { message: message.substring(0, 100), chat_id });

    // Prompt para clasificación de intención
    const classificationPrompt = `Eres un clasificador de intenciones para Abundiss Services. 
Analiza el siguiente mensaje y devuelve SOLO una de estas etiquetas:

- "conversacion": Preguntas generales, información, dudas sobre servicios
- "cotiza": Solicitudes de precios, cotizaciones, presupuestos
- "agenda": Citas, reuniones, programación, calendario
- "molesto": Clientes insatisfechos, quejas, problemas urgentes

Mensaje del cliente: "${message}"

Responde SOLO con la etiqueta, sin explicaciones adicionales.`;

    // Llamar a Deepseek API para clasificación
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
            content: classificationPrompt
          }
        ],
        max_tokens: 50,
        temperature: 0.1, // Baja temperatura para respuestas consistentes
      }),
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('❌ Error en Deepseek API:', deepseekResponse.status, errorText);
      throw new Error(`Error en Deepseek API: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    const intent = deepseekData.choices[0]?.message?.content?.trim().toLowerCase() || 'conversacion';

    // Normalizar la respuesta
    let normalizedIntent = 'conversacion'; // Default
    if (intent.includes('cotiza') || intent.includes('precio') || intent.includes('presupuesto')) {
      normalizedIntent = 'cotiza';
    } else if (intent.includes('agenda') || intent.includes('cita') || intent.includes('reunion') || intent.includes('calendario')) {
      normalizedIntent = 'agenda';
    } else if (intent.includes('molesto') || intent.includes('queja') || intent.includes('problema') || intent.includes('urgente')) {
      normalizedIntent = 'molesto';
    }

    console.log('✅ Intención clasificada:', { original: intent, normalized: normalizedIntent });

    // Guardar la clasificación en msg_buffer para seguimiento
    try {
      const { error: bufferError } = await supabase
        .from('msg_buffer')
        .insert({
          chat_id,
          message,
          intent: normalizedIntent,
          created_at: new Date().toISOString(),
        });

      if (bufferError) {
        console.error('⚠️ Error guardando en buffer:', bufferError);
      }
    } catch (bufferErr) {
      console.error('⚠️ Error en operación de buffer:', bufferErr);
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        intent: normalizedIntent,
        confidence: 'high',
        message_analyzed: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        timestamp: new Date().toISOString(),
      }),
    };

  } catch (error) {
    console.error('❌ Error en deepseek-router:', error);
    
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        intent: 'conversacion', // Fallback seguro
        message: 'Error en clasificación, usando conversación por defecto'
      }),
    };
  }
}
