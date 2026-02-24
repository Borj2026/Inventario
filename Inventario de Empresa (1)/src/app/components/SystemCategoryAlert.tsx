import { Shield, X } from "lucide-react";

interface SystemCategoryAlertProps {
  action: "eliminar" | "editar";
  onClose: () => void;
}

export function SystemCategoryAlert({ action, onClose }: SystemCategoryAlertProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Categoría Protegida</h3>
              <p className="text-blue-100 text-sm">Categoría del sistema</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              No se puede <span className="font-bold">{action}</span> la categoría{" "}
              <span className="font-bold text-blue-600">"Sin Categoría"</span> porque es una categoría 
              del sistema.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-blue-900 text-sm">
                <span className="font-semibold">ℹ️ Información:</span> Esta categoría se utiliza para 
                productos que no tienen una categoría asignada y es esencial para el funcionamiento del sistema.
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
