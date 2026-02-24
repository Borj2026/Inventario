# 🚀 Instrucciones de Migración de Usuarios a Supabase

## ✅ **ESTADO ACTUAL DEL SISTEMA**

### **Cambios Implementados**:

1. ✅ **Backend Hono actualizado** con todos los endpoints de usuarios:
   - `POST /users/login` - Autenticación
   - `GET /users` - Obtener todos los usuarios
   - `POST /users` - Crear nuevo usuario
   - `PUT /users/:id` - Actualizar usuario
   - `DELETE /users/:id` - Eliminar usuario

2. ✅ **Frontend actualizado** para usar autenticación con Supabase
   - Login sin código hardcodeado
   - Registro con guardado en Supabase
   - Detección dinámica de roles

3. ✅ **Herramienta de migración** creada y lista para usar

---

## 📋 **PASO A PASO PARA MIGRAR**

### **Opción 1: Migración desde la Interfaz (Recomendada)**

#### **Paso 1: Crear Cuenta Temporal de Admin**

Como ya no existen cuentas hardcodeadas, primero necesitas crear una cuenta de administrador temporal:

1. **Ir a la pantalla de Login**
2. **Clic en "Regístrate aquí"**
3. **Completar el formulario**:
   - Nombre: `Admin Temporal`
   - Email: `admin@centromaster.com`
   - Contraseña: `admin123`
   - Empresa: `AMS`
4. **Clic en "Registrarse"**

Esta cuenta será de tipo "usuario" por defecto, pero la usaremos solo para ejecutar la migración.

---

#### **Paso 2: Ejecutar Migración Manualmente**

Ya que la herramienta de migración solo es visible para administradores, vamos a ejecutar la migración desde la consola del navegador:

1. **Abrir la Consola del Navegador** (F12 o Ctrl+Shift+I)
2. **Ir a la pestaña "Console"**
3. **Copiar y pegar este código**:

