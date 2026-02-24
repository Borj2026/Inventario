// Utilidades para gestión de permisos con Supabase
import * as api from "./api";

interface ModulePermission {
  module: string;
  [key: string]: string | boolean;
}

interface CrudPermission {
  operation: string;
  [key: string]: string | boolean;
}

interface FeaturePermission {
  feature: string;
  [key: string]: string | boolean;
}

interface DataPermission {
  data: string;
  [key: string]: string | boolean;
}

interface PermissionsData {
  moduleAccess: ModulePermission[];
  crudPermissions: CrudPermission[];
  specialFeatures: FeaturePermission[];
  financialAccess: DataPermission[];
}

// Cache en memoria para evitar múltiples llamadas a la API
let permissionsCache: {
  moduleAccess: ModulePermission[] | null;
  crudPermissions: CrudPermission[] | null;
  specialFeatures: FeaturePermission[] | null;
  financialAccess: DataPermission[] | null;
  lastFetch: number;
} = {
  moduleAccess: null,
  crudPermissions: null,
  specialFeatures: null,
  financialAccess: null,
  lastFetch: 0,
};

// Cache síncrono: se rellena cuando se cargan los permisos
let syncPermissionsData: PermissionsData | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Mapeo de roles en español a IDs de roles
const roleIdMap: Record<string, string> = {
  "administrador": "admin",
  "contable": "accounting",
  "contabilidad": "accounting", // Mantener compatibilidad con versiones anteriores
  "coordinador": "coordinator",
  "usuario": "user"
};

/**
 * Carga los permisos desde Supabase (con caché)
 */
async function loadPermissions() {
  const now = Date.now();
  
  // Usar caché si es reciente
  if (permissionsCache.lastFetch && now - permissionsCache.lastFetch < CACHE_DURATION) {
    return permissionsCache;
  }
  
  try {
    const data = await api.getRolePermissions();
    
    const loaded = {
      moduleAccess: data.moduleAccess || getDefaultModuleAccessData(),
      crudPermissions: data.crudPermissions || getDefaultCrudPermissionsData(),
      specialFeatures: data.specialFeatures || getDefaultSpecialFeaturesData(),
      financialAccess: data.financialAccess || getDefaultFinancialAccessData(),
      lastFetch: now,
    };

    permissionsCache = loaded;

    // Actualizar el cache síncrono también
    syncPermissionsData = {
      moduleAccess: loaded.moduleAccess,
      crudPermissions: loaded.crudPermissions,
      specialFeatures: loaded.specialFeatures,
      financialAccess: loaded.financialAccess,
    };
    
    return permissionsCache;
  } catch (error) {
    console.error("Error al cargar permisos desde Supabase:", error);
    
    const defaults = {
      moduleAccess: getDefaultModuleAccessData(),
      crudPermissions: getDefaultCrudPermissionsData(),
      specialFeatures: getDefaultSpecialFeaturesData(),
      financialAccess: getDefaultFinancialAccessData(),
    };

    // Actualizar el cache síncrono con los defaults
    syncPermissionsData = defaults;

    // Si falla, usar valores por defecto
    return {
      ...defaults,
      lastFetch: now,
    };
  }
}

/**
 * Carga y cachea permisos explícitamente (para uso en componentes)
 * Retorna los datos de permisos
 */
export async function preloadPermissions(): Promise<PermissionsData> {
  const data = await loadPermissions();
  return {
    moduleAccess: data.moduleAccess || getDefaultModuleAccessData(),
    crudPermissions: data.crudPermissions || getDefaultCrudPermissionsData(),
    specialFeatures: data.specialFeatures || getDefaultSpecialFeaturesData(),
    financialAccess: data.financialAccess || getDefaultFinancialAccessData(),
  };
}

/**
 * Obtiene los permisos del cache síncrono (retorna null si no se han cargado aún)
 */
export function getSyncPermissions(): PermissionsData | null {
  return syncPermissionsData;
}

/**
 * Verifica síncronamente si un rol tiene acceso a un módulo específico
 * (requiere que los permisos hayan sido precargados con preloadPermissions)
 */
export function hasModuleAccessSync(userRole: string, moduleName: string): boolean {
  const data = syncPermissionsData;
  if (!data) {
    // Si no hay datos cargados, usar defaults
    const defaults = getDefaultModuleAccessData();
    const roleId = roleIdMap[userRole.toLowerCase()] || userRole;
    const perm = defaults.find(m => m.module === moduleName);
    return perm ? perm[roleId] === true : false;
  }
  const roleId = roleIdMap[userRole.toLowerCase()] || userRole;
  const perm = data.moduleAccess.find(m => m.module === moduleName);
  return perm ? perm[roleId] === true : false;
}

/**
 * Verifica síncronamente si un rol tiene permiso para una operación CRUD
 */
