# ⚠️ EDGE FUNCTIONS DESHABILITADAS

## 🚫 NO DESPLEGAR - ARCHIVOS DESHABILITADOS

**Todos los archivos en este directorio están DESHABILITADOS y NO deben desplegarse como Edge Functions.**

---

## ❌ Estado: FUERA DE USO

Este proyecto **NO utiliza Edge Functions** de Supabase.

### ¿Por qué?

1. ⚠️ Error 403 al intentar desplegar
2. ✅ No es necesario tener un servidor intermedio
3. ✅ Conexión directa a Supabase Database es más simple y eficiente

---

## ✅ Arquitectura Actual

```
┌─────────────────┐
│  Frontend       │
│  (React App)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ @supabase/      │
│ supabase-js     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase       │
│  Database       │
│  (PostgreSQL)   │
└─────────────────┘
```

**NO hay servidor intermedio** - La app se conecta directamente a la base de datos.

---

## 📁 Archivos Activos (LOS QUE SÍ SE USAN)

| Archivo | Descripción |
|---------|-------------|
| ✅ `/src/app/utils/supabase.ts` | Cliente de Supabase |
| ✅ `/src/app/utils/api.ts` | API wrapper |
| ✅ `/supabase/migrations/001_initial_schema.sql` | Schema de base de datos |

---

## 📁 Archivos Deshabilitados (NO USAR)

| Archivo | Estado |
|---------|--------|
| ❌ `/supabase/functions/server/index.tsx` | **DESHABILITADO** |
| ❌ `/supabase/functions/server/kv_store.tsx` | **DESHABILITADO** |

Estos archivos han sido modificados para que **NO sean Edge Functions válidas**.

---

## 🔧 Configuración

### Archivos de Configuración

- `/.figmaignore` - Ignora Edge Functions
- `/.edgefunctionsignore` - Seguridad adicional
- `/supabase/config.toml` - `functions.enabled = false`

---

## 📚 Documentación

Para configurar la aplicación correctamente:

1. **Inicio rápido**: `/INICIO_RAPIDO.md`
2. **Setup completo**: `/SETUP_SUPABASE.md`
3. **Solución de errores**: `/ERRORES_SOLUCIONADOS.md`

---

## ⚠️ IMPORTANTE

**Si ves el error:**
```
Error 403: Edge Functions deployment failed
```

**Solución**:
1. ✅ Los archivos ya están deshabilitados
2. ✅ Refrescar la aplicación (F5)
3. ✅ Limpiar cache del navegador si es necesario

**NO necesitas desplegar nada en Supabase Edge Functions.**

---

**Fecha**: 20 de febrero de 2026  
**Estado**: ❌ **DESHABILITADO - NO USAR EDGE FUNCTIONS**  
**Arquitectura**: Conexión directa a Database
