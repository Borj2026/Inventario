-- ==================== SCRIPT DE REPARACIÓN ====================
-- Ejecutar SOLO SI ya tienes la tabla kv_store_0c8a700a sin la columna updated_at
-- Este script agrega la columna si no existe (opcional, no es crítica)

-- Verificar si la columna existe antes de intentar agregarla
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'kv_store_0c8a700a' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE kv_store_0c8a700a 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Crear trigger para updated_at
        CREATE TRIGGER update_kv_store_updated_at
          BEFORE UPDATE ON kv_store_0c8a700a
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        
        RAISE NOTICE 'Columna updated_at agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna updated_at ya existe';
    END IF;
END $$;
