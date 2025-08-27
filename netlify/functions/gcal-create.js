import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

// Configuración hardcodeada para evitar problemas de variables de entorno
const supabaseUrl = 'https://fcvwqwjsypossdqochde.supabase.co';
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdndxd2pzeXBvc3NkcW9jaGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MTgxNjA4N30.6P-J5cQbnSBGYP27jJ33JVCO23z_JcoTFgqmGZDgPXE';

// Configuración de Google Calendar
const GCP_CLIENT_EMAIL = 'abundiss-calendar@abundiss-consola.iam.gserviceaccount.com';
const GCP_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCutkXdP46Z138H\nC7BJq0kD1mLqYqtx7i88G9sdEDewfGy1E5WVKdhiayV5tjRMiIZiIDOUTTUs78mC\nRbfh/FA6pOwfvqX3D7CT4yAJeeKNNqDQdBWDJGsf5WBDos7v+vhJCyLLvqxxVCMD\nij4C7lpGWOC8pfNyA+u9TF+UPh2JDPnh4c4NMeYQ15yaOrCdq5FK9faZMxdIoDHo\nDeevks10eFVrD67/AWduhcZ+lxolYIP7wbrxCMQDmNN4//vYeWDbHAdk77dYulCO\nTDRvP+gJ2//9Xq4cpWv5y0Mme/3Atix+Y7vAwszPiSUGxGyoFZ5CnZ5YvCKSkFQi\nj4anpFITAgMBAAECggEAPycY2vBR8g8g1iGmAAMfufjhOXsgIOcpgM9K5VcK4ksf\nmlaxb8E3+99iJPw1LGL/PHIKYvWDnrIwg1wDK3diYshhp9nosQUlXVewqWw69bOE\n7sS/T++2n0lxAhHUPo/X9sNFOSO7vp1cqLdsUe/phtsypU5RUOnU6VC1jebkEzkZ\ngvwFxsRe3oUCEfAQ7S/MFkp7XCRohFHkMhTFEZKs6LgFDOO7Okzm+thpwajPV/8P\nP/ZdTfYsd32+njKtLNfaR1H70diIygw+85WZ7jB8pLGMlhCeikc3/YNMOGMRPaNF\nZloNZ4/Vh6Xxhb0sr+W9e9r0fvMbBttkpGqJqwWTkQKBgQDnzIrYlPzSNNZgezhN\nJrEANY/KIftkcyEIhXOQD9C8aF7D4nn0mNzN36NLoQ9LBzAMyhGO96OkNP+xqQVe\n5UM83zbAmTrOKMBkkmNMllxFN+SBmsfE5XPNeiSEryuKkUiRmrqp3/ZASWe52wvQ\nOPz66fGNtcHbXTm1LAMOY2J1gwKBgQDA8+z6GNVMXh25o5DD665O0TyNCVLZHmza\n9n7Lgk1pL58crFywtez/W51RQRWd81e6b+ked83S1Knp0by7LlKWWNbakhq2OoSB\nCiFq/zL1FSB+71z8tirH+Kzj737QUZOUHiKBPNRtBJJuUEF1rP8b6yjznetLlHla\nXDgwbhCcMQKBgFrYgk4xzghAZwh3InCySkqPs2P//3u112t0if8bA67jpMhWuX9Q\nbbFOBby9SbYZAg7xHwKOMZdIojGp0Y4IglqYDOhc5Xwo4oZIDRzWDSGfrzHQTJzx\nZHpSdX9++6yaFfvizWeIfAVj/4AKxk18GEHqcB4e7vQfTF+h+SypbMwrAoGAGSby\n6jsYeub92vgeY9uyEiYmTYA8o37a08Q0DRVEQATsKdGyF3rvlO39WN0yEy/obK4v\n5j/ZvbTpHUiw4HmOXHjiMQXAo6aHJUcLyiXQH7CMVt+e8HZSp1ScPO44SrGHmlQ/\nTTd/vWJOMEEX914At0P1R6R7SpPlKclBrdZ7JdECgYEAqY7vFNlY+Cd38tIvNNbU\nsBUfjqahgADycngU66x6ThjdBl17xsUIgM29B0bHawh/l7xzPBw1nqFqJ4Kupppk\njDNP/fXyms/OBNPGORf00Sl4sCB0BsqPzLEBrjuSmg6G340ILBcth+1Ythrfjva5\nrkF2h71npv5WhLq5ZnaWfWc=\n-----END PRIVATE KEY-----\n';
const GCAL_CALENDAR_ID = 'd85cd569de00380a08a8e7f8b118a09122761706cfb3fa27c1647f46badfa710@group.calendar.google.com';
const GCAL_TIMEZONE = 'America/Mexico_City';

const supabase = createClient(supabaseUrl, supabaseServiceRole);

// Configurar Google Auth
const auth = new google.auth.JWT(
  GCP_CLIENT_EMAIL,
  null,
  GCP_PRIVATE_KEY,
  ['https://www.googleapis.com/auth/calendar']
);

const calendar = google.calendar({ version: 'v3', auth });

