import { ShieldOff, ArrowLeft } from "lucide-react";

interface AccessDeniedViewProps {
  viewName?: string;
  onGoBack: () => void;
}

export function AccessDeniedView({ viewName, onGoBack }: AccessDeniedViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="text-center max-w-md">
        {/* Icono */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-red-500" />
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-[#111827] mb-2">
          Acceso Denegado
        </h2>

        {/* Descripción */}
        <p className="text-[#6b7280] mb-2">
          No tienes permiso para acceder a{" "}
          {viewName ? (
            <span className="font-medium text-[#374151]">"{viewName}"</span>
          ) : (
            "esta sección"
          )}
          .
        </p>
        <p className="text-sm text-[#9ca3af] mb-8">
          Contacta con el administrador del sistema si crees que deberías tener acceso.
        </p>

        {/* Botón */}
        <button
          onClick={onGoBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors font-medium shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Panel
        </button>
      </div>
    </div>
  );
}
