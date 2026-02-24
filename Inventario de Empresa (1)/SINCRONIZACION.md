# 🌐 Sistema de Sincronización en la Nube con Supabase

## ✅ Estado de la Implementación

### Componentes Sincronizados:
- ✅ **Gestión de Roles y Permisos** - Auto-guardado en la nube
- ✅ **Productos** - Sincronización automática por empresa
- ✅ **Empleados** - Compartidos entre todas las empresas
- ✅ **Categorías** - Sincronización por empresa
- ✅ **Proveedores** - Sincronización por empresa
- ✅ **Empresa Seleccionada** - Persistencia en la nube

### Características Implementadas:
- 🔄 **Auto-guardado**: Los cambios se guardan automáticamente cada 1 segundo
- 📊 **Indicador de Sincronización**: Muestra el estado de conexión con la nube
- 🔌 **Modo Offline**: Funciona localmente si pierde la conexión
- 💾 **Caché Inteligente**: Los permisos se cachean 5 minutos para mejor rendimiento
- 🏢 **Multi-empresa**: Los datos se separan por empresa (AMS, CEM, RUGH, SADAF)

## 🚀 Cómo Funciona

### 1. Carga Inicial
Al abrir la aplicación:
1. Se muestra una pantalla de carga
2. Se cargan los datos desde Supabase
3. Si hay error, usa valores por defecto locales
4. Muestra notificación de conexión exitosa

### 2. Sincronización Automática
Cuando modificas datos (productos, empleados, etc.):
1. Los cambios se aplican inmediatamente en la interfaz
2. Después de 1 segundo sin cambios, se guarda en la nube
3. Si hay error, se muestra notificación y mantiene los datos locales
4. Los logs en consola confirman cada sincronización

### 3. Permisos y Roles
Los permisos tienen un sistema especial:
- Se guardan INSTANTÁNEAMENTE al marcar/desmarcar checkbox
- Se cachean 5 minutos para mejor rendimiento
- Puedes invalidar el caché llamando a `invalidatePermissionsCache()`

## 📱 Sincronización Multi-Dispositivo

### ¿Cómo probar en varios dispositivos?

1. **Abre la app en el dispositivo 1** (ej: tu ordenador)
   - Inicia sesión y agrega un producto
   - Verás en consola: "✅ Productos sincronizados con la nube"

2. **Abre la app en el dispositivo 2** (ej: tu tablet/móvil)
   - Inicia sesión con el mismo usuario
   - Verás el producto que creaste en el dispositivo 1

3. **Haz cambios en cualquier dispositivo**
   - Los cambios se sincronizan automáticamente
   - Recarga la página en el otro dispositivo para ver los cambios

### Limitaciones Actuales:
⚠️ **Sincronización en Tiempo Real**: Los cambios NO se reflejan automáticamente sin recargar. Para ver cambios de otro dispositivo, debes:
- Recargar la página (F5)
- O cerrar sesión y volver a entrar

## 🔧 Endpoints de la API

Todos los endpoints están en `/supabase/functions/server/index.tsx`:

### Roles y Permisos
- `GET /roles/permissions` - Obtener todos los permisos
- `POST /roles/module-access` - Guardar permisos de módulos
- `POST /roles/crud-permissions` - Guardar permisos CRUD
- `POST /roles/special-features` - Guardar características especiales
- `POST /roles/financial-access` - Guardar acceso financiero
- `POST /roles/custom-roles` - Guardar roles personalizados

### Productos
- `GET /products/:company` - Obtener productos de una empresa
- `POST /products/:company` - Guardar productos de una empresa

### Categorías
- `GET /categories/:company` - Obtener categorías de una empresa
- `POST /categories/:company` - Guardar categorías de una empresa

### Proveedores
- `GET /suppliers/:company` - Obtener proveedores de una empresa
- `POST /suppliers/:company` - Guardar proveedores de una empresa

### Empleados
- `GET /employees` - Obtener todos los empleados
- `POST /employees` - Guardar todos los empleados

### Configuración
- `GET /selected-company` - Obtener empresa seleccionada
- `POST /selected-company` - Guardar empresa seleccionada

### Utilidades
- `GET /health` - Verificar estado del servidor
- `GET /sync/all` - Sincronización completa (obtener todos los datos)

## 🛠️ Archivos Clave

### Backend (Supabase)
- `/supabase/functions/server/index.tsx` - Servidor Hono con todos los endpoints
- `/supabase/functions/server/kv_store.tsx` - Sistema de almacenamiento

### Frontend (React)
- `/src/app/utils/api.ts` - Cliente API para comunicarse con Supabase
- `/src/app/utils/permissions.ts` - Sistema de permisos con caché
- `/src/app/hooks/useSupabaseSync.ts` - Hook personalizado para sincronización
- `/src/app/components/SyncIndicator.tsx` - Indicador visual de estado
- `/src/app/components/RoleManagementView.tsx` - Gestión de roles (actualizado)
- `/src/app/App.tsx` - Componente principal (actualizado)

## 🎯 Próximos Pasos (Opcional)

### Para Sincronización en Tiempo Real:
Si necesitas que los cambios aparezcan instantáneamente sin recargar:
1. Implementar WebSockets o Supabase Realtime
2. Escuchar cambios en la base de datos
3. Actualizar el estado cuando otro usuario haga cambios

### Para Sincronización de Más Datos:
Los siguientes datos todavía NO se sincronizan:
- ❌ Historial de stock
- ❌ Movimientos de stock
- ❌ Pedidos
- ❌ Clientes
- ❌ Unidades de productos
- ❌ Productos eliminados (papelera)
- ❌ Stocks pendientes

Si necesitas sincronizar estos datos, solo tienes que:
1. Agregar endpoints en `/supabase/functions/server/index.tsx`
2. Agregar funciones en `/src/app/utils/api.ts`
3. Agregar useEffect en `/src/app/App.tsx`

## 🐛 Debugging

### Ver logs de sincronización:
1. Abre la consola del navegador (F12)
2. Busca mensajes que empiecen con "✅"
3. Los errores aparecerán en rojo

### Verificar estado de Supabase:
1. El indicador de sincronización muestra:
   - 🟢 Verde = Conectado
   - 🔵 Azul (girando) = Sincronizando
   - 🔴 Rojo = Sin conexión

### Si hay problemas:
1. Revisa la consola del navegador
2. Verifica que Supabase esté funcionando
3. Comprueba la conexión a internet
4. Recarga la página (F5)

## 📞 Soporte

Si algo no funciona:
1. Abre la consola del navegador (F12)
2. Copia los mensajes de error
3. Comparte los logs para ayuda

---

**Nota**: Esta aplicación está diseñada para desarrollo. Para producción, considera:
- Autenticación real con usuarios y contraseñas
- Cifrado de datos sensibles
- Backups automáticos
- Rate limiting en las APIs
- Auditoría de cambios