export async function handler(event) {
  console.log('📅 gcal-create recibió request:', {
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
    const { title, startISO, endISO, notes, chat_id } = JSON.parse(event.body || '{}');
    
    if (!title || !startISO || !endISO) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'title, startISO y endISO son requeridos' }),
      };
    }

    console.log('📅 Creando evento en Google Calendar:', {
      title,
      startISO,
      endISO,
      notes: notes?.substring(0, 50),
      chat_id
    });

    // 1. Crear evento en Google Calendar
    console.log('🔌 Conectando a Google Calendar...');
    
    const eventResource = {
      summary: title,
      description: notes || '',
      start: {
        dateTime: startISO,
        timeZone: GCAL_TIMEZONE,
      },
      end: {
        dateTime: endISO,
        timeZone: GCAL_TIMEZONE,
      },
      // Configuraciones adicionales
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 día antes
          { method: 'popup', minutes: 30 }, // 30 minutos antes
        ],
      },
      // Metadata personalizada
      extendedProperties: {
        private: {
          source: 'abundiss_console',
          chat_id: chat_id || 'unknown',
          created_at: new Date().toISOString()
        }
      }
    };

    console.log('📋 Recurso del evento preparado:', {
      summary: eventResource.summary,
      start: eventResource.start.dateTime,
      end: eventResource.end.dateTime,
      timezone: GCAL_TIMEZONE
    });

    const gcalResponse = await calendar.events.insert({
      calendarId: GCAL_CALENDAR_ID,
      resource: eventResource,
      sendUpdates: 'all', // Enviar notificaciones a los asistentes
    });

    const createdEvent = gcalResponse.data;
    console.log('✅ Evento creado en Google Calendar:', {
      id: createdEvent.id,
      htmlLink: createdEvent.htmlLink,
      status: createdEvent.status
    });

    // 2. Guardar en Supabase para sincronización
    console.log('🗄️ Guardando evento en Supabase...');
    
    const eventData = {
      title: createdEvent.summary || title,
      description: createdEvent.description || notes || '',
      start_time: startISO,
      end_time: endISO,
      gcal_id: createdEvent.id,
      html_link: createdEvent.htmlLink || '',
      metadata: {
        source: 'google_calendar',
        gcal_status: createdEvent.status,
        chat_id: chat_id || null,
        created_via: 'calendar_form',
        gcal_created: createdEvent.created,
        gcal_updated: createdEvent.updated
      }
    };

    const { data: supabaseEvent, error: supabaseError } = await supabase
      .from('gcal_events')
      .insert(eventData)
      .select()
      .single();

    if (supabaseError) {
      console.error('⚠️ Error guardando en Supabase:', supabaseError);
      // No fallar si Supabase falla, el evento ya está en Google Calendar
    } else {
      console.log('✅ Evento guardado en Supabase:', supabaseEvent.id);
    }

    // 3. Si hay chat_id, guardar en conversaciones
    if (chat_id) {
      try {
        await supabase.from('conversations').insert({
          chat_id,
          intent: 'agenda',
          message: `Solicitud de agenda: ${title}`,
          reply: `Evento "${title}" programado exitosamente para ${new Date(startISO).toLocaleDateString('es-ES')} a las ${new Date(startISO).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}. Puedes verlo en Google Calendar: ${createdEvent.htmlLink}`,
          created_at: new Date().toISOString(),
        });
        console.log('✅ Conversación guardada en Supabase');
      } catch (convError) {
        console.error('⚠️ Error guardando conversación:', convError);
      }
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Evento creado exitosamente en Google Calendar',
        event: {
          id: createdEvent.id,
          title: createdEvent.summary,
          start_time: startISO,
          end_time: endISO,
          html_link: createdEvent.htmlLink,
          gcal_status: createdEvent.status
        },
        links: {
          google_calendar: createdEvent.htmlLink,
          supabase_id: supabaseEvent?.id || null
        },
        metadata: {
          timezone: GCAL_TIMEZONE,
          chat_id: chat_id || null,
          created_at: new Date().toISOString()
        }
      }),
    };

  } catch (error) {
    console.error('❌ Error en gcal-create:', error);
    
    // Intentar crear solo en Supabase como fallback
    try {
      console.log('🔄 Fallback: creando evento solo en Supabase...');
      const { title, startISO, endISO, notes, chat_id } = JSON.parse(event.body || '{}');
      
      const eventData = {
        title,
        description: notes || '',
        start_time: startISO,
        end_time: endISO,
        gcal_id: `local_${Date.now()}`,
        html_link: '',
        metadata: {
          source: 'local_fallback',
          error: error.message,
          chat_id: chat_id || null,
          created_via: 'calendar_form_fallback'
        }
      };

      const { data: supabaseEvent, error: supabaseError } = await supabase
        .from('gcal_events')
        .insert(eventData)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Evento creado en base de datos local (Google Calendar no disponible)',
          event: {
            id: supabaseEvent.id,
            title: supabaseEvent.title,
            start_time: supabaseEvent.start_time,
            end_time: supabaseEvent.end_time,
            html_link: '',
            gcal_status: 'local_only'
          },
          note: 'Google Calendar no disponible, evento guardado localmente',
          metadata: {
            error: error.message,
            fallback: true,
            created_at: new Date().toISOString()
          }
        }),
      };
    } catch (fallbackError) {
      console.error('❌ Error en fallback:', fallbackError);
      
      return {
        statusCode: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Error creando evento en el calendario',
          details: error.message,
          fallback_error: fallbackError.message
        }),
      };
    }
  }
}
