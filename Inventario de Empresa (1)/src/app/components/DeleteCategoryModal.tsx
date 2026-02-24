import { AlertTriangle, X, Package, ArrowRight } from "lucide-react";

interface DeleteCategoryModalProps {
  categoryName: string;
  productCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteCategoryModal({ 
  categoryName, 
  productCount, 
  onConfirm, 
  onCancel 
}: DeleteCategoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Confirmar Eliminación</h3>
              <p className="text-red-100 text-sm">Esta acción no se puede deshacer</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              ¿Estás seguro de que deseas eliminar la categoría{" "}
              <span className="font-bold text-gray-900">"{categoryName}"</span>?
            </p>

            {productCount > 0 ? (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-amber-900 font-semibold mb-2">
                      {productCount} {productCount === 1 ? "producto asignado" : "productos asignados"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-amber-800">
                      <span className="font-medium">"{categoryName}"</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="font-medium">"Sin Categoría"</span>
                    </div>
                    <p className="text-amber-700 text-xs mt-2">
                      Los productos se reasignarán automáticamente a "Sin Categoría"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-green-800 text-sm">
                    Esta categoría no tiene productos asignados
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
            >
              Eliminar Categoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
