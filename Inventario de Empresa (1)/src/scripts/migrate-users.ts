/**
 * Script de migración de usuarios a Supabase
 * 
 * Este script crea las cuentas iniciales de empleados en Supabase
 * Ejecutar una sola vez para poblar la base de datos
 */

import { saveUser } from "../app/utils/api";

// Usuarios iniciales del sistema con sus datos completos
const initialUsers = [
  {
    name: "Jorge",
    email: "jorge@centromaster.com",
    password: "123456", // En producción, usar contraseñas seguras
    company: "AMS",
    role: "administrador",
    department: "Informática",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Maite",
    email: "maite@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "contable",
    department: "Contabilidad",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Berta",
    email: "berta@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "contable",
    department: "Contabilidad",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Yeray",
    email: "yeray@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "coordinador",
    department: "Mantenimiento",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Borja",
    email: "borja@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "coordinador",
    department: "Mantenimiento",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Nara",
    email: "nara@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "usuario",
    department: "Secretaría",
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

/**
 * Función principal de migración
 */
export async function migrateUsers() {
  console.log("🚀 Iniciando migración de usuarios a Supabase...");
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const user of initialUsers) {
    try {
      console.log(`📝 Creando usuario: ${user.name} (${user.email})...`);
      await saveUser(user);
      console.log(`✅ Usuario ${user.name} creado exitosamente`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error al crear usuario ${user.name}:`, error);
      errorCount++;
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log(`✅ Usuarios creados exitosamente: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log("=".repeat(50));
  
  if (successCount === initialUsers.length) {
    console.log("🎉 ¡Migración completada con éxito!");
  } else {
    console.log("⚠️ Migración completada con algunos errores");
  }
}

/**
 * Datos de usuarios para referencia rápida
 */
export const getUserCredentials = () => {
  return initialUsers.map(user => ({
    email: user.email,
    password: user.password,
    role: user.role,
    name: user.name,
  }));
};

// Si se ejecuta directamente, correr la migración
if (typeof window === "undefined") {
  // Modo Node.js
  migrateUsers().catch(console.error);
}