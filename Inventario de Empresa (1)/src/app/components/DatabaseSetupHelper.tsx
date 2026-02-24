import { useState } from "react";
import { Database, CheckCircle, XCircle, AlertCircle, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { supabase } from "../utils/supabase";

/**
 * Componente de ayuda para configurar la base de datos
 * Muestra instrucciones claras y verifica el estado de la configuración
 */
export function DatabaseSetupHelper() {
  const [isVisible, setIsVisible] = useState(false);
  const [checkStatus, setCheckStatus] = useState<{
    tableExists: boolean | null;
    adminExists: boolean | null;
    checking: boolean;
  }>({
    tableExists: null,
    adminExists: null,
    checking: false,
  });
  const [showSQL, setShowSQL] = useState(false);

  const sqlScript = `-- Crear tabla de usuarios
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

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON public.users(company);

-- Habilitar Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Permitir lectura" ON public.users FOR SELECT USING (true);
CREATE POLICY "Permitir inserción" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminación" ON public.users FOR DELETE USING (true);

-- Insertar usuario administrador
INSERT INTO public.users (name, email, password, company, role, department, status, is_active)
VALUES ('Jorge', 'jorge@centromaster.com', '123456', 'AMS', 'administrador', 'Informática', 'active', true)
ON CONFLICT (email) DO NOTHING;`;

  const checkDatabase = async () => {
    setCheckStatus({ ...checkStatus, checking: true });

    try {
      // Intentar leer la tabla users
      const { data: users, error: tableError } = await supabase
        .from("users")
        .select("email")
        .limit(1);

      const tableExists = !tableError || tableError.code !== "PGRST205";

      // Si la tabla existe, verificar si existe el admin
      let adminExists = false;
      if (tableExists) {
        const { data: admin } = await supabase
          .from("users")
          .select("email")
          .eq("email", "jorge@centromaster.com")
          .single();

        adminExists = !!admin;
      }

      setCheckStatus({
        tableExists,
        adminExists,
        checking: false,
      });
    } catch (error) {
      console.error("Error al verificar base de datos:", error);
      setCheckStatus({
        tableExists: false,
        adminExists: false,
        checking: false,
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      alert("✅ Script SQL copiado al portapapeles");
    } catch (err) {
      console.error("Error al copiar:", err);
      alert("❌ No se pudo copiar. Copia manualmente el script.");
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => {
            setIsVisible(true);
            checkDatabase();
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
          title="Ayuda de configuración de base de datos"
        >
          <Database className="w-4 h-4 mr-2" />
          Configurar BD
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#111827]">
                Configuración de Base de Datos
              </h2>
              <p className="text-[#6b7280] text-sm">
                Configura Supabase para tu aplicación
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-[#6b7280] hover:text-[#111827]"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Estado de verificación */}
        <div className="mb-6 space-y-3">
          <h3 className="font-semibold text-[#111827] mb-3">
            Estado de la Base de Datos
          </h3>

          {checkStatus.checking && (
            <div className="flex items-center gap-2 text-[#6b7280]">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#3b82f6] border-t-transparent" />
              <span>Verificando configuración...</span>
            </div>
          )}

          {!checkStatus.checking && (
            <>
              {/* Tabla users */}
              <div className="flex items-center gap-2">
                {checkStatus.tableExists === true ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700">
                      ✅ Tabla "users" existe
                    </span>
                  </>
                ) : checkStatus.tableExists === false ? (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700">
                      ❌ Tabla "users" NO existe
                    </span>
                  </>
                ) : null}
              </div>

              {/* Usuario admin */}
              <div className="flex items-center gap-2">
                {checkStatus.adminExists === true ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700">
                      ✅ Usuario administrador creado
                    </span>
                  </>
                ) : checkStatus.adminExists === false &&
                  checkStatus.tableExists === true ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-700">
                      ⚠️ Usuario administrador NO creado
                    </span>
                  </>
                ) : null}
              </div>

              <Button
                onClick={checkDatabase}
                className="mt-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white"
              >
                🔄 Verificar de nuevo
              </Button>
            </>
          )}
        </div>

        {/* Instrucciones */}
        {checkStatus.tableExists === false && (
          <>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-red-800 mb-2">
                ⚠️ Configuración Requerida
              </h4>
              <p className="text-red-700 text-sm">
                La tabla "users" no existe en tu base de datos Supabase. Sigue
                los pasos a continuación para configurarla.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-[#111827]">
                📋 Instrucciones Paso a Paso
              </h3>

              <ol className="list-decimal list-inside space-y-3 text-[#374151]">
                <li className="pl-2">
                  <strong>Abre el Dashboard de Supabase</strong>
                  <p className="text-sm text-[#6b7280] ml-6 mt-1">
                    Ve a{" "}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3b82f6] underline"
                    >
                      supabase.com/dashboard
                    </a>{" "}
                    y selecciona tu proyecto
                  </p>
                </li>

                <li className="pl-2">
                  <strong>Abre el SQL Editor</strong>
                  <p className="text-sm text-[#6b7280] ml-6 mt-1">
                    En el menú lateral, haz clic en "SQL Editor" o "Editor SQL"
                  </p>
                </li>

                <li className="pl-2">
                  <strong>Copia el script SQL</strong>
                  <p className="text-sm text-[#6b7280] ml-6 mt-1">
                    Haz clic en el botón "Copiar Script SQL" a continuación
                  </p>
                </li>

                <li className="pl-2">
                  <strong>Pega y ejecuta el script</strong>
                  <p className="text-sm text-[#6b7280] ml-6 mt-1">
                    Pega el script en el editor SQL y haz clic en "Run" o
                    presiona Ctrl+Enter
                  </p>
                </li>

                <li className="pl-2">
                  <strong>Verifica la ejecución</strong>
                  <p className="text-sm text-[#6b7280] ml-6 mt-1">
                    Asegúrate de que no haya errores en la consola. Deberías
                    ver "Success"
                  </p>
                </li>

                <li className="pl-2">
                  <strong>Refresca la aplicación</strong>
                  <p className="text-sm text-[#6b7280] ml-6 mt-1">
                    Vuelve aquí y haz clic en "Verificar de nuevo"
                  </p>
                </li>
              </ol>
            </div>

            {/* Botón para mostrar/ocultar SQL */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSQL(!showSQL)}
                  className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                >
                  {showSQL ? "Ocultar Script SQL" : "Ver Script SQL"}
                </Button>
                <Button
                  onClick={copyToClipboard}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Script
                </Button>
              </div>

              {showSQL && (
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {sqlScript}
                  </pre>
                </div>
              )}
            </div>

            {/* Archivo SQL */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                💡 <strong>Tip:</strong> También puedes encontrar el script
                completo en el archivo <code>/SETUP_DATABASE.sql</code> en la
                raíz del proyecto.
              </p>
            </div>
          </>
        )}

        {/* Todo configurado */}
        {checkStatus.tableExists === true && checkStatus.adminExists === true && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">
              ✅ ¡Todo Configurado!
            </h4>
            <p className="text-green-700 text-sm mb-4">
              Tu base de datos está correctamente configurada. Ahora puedes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
              <li>Iniciar sesión con jorge@centromaster.com / 123456</li>
              <li>Registrar nuevos usuarios</li>
              <li>Gestionar productos e inventario</li>
            </ul>
          </div>
        )}

        {/* Botón cerrar */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => setIsVisible(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700"
          >
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  );
}
