import { createClient } from '@supabase/supabase-js';

// Configuración hardcodeada para evitar problemas de variables de entorno
const supabaseUrl = 'https://fcvwqwjsypossdqochde.supabase.co';
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdndxd2pzeXBvc3NkcW9jaGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MTgxNjA4N30.6P-J5cQbnSBGYP27jJ33JVCO23z_JcoTFgqmGZDgPXE';
const deepseekApiKey = 'sk-94706e3233474ad081b6e2d199669311';

const supabase = createClient(supabaseUrl, supabaseServiceRole);

// Lista de precios fija
const PRICE_LIST = {
  'Landing': 15500,
  'Website': 28900,
  'Ecommerce': 39900,
  'Kommo': 12500,
  'Agente IA': 8700,
  'Soporte': 6900,
  'Hora extra': 800
};

export async function handler(event) {
  console.log('💰 deepseek-quote recibió request:', {
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
    const { message, chat_id, requirements } = JSON.parse(event.body || '{}');
    
    if (!message) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Mensaje es requerido' }),
      };
    }

    console.log('📥 Generando cotización para:', { message: message.substring(0, 100), chat_id, requirements });

    // 1. Obtener promociones activas para aplicar descuentos
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

    // 2. Construir prompt para Deepseek
    let prompt = 'Eres un experto en cotizaciones de Abundiss Services. ';
    prompt += 'Genera una cotización profesional y detallada en español basada en la siguiente información:\n\n';
    
    prompt += 'LISTA DE PRECIOS:\n';
    Object.entries(PRICE_LIST).forEach(([service, price]) => {
      prompt += `- ${service}: $${price.toLocaleString('es-MX')} MXN\n`;
    });
    
    prompt += '\nREQUISITOS DEL CLIENTE:\n';
    prompt += `${message}\n\n`;
    
    if (requirements) {
      prompt += `DETALLES ADICIONALES:\n${requirements}\n\n`;
    }

    if (promotions && promotions.length > 0) {
      prompt += 'PROMOCIONES ACTIVAS APLICABLES:\n';
      promotions.forEach(promo => {
        if (promo.discount_percent) {
          prompt += `- ${promo.title}: ${promo.discount_percent}% de descuento\n`;
        } else if (promo.discount_amount) {
          prompt += `- ${promo.title}: $${promo.discount_amount} de descuento\n`;
        }
      });
      prompt += '\n';
    }

    prompt += 'INSTRUCCIONES:\n';
    prompt += '1. Analiza los requisitos y sugiere servicios apropiados\n';
    prompt += '2. Calcula el precio total aplicando descuentos si corresponde\n';
    prompt += '3. Incluye tiempo estimado de entrega\n';
    prompt += '4. Menciona garantías y soporte incluido\n';
    prompt += '5. Formato: Cotización profesional con estructura clara\n';
    prompt += '6. Máximo 3 párrafos, tono amigable pero profesional';

    console.log('📋 Prompt construido:', prompt.substring(0, 200) + '...');

    // 3. Llamar a Deepseek API
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
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('❌ Error en Deepseek API:', deepseekResponse.status, errorText);
      throw new Error(`Error en Deepseek API: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    const quoteResponse = deepseekData.choices[0]?.message?.content || 'No se pudo generar la cotización en este momento.';

    console.log('✅ Cotización generada:', quoteResponse.substring(0, 100) + '...');

    // 4. Guardar la conversación en Supabase
    const { error: convError } = await supabase
      .from('conversations')
      .insert({
        chat_id,
        intent: 'cotiza',
        message,
        reply: quoteResponse,
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
        quote: quoteResponse,
        price_list: PRICE_LIST,
        promotions_applied: promotions?.length || 0,
        context: {
          requirements: requirements || 'No especificados',
          message_length: message.length,
        }
      }),
    };

  } catch (error) {
    console.error('❌ Error en deepseek-quote:', error);
    
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        quote: 'Lo siento, hubo un error generando la cotización. Por favor, contacta directamente con nuestro equipo.'
      }),
    };
  }
}