export function hasCrudPermissionSync(userRole: string, operation: string): boolean {
  const data = syncPermissionsData;
  if (!data) {
    const defaults = getDefaultCrudPermissionsData();
    const roleId = roleIdMap[userRole.toLowerCase()] || userRole;
    const perm = defaults.find(c => c.operation === operation);
    return perm ? perm[roleId] === true : false;
  }
  const roleId = roleIdMap[userRole.toLowerCase()] || userRole;
  const perm = data.crudPermissions.find(c => c.operation === operation);
  return perm ? perm[roleId] === true : false;
}

/**
 * Verifica síncronamente si un rol tiene acceso a una característica especial
 */
export function hasFeatureAccessSync(userRole: string, featureName: string): boolean {
  const data = syncPermissionsData;
  if (!data) {
    const defaults = getDefaultSpecialFeaturesData();
    const roleId = roleIdMap[userRole.toLowerCase()] || userRole;
    const perm = defaults.find(f => f.feature === featureName);
    return perm ? perm[roleId] === true : false;
  }
  const roleId = roleIdMap[userRole.toLowerCase()] || userRole;
  const perm = data.specialFeatures.find(f => f.feature === featureName);
  return perm ? perm[roleId] === true : false;
}

/**
 * Verifica síncronamente si un rol tiene acceso a datos financieros específicos
 */
export function hasDataAccessSync(userRole: string, dataName: string): boolean {
  const data = syncPermissionsData;
  if (!data) {
    const defaults = getDefaultFinancialAccessData();
    const roleId = roleIdMap[userRole.toLowerCase()] || userRole;
    const perm = defaults.find(d => d.data === dataName);
    return perm ? perm[roleId] === true : false;
  }
  const roleId = roleIdMap[userRole.toLowerCase()] || userRole;
  const perm = data.financialAccess.find(d => d.data === dataName);
  return perm ? perm[roleId] === true : false;
}

/**
 * Verifica si un rol tiene acceso a un módulo específico (ASYNC)
 */
export async function hasModuleAccess(userRole: string, moduleName: string): Promise<boolean> {
  try {
    const permissions = await loadPermissions();
    const roleId = roleIdMap[userRole.toLowerCase()] || userRole;
    
    const modulePermission = permissions.moduleAccess?.find(m => m.module === moduleName);
    if (!modulePermission) return false;

    return modulePermission[roleId] === true;
  } catch (error) {
    console.error("Error al verificar permisos de módulo:", error);
    return false;
  }
}

/**
 * Verifica si un rol tiene permiso para una operación CRUD específica (ASYNC)
 */
export async function hasCrudPermission(userRole: string, operation: string): Promise<boolean> {
  try {
    const permissions = await loadPermissions();
    const roleId = roleIdMap[userRole.toLowerCase()] || userRole;
    
    const crudPermission = permissions.crudPermissions?.find(c => c.operation === operation);
    if (!crudPermission) return false;

    return crudPermission[roleId] === true;
  } catch (error) {
    console.error("Error al verificar permisos CRUD:", error);
    return false;
  }
}

/**
 * Verifica si un rol tiene acceso a una característica especial (ASYNC)
 */
export async function hasFeatureAccess(userRole: string, featureName: string): Promise<boolean> {
  try {
    const permissions = await loadPermissions();
    const roleId = roleIdMap[userRole.toLowerCase()] || userRole;
    
    const featurePermission = permissions.specialFeatures?.find(f => f.feature === featureName);
    if (!featurePermission) return false;

    return featurePermission[roleId] === true;
  } catch (error) {
    console.error("Error al verificar permisos de característica:", error);
    return false;
  }
}

/**
 * Verifica si un rol tiene acceso a datos financieros específicos (ASYNC)
 */
export async function hasDataAccess(userRole: string, dataName: string): Promise<boolean> {
  try {
    const permissions = await loadPermissions();
    const roleId = roleIdMap[userRole.toLowerCase()] || userRole;
    
    const dataPermission = permissions.financialAccess?.find(d => d.data === dataName);
    if (!dataPermission) return false;

    return dataPermission[roleId] === true;
  } catch (error) {
    console.error("Error al verificar permisos de datos:", error);
    return false;
  }
}

/**
 * Invalida el caché de permisos (útil después de cambiar permisos)
 */
export function invalidatePermissionsCache() {
  permissionsCache.lastFetch = 0;
  // No ponemos syncPermissionsData = null para evitar que los componentes
  // caigan en los defaults hardcodeados mientras se recarga. Los datos viejos
  // son mejores que los defaults durante el breve instante de recarga.
  // syncPermissionsData se actualizará automáticamente cuando loadPermissions() complete.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("permissions-updated"));
  }
}

