import { projectId, publicAnonKey } from "/utils/supabase/info";
import * as supabaseApi from './supabase';

// Exportar todas las funciones del módulo de Supabase
export const {
  // Usuarios
  getUsers,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  // Productos
  getProducts,
  saveProducts,
  getDeletedProducts,
  saveDeletedProducts,
  // Categorías
  getCategories,
  saveCategories,
  // Proveedores
  getSuppliers,
  saveSuppliers,
  // Empleados
  getEmployees,
  saveEmployees,
  // Almacenes
  getWarehouses,
  saveWarehouses,
  // Empresa
  getSelectedCompany,
  saveSelectedCompany,
  // Permisos
  getRolePermissions,
  saveModuleAccess,
  saveCrudPermissions,
  saveSpecialFeatures,
  saveFinancialAccess,
  saveCustomRoles,
  // Sincronización
  syncAll,
} = supabaseApi;

// Alias para compatibilidad con código existente
export const saveUser = createUser;

// Health check (mantener para compatibilidad)
export async function healthCheck() {
  try {
    await getUsers();
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', error };
  }
}