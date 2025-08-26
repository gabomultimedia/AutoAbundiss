# Abundiss Console

Un panel administrativo completo y funcional para orquestar el flujo de mensajes de Kommo usando Supabase, Deepseek y Google Calendar.

## 🚀 Características

- **Dashboard completo** con KPIs, gráficos y estadísticas en tiempo real
- **Gestión de conversaciones** con filtros avanzados y paginación
- **Sistema de promociones** con fechas de vigencia y descuentos
- **Base de conocimiento** con editor markdown y etiquetas
- **Calendario integrado** con Google Calendar
- **Gestión de archivos** con upload a Supabase Storage
- **Branding personalizable** con colores y logo configurables
- **Autenticación segura** con cookies HttpOnly
- **Tema dark** moderno y responsive

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: TailwindCSS + Lucide React
- **Estado**: Zustand
- **Enrutamiento**: React Router v6
- **Gráficos**: Recharts
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: JWT con cookies HttpOnly
- **Despliegue**: Netlify + Netlify Functions

## 📋 Prerrequisitos

- Node.js 18+ y npm
- Cuenta de Supabase
- Cuenta de Netlify
- API Key de Deepseek
- Service Account de Google Calendar
- Cuenta de Kommo

## 🚀 Instalación Local

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd abundiss-console
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `env.example` a `.env.local`:

```bash
cp env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Panel / Auth
PANEL_BASIC_USER=AdminAbundiss
PANEL_BASIC_PASS=tu-contraseña-segura
SESSION_SECRET=tu-secret-32-caracteres

# Kommo
KOMMO_BASE_URL=https://tu-subdominio.kommo.com
KOMMO_BEARER=tu-token-kommo

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE=tu-service-role-key
SUPABASE_BUCKET=abundiss-files

# Deepseek
DEEPSEEK_API_KEY=tu-api-key-deepseek

# Google Calendar
GCAL_CALENDAR_ID=primary
GCP_CLIENT_EMAIL=tu-service-account@proyecto.iam.gserviceaccount.com
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GCAL_TIMEZONE=America/Mexico_City

# Debounce
DEBOUNCE_MS=12000

# UI
APP_NAME=Abundiss Console
VITE_APP_LOGO_URL=https://tu-dominio.com/logo.png
```

### 4. Configurar Supabase

1. Ve a tu proyecto de Supabase
2. Ejecuta el script SQL en `supabase.sql`
3. Crea el bucket de storage `abundiss-files`
4. Configura las políticas RLS

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🌐 Despliegue en Netlify

### 1. Build del proyecto

```bash
npm run build
```

### 2. Configurar Netlify

1. Conecta tu repositorio a Netlify
2. Configura el build command: `npm run build`
3. Configura el publish directory: `dist`
4. Configura las funciones en `netlify/functions`

### 3. Variables de entorno en Netlify

Ve a **Site settings > Environment variables** y configura todas las variables del archivo `.env.example`.

### 4. Desplegar funciones

Las funciones de Netlify se despliegan automáticamente desde el directorio `netlify/functions`.

## 🔧 Configuración de Servicios

### Supabase

1. Crea un nuevo proyecto
2. Ejecuta el script `supabase.sql`
3. Crea el bucket `abundiss-files`
4. Configura las políticas RLS para permitir solo lectura desde el cliente

### Google Calendar

1. Crea un proyecto en Google Cloud Console
2. Habilita la API de Google Calendar
3. Crea una Service Account
4. Descarga la clave privada JSON
5. Comparte tu calendario con el email de la Service Account

### Kommo

1. Configura el webhook: `POST /.netlify/functions/kommo-hook`
2. Asegúrate de que el token tenga permisos de lectura y escritura

### Deepseek

1. Obtén tu API key desde [Deepseek](https://platform.deepseek.com/)
2. Configura la variable `DEEPSEEK_API_KEY`

## 📱 Uso de la Aplicación

### Login

- Usuario: `AdminAbundiss` (configurable)
- Contraseña: La configurada en `PANEL_BASIC_PASS`

### Dashboard

- KPIs en tiempo real
- Gráficos de conversaciones por semana
- Distribución de intenciones
- Conversaciones recientes

### Conversaciones

- Filtros por fecha, intención y texto
- Paginación avanzada
- Vista detallada de cada conversación

### Promociones

- CRUD completo de promociones
- Fechas de vigencia
- Descuentos porcentuales y en pesos
- Estados activo/inactivo

### Base de Conocimiento

- Editor markdown con vista previa
- Sistema de etiquetas
- Prioridades configurables
- Estados activo/inactivo

### Calendario

- Vista de eventos próximos
- Creación de nuevos eventos
- Integración con Google Calendar
- Enlaces directos a eventos

### Archivos

- Upload a Supabase Storage
- Metadatos configurables
- Etiquetas y descripciones
- Gestión completa de archivos

### Configuración

- Personalización del branding
- Colores configurables
- Logo personalizable
- Vista previa en tiempo real

## 🔒 Seguridad

- **Autenticación**: Cookies HttpOnly con JWT
- **RLS**: Row Level Security en Supabase
- **Variables de entorno**: Secretos nunca expuestos al cliente
- **Rate limiting**: Protección contra ataques de fuerza bruta
- **CORS**: Configurado para dominios específicos

## 🧪 Testing

```bash
# Linting
npm run lint

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 📁 Estructura del Proyecto

```
abundiss-console/
├── netlify/
│   └── functions/          # Netlify Functions
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── lib/               # Utilidades y configuraciones
│   ├── pages/             # Páginas de la aplicación
│   ├── store/             # Estado global con Zustand
│   └── styles/            # Estilos globales
├── supabase.sql           # Esquema de la base de datos
├── package.json           # Dependencias del proyecto
└── README.md              # Este archivo
```

## 🚨 Solución de Problemas

### Error de autenticación

- Verifica que las credenciales en `.env.local` sean correctas
- Asegúrate de que la función `auth-gate` esté desplegada

### Error de Supabase

- Verifica que las variables de entorno de Supabase sean correctas
- Asegúrate de que el esquema SQL se haya ejecutado
- Verifica las políticas RLS

### Error de Google Calendar

- Verifica que la Service Account tenga permisos
- Asegúrate de que el calendario esté compartido
- Verifica el formato de la clave privada

### Build falla en Netlify

- Verifica que Node.js 18+ esté configurado
- Revisa los logs de build en Netlify
- Asegúrate de que todas las dependencias estén en `package.json`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:

- Abre un issue en GitHub
- Contacta al equipo de desarrollo
- Revisa la documentación de cada servicio integrado

## 🔄 Changelog

### v1.0.0
- Lanzamiento inicial
- Dashboard completo con KPIs
- Gestión de conversaciones
- Sistema de promociones
- Base de conocimiento
- Calendario integrado
- Gestión de archivos
- Configuración personalizable
- Autenticación segura
- Tema dark responsive

---

**Abundiss Console** - Potenciando la gestión de conversaciones con IA