// Funciones auxiliares para valores por defecto
function getDefaultModuleAccessData(): ModulePermission[] {
  return [
    { module: "Dashboard", admin: true, accounting: true, coordinator: true, user: true },
    { module: "Gestión de Inventario", admin: true, accounting: false, coordinator: true, user: false },
    { module: "Sistema de Contabilidad", admin: true, accounting: true, coordinator: false, user: false },
    { module: "Gestión de Productos", admin: true, accounting: false, coordinator: true, user: false },
    { module: "Gestión de Categorías", admin: true, accounting: true, coordinator: false, user: false },
    { module: "Gestión de Proveedores", admin: true, accounting: true, coordinator: false, user: false },
    { module: "Gestión de Clientes", admin: true, accounting: true, coordinator: false, user: false },
    { module: "Gestión de Departamentos", admin: true, accounting: true, coordinator: false, user: false },
    { module: "Reportes y Estadísticas", admin: true, accounting: true, coordinator: true, user: true },
    { module: "Gestión de Roles", admin: true, accounting: false, coordinator: false, user: false },
  ];
}

function getDefaultCrudPermissionsData(): CrudPermission[] {
  return [
    { operation: "Crear Productos", admin: true, accounting: false, coordinator: true, user: false },
    { operation: "Editar Productos", admin: true, accounting: false, coordinator: true, user: false },
    { operation: "Eliminar Productos", admin: true, accounting: false, coordinator: false, user: false },
    { operation: "Ver Productos", admin: true, accounting: true, coordinator: true, user: true },
    { operation: "Crear Pedidos", admin: true, accounting: true, coordinator: true, user: false },
    { operation: "Modificar Pedidos", admin: true, accounting: true, coordinator: false, user: false },
    { operation: "Cancelar Pedidos", admin: true, accounting: true, coordinator: false, user: false },
    { operation: "Ver Historial Completo", admin: true, accounting: true, coordinator: true, user: false },
    { operation: "Gestionar Stock", admin: true, accounting: false, coordinator: true, user: false },
    { operation: "Mover Unidades", admin: true, accounting: false, coordinator: true, user: false },
    { operation: "Eliminar Unidades", admin: true, accounting: false, coordinator: false, user: false },
    { operation: "Ver Papelera", admin: true, accounting: false, coordinator: true, user: false },
    { operation: "Restaurar desde Papelera", admin: true, accounting: false, coordinator: false, user: false },
    { operation: "Eliminar Permanentemente de Papelera", admin: true, accounting: false, coordinator: false, user: false },
  ];
}

function getDefaultSpecialFeaturesData(): FeaturePermission[] {
  return [
    { feature: "Acceso a Contabilidad", admin: true, accounting: true, coordinator: false, user: false },
    { feature: "Cambiar entre Sistemas", admin: true, accounting: false, coordinator: false, user: false },
    { feature: "Generar PDFs de Pedidos", admin: true, accounting: true, coordinator: true, user: false },
    { feature: "Exportar a Excel", admin: true, accounting: true, coordinator: true, user: false },
    { feature: "Importar Datos Masivos", admin: true, accounting: false, coordinator: false, user: false },
    { feature: "Escanear Códigos QR", admin: true, accounting: false, coordinator: true, user: true },
    { feature: "Ver Precios de Compra", admin: true, accounting: true, coordinator: false, user: false },
    { feature: "Ver Precios de Venta", admin: true, accounting: true, coordinator: true, user: true },
    { feature: "Modificar Configuración", admin: true, accounting: false, coordinator: false, user: false },
    { feature: "Gestionar Usuarios", admin: true, accounting: false, coordinator: false, user: false },
    { feature: "Cambiar Posición Sidebar", admin: true, accounting: true, coordinator: true, user: true },
    { feature: "Ver Ayuda/Soporte", admin: true, accounting: true, coordinator: true, user: true },
    { feature: "Editar Inventario Compras", admin: true, accounting: true, coordinator: true, user: false },
    { feature: "Eliminar Inventario Compras", admin: true, accounting: true, coordinator: false, user: false },
    { feature: "Editar Inventario Ventas", admin: true, accounting: true, coordinator: true, user: false },
    { feature: "Eliminar Inventario Ventas", admin: true, accounting: true, coordinator: false, user: false },
    { feature: "Editar Proveedores", admin: true, accounting: true, coordinator: true, user: false },
    { feature: "Eliminar Proveedores", admin: true, accounting: true, coordinator: false, user: false },
  ];
}

function getDefaultFinancialAccessData(): DataPermission[] {
  return [
    { data: "Inventario de Compras", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Inventario de Ventas", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Datos de Facturación", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Descuentos Aplicados", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Márgenes de Beneficio", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Información de Proveedores", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Información de Clientes", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Salarios de Empleados", admin: true, accounting: false, coordinator: false, user: false },
    { data: "Datos de Departamentos", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Histórico Financiero", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Ubicaciones y Almacenes", admin: true, accounting: true, coordinator: true, user: false },
    { data: "Números de Serie/SKU", admin: true, accounting: false, coordinator: true, user: false },
  ];
}