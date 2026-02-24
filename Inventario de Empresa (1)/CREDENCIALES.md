# 🔐 Credenciales de Usuarios del Sistema

## 📋 Lista de Usuarios Migrados a Supabase

Todos los usuarios tienen la **contraseña temporal**: `123456`

⚠️ **IMPORTANTE**: Cambiar estas contraseñas después del primer acceso por seguridad.

---

### 👨‍💼 **ADMINISTRADORES**

| Nombre | Email | Rol | Departamento | Permisos |
|--------|-------|-----|--------------|----------|
| **Jorge** | jorge@centromaster.com | Administrador | Informática | Acceso completo al sistema |

---

### 🧮 **CONTABLES**

| Nombre | Email | Rol | Departamento | Permisos |
|--------|-------|-----|--------------|----------|
| **Maite** | maite@centromaster.com | Contable | Contabilidad | Sistema de contabilidad |
| **Berta** | berta@centromaster.com | Contable | Contabilidad | Sistema de contabilidad |

---

### 👨‍🔧 **COORDINADORES**

| Nombre | Email | Rol | Departamento | Permisos |
|--------|-------|-----|--------------|----------|
| **Yeray** | yeray@centromaster.com | Coordinador | Mantenimiento | Gestión de inventario |
| **Borja** | borja@centromaster.com | Coordinador | Mantenimiento | Gestión de inventario |

---

### 👤 **USUARIOS**

| Nombre | Email | Rol | Departamento | Permisos |
|--------|-------|-----|--------------|----------|
| **Nara** | nara@centromaster.com | Usuario | Secretaría | Permisos limitados |
| **Daniela** | daniela@centromaster.com | Usuario | Secretaría | Permisos limitados |

---

## 🚀 Proceso de Migración

### Opción 1: Desde la Interfaz Web (Recomendado)

1. Inicia sesión como **administrador** (jorge@centromaster.com / 123456)
2. Ve al menú lateral → **"Migración de Datos"**
3. Haz clic en **"Iniciar Migración"**
4. Espera a que se complete el proceso
5. Revisa los resultados

### Opción 2: Desde el Script

```bash
# Ejecutar el script de migración
npm run migrate-users
```

---

## 📊 Configuración de Roles y Permisos

### 🔴 **Administrador**
- ✅ Acceso completo a todos los módulos
- ✅ Gestión de usuarios
- ✅ Gestión de roles y permisos
- ✅ Configuración del sistema
- ✅ Acceso a contabilidad
- ✅ Gestión de departamentos

### 🟢 **Contable**
- ✅ Sistema de contabilidad (compras/ventas)
- ✅ Inventario de facturas
- ✅ Gestión de clientes
- ❌ NO acceso al sistema de inventario general

### 🔵 **Coordinador**
- ✅ Dashboard
- ✅ Reportes y estadísticas
- ✅ Gestión de inventario (crear, editar productos)
- ✅ Gestión de pedidos
- ✅ Gestión de proveedores
- ✅ Gestión de categorías
- ❌ NO acceso a departamentos
- ❌ NO acceso a gestión de roles

### ⚪ **Usuario**
- ✅ Dashboard (solo lectura)
- ✅ Reportes (solo lectura)
- ✅ Ver inventario (sin editar)
- ❌ NO puede crear/editar productos
- ❌ NO acceso a configuraciones

---

## 🏢 Empresas Configuradas

- **AMS** (Predeterminada)
- **CEM**
- **RUGH**
- **SADAF**

Cada empresa tiene inventarios separados e independientes.

---

## 🔒 Seguridad

### ⚠️ Recomendaciones Importantes:

1. **Cambiar contraseñas** inmediatamente después de la migración
2. Usar contraseñas seguras (mínimo 8 caracteres, mayúsculas, minúsculas, números)
3. No compartir credenciales entre usuarios
4. Revisar y ajustar permisos según necesidades específicas
5. Monitorear actividad de usuarios administradores

### 🔐 Cambiar Contraseña:

1. Inicia sesión con tu usuario
2. Ve a **"Mi Perfil"** o **"Configuración"**
3. Selecciona **"Cambiar Contraseña"**
4. Ingresa tu contraseña actual (123456)
5. Ingresa y confirma tu nueva contraseña
6. Guarda los cambios

---

## 📞 Soporte

Si tienes problemas con las credenciales o necesitas restablecer una contraseña:

1. Contacta al administrador del sistema (jorge@centromaster.com)
2. O utiliza la opción **"¿Olvidaste tu contraseña?"** en la pantalla de login

---

## 📝 Notas Adicionales

- **Fecha de creación**: 20 de febrero de 2026
- **Sistema**: Gestión de Inventario Empresarial
- **Base de datos**: Supabase
- **Versión**: 1.0.0

---

## ✅ Checklist de Verificación Post-Migración

- [ ] Todos los usuarios pueden iniciar sesión
- [ ] Los roles están asignados correctamente
- [ ] Los permisos funcionan según lo esperado
- [ ] Las contraseñas han sido cambiadas
- [ ] Los usuarios están asignados a sus departamentos
- [ ] La sincronización con Supabase funciona
- [ ] Los datos de empleados coinciden con la lista de usuarios
