# Sistema de Permisos - Documentación

## Descripción General

El sistema de gestión de roles y permisos permite controlar el acceso a módulos, operaciones, funcionalidades y datos según el rol del usuario. Los permisos se pueden modificar dinámicamente desde la interfaz de **Gestión de Roles**.

## Roles Disponibles

### 1. **Administrador** (`administrador`)
- Acceso completo a todos los módulos del sistema
- Puede realizar todas las operaciones CRUD
- Acceso a configuración y gestión de roles
- Acceso a todos los datos financieros y sensibles

### 2. **Contabilidad** (`contable`)
- Acceso al sistema de contabilidad
- Gestión de datos financieros
- Creación y gestión de pedidos
- Sin acceso a gestión de empleados ni configuración

### 3. **Empleado** (`empleado` / `coordinador`)
- Gestión de inventario y productos
- Operaciones CRUD en productos
- Movimiento de unidades y gestión de stock
- Sin acceso a datos financieros sensibles

### 4. **Usuario** (`usuario`)
- Solo visualización de productos
- Acceso limitado a reportes y estadísticas
- Puede escanear códigos QR
- Sin permisos de edición o eliminación

## Archivos del Sistema

### `/src/app/utils/permissions.ts`
Archivo central que gestiona todos los permisos:

**Funciones principales:**
- `getStoredPermissions()`: Obtiene los permisos guardados desde localStorage
- `hasModuleAccess(userRole, moduleName)`: Verifica acceso a un módulo
- `hasCrudPermission(userRole, operationName)`: Verifica permisos CRUD
- `hasFeatureAccess(userRole, featureName)`: Verifica funcionalidades especiales
- `hasDataAccess(userRole, dataType)`: Verifica acceso a datos sensibles
- `getRolePermissions(userRole)`: Obtiene todos los permisos de un rol

### `/src/app/hooks/usePermissions.ts`
Hook personalizado para facilitar la verificación de permisos:

**Funciones disponibles:**
```typescript
const permissions = usePermissions(userRole);

// Verificaciones generales
permissions.canAccessModule("Gestión de Inventario")
permissions.canPerformCrud("Crear Productos")
permissions.canUseFeature("Exportar a Excel")
permissions.canAccessData("Datos de Facturación")

// Verificaciones específicas
permissions.canCreateProducts()
permissions.canEditProducts()
permissions.canDeleteProducts()
permissions.canManageStock()
permissions.canExportExcel()
permissions.canGeneratePDF()
```

### `/src/app/components/RoleManagementView.tsx`
Interfaz de usuario para gestionar los permisos de cada rol.

## Cómo Usar el Sistema

### 1. Importar las funciones de permisos

```typescript
import { hasModuleAccess, hasCrudPermission } from "@/app/utils/permissions";
```

### 2. Usar el hook personalizado (Recomendado)

```typescript
import { usePermissions } from "@/app/hooks/usePermissions";

function MiComponente({ userRole }: { userRole: string }) {
  const permissions = usePermissions(userRole);

  // Verificar si puede crear productos
  if (permissions.canCreateProducts()) {
    // Mostrar botón de crear
  }

  // Verificar si puede acceder a inventario
  if (permissions.canAccessInventory()) {
    // Mostrar sección de inventario
  }
}
```

### 3. Ejemplo de restricción de botones

```typescript
function InventoryView({ userRole }: { userRole: string }) {
  const permissions = usePermissions(userRole);

  return (
    <div>
      {/* Botón solo visible si tiene permiso */}
      {permissions.canCreateProducts() && (
        <button onClick={handleCreateProduct}>
          Crear Producto
        </button>
      )}

      {/* Botón deshabilitado si no tiene permiso */}
      <button 
        onClick={handleDeleteProduct}
        disabled={!permissions.canDeleteProducts()}
      >
        Eliminar Producto
      </button>

      {/* Mostrar precios solo si tiene permiso */}
      {permissions.canViewPurchasePrices() && (
        <div>Precio de compra: {product.price}</div>
      )}
    </div>
  );
}
```

### 4. Ejemplo de restricción de rutas/vistas

```typescript
function App({ currentUser }) {
  const permissions = usePermissions(currentUser?.role);

  return (
    <div>
      {/* Solo mostrar módulo si tiene acceso */}
      {permissions.canAccessModule("Gestión de Empleados") && (
        <EmployeesView />
      )}

      {/* Restringir configuración */}
      {permissions.canAccessModule("Configuración del Sistema") && (
        <SettingsView />
      )}
    </div>
  );
}
```

## Tablas de Permisos

### Tabla 1: Acceso a Módulos del Sistema
Controla qué módulos puede ver cada rol:
- Dashboard
- Gestión de Inventario
- Sistema de Contabilidad
- Gestión de Productos
- Gestión de Categorías
- Gestión de Proveedores
- Gestión de Clientes
- Gestión de Empleados
- Gestión de Departamentos
- Reportes y Estadísticas
- Configuración del Sistema
- Gestión de Roles

### Tabla 2: Permisos de Operaciones CRUD
Controla qué operaciones puede realizar cada rol:
- Crear Productos
- Editar Productos
- Eliminar Productos
- Ver Productos
- Crear Pedidos
- Modificar Pedidos
- Cancelar Pedidos
- Ver Historial Completo
- Gestionar Stock
- Mover Unidades
- Eliminar Unidades
- Restaurar desde Papelera

### Tabla 3: Acceso a Funcionalidades Especiales
Controla funcionalidades específicas:
- Acceso a Contabilidad
- Cambiar entre Sistemas
- Generar PDFs de Pedidos
- Exportar a Excel
- Importar Datos Masivos
- Escanear Códigos QR
- Ver Precios de Compra
- Ver Precios de Venta
- Modificar Configuración
- Gestionar Usuarios
- Cambiar Posición Sidebar
- Ver Ayuda/Soporte

