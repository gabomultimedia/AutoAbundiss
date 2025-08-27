import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

// Configuración hardcodeada para evitar problemas de variables de entorno
const supabaseUrl = 'https://fcvwqwjsypossdqochde.supabase.co';
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdndxd2pzeXBvc3NkcW9jaGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MTgxNjA4N30.6P-J5cQbnSBGYP27jJ33JVCO23z_JcoTFgqmGZDgPXE';

// Configuración de Google Calendar
const GCP_CLIENT_EMAIL = 'abundiss-calendar@abundiss-consola.iam.gserviceaccount.com';
const GCP_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCutkXdP46Z138H\nC7BJq0kD1mLqYqtx7i88G9sdEDewfGy1E5WVKdhiayV5tjRMiIZiIDOUTTUs78mC\nRbfh/FA6pOwfvqX3D7CT4yAJeeKNNqDQdBWDJGsf5WBDos7v+vhJCyLLvqxxVCMD\nij4C7lpGWOC8pfNyA+u9TF+UPh2JDPnh4c4NMeYQ15yaOrCdq5FK9faZMxdIoDHo\nDeevks10eFVrD67/AWduhcZ+lxolYIP7wbrxCMQDmNN4//vYeWDbHAdk77dYulCO\nTDRvP+gJ2//9Xq4cpWv5y0Mme/3Atix+Y7vAwszPiSUGxGyoFZ5CnZ5YvCKSkFQi\nj4anpFITAgMBAAECggEAPycY2vBR8g8g1iGmAAMfufjhOXsgIOcpgM9K5VcK4ksf\nmlaxb8E3+99iJPw1LGL/PHIKYvWDnrIwg1wDK3diYshhp9nosQUlXVewqWw69bOE\n7sS/T++2n0lxAhHUPo/X9sNFOSO7vp1cqLdsUe/phtsypU5RUOnU6VC1jebkEzkZ\ngvwFxsRe3oUCEfAQ7S/MFkp7XCRohFHkMhTFEZKs6LgFDOO7Okzm+thpwajPV/8P\nP/ZdTfYsd32+njKtLNfaR1H70diIygw+85WZ7jB8pLGMlhCeikc3/YNMOGMRPaNF\nZloNZ4/Vh6Xxhb0sr+W9e9r0fvMbBttkpGqJqwWTkQKBgQDnzIrYlPzSNNZgezhN\nJrEANY/KIftkcyEIhXOQD9C8aF7D4nn0mNzN36NLoQ9LBzAMyhGO96OkNP+xqQVe\n5UM83zbAmTrOKMBkkmNMllxFN+SBmsfE5XPNeiSEryuKkUiRmrqp3/ZASWe52wvQ\nOPz66fGNtcHbXTm1LAMOY2J1gwKBgQDA8+z6GNVMXh25o5DD665O0TyNCVLZHmza\n9n7Lgk1pL58crFywtez/W51RQRWd81e6b+ked83S1Knp0by7LlKWWNbakhq2OoSB\nCiFq/zL1FSB+71z8tirH+Kzj737QUZOUHiKBPNRtBJJuUEF1rP8b6yjznetLlHla\nXDgwbhCcMQKBgFrYgk4xzghAZwh3InCySkqPs2P//3u112t0if8bA67jpMhWuX9Q\nbbFOBby9SbYZAg7xHwKOMZdIojGp0Y4IglqYDOhc5Xwo4oZIDRzWDSGfrzHQTJzx\nZHpSdX9++6yaFfvizWeIfAVj/4AKxk18GEHqcB4e7vQfTF+h+SypbMwrAoGAGSby\n6jsYeub92vgeY9uyEiYmTYA8o37a08Q0DRVEQATsKdGyF3rvlO39WN0yEy/obK4v\n5j/ZvbTpHUiw4HmOXHjiMQXAo6aHJUcLyiXQH7CMVt+e8HZSp1ScPO44SrGHmlQ/\nTTd/vWJOMEEX914At0P1R6R7SpPlKclBrdZ7JdECgYEAqY7vFNlY+Cd38tIvNNbU\nsBUfjqahgADycngU66x6ThjdBl17xsUIgM29B0bHawh/l7xzPBw1nqFqJ4Kupppk\njDNP/fXyms/OBNPGORf00Sl4sCB0BsqPzLEBrjuSmg6G340ILBcth+1Ythrfjva5\nrkF2h71npv5WhLq5ZnaWfWc=\n-----END PRIVATE KEY-----\n';
const GCAL_CALENDAR_ID = 'd85cd569de00380a08a8e7f8b118a09122761706cfb3fa27c1647f46badfa710@group.calendar.google.com';

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
  console.log('🗑️ gcal-delete recibió request:', {
    method: event.httpMethod,
    body: event.body
  });

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método no permitido' }),
    };
  }

  try {
    const { eventId, gcal_id } = JSON.parse(event.body || '{}');
    
    if (!eventId && !gcal_id) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'eventId o gcal_id es requerido' }),
      };
    }

    console.log('🗑️ Eliminando evento:', { eventId, gcal_id });

    // 1. Obtener información del evento desde Supabase
    let eventToDelete;
    if (eventId) {
      const { data: eventData, error: eventError } = await supabase
        .from('gcal_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('❌ Error obteniendo evento:', eventError);
        throw new Error('Evento no encontrado');
      }
      eventToDelete = eventData;
    } else {
      const { data: eventData, error: eventError } = await supabase
        .from('gcal_events')
        .select('*')
        .eq('gcal_id', gcal_id)
        .single();

      if (eventError) {
        console.error('❌ Error obteniendo evento por gcal_id:', eventError);
        throw new Error('Evento no encontrado');
      }
      eventToDelete = eventData;
    }

    console.log('📅 Evento a eliminar:', {
      id: eventToDelete.id,
      title: eventToDelete.title,
      gcal_id: eventToDelete.gcal_id
    });

    // 2. Eliminar de Google Calendar si existe
    if (eventToDelete.gcal_id && eventToDelete.gcal_id !== `local_${Date.now()}`) {
      try {
        console.log('🔌 Eliminando de Google Calendar...');
        
        await calendar.events.delete({
          calendarId: GCAL_CALENDAR_ID,
          eventId: eventToDelete.gcal_id,
          sendUpdates: 'all'
        });

        console.log('✅ Evento eliminado de Google Calendar');
      } catch (gcalError) {
        console.error('⚠️ Error eliminando de Google Calendar:', gcalError);
        // No fallar si Google Calendar falla, continuar con Supabase
      }
    } else {
      console.log('ℹ️ Evento solo local, saltando Google Calendar');
    }

    // 3. Eliminar de Supabase
    console.log('🗄️ Eliminando de Supabase...');
    
    const { error: deleteError } = await supabase
      .from('gcal_events')
      .delete()
      .eq('id', eventToDelete.id);

    if (deleteError) {
      console.error('❌ Error eliminando de Supabase:', deleteError);
      throw new Error('Error eliminando evento de la base de datos');
    }

    console.log('✅ Evento eliminado de Supabase');

    // 4. Registrar la eliminación en conversaciones si hay chat_id
    if (eventToDelete.metadata?.chat_id) {
      try {
        await supabase.from('conversations').insert({
          chat_id: eventToDelete.metadata.chat_id,
          intent: 'agenda',
          message: `Evento eliminado: ${eventToDelete.title}`,
          reply: `El evento "${eventToDelete.title}" ha sido eliminado exitosamente del calendario.`,
          created_at: new Date().toISOString(),
        });
        console.log('✅ Conversación de eliminación guardada');
      } catch (convError) {
        console.error('⚠️ Error guardando conversación de eliminación:', convError);
      }
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Evento eliminado exitosamente',
        deleted_event: {
          id: eventToDelete.id,
          title: eventToDelete.title,
          gcal_id: eventToDelete.gcal_id,
          was_in_gcal: eventToDelete.gcal_id && eventToDelete.gcal_id !== `local_${Date.now()}`
        },
        timestamp: new Date().toISOString()
      }),
    };

  } catch (error) {
    console.error('❌ Error en gcal-delete:', error);
    
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Error eliminando evento del calendario',
        timestamp: new Date().toISOString()
      }),
    };
  }
}
