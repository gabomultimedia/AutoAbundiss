-- Fix RLS Policies for Abundiss Console
-- This file fixes overly restrictive RLS policies that prevent CRUD operations

-- 1. Enable RLS on all tables (if not already enabled)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.msg_buffer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.app_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.app_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.app_settings;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.app_settings;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.conversations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.conversations;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.conversations;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.conversations;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.files_log;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.files_log;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.files_log;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.files_log;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.gcal_events;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.gcal_events;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.gcal_events;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.gcal_events;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.kb_entries;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.kb_entries;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.kb_entries;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.kb_entries;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.msg_buffer;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.msg_buffer;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.msg_buffer;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.msg_buffer;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.oauth_tokens;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.oauth_tokens;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.oauth_tokens;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.oauth_tokens;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.promotions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.promotions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.promotions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.promotions;

-- 3. Create permissive policies for admin operations (service role)
-- These policies allow the service role to perform all operations

-- App Settings
CREATE POLICY "Enable all operations for service role" ON public.app_settings
    FOR ALL USING (true) WITH CHECK (true);

-- Conversations
CREATE POLICY "Enable all operations for service role" ON public.conversations
    FOR ALL USING (true) WITH CHECK (true);

-- Files Log
CREATE POLICY "Enable all operations for service role" ON public.files_log
    FOR ALL USING (true) WITH CHECK (true);

-- Google Calendar Events
CREATE POLICY "Enable all operations for service role" ON public.gcal_events
    FOR ALL USING (true) WITH CHECK (true);

-- Knowledge Base Entries
CREATE POLICY "Enable all operations for service role" ON public.kb_entries
    FOR ALL USING (true) WITH CHECK (true);

-- Message Buffer
CREATE POLICY "Enable all operations for service role" ON public.msg_buffer
    FOR ALL USING (true) WITH CHECK (true);

-- OAuth Tokens
CREATE POLICY "Enable all operations for service role" ON public.oauth_tokens
    FOR ALL USING (true) WITH CHECK (true);

-- Promotions
CREATE POLICY "Enable all operations for service role" ON public.promotions
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Alternative: Create more restrictive policies if needed
-- Uncomment these if you want more security (but they might cause issues)

/*
-- App Settings - Read/Write for authenticated users
CREATE POLICY "Enable read for authenticated users" ON public.app_settings
    FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.app_settings
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.app_settings
    FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users" ON public.app_settings
    FOR DELETE USING (true);

-- Promotions - Read/Write for authenticated users
CREATE POLICY "Enable read for authenticated users" ON public.promotions
    FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.promotions
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.promotions
    FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users" ON public.promotions
    FOR DELETE USING (true);

-- KB Entries - Read/Write for authenticated users
CREATE POLICY "Enable read for authenticated users" ON public.kb_entries
    FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.kb_entries
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.kb_entries
    FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users" ON public.kb_entries
    FOR DELETE USING (true);

-- GCal Events - Read/Write for authenticated users
CREATE POLICY "Enable read for authenticated users" ON public.gcal_events
    FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.gcal_events
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.gcal_events
    FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users" ON public.gcal_events
    FOR DELETE USING (true);
*/

-- 5. Grant necessary permissions to the service role
GRANT ALL ON public.app_settings TO service_role;
GRANT ALL ON public.conversations TO service_role;
GRANT ALL ON public.files_log TO service_role;
GRANT ALL ON public.gcal_events TO service_role;
GRANT ALL ON public.kb_entries TO service_role;
GRANT ALL ON public.msg_buffer TO service_role;
GRANT ALL ON public.oauth_tokens TO service_role;
GRANT ALL ON public.promotions TO service_role;

-- 6. Grant permissions to anon role for read operations (if needed)
GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT ON public.conversations TO anon;
GRANT SELECT ON public.files_log TO anon;
GRANT SELECT ON public.gcal_events TO anon;
GRANT SELECT ON public.kb_entries TO anon;
GRANT SELECT ON public.msg_buffer TO anon;
GRANT SELECT ON public.oauth_tokens TO anon;
GRANT SELECT ON public.promotions TO anon;
