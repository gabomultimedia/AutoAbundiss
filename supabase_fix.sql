-- Archivo SQL simple para insertar datos de ejemplo en Abundiss Console
-- Ejecutar en Supabase SQL Editor

-- 1. Insertar promociones de ejemplo (sin priority)
INSERT INTO public.promotions (title, description, discount_percent, starts_at, ends_at, is_active) VALUES
('Descuento de Bienvenida', '20% de descuento en tu primera compra', 20, NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days', true),
('Oferta Especial', '15% de descuento en productos seleccionados', 15, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', true),
('Promoción de Verano', '25% de descuento en productos de temporada', 25, NOW() - INTERVAL '7 days', NOW() + INTERVAL '60 days', true);

-- 2. Insertar entradas de KB de ejemplo (con priority)
INSERT INTO public.kb_entries (title, content, tags, is_active, priority) VALUES
('Cómo usar la consola', 'Guía básica para navegar por la consola de Abundiss', ARRAY['consola', 'guía', 'navegación'], true, 1),
('Configuración de promociones', 'Pasos para crear y gestionar promociones', ARRAY['promociones', 'configuración', 'gestión'], true, 2),
('Manejo de conversaciones', 'Cómo gestionar conversaciones entrantes', ARRAY['conversaciones', 'chat', 'soporte'], true, 3);

-- 3. Insertar conversaciones de ejemplo
INSERT INTO public.conversations (chat_id, intent, message, reply, metadata) VALUES
('chat_001', 'conversacion', 'Hola, necesito ayuda', '¡Hola! ¿En qué puedo ayudarte hoy?', '{"platform": "whatsapp", "user_name": "Juan Pérez"}'),
('chat_002', 'cotiza', 'Quiero cotizar un servicio', 'Perfecto, te ayudo con la cotización. ¿Qué servicio necesitas?', '{"platform": "telegram", "user_name": "María García"}'),
('chat_003', 'agenda', 'Necesito agendar una cita', 'Claro, ¿qué día te viene mejor? Tenemos disponibilidad esta semana', '{"platform": "whatsapp", "user_name": "Carlos López"}');

-- 4. Insertar archivos de ejemplo
INSERT INTO public.files_log (filename, file_path, file_size, mime_type, uploaded_by, metadata) VALUES
('logo.png', '/uploads/logo.png', 102400, 'image/png', 'admin', '{"category": "branding", "description": "Logo principal"}'),
('manual.pdf', '/uploads/manual.pdf', 2048000, 'application/pdf', 'admin', '{"category": "documentation", "description": "Manual de usuario"}'),
('imagen.jpg', '/uploads/imagen.jpg', 512000, 'image/jpeg', 'admin', '{"category": "marketing", "description": "Imagen promocional"}');

-- 5. Insertar eventos de calendario de ejemplo
INSERT INTO public.gcal_events (gcal_id, title, description, start_time, end_time, html_link, metadata) VALUES
('event_001', 'Reunión de Equipo', 'Reunión semanal para revisar proyectos', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', 'https://calendar.google.com/event/001', '{"attendees": ["team@abundiss.com"], "location": "Oficina"}'),
('event_002', 'Presentación Cliente', 'Presentación de propuesta comercial', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '2 hours', 'https://calendar.google.com/event/002', '{"attendees": ["cliente@empresa.com"], "location": "Virtual"}'),
('event_003', 'Capacitación', 'Sesión de capacitación para el equipo', NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week' + INTERVAL '3 hours', 'https://calendar.google.com/event/003', '{"attendees": ["team@abundiss.com"], "location": "Sala de conferencias"}');

-- 6. Insertar mensajes en buffer de ejemplo
INSERT INTO public.msg_buffer (chat_id, usuario_id, mensaje, attachment_type, attachment_link, metadata) VALUES
('chat_001', 'user_001', 'Hola, ¿cómo están?', NULL, NULL, '{"platform": "whatsapp", "timestamp": "2024-01-15T10:00:00Z"}'),
('chat_002', 'user_002', 'Necesito información sobre servicios', NULL, NULL, '{"platform": "telegram", "timestamp": "2024-01-15T11:00:00Z"}'),
('chat_003', 'user_003', '¿Tienen promociones activas?', NULL, NULL, '{"platform": "whatsapp", "timestamp": "2024-01-15T12:00:00Z"}');

-- 7. Insertar configuración de la aplicación
INSERT INTO public.app_settings (key, value) VALUES
('app_name', '"Abundiss Console"'),
('logo_url', '"https://abundiss.com/wp-content/uploads/2021/11/LogoB.png"'),
('brand_colors', '{"primary": "#0ea5e9", "accent": "#8b5cf6", "background": "#0b0d12", "foreground": "#e6e7eb", "muted": "#334155", "border": "#475569"}'),
('company_info', '{"name": "Abundiss", "email": "info@abundiss.com", "phone": "+52 55 1234 5678", "address": "Ciudad de México, México"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Mensaje de confirmación
SELECT 'Datos de ejemplo insertados exitosamente' as status;