\`\`\`javascript
// Script de migración de usuarios
const BASE_URL = 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-0c8a700a';
const API_KEY = 'YOUR_ANON_KEY';

const users = [
  {
    name: "Jorge",
    email: "jorge@centromaster.com",
    password: "123456",
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
  {
    name: "Daniela",
    email: "daniela@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "usuario",
    department: "Secretaría",
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

// Función para migrar usuarios
async function migrateUsers() {
  console.log('🚀 Iniciando migración de usuarios...');
  
  for (const user of users) {
    try {
      const response = await fetch(\`\${BASE_URL}/users\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${API_KEY}\`,
        },
        body: JSON.stringify(user),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log(\`✅ Usuario creado: \${user.name} (\${user.email})\`);
      } else {
        console.error(\`❌ Error al crear \${user.name}:\`, result.error);
      }
    } catch (error) {
      console.error(\`❌ Error al crear \${user.name}:\`, error);
    }
  }
  
  console.log('✅ Migración completada!');
}

// Ejecutar migración
migrateUsers();
\`\`\`

4. **Presionar Enter**
5. **Esperar a que se complete** (verás los logs en la consola)

---

#### **Paso 3: Verificar Migración**

1. **Cerrar sesión** (si estás logueado con admin temporal)
2. **Intentar iniciar sesión con Jorge**:
   - Email: `jorge@centromaster.com`
   - Contraseña: `123456`
3. **Si funciona**, ¡la migración fue exitosa! ✅

---

#### **Paso 4: Acceder a Gestión de Usuarios**

Ahora que Jorge es administrador:

1. **Iniciar sesión** como Jorge
2. **Ir al menú lateral** → **"Gestión de Usuarios"**
3. **Verificar** que los 7 usuarios aparezcan listados
4. **(Opcional)** **Eliminar** la cuenta temporal de admin

---

### **Opción 2: Migración Usando la Herramienta Visual**

Si ya tienes acceso como administrador (Jorge):

1. **Iniciar sesión** como Jorge (jorge@centromaster.com / 123456)
2. **Ir al menú lateral** → **"Migración de Datos"**
3. **Revisar** la lista de usuarios a migrar
4. **Clic en "Iniciar Migración"**
5. **Esperar** a que se complete
6. **Verificar** que todos tengan ✅ verde

---

## 🔒 **POST-MIGRACIÓN: Seguridad**

### **Tareas Importantes**:

1. ✅ **Cambiar contraseñas**:
   - Todas las cuentas tienen contraseña `123456`
   - Cambiar a contraseñas seguras INMEDIATAMENTE

2. ✅ **Eliminar cuenta temporal** (si la creaste):
   - Ir a "Gestión de Usuarios"
   - Buscar `admin@centromaster.com`
   - Eliminar cuenta

3. ✅ **Sincronizar empleados**:
   - Ir a "Departamentos"
   - Verificar que los empleados coincidan con los usuarios

4. ✅ **Probar permisos**:
   - Iniciar sesión con cada rol (usuario, coordinador, contable, admin)
   - Verificar que los permisos funcionen correctamente

---

## 👥 **USUARIOS MIGRADOS**

| Nombre | Email | Contraseña | Rol | Departamento |
|--------|-------|------------|-----|--------------|
| Jorge | jorge@centromaster.com | 123456 | Administrador | Informática |
| Maite | maite@centromaster.com | 123456 | Contable | Contabilidad |
| Berta | berta@centromaster.com | 123456 | Contable | Contabilidad |
| Yeray | yeray@centromaster.com | 123456 | Coordinador | Mantenimiento |
| Borja | borja@centromaster.com | 123456 | Coordinador | Mantenimiento |
| Nara | nara@centromaster.com | 123456 | Usuario | Secretaría |
| Daniela | daniela@centromaster.com | 123456 | Usuario | Secretaría |

---

## 🐛 **SOLUCIÓN DE PROBLEMAS**

### **Error: "Usuario no encontrado"**

**Causa**: La migración no se ejecutó o falló.

**Solución**:
1. Ejecutar el script de migración desde la consola
2. Verificar que la conexión a Supabase funcione
3. Revisar logs del backend en Supabase

---

### **Error: "El correo electrónico ya está registrado"**

**Causa**: Los usuarios ya existen en Supabase.

**Solución**:
1. ✅ Esto es normal si ya ejecutaste la migración
2. Simplemente inicia sesión con las credenciales existentes
3. No es necesario migrar de nuevo

---

### **No puedo acceder a "Migración de Datos"**

**Causa**: Tu cuenta no es administrador.

**Solución**:
1. Iniciar sesión con Jorge (jorge@centromaster.com)
2. O ejecutar la migración desde la consola del navegador

---

### **Login falla con "Credenciales incorrectas"**

**Causa**: El usuario no existe o la contraseña es incorrecta.

**Solución**:
1. Verificar que la migración se completó
2. Intentar con la contraseña `123456`
3. Revisar que el email esté correcto (sin espacios extra)

---

## 📊 **ARQUITECTURA DEL SISTEMA**

### **Flujo de Autenticación**:

\`\`\`
Usuario → Login → API (POST /users/login) → Supabase KV Store
                                ↓
                          Verificar contraseña
                                ↓
                          Devolver datos de usuario
                                ↓
                          Frontend actualiza estado
\`\`\`

### **Almacenamiento de Datos**:

- **Tabla**: `users` (en Supabase KV Store)
- **Estructura**:
  \`\`\`json
  {
    "id": "user_1708464000000_abc123",
    "name": "Jorge",
    "email": "jorge@centromaster.com",
    "password": "123456",
    "company": "AMS",
    "role": "administrador",
    "department": "Informática",
    "status": "active",
    "createdAt": "2026-02-20T10:00:00.000Z",
    "isActive": true
  }
  \`\`\`

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

Después de la migración, verifica:

- [ ] Puedo iniciar sesión con Jorge
- [ ] Puedo ver "Gestión de Usuarios" en el menú
- [ ] Los 7 usuarios aparecen en la lista
- [ ] Puedo cerrar sesión y volver a entrar
- [ ] El rol de administrador funciona (acceso completo)
- [ ] Las contraseñas han sido cambiadas
- [ ] Los empleados en "Departamentos" coinciden con los usuarios
- [ ] La cuenta temporal fue eliminada (si se creó)

---

## 📞 **SOPORTE**

Si tienes problemas:

1. Revisar logs de la consola del navegador (F12)
2. Revisar logs del backend en Supabase
3. Verificar conectividad con Supabase
4. Contactar al administrador del sistema

---

**Fecha de actualización**: 20 de febrero de 2026  
**Versión del sistema**: 1.0.0  
**Estado**: ✅ Listo para migración
