# 🚀 Configuración de Supabase - Guía Completa

## 📋 **PASOS PARA CONFIGURAR LA BASE DE DATOS**

### **Paso 1: Acceder al Dashboard de Supabase**

1. Ir a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Iniciar sesión con tu cuenta
3. Seleccionar tu proyecto

---

### **Paso 2: Crear las Tablas Necesarias**

#### **A. Ir al Editor SQL**

1. En el menú lateral, hacer clic en **"SQL Editor"**
2. Hacer clic en **"New Query"**

---

#### **B. Ejecutar el Script de Creación de Tablas**

Copiar y pegar el siguiente SQL en el editor:

\`\`\`sql
-- ==================== TABLA DE USUARIOS ====================

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT 'AMS',
  role TEXT NOT NULL DEFAULT 'usuario',
  department TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ==================== TABLA DE KV STORE ====================

CREATE TABLE IF NOT EXISTS kv_store_0c8a700a (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Crear índice para búsquedas rápidas por clave
CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store_0c8a700a(key);

-- ==================== POLÍTICAS DE SEGURIDAD (RLS) ====================

-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_store_0c8a700a ENABLE ROW LEVEL SECURITY;

-- Política para permitir acceso completo (temporalmente)
-- En producción, ajustar estas políticas según necesidades de seguridad
CREATE POLICY "Allow all access to users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to kv_store" ON kv_store_0c8a700a
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==================== FUNCIONES AUTOMÁTICAS ====================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para tabla users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabla kv_store
CREATE TRIGGER update_kv_store_updated_at
  BEFORE UPDATE ON kv_store_0c8a700a
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
\`\`\`

3. Hacer clic en **"Run"** (Ejecutar) en la esquina inferior derecha
4. Esperar a ver el mensaje: **"Success. No rows returned"**

---

### **Paso 3: Verificar que las Tablas se Crearon**

1. En el menú lateral, hacer clic en **"Table Editor"**
2. Deberías ver dos tablas:
   - ✅ **users**
   - ✅ **kv_store_0c8a700a**

---

### **Paso 4: Insertar Usuarios Iniciales (Migración)**

Ahora puedes usar la aplicación para migrar los usuarios. Hay **3 formas** de hacerlo:

#### **Opción 1: Botón Flotante en Login (MÁS FÁCIL)** 🔥

1. Abrir la aplicación
2. En la pantalla de **Login**, buscar el botón flotante **"Migrar Usuarios"** (esquina inferior derecha)
3. Hacer clic en el botón
4. Esperar el mensaje: `✅ Migración exitosa! 7 usuarios creados.`

---

#### **Opción 2: Desde el SQL Editor de Supabase**

Si prefieres crear los usuarios manualmente desde Supabase:

\`\`\`sql
-- Insertar usuarios iniciales
INSERT INTO users (name, email, password, company, role, department, status, is_active)
VALUES
  ('Jorge', 'jorge@centromaster.com', '123456', 'AMS', 'administrador', 'Informática', 'active', true),
  ('Maite', 'maite@centromaster.com', '123456', 'AMS', 'contable', 'Contabilidad', 'active', true),
  ('Berta', 'berta@centromaster.com', '123456', 'AMS', 'contable', 'Contabilidad', 'active', true),
  ('Yeray', 'yeray@centromaster.com', '123456', 'AMS', 'coordinador', 'Mantenimiento', 'active', true),
  ('Borja', 'borja@centromaster.com', '123456', 'AMS', 'coordinador', 'Mantenimiento', 'active', true),
  ('Nara', 'nara@centromaster.com', '123456', 'AMS', 'usuario', 'Secretaría', 'active', true),
  ('Daniela', 'daniela@centromaster.com', '123456', 'AMS', 'usuario', 'Secretaría', 'active', true);
\`\`\`

---

#### **Opción 3: Desde la Consola del Navegador**

Si tienes problemas con las opciones anteriores:

1. Abrir la aplicación
2. Presionar **F12** (o Ctrl+Shift+I) para abrir DevTools
3. Ir a la pestaña **"Console"**
4. Copiar y pegar este código:

\`\`\`javascript
const { supabase } = await import('./utils/supabase.js');

const users = [
  { name: "Jorge", email: "jorge@centromaster.com", password: "123456", company: "AMS", role: "administrador", department: "Informática", status: "active", is_active: true },
  { name: "Maite", email: "maite@centromaster.com", password: "123456", company: "AMS", role: "contable", department: "Contabilidad", status: "active", is_active: true },
  { name: "Berta", email: "berta@centromaster.com", password: "123456", company: "AMS", role: "contable", department: "Contabilidad", status: "active", is_active: true },
  { name: "Yeray", email: "yeray@centromaster.com", password: "123456", company: "AMS", role: "coordinador", department: "Mantenimiento", status: "active", is_active: true },
  { name: "Borja", email: "borja@centromaster.com", password: "123456", company: "AMS", role: "coordinador", department: "Mantenimiento", status: "active", is_active: true },
  { name: "Nara", email: "nara@centromaster.com", password: "123456", company: "AMS", role: "usuario", department: "Secretaría", status: "active", is_active: true },
  { name: "Daniela", email: "daniela@centromaster.com", password: "123456", company: "AMS", role: "usuario", department: "Secretaría", status: "active", is_active: true },
];

for (const user of users) {
  await supabase.from('users').insert(user);
}

console.log('✅ Usuarios migrados!');
\`\`\`

5. Presionar **Enter**

---

### **Paso 5: Verificar que Todo Funciona**

1. **Cerrar la consola** (si la abriste)
2. **Ir a la pantalla de Login**
3. **Iniciar sesión** con:
   - Email: `jorge@centromaster.com`
   - Contraseña: `123456`
4. Si funciona, ¡todo está listo! ✅

---

## 🔐 **SEGURIDAD POST-CONFIGURACIÓN**

### **IMPORTANTE: Cambiar Contraseñas**

⚠️ **Todos los usuarios tienen contraseña `123456`**

**Después de migrar**:
1. Iniciar sesión como Jorge (administrador)
2. Ir a **"Gestión de Usuarios"**
3. Editar cada usuario y cambiar su contraseña
4. Usar contraseñas seguras

---

### **Mejorar Políticas de RLS (Opcional)**

Las políticas actuales permiten acceso completo a todos. Para producción, considera:

\`\`\`sql
-- Eliminar políticas permisivas
DROP POLICY "Allow all access to users" ON users;
DROP POLICY "Allow all access to kv_store" ON kv_store_0c8a700a;

-- Crear políticas más restrictivas
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can modify users" ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );
\`\`\`

---

## 🐛 **SOLUCIÓN DE PROBLEMAS**

### **Error: "relation 'users' does not exist"**

**Causa**: Las tablas no se han creado todavía.

**Solución**:
1. Ir al **SQL Editor** de Supabase
2. Ejecutar el script de creación de tablas (Paso 2)
3. Verificar en **Table Editor** que las tablas existan

---

### **Error: "duplicate key value violates unique constraint"**

**Causa**: Los usuarios ya existen en la base de datos.

**Solución**:
- ✅ Esto es normal si ya ejecutaste la migración
- Simplemente inicia sesión con las credenciales existentes
- Si quieres resetear, ejecuta:
  \`\`\`sql
  DELETE FROM users;
  \`\`\`
  Y vuelve a migrar

---

### **Error: "Failed to fetch" o "Network error"**

**Causa**: Problema de conectividad con Supabase.

**Solución**:
1. Verificar que el proyecto de Supabase esté activo
2. Revisar que las credenciales en `/utils/supabase/info.tsx` sean correctas
3. Verificar conexión a internet

---

## 📊 **ESTRUCTURA DE DATOS**

### **Tabla: users**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | ID único (generado automáticamente) |
| name | TEXT | Nombre completo del usuario |
| email | TEXT | Email (único, usado para login) |
| password | TEXT | Contraseña (en texto plano, hash en producción) |
| company | TEXT | Empresa (AMS, CEM, RUGH, SADAF) |
| role | TEXT | Rol (administrador, contable, coordinador, usuario) |
| department | TEXT | Departamento del usuario |
| status | TEXT | Estado (active, inactive) |
| is_active | BOOLEAN | Si el usuario está activo |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

---

### **Tabla: kv_store_0c8a700a**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| key | TEXT | Clave única (PRIMARY KEY) |
| value | JSONB | Valor JSON (productos, categorías, etc.) |
| updated_at | TIMESTAMP | Fecha de última actualización |

**Claves usadas**:
- `products_{company}` - Productos por empresa
- `categories_{company}` - Categorías por empresa
- `suppliers_{company}` - Proveedores por empresa
- `warehouses_{company}` - Almacenes por empresa
- `employees` - Lista de empleados
- `selectedCompany` - Empresa seleccionada actual
- `rolePermissions_*` - Permisos de roles

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

Después de la configuración, verifica:

- [ ] Tablas `users` y `kv_store_0c8a700a` creadas en Supabase
- [ ] Políticas RLS habilitadas
- [ ] Triggers de `updated_at` funcionando
- [ ] 7 usuarios iniciales creados
- [ ] Login funciona con jorge@centromaster.com
- [ ] Aplicación se conecta correctamente a Supabase
- [ ] Datos se guardan y sincronizan
- [ ] Contraseñas cambiadas por seguridad

---

## 📞 **RECURSOS**

- **Dashboard de Supabase**: https://supabase.com/dashboard
- **Documentación**: https://supabase.com/docs
- **Guía de RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **SQL Editor**: Dashboard → SQL Editor

---

**Fecha de creación**: 20 de febrero de 2026  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para usar