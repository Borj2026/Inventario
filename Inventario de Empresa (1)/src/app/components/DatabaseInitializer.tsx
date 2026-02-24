import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { Button } from "./ui/button";
import { Database, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card } from "./ui/card";

export function DatabaseInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      // Intentar obtener usuarios
      const { data, error } = await supabase.from("users").select("id").limit(1);
      
      if (error) {
        // Si hay error, probablemente las tablas no existen
        if (error.code === "42P01") {
          // Código 42P01 = tabla no existe
          setShowButton(true);
          setMessage("La base de datos necesita inicializarse");
        } else {
          console.error("Error al verificar BD:", error);
          setShowButton(true);
          setMessage("Error al conectar con la base de datos");
        }
      } else {
        // Todo bien, las tablas existen
        setStatus("success");
        setShowButton(false);
      }
    } catch (error) {
      console.error("Error al verificar BD:", error);
      setShowButton(true);
      setMessage("Error al verificar la base de datos");
    }
  };

  const initializeDatabase = async () => {
    setIsInitializing(true);
    setMessage("Inicializando base de datos...");

    try {
      // Crear tabla de usuarios
      const { error: usersError } = await supabase.rpc("exec_sql", {
        sql: `
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
          
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
          CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
          CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        `
      });

      if (usersError) throw usersError;

      // Crear tabla de kv_store
      const { error: kvError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS kv_store (
            key TEXT PRIMARY KEY,
            value JSONB NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store(key);
        `
      });

      if (kvError) throw kvError;

      setStatus("success");
      setMessage("✅ Base de datos inicializada correctamente");
      setShowButton(false);
    } catch (error: any) {
      console.error("Error al inicializar BD:", error);
      setStatus("error");
      setMessage(`❌ Error: ${error.message || "Error desconocido"}`);
    } finally {
      setIsInitializing(false);
    }
  };

  if (!showButton && status !== "error") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Card className="p-4 shadow-lg border-2 border-yellow-500 bg-yellow-50">
        <div className="flex items-start gap-3">
          <Database className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">
              Inicialización de Base de Datos
            </h3>
            <p className="text-sm text-yellow-800 mb-3">{message}</p>

            {status === "idle" && (
              <Button
                onClick={initializeDatabase}
                disabled={isInitializing}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inicializando...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Inicializar Base de Datos
                  </>
                )}
              </Button>
            )}

            {status === "success" && (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Listo para usar</span>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                <Button
                  onClick={initializeDatabase}
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  Reintentar
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
