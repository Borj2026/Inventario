# 🏢 Sistema de Gestión de Inventario Empresarial

Sistema completo de gestión de inventario para múltiples empresas con sincronización en la nube usando Supabase.

## 🚀 Inicio Rápido

### Primera Vez - Configuración (2 minutos)

1. **Abre la aplicación** en tu navegador
2. **Haz clic en "Configurar BD"** (botón naranja, esquina superior derecha)
3. **Sigue las instrucciones** del asistente visual
4. **Inicia sesión** con:
   ```
   Email:    jorge@centromaster.com
   Password: 123456
   ```

### ¿Problemas con la Base de Datos?

Si ves el error **"Could not find table users"**, consulta:

📖 **[LEEME_PRIMERO.md](./LEEME_PRIMERO.md)** - Solución en 2 minutos  
📖 **[INSTRUCCIONES_VISUALES.md](./INSTRUCCIONES_VISUALES.md)** - Guía paso a paso con diagramas

---

## ✨ Características Principales

### 📦 Gestión de Inventario
- ✅ Productos con SKU, categorías y ubicaciones
- ✅ Control de stock en tiempo real
- ✅ Alertas de stock mínimo
- ✅ Historial completo de movimientos
- ✅ Gestión de múltiples almacenes
- ✅ Sistema de trazabilidad con códigos QR

### 🏢 Multi-Empresa
- ✅ Soporte para 4 empresas: **AMS**, **CEM**, **RUGH**, **SADAF**
- ✅ Datos separados por empresa
- ✅ Cambio rápido entre empresas
- ✅ Categorías personalizadas por empresa

### 👥 Gestión de Usuarios
- ✅ Sistema de autenticación seguro
- ✅ Roles: Administrador, Usuario, Contabilidad
- ✅ Permisos personalizables
- ✅ Gestión de empleados y departamentos
- ✅ Registro de usuarios con validación

### 📊 Dashboard y Reportes
- ✅ Dashboard interactivo con KPIs
- ✅ Gráficos de tendencias
- ✅ Reportes de stock por categoría
- ✅ Análisis de variaciones de stock
- ✅ Exportación de reportes

### 🔄 Sincronización en la Nube
- ✅ Integración con Supabase
- ✅ Sincronización automática
- ✅ Datos accesibles desde múltiples dispositivos
- ✅ Indicador de estado de conexión

### 📱 Diseño Responsive
- ✅ Funciona en escritorio y móvil
- ✅ Interfaz adaptativa
- ✅ Sidebar colapsable
- ✅ Optimizado para tablets

---

## 🛠️ Tecnologías

- **Frontend:** React 18 + TypeScript
- **Estilos:** Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL)
- **Iconos:** Lucide React
- **Gráficos:** Recharts
- **Notificaciones:** Sonner
- **Almacenamiento:** LocalStorage + Supabase

---

## 📋 Estructura del Proyecto

```
/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes React
│   │   │   ├── LoginView.tsx
│   │   │   ├── RegisterView.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── InventoryView.tsx
│   │   │   ├── DatabaseSetupHelper.tsx  # ← Asistente de configuración
│   │   │   └── ...
│   │   ├── utils/               # Utilidades
│   │   │   ├── api.ts          # API wrapper
│   │   │   ├── supabase.ts     # Cliente Supabase
│   │   │   └── ...
│   │   └── App.tsx             # Componente principal
│   └── styles/                  # Estilos globales
│       ├── theme.css
│       └── fonts.css
│
├── LEEME_PRIMERO.md            # ← EMPIEZA AQUÍ
├── INSTRUCCIONES_VISUALES.md   # Guía con diagramas
├── SOLUCION_ERROR_TABLA_USERS.md  # Troubleshooting completo
├── SETUP_DATABASE.sql          # Script de configuración SQL
├── RESUMEN_SOLUCION.md         # Resumen técnico
└── README.md                    # Este archivo
```

---

## 🔧 Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Anota tu **Project URL** y **anon key**

### 2. Configurar Conexión

La aplicación ya está configurada para conectarse a Supabase. Solo necesitas ejecutar el script SQL para crear las tablas.

### 3. Ejecutar Script SQL

Usa el **asistente visual** en la aplicación o ejecuta manualmente el archivo **`/SETUP_DATABASE.sql`** en el SQL Editor de Supabase.

El script crea:
- ✅ Tabla `users` con campos necesarios
- ✅ Tabla `kv_store_0c8a700a` para datos del sistema
- ✅ Índices para mejor rendimiento
- ✅ Políticas de seguridad (RLS)
- ✅ Usuario administrador inicial

---

## 👤 Usuarios y Roles

### Roles Disponibles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Administrador** | Control total del sistema | Todo |
| **Usuario** | Operación diaria | Ver, crear, editar productos |
| **Contabilidad** | Maite y Berta - Sistema especial | Sistema contable separado |
| **Coordinador** | Coordina departamento | Gestión de su área |

### Usuario Inicial

Después de ejecutar el script SQL:

```
Email:       jorge@centromaster.com
Password:    123456
Rol:         Administrador
Empresa:     AMS
```

⚠️ **Importante:** Cambia la contraseña después del primer login.

### Crear Nuevos Usuarios

1. **Como Administrador:**
   - Ve a Departamentos → Empleados
   - Invita nuevos usuarios

2. **Registro Público:**
   - Los usuarios pueden registrarse desde la pantalla de login
   - Click en "Regístrate aquí"
   - Llenar formulario y crear cuenta

---

## 📊 Empresas Configuradas

El sistema gestiona inventario para 4 empresas:

| Empresa | Nombre Completo | Descripción |
|---------|-----------------|-------------|
| **AMS** | AMS | Empresa principal |
| **CEM** | CEM | Segunda empresa |
| **RUGH** | RUGH | Tercera empresa |
| **SADAF** | SADAF | Cuarta empresa |

Cada empresa tiene:
- ✅ Productos independientes
- ✅ Categorías personalizadas
- ✅ Proveedores propios
- ✅ Almacenes separados
- ✅ Reportes individuales

---

## 📱 Uso del Sistema

### Panel Principal

1. **Dashboard**
   - Resumen general del inventario
   - Gráficos de tendencias
   - Productos con stock bajo
   - Estadísticas en tiempo real

2. **Inventario**
   - Lista completa de productos
   - Búsqueda y filtros
   - Edición rápida
   - Códigos QR

3. **Categorías**
   - Gestión de categorías
   - Crear, editar, eliminar
   - Asignación de productos

4. **Proveedores**
   - Base de datos de proveedores
   - Información de contacto
   - Historial de pedidos

5. **Reportes**
   - Reportes detallados
   - Exportación a PDF/Excel
   - Análisis de tendencias

6. **Departamentos**
   - Gestión de empleados
   - Asignación de roles
   - Permisos por departamento

---

## 🔐 Seguridad

### Autenticación
- ✅ Sistema de login seguro
- ✅ Validación de credenciales contra Supabase
- ✅ Sesiones persistentes
- ✅ Recuperación de contraseña

### Autorización
- ✅ Control de acceso basado en roles
- ✅ Permisos granulares por módulo
- ✅ Restricciones a nivel de empresa
- ✅ Auditoría de acciones

### Datos
- ✅ Row Level Security (RLS) en Supabase
- ✅ Validación de datos en frontend y backend
- ✅ Encriptación en tránsito (HTTPS)
- ⚠️ **Nota:** Contraseñas en texto plano para desarrollo. **Implementar hashing para producción.**

---

## 🆘 Solución de Problemas

### Error: "Could not find table users"

**Causa:** La tabla no existe en Supabase  
**Solución:** Ver **[LEEME_PRIMERO.md](./LEEME_PRIMERO.md)**

### Error: "Contraseña incorrecta"

**Solución:**
```sql
UPDATE public.users 
SET password = '123456' 
WHERE email = 'jorge@centromaster.com';
```

### Error: "No se puede conectar a Supabase"

**Verifica:**
1. Conexión a internet
2. Configuración en `/utils/supabase/info`
3. Estado del proyecto en Supabase Dashboard

### El sistema está lento

**Optimizaciones:**
1. Limpia caché del navegador (Ctrl+Shift+R)
2. Verifica red en Supabase (Dashboard → Database → Performance)
3. Revisa índices en la tabla users

---

## 📚 Documentación Adicional

| Archivo | Descripción |
|---------|-------------|
| **[LEEME_PRIMERO.md](./LEEME_PRIMERO.md)** | Configuración rápida en 2 minutos |
| **[INSTRUCCIONES_VISUALES.md](./INSTRUCCIONES_VISUALES.md)** | Guía paso a paso con diagramas |
| **[SOLUCION_ERROR_TABLA_USERS.md](./SOLUCION_ERROR_TABLA_USERS.md)** | Solución completa de errores |
| **[SETUP_DATABASE.sql](./SETUP_DATABASE.sql)** | Script SQL completo |
| **[RESUMEN_SOLUCION.md](./RESUMEN_SOLUCION.md)** | Resumen técnico |
| **[CAMBIOS_SISTEMA_REGISTRO.md](./CAMBIOS_SISTEMA_REGISTRO.md)** | Cambios recientes |

---

## 🚀 Roadmap

### Próximas Características

- [ ] Hashing de contraseñas con bcrypt
- [ ] Autenticación de dos factores (2FA)
- [ ] Notificaciones por email
- [ ] Exportación avanzada de reportes
- [ ] App móvil nativa
- [ ] Integración con ERPs
- [ ] Sistema de backups automáticos
- [ ] Modo offline completo

---

## 🤝 Contribución

Este es un proyecto privado de Centro Master. Para contribuir:

1. Clona el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Haz tus cambios
4. Commit (`git commit -m 'Agregar nueva funcionalidad'`)
5. Push (`git push origin feature/nueva-funcionalidad`)
6. Abre un Pull Request

---

## 📄 Licencia

Copyright © 2026 Centro Master. Todos los derechos reservados.

---

## 📞 Soporte

Para soporte técnico:

1. **Consulta la documentación** en los archivos MD
2. **Revisa la consola** del navegador (F12)
3. **Verifica Supabase** Dashboard → Logs
4. **Contacta al administrador** del sistema

---

## ✅ Checklist de Inicio

Antes de usar el sistema:

- [ ] He leído **LEEME_PRIMERO.md**
- [ ] He configurado Supabase
- [ ] He ejecutado el script SQL
- [ ] He verificado que la tabla `users` existe
- [ ] He iniciado sesión correctamente
- [ ] He cambiado la contraseña por defecto
- [ ] He invitado a otros usuarios
- [ ] He explorado el dashboard
- [ ] He creado mi primer producto
- [ ] ✅ **Sistema listo para producción**

---

## 🎉 ¡Gracias por usar nuestro sistema!

**Versión:** 2.0.0  
**Última actualización:** 20 de febrero de 2026  
**Desarrollado por:** Centro Master - Departamento de Informática  
**Mantenido por:** Jorge (jorge@centromaster.com)

---

**🌟 Si tienes alguna pregunta, no dudes en consultar la documentación o contactar al equipo de soporte.**