### Tabla 4: Acceso a Datos Financieros y Sensibles
Controla el acceso a información confidencial:
- Inventario de Compras
- Inventario de Ventas
- Datos de Facturación
- Descuentos Aplicados
- Márgenes de Beneficio
- Información de Proveedores
- Información de Clientes
- Salarios de Empleados
- Datos de Departamentos
- Histórico Financiero
- Ubicaciones y Almacenes
- Números de Serie/SKU

## Comportamiento al Desmarcar Checkboxes

### ✅ Checkbox Marcado (Permiso Activo)
- El rol **TIENE** acceso a ese módulo/operación/funcionalidad/dato
- Los usuarios con ese rol pueden realizar la acción
- Se muestra el contenido asociado en la interfaz

### ❌ Checkbox Desmarcado (Permiso Eliminado)
- El rol **NO TIENE** acceso
- Se bloquea el acceso a ese módulo/operación/funcionalidad/dato
- Los botones/opciones asociados se ocultan o deshabilitan
- Si un usuario intenta acceder, se le debe mostrar un mensaje de error

### Ejemplo de Flujo

1. **Estado Inicial**: Empleado tiene marcado "Crear Productos" ✅
2. **Acción**: Administrador desmarca el checkbox
3. **Notificación**: Toast muestra "Permiso eliminado - El rol Empleado ya no tiene acceso a operación: Crear Productos"
4. **Efecto**: Se marca como cambio pendiente
5. **Guardar**: Al hacer clic en "Guardar Cambios", se persiste en localStorage
6. **Resultado**: Todos los empleados pierden el botón "Crear Producto" en su interfaz

## Persistencia de Datos

Los permisos se guardan en **localStorage** con las siguientes claves:
- `rolePermissions_moduleAccess`
- `rolePermissions_crudPermissions`
- `rolePermissions_specialFeatures`
- `rolePermissions_financialAccess`

### Cargar Permisos
```typescript
const permissions = getStoredPermissions();
console.log(permissions.moduleAccess);
console.log(permissions.crudPermissions);
```

### Verificar Permiso
```typescript
// Por módulo
if (hasModuleAccess("empleado", "Gestión de Inventario")) {
  // El empleado puede acceder al inventario
}

// Por operación CRUD
if (hasCrudPermission("usuario", "Crear Productos")) {
  // El usuario puede crear productos
}

// Por funcionalidad
if (hasFeatureAccess("contable", "Exportar a Excel")) {
  // El contable puede exportar a Excel
}

// Por tipo de dato
if (hasDataAccess("administrador", "Salarios de Empleados")) {
  // El administrador puede ver salarios
}
```

## Mejores Prácticas

### 1. Siempre verificar permisos antes de mostrar UI
```typescript
// ❌ MAL
<button onClick={deleteProduct}>Eliminar</button>

// ✅ BIEN
{permissions.canDeleteProducts() && (
  <button onClick={deleteProduct}>Eliminar</button>
)}
```

### 2. Mostrar mensajes informativos cuando no hay permisos
```typescript
{!permissions.canAccessModule("Gestión de Empleados") && (
  <div className="alert">
    No tienes permisos para acceder a esta sección
  </div>
)}
```

### 3. Deshabilitar en lugar de ocultar (cuando sea apropiado)
```typescript
<button 
  onClick={handleAction}
  disabled={!permissions.canPerformAction()}
  title={!permissions.canPerformAction() ? "No tienes permisos" : ""}
>
  Acción
</button>
```

### 4. Verificar permisos tanto en el frontend como en el backend
El sistema actual solo verifica en frontend. En producción, **siempre** debes validar permisos también en el servidor.

## Integración con Componentes Existentes

Para integrar el sistema de permisos en componentes existentes, necesitas:

1. Recibir el rol del usuario como prop
2. Usar el hook `usePermissions`
3. Condicionar la renderización según los permisos

```typescript
interface ComponentProps {
  userRole: string;
  // ... otras props
}

export function MyComponent({ userRole }: ComponentProps) {
  const permissions = usePermissions(userRole);
  
  return (
    <div>
      {permissions.can("module", "Gestión de Productos") && (
        <ProductsSection />
      )}
    </div>
  );
}
```

## Notificaciones Toast

El sistema muestra notificaciones automáticas:

### Permiso Agregado (✅)
```
Permiso agregado
El rol "Empleado" ahora tiene acceso a módulo: "Gestión de Productos"
```

### Permiso Eliminado (⚠️)
```
Permiso eliminado
El rol "Usuario" ya no tiene acceso a operación: "Crear Productos"
```

### Cambios Guardados (✅)
```
Permisos guardados correctamente
Los cambios en la gestión de roles se han aplicado exitosamente.
Los permisos están ahora activos para todos los usuarios según su rol.
```

## Troubleshooting

### Los cambios no se aplican
- Asegúrate de hacer clic en "Guardar Cambios"
- Verifica que los permisos se guarden en localStorage
- Recarga la página para cargar los nuevos permisos

### Los permisos no se verifican correctamente
- Verifica que estés pasando el rol correcto
- Asegúrate de usar los nombres exactos de módulos/operaciones
- Los nombres son case-insensitive pero deben coincidir

### Un rol no tiene ningún permiso
- Verifica que al menos tenga acceso al Dashboard
- Los roles sin permisos no podrán usar la aplicación
- Siempre mantén permisos mínimos de visualización

## Soporte

Para más información o problemas, contacta al administrador del sistema en:
- **Email**: soporte@centromaster.com
- **Gestión de Roles**: Accesible solo para Administradores en el menú principal
