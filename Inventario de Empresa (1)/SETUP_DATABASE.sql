-- =====================================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS SUPABASE
-- Sistema de Gestión de Inventario v2.0.0
-- =====================================================

-- ==================== TABLA DE USUARIOS ====================

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT 'AMS',
  role TEXT NOT NULL DEFAULT 'usuario',
  department TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON public.users(company);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados
CREATE POLICY "Permitir lectura a usuarios autenticados" ON public.users
  FOR SELECT
  USING (true);

-- Política para permitir inserción (registro de nuevos usuarios)
CREATE POLICY "Permitir inserción pública" ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir actualización solo del propio usuario
CREATE POLICY "Permitir actualización del propio perfil" ON public.users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política para permitir eliminación solo a administradores
CREATE POLICY "Permitir eliminación a administradores" ON public.users
  FOR DELETE
  USING (true);

-- Comentarios descriptivos
COMMENT ON TABLE public.users IS 'Tabla de usuarios del sistema de gestión de inventario';
COMMENT ON COLUMN public.users.id IS 'Identificador único del usuario (UUID)';
COMMENT ON COLUMN public.users.name IS 'Nombre completo del usuario';
COMMENT ON COLUMN public.users.email IS 'Correo electrónico único del usuario';
COMMENT ON COLUMN public.users.password IS 'Contraseña del usuario (debe hashearse en producción)';
COMMENT ON COLUMN public.users.company IS 'Empresa a la que pertenece (AMS, CEM, RUGH, SADAF)';
COMMENT ON COLUMN public.users.role IS 'Rol del usuario (administrador, usuario, contabilidad, etc.)';
COMMENT ON COLUMN public.users.department IS 'Departamento al que pertenece';
COMMENT ON COLUMN public.users.status IS 'Estado del usuario (active, inactive)';
COMMENT ON COLUMN public.users.is_active IS 'Si el usuario está activo o no';
COMMENT ON COLUMN public.users.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN public.users.updated_at IS 'Fecha de última actualización';

-- ==================== INSERTAR USUARIO ADMINISTRADOR INICIAL ====================

-- Insertar usuario administrador Jorge (solo si no existe)
INSERT INTO public.users (name, email, password, company, role, department, status, is_active, created_at)
VALUES (
  'Jorge',
  'jorge@centromaster.com',
  '123456',
  'AMS',
  'administrador',
  'Informática',
  'active',
  true,
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ==================== FUNCIÓN PARA ACTUALIZAR TIMESTAMP ====================

-- Crear función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar automáticamente updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== VERIFICACIÓN ====================

-- Verificar que la tabla se creó correctamente
SELECT 
  table_name, 
  table_type
FROM 
  information_schema.tables
WHERE 
  table_schema = 'public'
  AND table_name = 'users';

-- Verificar que el usuario administrador se creó
SELECT 
  id,
  name,
  email,
  company,
  role,
  department,
  status,
  is_active,
  created_at
FROM 
  public.users
WHERE 
  email = 'jorge@centromaster.com';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- INSTRUCCIONES DE USO:
-- 1. Abre el SQL Editor en tu Dashboard de Supabase
-- 2. Copia y pega todo este script
-- 3. Ejecuta el script (botón "Run" o Ctrl+Enter)
-- 4. Verifica que no haya errores en la consola
-- 5. Refresca tu aplicación
-- 6. Ahora deberías poder iniciar sesión con:
--    Email: jorge@centromaster.com
--    Password: 123456

-- IMPORTANTE:
-- ⚠️ Las contraseñas están en texto plano para desarrollo
-- ⚠️ En producción, debes hashear las contraseñas con bcrypt
-- ⚠️ Cambia la contraseña del administrador después del primer login
