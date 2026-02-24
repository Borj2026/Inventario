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

-- Crear índices en la tabla users para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ==================== TABLA DE KV STORE ====================
-- Tabla simple de clave-valor para datos generales (productos, categorías, etc.)

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

-- Política para permitir lectura/escritura de usuarios (temporalmente abierta)
-- En producción, ajustar estas políticas según necesidades de seguridad
CREATE POLICY "Allow all access to users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política para permitir lectura/escritura de kv_store (temporalmente abierta)
CREATE POLICY "Allow all access to kv_store" ON kv_store_0c8a700a
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==================== FUNCIONES AUTOMÁTICAS ====================

-- Función para actualizar updated_at automáticamente en la tabla users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en la tabla users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
