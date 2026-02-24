import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from "/utils/supabase/info";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== GESTIÓN DE USUARIOS ====================

export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
  
  return data || [];
}

export async function createUser(userData: any) {
  // Verificar si el email ya existe
  const { data: existingUsers } = await supabase
    .from('users')
    .select('email')
    .eq('email', userData.email);
  
  if (existingUsers && existingUsers.length > 0) {
    throw new Error('El correo electrónico ya está registrado');
  }
  
  const newUser = {
    name: userData.name,
    email: userData.email,
    password: userData.password, // En producción, hashear la contraseña
    company: userData.company || 'AMS',
    role: userData.role || 'usuario',
    department: userData.department || '',
    status: userData.status || 'active',
    created_at: new Date().toISOString(),
    is_active: true,
  };
  
  const { data, error } = await supabase
    .from('users')
    .insert([newUser])
    .select()
    .single();
  
  if (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
  
  return data;
}

export async function loginUser(email: string, password: string) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .limit(1);
    
    if (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: 'Error de conexión. Por favor, intenta de nuevo.'
      };
    }
    
    if (!users || users.length === 0) {
      return {
        success: false,
        error: 'Usuario no encontrado. Verifica tu correo electrónico.'
      };
    }
    
    const user = users[0];
    
    // Verificar contraseña (en producción, comparar hash)
    if (user.password !== password) {
      return {
        success: false,
        error: 'Contraseña incorrecta. Por favor, verifica tu contraseña.'
      };
    }
    
    // Verificar si el usuario está activo
    if (user.status === 'inactive' || !user.is_active) {
      return {
        success: false,
        error: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
      };
    }
    
    // Login exitoso - no devolver la contraseña
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Error inesperado en login:', error);
    return {
      success: false,
      error: 'Error inesperado al iniciar sesión. Por favor, intenta de nuevo.'
    };
  }
}

export async function updateUser(userId: string, userData: any) {
  // Convertir camelCase a snake_case para la base de datos
  const dbData: any = {};
  
  if (userData.name !== undefined) dbData.name = userData.name;
  if (userData.email !== undefined) dbData.email = userData.email;
  if (userData.company !== undefined) dbData.company = userData.company;
  if (userData.role !== undefined) dbData.role = userData.role;
  if (userData.department !== undefined) dbData.department = userData.department;
  if (userData.status !== undefined) dbData.status = userData.status;
  if (userData.password !== undefined) dbData.password = userData.password;
  
  // Convertir isActive a is_active
  if (userData.isActive !== undefined) dbData.is_active = userData.isActive;
  
  const { data, error } = await supabase
    .from('users')
    .update(dbData)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
  
  return data;
}

export async function deleteUser(userId: string) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  
  if (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
  
  return { success: true };
}

// ==================== GESTIÓN DE DATOS (KV Store) ====================

// Nombre de la tabla KV Store (con sufijo único de Figma Make)
const KV_STORE_TABLE = 'kv_store_0c8a700a';

export async function getKVData(key: string) {
  const { data, error } = await supabase
    .from(KV_STORE_TABLE)
    .select('value')
    .eq('key', key)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró el registro, devolver null
      return null;
    }
    console.error(`Error al obtener ${key}:`, error);
    throw error;
  }
  
  return data?.value;
}

export async function setKVData(key: string, value: any) {
  const { error } = await supabase
    .from(KV_STORE_TABLE)
    .upsert({
      key,
      value
    });
  
  if (error) {
    console.error(`Error al guardar ${key}:`, error);
    throw error;
  }
  
  return { success: true };
}

// ==================== GESTIÓN DE PRODUCTOS ====================

export async function getProducts(company: string) {
  return await getKVData(`products_${company}`) || [];
}

export async function saveProducts(company: string, products: any[]) {
  return await setKVData(`products_${company}`, products);
}

export async function getDeletedProducts(company: string) {
  return await getKVData(`deleted_products_${company}`) || [];
}

export async function saveDeletedProducts(company: string, deletedProducts: any[]) {
  return await setKVData(`deleted_products_${company}`, deletedProducts);
}

// ==================== GESTIÓN DE CATEGORÍAS ====================

export async function getCategories(company: string) {
  return await getKVData(`categories_${company}`) || [];
}

export async function saveCategories(company: string, categories: any[]) {
  return await setKVData(`categories_${company}`, categories);
}

// ==================== GESTIÓN DE PROVEEDORES ====================

export async function getSuppliers(company: string) {
  return await getKVData(`suppliers_${company}`) || [];
}

export async function saveSuppliers(company: string, suppliers: any[]) {
  return await setKVData(`suppliers_${company}`, suppliers);
}

// ==================== GESTIÓN DE EMPLEADOS ====================

export async function getEmployees() {
  return await getKVData('employees') || [];
}

export async function saveEmployees(employees: any[]) {
  return await setKVData('employees', employees);
}

// ==================== GESTIÓN DE ALMACENES ====================

export async function getWarehouses(company: string) {
  return await getKVData(`warehouses_${company}`) || [];
}

export async function saveWarehouses(company: string, warehouses: any[]) {
  return await setKVData(`warehouses_${company}`, warehouses);
}

// ==================== CONFIGURACIÓN DE EMPRESA ====================

export async function getSelectedCompany() {
  return await getKVData('selectedCompany') || 'AMS';
}

export async function saveSelectedCompany(company: string) {
  return await setKVData('selectedCompany', company);
}

// ==================== GESTIÓN DE ROLES Y PERMISOS ====================

export async function getRolePermissions() {
  const [moduleAccess, crudPermissions, specialFeatures, financialAccess, customRoles] = await Promise.all([
    getKVData('rolePermissions_moduleAccess'),
    getKVData('rolePermissions_crudPermissions'),
    getKVData('rolePermissions_specialFeatures'),
    getKVData('rolePermissions_financialAccess'),
    getKVData('rolePermissions_customRoles'),
  ]);

  return {
    moduleAccess: moduleAccess || null,
    crudPermissions: crudPermissions || null,
    specialFeatures: specialFeatures || null,
    financialAccess: financialAccess || null,
    customRoles: customRoles || null,
  };
}

export async function saveModuleAccess(data: any) {
  return await setKVData('rolePermissions_moduleAccess', data);
}

export async function saveCrudPermissions(data: any) {
  return await setKVData('rolePermissions_crudPermissions', data);
}

export async function saveSpecialFeatures(data: any) {
  return await setKVData('rolePermissions_specialFeatures', data);
}

export async function saveFinancialAccess(data: any) {
  return await setKVData('rolePermissions_financialAccess', data);
}

export async function saveCustomRoles(data: any) {
  return await setKVData('rolePermissions_customRoles', data);
}

// ==================== SINCRONIZACIÓN COMPLETA ====================

export async function syncAll() {
  const companies = ['AMS', 'CEM', 'RUGH', 'SADAF'];
  
  const [rolePermissions, employees, selectedCompany, ...companyData] = await Promise.all([
    getRolePermissions(),
    getEmployees(),
    getSelectedCompany(),
    ...companies.flatMap(company => [
      getProducts(company),
      getCategories(company),
      getSuppliers(company),
      getWarehouses(company),
    ]),
  ]);

  const response: any = {
    rolePermissions,
    employees,
    selectedCompany,
  };

  // Organizar datos por empresa
  companies.forEach((company, index) => {
    const baseIndex = index * 4;
    response[company] = {
      products: companyData[baseIndex] || [],
      categories: companyData[baseIndex + 1] || [],
      suppliers: companyData[baseIndex + 2] || [],
      warehouses: companyData[baseIndex + 3] || [],
    };
  });

  return response;
}