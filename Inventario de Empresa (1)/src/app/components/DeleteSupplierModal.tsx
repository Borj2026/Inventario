import { AlertTriangle, X, Package, Users } from "lucide-react";

interface DeleteSupplierModalProps {
  supplierName: string;
  productCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteSupplierModal({ 
  supplierName, 
  productCount, 
  onConfirm, 
  onCancel 
}: DeleteSupplierModalProps) {
  const canDelete = productCount === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className={`relative ${canDelete ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-amber-500 to-amber-600'} p-6 rounded-t-2xl`}>
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
              <h3 className="text-xl font-bold text-white">
                {canDelete ? 'Confirmar Eliminación' : 'No se puede eliminar'}
              </h3>
              <p className={`${canDelete ? 'text-red-100' : 'text-amber-100'} text-sm`}>
                {canDelete ? 'Esta acción no se puede deshacer' : 'El proveedor tiene productos asignados'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              {canDelete ? (
                <>
                  ¿Estás seguro de que deseas eliminar el proveedor{" "}
                  <span className="font-bold text-gray-900">"{supplierName}"</span>?
                </>
              ) : (
                <>
                  No se puede eliminar el proveedor{" "}
                  <span className="font-bold text-gray-900">"{supplierName}"</span>{" "}
                  porque tiene productos asignados.
                </>
              )}
            </p>

            {productCount > 0 ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-900 font-semibold mb-2">
                      {productCount} {productCount === 1 ? "producto asignado" : "productos asignados"}
                    </p>
                    <p className="text-red-700 text-sm">
                      Para eliminar este proveedor, primero debes reasignar o eliminar todos los productos que lo tienen asignado.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-green-800 text-sm">
                    Este proveedor no tiene productos asignados
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          {canDelete ? (
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
                Eliminar Proveedor
              </button>
            </div>
          ) : (
            <button
              onClick={onCancel}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
