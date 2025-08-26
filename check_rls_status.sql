-- Check RLS Status for Abundiss Console
-- Run this first to see what policies exist

-- 1. Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'app_settings',
    'conversations', 
    'files_log',
    'gcal_events',
    'kb_entries',
    'msg_buffer',
    'oauth_tokens',
    'promotions'
);

-- 2. Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'app_settings',
    'conversations',
    'files_log', 
    'gcal_events',
    'kb_entries',
    'msg_buffer',
    'oauth_tokens',
    'promotions'
);

-- 3. Check table permissions
SELECT 
    table_schema,
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND table_name IN (
    'app_settings',
    'conversations',
    'files_log',
    'gcal_events', 
    'kb_entries',
    'msg_buffer',
    'oauth_tokens',
    'promotions'
)
ORDER BY table_name, privilege_type;
