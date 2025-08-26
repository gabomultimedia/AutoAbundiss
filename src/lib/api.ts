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
  getAll: async (params?: {
    page?: number;
    limit?: number;
    intent?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<{ data: Conversation[]; total: number }> => {
    let query = supabase
      .from('conversations')
      .select('*', { count: 'exact' });

    if (params?.intent) {
      query = query.eq('intent', params.intent);
    }
    if (params?.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params?.endDate) {
      query = query.lte('created_at', params.endDate);
    }
    if (params?.search) {
      query = query.or(`message.ilike.%${params.search}%,reply.ilike.%${params.search}%`);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return { data: data || [], total: count || 0 };
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
    const { data, error } = await supabase
      .from('conversations')
      .select('intent, created_at');

    if (error) throw new Error(error.message);

    const total = data?.length || 0;
    const byIntent = data?.reduce((acc, conv) => {
      acc[conv.intent] = (acc[conv.intent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = data?.filter(conv => 
      new Date(conv.created_at) >= sevenDaysAgo
    ).length || 0;

    return { total, byIntent, last7Days };
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
    const createdPromotion = await handleResponse(response);
    
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
    const updatedPromotion = await handleResponse(response);
    
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
    return handleResponse(response);
  },

  update: async (id: string, entry: Partial<KbEntry>): Promise<KbEntry> => {
    const response = await fetch(`${API_BASE}/admin-supa`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_kb_entry', id, data: entry }),
    });
    return handleResponse(response);
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
    return handleResponse(response);
  },

  createEvent: async (event: {
    title: string;
    startISO: string;
    endISO: string;
    notes?: string;
  }): Promise<{ id: string; htmlLink: string }> => {
    const response = await fetch(`${API_BASE}/gcal-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return handleResponse(response);
  },
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
    await handleResponse(response);
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
