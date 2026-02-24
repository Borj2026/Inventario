# 🚀 INICIO RÁPIDO - Configuración de Supabase

## ⚡ TL;DR (3 pasos, 5 minutos)

### ✅ Opción A: **Si la tabla ya existe con errores**
Tu tabla `kv_store_0c8a700a` ya existe pero tiene errores. **NO HAGAS NADA**, el código ya está corregido. Solo:

1. **Refrescar la app** (F5)
2. **Probar** crear un producto
3. ✅ **Debería funcionar**

Ver detalles en: `/SOLUCION_ERROR_UPDATED_AT.md`

---

### ✅ Opción B: **Si necesitas crear las tablas desde cero**

#### 1.1 Ir a Supabase Dashboard
- Abrir [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Seleccionar tu proyecto

#### 1.2 Ejecutar SQL
1. Click en **"SQL Editor"** (menú lateral)
2. Click en **"New Query"**
3. Copiar **TODO** el contenido de `/supabase/migrations/001_initial_schema.sql`
4. Pegar en el editor
5. Click en **"Run"** (botón verde abajo)
6. Esperar mensaje: **"Success. No rows returned"** ✅

---

## ⚡ PASO 2: Migrar Usuarios (30 segundos)

### 2.1 Abrir la Aplicación

Ir a la pantalla de **Login**

### 2.2 Hacer Clic en "Migrar Usuarios"

- Buscar el **botón azul flotante** en la esquina inferior derecha
- Dice: **"Migrar Usuarios"** con un ícono de upload
- Hacer **1 CLIC**

### 2.3 Esperar Confirmación

Aparecerá un mensaje verde:

```
✅ Migración exitosa! 7 usuarios creados.
```

---

## ��� PASO 3: Iniciar Sesión (10 segundos)

### 3.1 Usar Credenciales de Administrador

- **Email**: `jorge@centromaster.com`
- **Contraseña**: `123456`

### 3.2 ¡Listo! 🎉

Ya puedes usar la aplicación completa.

---

## 👥 USUARIOS DISPONIBLES

Todos tienen contraseña: **123456**

| Nombre | Email | Rol |
|--------|-------|-----|
| **Jorge** | jorge@centromaster.com | Administrador |
| **Maite** | maite@centromaster.com | Contable |
| **Berta** | berta@centromaster.com | Contable |
| **Yeray** | yeray@centromaster.com | Coordinador |
| **Borja** | borja@centromaster.com | Coordinador |
| **Nara** | nara@centromaster.com | Usuario |
| **Daniela** | daniela@centromaster.com | Usuario |

---

## 🔒 SEGURIDAD

### ⚠️ IMPORTANTE: Cambiar Contraseñas

Después del primer login:

1. Ir a **Gestión de Usuarios** (en el menú lateral)
2. Editar cada usuario
3. Cambiar contraseña de `123456` a algo seguro

---

## ❓ PREGUNTAS FRECUENTES

### ¿Qué pasa si ya migré antes?

Es normal ver errores de "duplicate key". Simplemente inicia sesión con las credenciales existentes.

### ¿Cómo verifico que funcionó?

1. Login debería funcionar ✅
2. En Supabase Dashboard → Table Editor → users → Deberías ver 7 usuarios ✅

### ¿Qué hago si veo "relation 'users' does not exist"?

Significa que no completaste el **Paso 1**. Ejecuta el SQL en Supabase.

---

## 📚 DOCUMENTACIN COMPLETA

Para más detalles:

- **Configuración Detallada**: `/SETUP_SUPABASE.md`
- **Solución Error 403**: `/ERROR_403_SOLUCIONADO.md`
- **Resumen Técnico**: `/RESUMEN_MIGRACION.md`
- **Lista de Credenciales**: `/CREDENCIALES.md`

---

## ✅ TODO LISTO

Ahora puedes:

- ✅ Crear y gestionar productos
- ✅ Organizar categorías
- ✅ Gestionar proveedores
- ✅ Controlar almacenes
- ✅ Administrar empleados
- ✅ Ver reportes y estadísticas
- ✅ Gestionar 4 empresas (AMS, CEM, RUGH, SADAF)
- ✅ Sincronizar entre dispositivos

**¡Disfruta la aplicación!** 🎉