import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "../utils/supabase";

/**
 * Botón de migración rápida para crear el usuario administrador inicial
 * Solo crea a Jorge (administrador) - el resto de usuarios se registrarán mediante el formulario
 */
export function QuickMigrationButton() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const adminUser = {
    name: "Jorge",
    email: "jorge@centromaster.com",
    password: "123456",
    company: "AMS",
    role: "administrador",
    department: "Informática",
    status: "active",
  };

  const runMigration = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", adminUser.email)
        .single();

      if (existingUser) {
        setResult(`ℹ️ El usuario administrador ya existe. ¡Sistema listo!`);
      } else {
        // Insertar usuario administrador
        const { error } = await supabase.from("users").insert({
          ...adminUser,
          is_active: true,
          created_at: new Date().toISOString(),
        });

        if (error) {
          // Comprobar si es error de duplicado
          if (error.code === "23505") {
            setResult(`ℹ️ El usuario administrador ya existe. ¡Sistema listo!`);
          } else {
            throw error;
          }
        } else {
          setResult(`✅ Usuario administrador creado exitosamente. Puedes iniciar sesión.`);
        }
      }
    } catch (error) {
      console.error("Error al crear usuario administrador:", error);
      setResult(`❌ Error al crear usuario administrador. Revisa la consola.`);
    }

    setIsRunning(false);

    // Auto-ocultar después de 5 segundos
    setTimeout(() => setResult(null), 5000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end gap-2">
        {result && (
          <div
            className={`px-4 py-2 rounded-lg text-sm font-medium shadow-lg max-w-xs ${
              result.includes("exitosamente")
                ? "bg-green-500 text-white"
                : result.includes("ya existe")
                ? "bg-blue-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {result}
          </div>
        )}
        
        <Button
          onClick={runMigration}
          disabled={isRunning}
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
          title="Crear usuario administrador inicial (jorge@centromaster.com)"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Creando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Crear Admin
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
