# 🚀 Deploy en Netlify - Abundiss Console

## ⚠️ **IMPORTANTE: Límite de 4KB en variables de entorno**

Netlify tiene un límite de **4KB** para variables de entorno en AWS Lambda. Para resolver esto:

### **1. Configuración en netlify.toml (SOLO variables esenciales)**

```toml
[build.environment]
  NODE_VERSION = "18"
  SUPABASE_URL = "https://fcvwqwjsypossdqochde.supabase.co"
  SUPABASE_ANON_KEY = "tu-anon-key"
```

### **2. Dashboard de Netlify - SOLO estas 3 variables:**

```bash
# ELIMINAR TODAS las demás variables del dashboard
# SOLO mantener:
NODE_VERSION = "18"
SUPABASE_URL = "https://fcvwqwjsypossdqochde.supabase.co"
SUPABASE_ANON_KEY = "tu-anon-key"
```

### **3. Variables que NO van en Netlify (muy largas):**

- ❌ `GCP_PRIVATE_KEY` (clave privada de Google - muy larga)
- ❌ `KOMMO_CLIENT_SECRET` (secreto de Kommo)
- ❌ `SESSION_SECRET` (secreto de sesión)
- ❌ `DEEPSEEK_API_KEY` (clave de API)

### **4. Configuración de Netlify Functions:**

Las funciones usarán valores por defecto del archivo `netlify/functions/config.js`:

```javascript
// Ejemplo de uso en funciones
import { config } from './config.js';

const user = config.panel.basicUser;
const pass = config.panel.basicPass;
```

### **5. Pasos para deploy exitoso:**

1. **Eliminar TODAS las variables** del dashboard de Netlify
2. **Mantener solo** las 3 variables esenciales
3. **Hacer commit y push** de los cambios
4. **Netlify detectará** los cambios automáticamente
5. **El build debería funcionar** sin el error de 4KB

### **6. Variables que se configuran por código:**

- ✅ `PANEL_BASIC_USER` → `config.panel.basicUser`
- ✅ `PANEL_BASIC_PASS` → `config.panel.basicPass`
- ✅ `SESSION_SECRET` → `config.panel.sessionSecret`
- ✅ `KOMMO_CLIENT_ID` → `config.kommo.clientId`
- ✅ `SUPABASE_SERVICE_ROLE` → `config.supabase.serviceRole`

### **7. Si necesitas cambiar valores:**

Edita el archivo `netlify/functions/config.js` y haz commit:

```javascript
export const config = {
  panel: {
    basicUser: 'NuevoUsuario',
    basicPass: 'NuevaContraseña',
    // ...
  }
};
```

## 🎯 **Resultado esperado:**

- ✅ Build exitoso en Netlify
- ✅ Variables de entorno < 4KB
- ✅ Funciones funcionando correctamente
- ✅ Aplicación desplegada sin errores

## 🔧 **Solución alternativa:**

Si sigues teniendo problemas, puedes:
1. **Reducir el tamaño** de las claves privadas
2. **Usar variables más cortas**
3. **Implementar configuración externa** (Base64, etc.)

---

**¡Con esta configuración el deploy debería funcionar perfectamente! 🚀**
