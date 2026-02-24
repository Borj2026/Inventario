# 🔑 Guía de Inicio de Sesión

## 📝 Pasos para Acceder al Sistema

### 1️⃣ Primera vez (Configuración Inicial)

Si es la primera vez que usas el sistema, sigue estos pasos:

1. **Haz clic en el botón de ayuda** (ícono de interrogación en la esquina inferior izquierda de la pantalla de login)
2. **Verás todas las credenciales disponibles** organizadas por rol
3. **Haz clic en "Migrar Usuarios"** (botón azul en la esquina inferior derecha)
4. **Espera a que se complete la migración** (aparecerá un mensaje de confirmación)
5. **Selecciona las credenciales que deseas usar** haciendo clic en "Usar estas credenciales" en cualquier usuario

### 2️⃣ Inicio de Sesión Normal

Una vez completada la configuración inicial:

1. Ingresa tu **correo electrónico**
2. Ingresa tu **contraseña** (por defecto: `123456`)
3. Haz clic en **"Iniciar Sesión"**

---

## 👥 Credenciales de Prueba

Todos los usuarios tienen la contraseña: **`123456`**

### 🔴 Administrador
- **Email:** jorge@centromaster.com
- **Rol:** Acceso completo al sistema

### 🟢 Contables
- **Email:** maite@centromaster.com
- **Email:** berta@centromaster.com
- **Rol:** Sistema de contabilidad (compras/ventas)

### 🔵 Coordinadores
- **Email:** yeray@centromaster.com
- **Email:** borja@centromaster.com
- **Rol:** Gestión completa de inventario

### ⚪ Usuarios
- **Email:** nara@centromaster.com
- **Email:** daniela@centromaster.com
- **Rol:** Permisos limitados (solo lectura)

---

## ❓ Solución de Problemas

### ❌ "Usuario no encontrado"
- **Causa:** Los usuarios no han sido migrados a la base de datos
- **Solución:** Haz clic en el botón "Migrar Usuarios" (esquina inferior derecha)

### ❌ "Contraseña incorrecta"
- **Causa:** La contraseña no coincide
- **Solución:** Verifica que estás usando `123456` (sin espacios)

### ❌ "Tu cuenta ha sido desactivada"
- **Causa:** El usuario está inactivo en la base de datos
- **Solución:** Contacta al administrador del sistema

### ❌ "Error de conexión"
- **Causa:** No hay conexión con Supabase
- **Solución:** 
  - Verifica tu conexión a internet
  - Comprueba que Supabase esté configurado correctamente
  - Revisa las credenciales en `/utils/supabase/info.tsx`

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:** Las contraseñas mostradas aquí son **temporales** y solo para pruebas.

En un entorno de producción:
- Cambia todas las contraseñas inmediatamente
- Usa contraseñas seguras (mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos)
- Habilita la autenticación de dos factores
- No compartas credenciales entre usuarios

---

## 📱 Funcionalidades según Rol

### Administrador (Jorge)
✅ Acceso completo a todas las funcionalidades
✅ Gestión de usuarios y permisos
✅ Configuración del sistema
✅ Acceso a todas las empresas (AMS, CEM, RUGH, SADAF)

### Contable (Maite, Berta)
✅ Sistema de contabilidad completo
✅ Gestión de compras y ventas
✅ Inventario de facturas
✅ Gestión de clientes
❌ No acceso al inventario general

### Coordinador (Yeray, Borja)
✅ Dashboard con estadísticas
✅ Gestión completa de productos
✅ Gestión de pedidos
✅ Gestión de proveedores
✅ Reportes y gráficas
❌ No gestión de usuarios

### Usuario (Nara, Daniela)
✅ Dashboard (solo lectura)
✅ Ver inventario
✅ Reportes básicos
❌ No puede crear/editar productos
❌ No acceso a configuraciones

---

## 🆘 Ayuda Adicional

Si sigues teniendo problemas para iniciar sesión:

1. **Revisa la consola del navegador** (F12) para ver errores específicos
2. **Verifica la configuración de Supabase** en `/utils/supabase/info.tsx`
3. **Comprueba que las tablas estén creadas** en Supabase:
   - `users` (tabla de usuarios)
   - `kv_store_0c8a700a` (almacenamiento de datos)
4. **Consulta el archivo** `/CREDENCIALES.md` para información detallada
5. **Revisa el archivo** `/SETUP_SUPABASE.md` para configuración de la base de datos

---

## ✅ Verificación Post-Login

Después de iniciar sesión correctamente, deberías ver:

- ✅ Mensaje de bienvenida con tu nombre
- ✅ Dashboard correspondiente a tu rol
- ✅ Menú lateral con las opciones disponibles
- ✅ Indicador de sincronización en la esquina superior derecha
- ✅ Nombre de usuario y empresa en el header

---

**Última actualización:** 20 de febrero de 2026
**Versión:** 1.0.0
