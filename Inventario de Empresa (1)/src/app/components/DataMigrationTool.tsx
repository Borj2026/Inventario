import { useState } from "react";
import { Database, Upload, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import * as api from "../utils/api";

interface MigrationUser {
  name: string;
  email: string;
  password: string;
  company: string;
  role: "usuario" | "coordinador" | "administrador" | "contable";
  department: string;
  status: "active" | "inactive";
}

const initialUsers: MigrationUser[] = [
  {
    name: "Jorge",
    email: "jorge@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "administrador",
    department: "Informática",
    status: "active",
  },
  {
    name: "Maite",
    email: "maite@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "contable",
    department: "Contabilidad",
    status: "active",
  },
  {
    name: "Berta",
    email: "berta@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "contable",
    department: "Contabilidad",
    status: "active",
  },
  {
    name: "Yeray",
    email: "yeray@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "coordinador",
    department: "Mantenimiento",
    status: "active",
  },
  {
    name: "Borja",
    email: "borja@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "coordinador",
    department: "Mantenimiento",
    status: "active",
  },
  {
    name: "Nara",
    email: "nara@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "usuario",
    department: "Secretaría",
    status: "active",
  },
];

interface MigrationResult {
  user: MigrationUser;
  success: boolean;
  error?: string;
}

export function DataMigrationTool() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleMigrate = async () => {
    setIsMigrating(true);
    setResults([]);
    setShowResults(true);

    const migrationResults: MigrationResult[] = [];

    for (const user of initialUsers) {
      try {
        await api.saveUser({
          ...user,
          createdAt: new Date().toISOString(),
        });
        
        migrationResults.push({
          user,
          success: true,
        });
        
        setResults([...migrationResults]);
        
        // Pequeña pausa para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error: any) {
        migrationResults.push({
          user,
          success: false,
          error: error.message || "Error desconocido",
        });
        
        setResults([...migrationResults]);
      }
    }

    setIsMigrating(false);
  };

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  return (
    <div className="min-h-screen bg-[#f9fafb] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-[#3b82f6] rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#111827]">
                Herramienta de Migración de Datos
              </h1>
              <p className="text-sm text-[#6b7280] mt-1">
                Migra los usuarios iniciales a Supabase
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium text-sm">
                ⚠️ Advertencia: Esta acción creará usuarios en Supabase
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Solo ejecuta esta migración una vez. Si los usuarios ya existen, se mostrarán errores.
              </p>
            </div>
          </div>

          {/* Usuarios a migrar */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-[#111827] mb-3">
              Usuarios a Migrar ({initialUsers.length})
            </h2>
            <div className="grid gap-2">
              {initialUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#f3f4f6] rounded-lg"
                >
                  <div>
                    <p className="font-medium text-[#111827] text-sm">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#6b7280]">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === "administrador"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "contable"
                          ? "bg-green-100 text-green-800"
                          : user.role === "coordinador"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-xs text-[#6b7280]">
                      {user.department}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón de migración */}
          <Button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-6 flex items-center justify-center gap-2"
          >
            {isMigrating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Migrando usuarios...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Iniciar Migración</span>
              </>
            )}
          </Button>

          {/* Resultados */}
          {showResults && results.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-[#111827]">
                  Resultados de Migración
                </h2>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-medium">
                    ✓ {successCount} exitosos
                  </span>
                  <span className="text-red-600 font-medium">
                    ✗ {errorCount} fallidos
                  </span>
                </div>
              </div>

              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      result.success
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm ${
                          result.success ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {result.user.name} ({result.user.email})
                      </p>
                      {result.error && (
                        <p className="text-xs text-red-700 mt-1">
                          Error: {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen final */}
              {results.length === initialUsers.length && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    errorCount === 0
                      ? "bg-green-50 border border-green-200"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  <p
                    className={`font-medium text-sm ${
                      errorCount === 0 ? "text-green-800" : "text-yellow-800"
                    }`}
                  >
                    {errorCount === 0
                      ? "🎉 ¡Migración completada exitosamente!"
                      : "⚠️ Migración completada con algunos errores"}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      errorCount === 0 ? "text-green-700" : "text-yellow-700"
                    }`}
                  >
                    {errorCount === 0
                      ? "Todos los usuarios fueron creados correctamente en Supabase."
                      : "Algunos usuarios no pudieron ser creados. Revisa los errores arriba."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-[#e5e7eb]">
            <h3 className="text-sm font-medium text-[#111827] mb-2">
              📋 Información de Acceso
            </h3>
            <div className="bg-[#f3f4f6] rounded-lg p-4">
              <p className="text-xs text-[#6b7280]">
                <strong>Contraseña para todos los usuarios:</strong> 123456
              </p>
              <p className="text-xs text-[#6b7280] mt-1">
                <strong>Empresa:</strong> AMS
              </p>
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Recuerda cambiar las contraseñas después de la migración por seguridad.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}