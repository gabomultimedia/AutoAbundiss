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
  console.log('📅 gcal-list recibió request:', {
    method: event.httpMethod,
    query: event.queryStringParameters
  });

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método no permitido' }),
    };
  }

  try {
    // 1. Obtener eventos de Google Calendar
    console.log('🔌 Conectando a Google Calendar...');
    
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString(); // +14 días

    console.log('📅 Buscando eventos entre:', { timeMin, timeMax });

    const gcalResponse = await calendar.events.list({
      calendarId: GCAL_CALENDAR_ID,
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
      timeZone: GCAL_TIMEZONE
    });

    const gcalEvents = gcalResponse.data.items || [];
    console.log(`✅ Encontrados ${gcalEvents.length} eventos en Google Calendar`);

    // 2. Obtener eventos locales de Supabase
    console.log('🗄️ Obteniendo eventos locales de Supabase...');
    const { data: localEvents, error: localError } = await supabase
      .from('gcal_events')
      .select('*')
      .gte('start_time', timeMin)
      .lte('start_time', timeMax)
      .order('start_time', { ascending: true });

    if (localError) {
      console.error('⚠️ Error obteniendo eventos locales:', localError);
    }

    console.log(`✅ Encontrados ${localEvents?.length || 0} eventos locales`);

    // 3. Combinar y sincronizar eventos
    const allEvents = [];
    
    // Agregar eventos de Google Calendar
    gcalEvents.forEach(gcalEvent => {
      const event = {
        id: gcalEvent.id,
        title: gcalEvent.summary || 'Sin título',
        description: gcalEvent.description || '',
        start_time: gcalEvent.start.dateTime || gcalEvent.start.date,
        end_time: gcalEvent.end.dateTime || gcalEvent.end.date,
        gcal_id: gcalEvent.id,
        html_link: gcalEvent.htmlLink || '',
        metadata: {
          source: 'google_calendar',
          gcal_status: gcalEvent.status,
          attendees: gcalEvent.attendees || [],
          location: gcalEvent.location || ''
        }
      };
      allEvents.push(event);
    });

    // Agregar eventos locales que no estén en Google Calendar
    if (localEvents) {
      localEvents.forEach(localEvent => {
        const existsInGcal = allEvents.find(e => e.gcal_id === localEvent.gcal_id);
        if (!existsInGcal) {
          allEvents.push({
            ...localEvent,
            source: 'local'
          });
        }
      });
    }

    // Ordenar por fecha de inicio
    allEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    console.log(`✅ Total de eventos combinados: ${allEvents.length}`);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        events: allEvents,
        count: allEvents.length,
        timeRange: {
          from: timeMin,
          to: timeMax,
          timezone: GCAL_TIMEZONE
        },
        sources: {
          google_calendar: gcalEvents.length,
          local: localEvents?.length || 0,
          total: allEvents.length
        }
      }),
    };

  } catch (error) {
    console.error('❌ Error en gcal-list:', error);
    
    // Fallback: solo eventos locales si falla Google Calendar
    try {
      console.log('🔄 Fallback: obteniendo solo eventos locales...');
      const now = new Date();
      const timeMin = now.toISOString();
      const timeMax = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString();

      const { data: localEvents, error: localError } = await supabase
        .from('gcal_events')
        .select('*')
        .gte('start_time', timeMin)
        .lte('start_time', timeMax)
        .order('start_time', { ascending: true });

      if (localError) throw localError;

      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          events: localEvents || [],
          count: localEvents?.length || 0,
          timeRange: { from: timeMin, to: timeMax, timezone: GCAL_TIMEZONE },
          sources: { google_calendar: 0, local: localEvents?.length || 0, total: localEvents?.length || 0 },
          note: 'Usando solo eventos locales (Google Calendar no disponible)'
        }),
      };
    } catch (fallbackError) {
      console.error('❌ Error en fallback:', fallbackError);
      
      return {
        statusCode: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Error obteniendo eventos del calendario',
          details: error.message,
          events: [],
          count: 0
        }),
      };
    }
  }
}
