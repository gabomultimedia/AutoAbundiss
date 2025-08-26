import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Tipos para las tablas de Supabase
export type Database = {
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          chat_id: string;
          intent: 'conversacion' | 'cotiza' | 'agenda' | 'molesto';
          message: string;
          reply: string;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          intent: 'conversacion' | 'cotiza' | 'agenda' | 'molesto';
          message: string;
          reply: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          intent?: 'conversacion' | 'cotiza' | 'agenda' | 'molesto';
          message?: string;
          reply?: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      msg_buffer: {
        Row: {
          id: string;
          chat_id: string;
          usuario_id: string;
          mensaje: string;
          attachment_type: string | null;
          attachment_link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          usuario_id: string;
          mensaje: string;
          attachment_type?: string | null;
          attachment_link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          usuario_id?: string;
          mensaje?: string;
          attachment_type?: string | null;
          attachment_link?: string | null;
          created_at?: string;
        };
      };
      promotions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          discount_percent: number | null;
          discount_amount: number | null;
          starts_at: string;
          ends_at: string;
          is_active: boolean;
          conditions: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          discount_percent?: number | null;
          discount_amount?: number | null;
          starts_at: string;
          ends_at: string;
          is_active?: boolean;
          conditions?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          discount_percent?: number | null;
          discount_amount?: number | null;
          starts_at?: string;
          ends_at?: string;
          is_active?: boolean;
          conditions?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      kb_entries: {
        Row: {
          id: string;
          title: string;
          content: string;
          tags: string[];
          is_active: boolean;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          tags?: string[];
          is_active?: boolean;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          tags?: string[];
          is_active?: boolean;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      gcal_events: {
        Row: {
          id: string;
          gcal_id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          html_link: string | null;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gcal_id: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          html_link?: string | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gcal_id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          html_link?: string | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      files_log: {
        Row: {
          id: string;
          filename: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          file_path?: string;
          file_size?: number;
          mime_type?: string;
          uploaded_by?: string;
          metadata?: any;
          created_at?: string;
        };
      };
    };
  };
};
