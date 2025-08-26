import { z } from 'zod';

// Schemas para validación de datos
export const conversationSchema = z.object({
  id: z.string().uuid().optional(),
  chat_id: z.string().min(1, 'Chat ID es requerido'),
  intent: z.enum(['conversacion', 'cotiza', 'agenda', 'molesto'], {
    errorMap: () => ({ message: 'Intención debe ser: conversacion, cotiza, agenda, o molesto' })
  }),
  message: z.string().min(1, 'Mensaje es requerido'),
  reply: z.string().min(1, 'Respuesta es requerida'),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const msgBufferSchema = z.object({
  id: z.string().uuid().optional(),
  chat_id: z.string().min(1, 'Chat ID es requerido'),
  usuario_id: z.string().min(1, 'Usuario ID es requerido'),
  mensaje: z.string().min(1, 'Mensaje es requerido'),
  attachment_type: z.string().nullable().optional(),
  attachment_link: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

export const promotionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Título es requerido'),
  description: z.string().optional(),
  discount_percent: z.number().min(0).max(100).optional(),
  discount_amount: z.number().min(0).optional(),
  starts_at: z.string().datetime('Fecha de inicio debe ser válida'),
  ends_at: z.string().datetime('Fecha de fin debe ser válida'),
  is_active: z.boolean().default(true),
  conditions: z.record(z.any()).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}).refine((data) => {
  if (data.starts_at && data.ends_at) {
    return new Date(data.starts_at) < new Date(data.ends_at);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['ends_at'],
});

export const kbEntrySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Título es requerido'),
  content: z.string().min(1, 'Contenido es requerido'),
  tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  priority: z.number().min(0).max(10).default(0),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const gcalEventSchema = z.object({
  id: z.string().uuid().optional(),
  gcal_id: z.string().min(1, 'Google Calendar ID es requerido'),
  title: z.string().min(1, 'Título es requerido'),
  description: z.string().optional(),
  start_time: z.string().datetime('Fecha de inicio debe ser válida'),
  end_time: z.string().datetime('Fecha de fin debe ser válida'),
  html_link: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return new Date(data.start_time) < new Date(data.end_time);
  }
  return true;
}, {
  message: 'La hora de inicio debe ser anterior a la hora de fin',
  path: ['end_time'],
});

export const fileLogSchema = z.object({
  id: z.string().uuid().optional(),
  filename: z.string().min(1, 'Nombre de archivo es requerido'),
  file_path: z.string().min(1, 'Ruta de archivo es requerida'),
  file_size: z.number().min(0, 'Tamaño de archivo debe ser positivo'),
  mime_type: z.string().min(1, 'Tipo MIME es requerido'),
  uploaded_by: z.string().min(1, 'Usuario que subió es requerido'),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().datetime().optional(),
});

export const appSettingsSchema = z.object({
  id: z.string().uuid().optional(),
  key: z.string().min(1, 'Clave es requerida'),
  value: z.any(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schemas para formularios
export const loginSchema = z.object({
  username: z.string().min(1, 'Usuario es requerido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});

export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Archivo es requerido' }),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// Tipos derivados de los schemas
export type Conversation = z.infer<typeof conversationSchema>;
export type MsgBuffer = z.infer<typeof msgBufferSchema>;
export type Promotion = z.infer<typeof promotionSchema>;
export type KbEntry = z.infer<typeof kbEntrySchema>;
export type GcalEvent = z.infer<typeof gcalEventSchema>;
export type FileLog = z.infer<typeof fileLogSchema>;
export type AppSettings = z.infer<typeof appSettingsSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
