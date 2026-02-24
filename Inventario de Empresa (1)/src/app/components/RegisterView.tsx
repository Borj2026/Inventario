import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User, Building2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";

interface RegisterViewProps {
  onRegister: (userData: {
    name: string;
    email: string;
    password: string;
    company: string;
  }) => Promise<{ success: boolean; error?: string } | void>;
  onSwitchToLogin: () => void;
}

export function RegisterView({ onRegister, onSwitchToLogin }: RegisterViewProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    company?: string;
  }>({});

  const companies = ["AMS", "CEM", "RUGH", "SADAF"];

  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      company?: string;
    } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    }

    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.company) {
      newErrors.company = "Selecciona una empresa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const result = await onRegister({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        company: formData.company,
      });
      
      // Si hay un error, mostrarlo en el campo de email (ya que suele ser email duplicado)
      if (result && !result.success) {
        setErrors({
          email: result.error || "El correo electrónico ya está registrado",
        });
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 my-8">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#3b82f6] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#111827] mb-2">
            Crear Cuenta
          </h1>
          <p className="text-[#6b7280]">
            Regístrate en el Sistema de Gestión de Inventario
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <Label htmlFor="firstName" className="text-[#374151] mb-2 block">
              Nombre
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Juan"
                className={`pl-10 ${errors.firstName ? "border-red-500" : ""}`}
              />
            </div>
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <Label htmlFor="lastName" className="text-[#374151] mb-2 block">
              Apellido
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Pérez"
                className={`pl-10 ${errors.lastName ? "border-red-500" : ""}`}
              />
            </div>
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

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
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="usuario@centromaster.com"
                className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Empresa */}
          <div>
            <Label htmlFor="company" className="text-[#374151] mb-2 block">
              Empresa
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af] z-10 pointer-events-none" />
              <select
                id="company"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] ${
                  errors.company ? "border-red-500" : "border-[#d1d5db]"
                }`}
              >
                <option value="">Selecciona una empresa</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
            {errors.company && (
              <p className="text-red-500 text-sm mt-1">{errors.company}</p>
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
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
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

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-[#374151] mb-2 block">
              Confirmar Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="••••••••"
                className={`pl-10 pr-10 ${
                  errors.confirmPassword ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Términos */}
          <div className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              required
              className="w-4 h-4 mt-0.5 rounded border-[#d1d5db] text-[#3b82f6] focus:ring-[#3b82f6]"
            />
            <span className="text-[#6b7280]">
              Acepto los{" "}
              <button type="button" className="text-[#3b82f6] hover:underline">
                términos y condiciones
              </button>{" "}
              y la{" "}
              <button type="button" className="text-[#3b82f6] hover:underline">
                política de privacidad
              </button>
            </span>
          </div>

          {/* Botón Submit */}
          <Button
            type="submit"
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-6"
          >
            Crear Cuenta
          </Button>
        </form>

        {/* Link a Login */}
        <div className="mt-6 text-center">
          <p className="text-[#6b7280] text-sm">
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-[#3b82f6] hover:underline font-medium"
            >
              Inicia sesión
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-[#9ca3af]">
          <p>Sistema de Gestión de Inventario v1.0.0</p>
          <p className="mt-1">© 2026 Centro Master</p>
        </div>
      </Card>
    </div>
  );
}