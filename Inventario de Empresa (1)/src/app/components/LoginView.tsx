import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { supabase } from "../utils/supabase";

interface LoginViewProps {
  onLogin: (email: string, password: string, userType?: "normal" | "accounting") => Promise<{ success: boolean; error?: string } | void>;
  onSwitchToRegister: () => void;
}

export function LoginView({ onLogin, onSwitchToRegister }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showKeepSessionModal, setShowKeepSessionModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Mostrar el modal de mantener sesión antes de hacer login
      setShowKeepSessionModal(true);
    }
  };

  const proceedWithLogin = async (keepSession: boolean) => {
    setShowKeepSessionModal(false);
    setIsLoggingIn(true);

    // Guardar preferencia de sesión en localStorage
    localStorage.setItem("keepSession", keepSession ? "true" : "false");

    const result = await onLogin(email, password);
    setIsLoggingIn(false);

    if (result && !result.success) {
      const errorMsg = result.error || "Credenciales incorrectas";

      if (errorMsg.toLowerCase().includes("usuario no encontrado") || errorMsg.toLowerCase().includes("correo")) {
        setErrors({ email: "Usuario no encontrado. Verifica tu correo electrónico." });
      } else if (errorMsg.toLowerCase().includes("contraseña")) {
        setErrors({ password: "Contraseña incorrecta. Por favor, verifica tu contraseña." });
      } else if (errorMsg.toLowerCase().includes("conexión") || errorMsg.toLowerCase().includes("servidor")) {
        setErrors({
          email: "Error de conexión. Verifica tu internet.",
          password: "Error de conexión. Verifica tu internet.",
        });
      } else {
        setErrors({
          email: "Credenciales incorrectas.",
          password: "Credenciales incorrectas.",
        });
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsSendingReset(true);
    setResetError(null);

    try {
      // 1. Verificar si el correo existe en Supabase
      const { data: users, error } = await supabase
        .from("kv_store_0c8a700a")
        .select("value")
        .eq("key", "users")
        .limit(1);

      if (error) {
        setResetError("Error de conexión. Por favor, intenta de nuevo.");
        return;
      }

      if (!users || users.length === 0) {
        setResetError("Error al cargar datos de usuarios.");
        return;
      }

      const allUsers = users[0].value as any[];
      const user = allUsers.find(u => u.email.toLowerCase() === resetEmail.toLowerCase());

      if (!user) {
        setResetError("No existe ninguna cuenta asociada a ese correo electrónico.");
        return;
      }

      // 2. Construir el enlace mailto con el mensaje predefinido
      const subject = encodeURIComponent("Recuperación de contraseña – Sistema de Inventario");
      const body = encodeURIComponent(
        `Hola ${user.name},\n\n` +
        `Has solicitado recuperar tu contraseña del Sistema de Gestión de Inventario.\n\n` +
        `Tu contraseña actual es: ${user.password}\n\n` +
        `Por seguridad, te recomendamos cambiarla después de iniciar sesión.\n\n` +
        `Si no has solicitado esto, ignora este mensaje.\n\n` +
        `Saludos,\nCentro Master`
      );

      const mailtoLink = `mailto:${user.email}?subject=${subject}&body=${body}`;

      // 3. Abrir el cliente de correo
      window.location.href = mailtoLink;

      // 4. Mostrar confirmación
      setResetEmailSent(true);

    } catch (err) {
      console.error("Error en recuperación de contraseña:", err);
      setResetError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#3b82f6] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#111827] mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-[#6b7280]">
            Accede al Sistema de Gestión de Inventario
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-[#374151] mb-2 block">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@centromaster.com"
                className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-[#374151] mb-2 block">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Botón de Olvidé mi Contraseña */}
          <div className="flex justify-end text-sm">
            <button
              type="button"
              className="text-[#3b82f6] hover:underline"
              onClick={() => setShowForgotPassword(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón Submit */}
          <Button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-6 disabled:opacity-60"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Entrando...
              </span>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        {/* Link a Registro */}
        <div className="mt-6 text-center">
          <p className="text-[#6b7280] text-sm">
            ¿No tienes una cuenta?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-[#3b82f6] hover:underline font-medium"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-[#9ca3af]">
          <p>Sistema de Gestión de Inventario v1.0.0</p>
          <p className="mt-1">© 2026 Centro Master</p>
        </div>
      </Card>

      {/* Modal ¿Mantener sesión abierta? */}
      {showKeepSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Icono */}
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#3b82f6]" />
            </div>

            {/* Texto */}
            <div className="text-center">
              <h2 className="text-lg font-semibold text-[#111827]">
                ¿Desea mantener la sesión abierta?
              </h2>
            </div>

            {/* Botones */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => proceedWithLogin(false)}
                className="flex-1 py-3 rounded-xl border border-[#e5e7eb] text-[#374151] hover:bg-[#f3f4f6] transition-colors font-medium"
              >
                No
              </button>
              <button
                onClick={() => proceedWithLogin(true)}
                className="flex-1 py-3 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white transition-colors font-medium"
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recuperar Contraseña */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-8">
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              Recuperar Contraseña
            </h2>
            <p className="text-[#6b7280] text-sm mb-6">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            
            {!resetEmailSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <Label htmlFor="resetEmail" className="text-[#374151] mb-2 block">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
                    <Input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setResetError(null);
                      }}
                      placeholder="usuario@centromaster.com"
                      className="pl-10"
                      required
                      disabled={isSendingReset}
                    />
                  </div>
                </div>

                {/* Mensaje de error */}
                {resetError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{resetError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                      setResetEmailSent(false);
                      setResetError(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-6"
                    disabled={isSendingReset}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white py-6 disabled:opacity-60"
                    disabled={isSendingReset}
                  >
                    {isSendingReset ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verificando...
                      </span>
                    ) : (
                      "Enviar"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 text-sm">
                    ✓ Se ha enviado un correo de recuperación a <strong>{resetEmail}</strong>.
                  </p>
                  <p className="text-green-700 text-sm mt-2">
                    Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                    setResetEmailSent(false);
                  }}
                  className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-6"
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}