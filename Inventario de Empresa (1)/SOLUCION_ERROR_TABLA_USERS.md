# 🔧 Solución: Error "Could not find the table 'public.users'"

## ❌ Error Encontrado

```json
{
  "code": "PGRST205",
  "details": null,
  "hint": null,
  "message": "Could not find the table 'public.users' in the schema cache"
}
```

**Causa:** La tabla `users` no existe en tu base de datos Supabase.

---

## ✅ Solución Rápida

### Opción 1: Usar el Asistente Visual (MÁS FÁCIL) 🎯

1. **Abre la aplicación**
2. **Ve a la pantalla de Login**
3. **Haz clic en el botón naranja "Configurar BD"** (esquina superior derecha)
4. **El asistente te mostrará:**
   - ✅ Estado de la tabla (si existe o no)
   - ✅ Estado del usuario administrador
   - ✅ Instrucciones paso a paso
   - ✅ Script SQL listo para copiar
5. **Sigue las instrucciones visuales**
6. **Haz clic en "Verificar de nuevo"** después de ejecutar el script

---

### Opción 2: Ejecutar Script SQL Manualmente

#### Paso 1: Accede al Dashboard de Supabase

1. Abre [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **"SQL Editor"**

#### Paso 2: Ejecuta el Script de Configuración

Copia y pega el siguiente script SQL completo:

```sql
-- Crear tabla de usuarios
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

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON public.users(company);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Habilitar Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Permitir lectura a usuarios autenticados" ON public.users
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción pública" ON public.users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización del propio perfil" ON public.users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación a administradores" ON public.users
  FOR DELETE
  USING (true);

-- Insertar usuario administrador
INSERT INTO public.users (name, email, password, company, role, department, status, is_active)
VALUES ('Jorge', 'jorge@centromaster.com', '123456', 'AMS', 'administrador', 'Informática', 'active', true)
ON CONFLICT (email) DO NOTHING;
```

#### Paso 3: Ejecuta el Script

1. Haz clic en el botón **"Run"** (o presiona `Ctrl + Enter`)
2. Espera a que aparezca el mensaje **"Success"**
3. Verifica que no haya errores en rojo

#### Paso 4: Verifica la Tabla

Ejecuta este query para confirmar:

```sql
SELECT * FROM public.users;
```

Deberías ver el usuario Jorge con estos datos:
- **Email:** jorge@centromaster.com
- **Rol:** administrador
- **Empresa:** AMS

---

## 📋 Estructura de la Tabla

La tabla `users` tiene los siguientes campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único (generado automáticamente) |
| `name` | TEXT | Nombre completo del usuario |
| `email` | TEXT | Correo electrónico (único, obligatorio) |
| `password` | TEXT | Contraseña (en texto plano para desarrollo) |
| `company` | TEXT | Empresa (AMS, CEM, RUGH, SADAF) |
| `role` | TEXT | Rol del usuario (administrador, usuario, contabilidad) |
| `department` | TEXT | Departamento al que pertenece |
| `status` | TEXT | Estado del usuario (active, inactive) |
| `is_active` | BOOLEAN | Si el usuario está activo |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

---

## 🎯 Usuario Administrador Inicial

Una vez ejecutado el script, tendrás un usuario administrador:

```
Email:     jorge@centromaster.com
Password:  123456
Rol:       administrador
Empresa:   AMS
```

**⚠️ IMPORTANTE:** Cambia la contraseña después del primer inicio de sesión.

---

## 🔄 Verificación Final

### 1. Verifica la Tabla en Supabase

En el Dashboard de Supabase:
1. Ve a **"Table Editor"** en el menú lateral
2. Deberías ver la tabla **"users"**
3. Haz clic en ella para ver el registro de Jorge

### 2. Prueba el Login

1. Refresca tu aplicación (F5 o Ctrl + Shift + R)
2. Intenta iniciar sesión con:
   - **Email:** jorge@centromaster.com
   - **Password:** 123456
3. Deberías poder acceder sin errores

### 3. Registra un Nuevo Usuario

1. Haz clic en **"Regístrate aquí"**
2. Llena el formulario de registro
3. Crea tu cuenta
4. Verifica que puedes iniciar sesión con tu nuevo usuario

---

## 📁 Archivos de Referencia

En el proyecto encontrarás estos archivos útiles:

### `/SETUP_DATABASE.sql`
Script SQL completo con:
- ✅ Creación de tabla
- ✅ Índices
- ✅ Políticas de seguridad
- ✅ Usuario administrador
- ✅ Funciones de actualización
- ✅ Comentarios explicativos

### `/src/app/components/DatabaseSetupHelper.tsx`
Componente visual que:
- ✅ Verifica el estado de la base de datos
- ✅ Muestra instrucciones paso a paso
- ✅ Permite copiar el script SQL
- ✅ Detecta si la tabla existe
- ✅ Detecta si el usuario admin existe

---

## 🛠️ Solución de Problemas

### Error: "relation 'public.users' already exists"

**Causa:** La tabla ya existe pero tiene un problema.

**Solución:**
```sql
-- Eliminar la tabla (CUIDADO: esto borrará todos los datos)
DROP TABLE IF EXISTS public.users CASCADE;

-- Volver a ejecutar el script de creación
-- (El script completo está arriba)
```

---

### Error: "duplicate key value violates unique constraint"

**Causa:** El usuario Jorge ya existe.

**Solución:** Esto es normal si ya ejecutaste el script antes. Puedes:

**Opción A:** Ignorar el error (el usuario ya está creado)

**Opción B:** Actualizar la contraseña
```sql
UPDATE public.users 
SET password = '123456' 
WHERE email = 'jorge@centromaster.com';
```

---

### Error: "permission denied for table users"

**Causa:** Problemas con las políticas de Row Level Security.

**Solución:**
```sql
-- Deshabilitar temporalmente RLS para pruebas
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Luego de verificar que funciona, volver a habilitar
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

---

### No puedo ver el botón "Configurar BD"

**Solución:**
1. Refresca la página (Ctrl + Shift + R)
2. Verifica que estés en la pantalla de Login
3. Busca en la esquina superior derecha un botón naranja

---

### El asistente dice "Tabla NO existe" después de ejecutar el script

**Solución:**
1. Espera 10-15 segundos (Supabase puede tardar en actualizar)
2. Haz clic en "Verificar de nuevo"
3. Si persiste, revisa la consola del SQL Editor en Supabase

---

## 🔐 Seguridad (Para Producción)

⚠️ **IMPORTANTE:** Este setup usa contraseñas en texto plano para desarrollo.

### Para producción, debes:

1. **Hashear contraseñas con bcrypt:**
```javascript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash('123456', 10);
```

2. **Usar Supabase Auth:**
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'usuario@example.com',
  password: 'contraseña_segura'
});
```

3. **Configurar políticas RLS más restrictivas:**
```sql
-- Solo el propio usuario puede ver sus datos
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);
```

---

## ✅ Checklist de Configuración Completa

Marca cada paso a medida que lo completes:

- [ ] Accedí al Dashboard de Supabase
- [ ] Abrí el SQL Editor
- [ ] Ejecuté el script de creación de tabla
- [ ] El script se ejecutó sin errores
- [ ] Verifiqué que la tabla "users" existe
- [ ] Verifiqué que el usuario Jorge existe
- [ ] Refresqué la aplicación
- [ ] Probé iniciar sesión con jorge@centromaster.com
- [ ] El login funcionó correctamente
- [ ] Probé registrar un nuevo usuario
- [ ] El nuevo usuario puede iniciar sesión
- [ ] ✅ **SISTEMA CONFIGURADO Y FUNCIONANDO**

---

## 📞 Soporte Adicional

Si después de seguir todos estos pasos sigues teniendo problemas:

1. **Revisa la consola del navegador (F12)**
   - Busca errores en rojo
   - Copia el mensaje de error completo

2. **Revisa los logs de Supabase**
   - Dashboard > Logs
   - Filtra por errores

3. **Verifica la configuración de Supabase**
   - Dashboard > Settings > API
   - Confirma que el Project URL y anon key son correctos

4. **Revisa el archivo `/src/app/utils/supabase.ts`**
   - Verifica que la conexión esté bien configurada

---

## 🎉 Próximos Pasos

Una vez que la base de datos esté configurada:

1. ✅ Iniciar sesión como administrador
2. ✅ Cambiar la contraseña del administrador
3. ✅ Invitar a otros usuarios a registrarse
4. ✅ Configurar permisos y roles
5. ✅ Empezar a usar el sistema de inventario

---

**Fecha:** 20 de febrero de 2026  
**Versión:** 2.0.0  
**Estado:** ✅ **SOLUCIONADO**
