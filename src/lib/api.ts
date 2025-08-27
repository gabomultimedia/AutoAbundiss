import { supabase } from './supabaseClient';
import type { 
  Conversation, 
  Promotion, 
  KbEntry, 
  GcalEvent, 
  LoginForm 
} from './schema';

const API_BASE = '/.netlify/functions';

// Helper para manejar respuestas de la API
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginForm): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/auth-gate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE}/logout`, { method: 'GET' });
  },

  checkSession: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth-gate`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  },
};

// Conversations API
export const conversationsAPI = {
  getAll: async (filters?: { 
    limit?: number; 
    startDate?: string; 
    endDate?: string;
    intent?: string;
  }): Promise<{ data: Conversation[]; total: number }> => {
    let query = supabase
      .from('conversations')
      .select('*', { count: 'exact' });

    // Aplicar filtros de fecha si se proporcionan
    if (filters?.startDate && filters?.endDate) {
      query = query
        .gte('created_at', filters.startDate)
        .lt('created_at', filters.endDate);
    }

    // Aplicar filtro de intent si se proporciona
    if (filters?.intent) {
      query = query.eq('intent', filters.intent);
    }

    // Aplicar límite si se proporciona
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    // Ordenar por fecha de creación (más recientes primero)
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return { 
      data: data || [], 
      total: count || 0 
    };
  },

  getById: async (id: string): Promise<Conversation> => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  getStats: async (): Promise<{
    total: number;
    byIntent: Record<string, number>;
    last7Days: number;
  }> => {
    try {
      console.log('📊 Obteniendo estadísticas de conversaciones...');
      
      const { data, error } = await supabase
        .from('conversations')
        .select('intent, created_at');

      if (error) {
        console.error('❌ Error obteniendo conversaciones:', error);
        throw new Error(error.message);
      }

      const total = data?.length || 0;
      console.log(`✅ Total de conversaciones: ${total}`);

      // Agrupar por intent
      const byIntent = data?.reduce((acc, conv) => {
        const intent = conv.intent || 'sin_intent';
        acc[intent] = (acc[intent] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      console.log('📈 Distribución por intents:', byIntent);

      // Calcular conversaciones de los últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const last7Days = data?.filter(conv => {
        if (!conv.created_at) return false;
        const convDate = new Date(conv.created_at);
        return convDate >= sevenDaysAgo;
      }).length || 0;

      console.log(`📅 Conversaciones últimos 7 días: ${last7Days}`);

      return { total, byIntent, last7Days };
    } catch (error) {
      console.error('❌ Error en getStats:', error);
      // Retornar valores por defecto en caso de error
      return { 
        total: 0, 
        byIntent: {}, 
        last7Days: 0 
      };
    }
  },
};

// Promotions API
export const promotionsAPI = {
  getAll: async (): Promise<Promotion[]> => {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  getActive: async (): Promise<Promotion[]> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  create: async (promotion: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>): Promise<Promotion> => {
    // Crear promoción en Supabase
    const response = await fetch(`${API_BASE}/admin-supa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_promotion', data: promotion }),
    });
    const createdPromotion = await handleResponse<Promotion>(response);
    
    // Enviar a Kommo si está activa
    if (createdPromotion.is_active) {
      try {
        await sendPromotionToKommo(createdPromotion);
      } catch (error) {
        console.warn('Error enviando promoción a Kommo:', error);
      }
    }
    
    return createdPromotion;
  },

  update: async (id: string, promotion: Partial<Promotion>): Promise<Promotion> => {
    // Actualizar promoción en Supabase
    const response = await fetch(`${API_BASE}/admin-supa`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_promotion', id, data: promotion }),
    });
    const updatedPromotion = await handleResponse<Promotion>(response);
    
    // Enviar a Kommo si está activa
    if (updatedPromotion.is_active) {
      try {
        await sendPromotionToKommo(updatedPromotion);
      } catch (error) {
        console.warn('Error enviando promoción actualizada a Kommo:', error);
      }
    }
    
    return updatedPromotion;
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/admin-supa`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_promotion', id }),
    });
    await handleResponse(response);
  },
};

// Knowledge Base API
export const kbAPI = {
  getAll: async (): Promise<KbEntry[]> => {
    const { data, error } = await supabase
      .from('kb_entries')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  getActive: async (): Promise<KbEntry[]> => {
    const { data, error } = await supabase
      .from('kb_entries')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  create: async (entry: Omit<KbEntry, 'id' | 'created_at' | 'updated_at'>): Promise<KbEntry> => {
    const response = await fetch(`${API_BASE}/admin-supa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_kb_entry', data: entry }),
    });
    return handleResponse<KbEntry>(response);
  },

  update: async (id: string, entry: Partial<KbEntry>): Promise<KbEntry> => {
    const response = await fetch(`${API_BASE}/admin-supa`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_kb_entry', id, data: entry }),
    });
    return handleResponse<KbEntry>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/admin-supa`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_kb_entry', id }),
    });
    await handleResponse(response);
  },
};

// Calendar API
export const calendarAPI = {
  getEvents: async (): Promise<GcalEvent[]> => {
    const response = await fetch(`${API_BASE}/gcal-list`);
    return handleResponse<GcalEvent[]>(response);
  },

  createEvent: async (event: {
    title: string;
    startISO: string;
    endISO: string;
    notes?: string;
    chat_id?: string;
  }): Promise<{ id: string; htmlLink: string }> => {
    const response = await fetch(`${API_BASE}/gcal-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    
    const result = await handleResponse<{ event: { id: string; html_link: string } }>(response);
    
    return {
      id: result.event.id || '',
      htmlLink: result.event.html_link || ''
    };
  },

  updateEvent: async (eventId: string, updates: {
    title?: string;
    start_time?: string;
    end_time?: string;
    description?: string;
  }): Promise<GcalEvent> => {
    const response = await fetch(`${API_BASE}/gcal-update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, updates }),
    });
    
    return handleResponse<GcalEvent>(response);
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/gcal-delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    });
    
    await handleResponse(response);
  },

  // Función para sincronizar eventos con Google Calendar
  syncWithGoogle: async (): Promise<{ synced: number; errors: number }> => {
    try {
      const response = await fetch(`${API_BASE}/gcal-list`);
      const data = await handleResponse<{ events: GcalEvent[]; sources: { google_calendar: number; local: number } }>(response);
      
      return {
        synced: data.sources.google_calendar,
        errors: data.sources.local
      };
    } catch (error) {
      console.error('Error sincronizando con Google Calendar:', error);
      return { synced: 0, errors: 1 };
    }
  }
};



// Settings API
export const settingsAPI = {
  get: async (key: string): Promise<any> => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) throw new Error(error.message);
    return data?.value;
  },

  update: async (key: string, value: any): Promise<void> => {
    const response = await fetch(`${API_BASE}/admin-supa`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_setting', key, value }),
    });
    await handleResponse<any>(response);
  },
};

// Función para enviar promociones a Kommo
async function sendPromotionToKommo(promotion: Promotion) {
  try {
    const response = await fetch(`${API_BASE}/kommo-send-promotion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: promotion.title,
        description: promotion.description,
        discount_type: promotion.discount_percent !== undefined ? 'percentage' : 'amount',
        discount_value: promotion.discount_percent !== undefined ? promotion.discount_percent : promotion.discount_amount,
        starts_at: promotion.starts_at,
        ends_at: promotion.ends_at,
        is_active: promotion.is_active
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error enviando a Kommo: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error enviando promoción a Kommo:', error);
    throw error;
  }
}
