# 🚀 Sistema de Gestión de Inventario - Configuración Inicial

## ⚠️ IMPORTANTE: Primera vez que usas la aplicación

Si ves el error **"Could not find the table 'public.users'"** al intentar iniciar sesión, necesitas configurar la base de datos en Supabase.

---

## ✅ Configuración en 2 Minutos

### Opción 1: Asistente Visual (RECOMENDADO) 🎯

1. **Abre la aplicación** en tu navegador
2. **Haz clic en el botón naranja "Configurar BD"** (esquina superior derecha)
3. **Sigue las instrucciones** del asistente visual
4. **Copia el script SQL** con un solo clic
5. **Pega y ejecuta** en Supabase SQL Editor
6. **¡Listo!** Ya puedes iniciar sesión

---

### Opción 2: Manual Rápido 📝

#### 1. Abre Supabase Dashboard
- Ve a: https://supabase.com/dashboard
- Selecciona tu proyecto
- Haz clic en **SQL Editor**

#### 2. Copia y pega este script:

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT 'AMS',
  role TEXT NOT NULL DEFAULT 'usuario',
  department TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON public.users FOR ALL USING (true);

INSERT INTO public.users (name, email, password, company, role, department, status, is_active)
VALUES ('Jorge', 'jorge@centromaster.com', '123456', 'AMS', 'administrador', 'Informática', 'active', true)
ON CONFLICT (email) DO NOTHING;
```

#### 3. Ejecuta el script
- Haz clic en **RUN** (o Ctrl+Enter)
- Espera el mensaje **"Success"**

#### 4. Inicia sesión
```
Email:    jorge@centromaster.com
Password: 123456
```

---

## 📚 Documentación Detallada

Si necesitas más información, consulta:

- **`/SOLUCION_ERROR_TABLA_USERS.md`** - Guía completa de solución de problemas
- **`/SETUP_DATABASE.sql`** - Script SQL completo con comentarios
- **`/CAMBIOS_SISTEMA_REGISTRO.md`** - Cambios recientes en el sistema

---

## 🎯 Credenciales Iniciales

Después de ejecutar el script, usa estas credenciales:

| Campo | Valor |
|-------|-------|
| **Email** | jorge@centromaster.com |
| **Contraseña** | 123456 |
| **Rol** | Administrador |

⚠️ **Cambia la contraseña después del primer inicio de sesión**

---

## 🆘 ¿Problemas?

### Error: "Could not find the table"
→ La tabla no existe, sigue los pasos de arriba

### Error: "Contraseña incorrecta"
→ Ejecuta este SQL en Supabase:
```sql
UPDATE public.users SET password = '123456' WHERE email = 'jorge@centromaster.com';
```

### Error: "Usuario no encontrado"
→ Ejecuta este SQL en Supabase:
```sql
INSERT INTO public.users (name, email, password, company, role, department, status, is_active)
VALUES ('Jorge', 'jorge@centromaster.com', '123456', 'AMS', 'administrador', 'Informática', 'active', true);
```

### El botón "Configurar BD" no aparece
→ Refresca la página (Ctrl+Shift+R)

---

## ✨ Características del Sistema

- 📦 **Gestión de productos** para 4 empresas (AMS, CEM, RUGH, SADAF)
- 📊 **Dashboard con estadísticas** en tiempo real
- 👥 **Gestión de empleados** y departamentos
- 🏢 **Múltiples almacenes** y ubicaciones
- 🔐 **Sistema de roles** y permisos
- 📱 **Responsive** - funciona en móvil y escritorio
- ☁️ **Sincronización en la nube** con Supabase

---

## 🔄 Flujo de Trabajo

1. **Primera vez:**
   - Configurar base de datos (2 minutos)
   - Login como Jorge
   - Cambiar contraseña

2. **Usuarios nuevos:**
   - Registrarse en la aplicación
   - Iniciar sesión
   - Empezar a usar el sistema

3. **Uso diario:**
   - Login
   - Gestionar productos
   - Ver reportes
   - Gestionar inventario

---

## 🎉 ¡Listo para Comenzar!

Una vez configurada la base de datos, tienes acceso completo a:

- ✅ Dashboard de inventario
- ✅ Gestión de productos
- ✅ Reportes y estadísticas
- ✅ Gestión de empleados
- ✅ Sistema de proveedores
- ✅ Múltiples almacenes
- ✅ Sistema de contabilidad (Maite y Berta)

---

**Versión:** 2.0.0  
**Última actualización:** 20 de febrero de 2026  
**Estado:** ✅ Producción
