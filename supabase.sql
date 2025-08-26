-- Abundiss Console Database Schema
-- Ejecutar en Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id TEXT NOT NULL,
    intent TEXT NOT NULL CHECK (intent IN ('conversacion', 'cotiza', 'agenda', 'molesto')),
    message TEXT NOT NULL,
    reply TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS msg_buffer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id TEXT NOT NULL,
    usuario_id TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    attachment_type TEXT,
    attachment_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
    discount_amount DECIMAL(10,2),
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kb_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gcal_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gcal_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    html_link TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_chat_id ON conversations(chat_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_intent ON conversations(intent);

CREATE INDEX IF NOT EXISTS idx_msg_buffer_chat_id ON msg_buffer(chat_id);
CREATE INDEX IF NOT EXISTS idx_msg_buffer_usuario_id ON msg_buffer(usuario_id);
CREATE INDEX IF NOT EXISTS idx_msg_buffer_created_at ON msg_buffer(created_at);

CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(starts_at, ends_at);

CREATE INDEX IF NOT EXISTS idx_kb_entries_active ON kb_entries(is_active);
CREATE INDEX IF NOT EXISTS idx_kb_entries_tags ON kb_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_kb_entries_priority ON kb_entries(priority);

CREATE INDEX IF NOT EXISTS idx_gcal_events_dates ON gcal_events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_gcal_events_gcal_id ON gcal_events(gcal_id);

CREATE INDEX IF NOT EXISTS idx_files_log_uploaded_by ON files_log(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_log_created_at ON files_log(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kb_entries_updated_at BEFORE UPDATE ON kb_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gcal_events_updated_at BEFORE UPDATE ON gcal_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE msg_buffer ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gcal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE files_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only allow SELECT from client, all operations from service role
CREATE POLICY "Allow public read access" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON conversations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON msg_buffer FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON promotions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON kb_entries FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON gcal_events FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON files_log FOR SELECT USING (true);

-- Insert default app settings
INSERT INTO app_settings (key, value) VALUES 
    ('app_name', '"Abundiss Console"'),
    ('logo_url', 'null'),
    ('brand_colors', '{"primary": "#0ea5e9", "accent": "#8b5cf6", "background": "#0b0d12", "foreground": "#e6e7eb"}'),
    ('pricing_list', '{"Landing": 15500, "Website": 28900, "Ecommerce": 39900, "Kommo": 12500, "Agente IA": 8700, "Soporte": 6900, "Hora extra": 800}')
ON CONFLICT (key) DO NOTHING;

-- Create storage bucket for files
-- Note: This needs to be done via Supabase Dashboard or CLI
-- INSERT INTO storage.buckets (id, name, public) VALUES ('abundiss-files', 'abundiss-files', false);
