import { useState } from "react";
import { X, MapPin, Package, AlertCircle, Hash } from "lucide-react";

interface BulkAddUnitsModalProps {
  onClose: () => void;
  onBulkAdd: (location: string, serialNumbers?: string[], reference?: string, skus?: string[]) => void; // Agregado skus
  unitsToAdd: number;
  requiresSerialNumber: boolean;
  defaultReference?: string; // Nuevo prop para autocompletar con número de pedido
}

// Localizaciones disponibles
const LOCATIONS = [
  // Vecindario (VC)
  "AULA 1 – VC",
  "AULA 2 – VC",
  "AULA 3 – VC",
  "AULA 4 – VC",
  "AULA 5 – VC",
  "AULA 6 – VC",
  "AULA 7 – VC",
  "AULA 8 – VC",
  "AULA 9 – VC",
  "RESTAURANTE – VC",
  "PELUQUERÍA – VC",
  "ESTÉTICA – VC",
  "ANEXO – VC",
  "ALMACÉN – VC",
  "Dirección – VC",
  "Calidad – VC",
  "Office – VC",
  "Agencia Colocación – VC",
  "Contabilidad – VC",
  "Ático/RRHH – VC",
  "Ático/Aula – VC",
  "Ático/Oficina – VC",
  // Maestro Falla (MF)
  "AULA 1 – MF",
  "AULA 2 – MF",
  "Almacén 1 – MF",
  "Almacén 2 – MF",
  "Secretaría – MF",
  "Aula Taller – MF",
  "Sala Profesores – MF",
  // Tenerife (TF)
  "Aula 1 – TF",
  "Aula 2 – TF",
  "Aula 3 – TF",
  "Aula 4 – TF",
  "Aula 5 – TF",
  "Aula 6 – TF",
  "Aula 7 – TF",
  "Aula 8 – TF",
  "Aula 9 – TF",
  "Despacho 1 – TF",
  "Despacho 2 – TF",
  "Secretaría – TF",
  "Almacén – TF",
  "Archivos – TF",
  "Informática – TF",
  "Agencia Colocación – TF",
  // San Fernando (SF)
  "AULA 1 – SF",
  "AULA 4 – SF",
  "AULA 5 – SF",
  "AULA 6 – SF",
  "ALMACÉN – SF",
  "PELUQUERÍA - SF",
  "Secretaría – SF",
  "Despacho - SF",
];

export function BulkAddUnitsModal({ onClose, onBulkAdd, unitsToAdd, requiresSerialNumber, defaultReference }: BulkAddUnitsModalProps) {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [serialNumbersInput, setSerialNumbersInput] = useState("");
  const [skusInput, setSkusInput] = useState(""); // Nuevo campo para SKUs separados por ;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reference, setReference] = useState(defaultReference ? `Pedido ${defaultReference}` : ""); // Autocompletar con formato "Pedido " + número
  const [quantity, setQuantity] = useState(requiresSerialNumber ? unitsToAdd : 1); // Nueva cantidad seleccionable
  const [quantityError, setQuantityError] = useState(""); // Nuevo estado para error de cantidad

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      alert("Por favor selecciona una localización");
      return;
    }

    // Validar cantidad para productos sin número de serie
    if (!requiresSerialNumber) {
      if (quantity < 1) {
        setQuantityError("La cantidad debe ser al menos 1");
        return;
      }
      if (quantity > unitsToAdd) {
        setQuantityError(`La cantidad no puede superar las ${unitsToAdd} unidades disponibles`);
        return;
      }
    }

    // Validar que la referencia sea obligatoria
    if (!reference.trim()) {
      alert("El campo Referencia es obligatorio.");
      return;
    }

    // Validar SKUs solo si se ingresaron
    if (skusInput.trim()) {
      const skus = skusInput.split(";").map(s => s.trim()).filter(s => s !== "");
      if (skus.length !== quantity) {
        alert(`Por favor ingresa exactamente ${quantity} SKUs separados por punto y coma (;). Actualmente hay ${skus.length}.`);
        return;
      }
    }

    // Validar números de serie si el producto los requiere
    if (requiresSerialNumber) {
      if (!serialNumbersInput.trim()) {
        alert("Este producto requiere números de serie. Por favor ingresa los números de serie separados por punto y coma (;).");
        return;
      }
      
      const serialNumbers = serialNumbersInput.split(";").map(s => s.trim()).filter(s => s !== "");
      if (serialNumbers.length !== quantity) {
        alert(`Por favor ingresa exactamente ${quantity} números de serie separados por punto y coma (;). Actualmente hay ${serialNumbers.length}.`);
        return;
      }
    }

    // Mostrar pantalla de confirmación
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    // Procesar SKUs
    let skus = skusInput.split(";").map(s => s.trim()).filter(s => s !== "");
    
    // Si no hay SKUs ingresados, crear un array vacío con la cantidad seleccionada
    if (skus.length === 0 && !requiresSerialNumber) {
      skus = Array(quantity).fill("");
    }
    
    // Procesar números de serie
    let serialNumbers: string[] | undefined = undefined;
    if (requiresSerialNumber && serialNumbersInput.trim()) {
      serialNumbers = serialNumbersInput.split(";").map(s => s.trim()).filter(s => s !== "");
    }
    
    onBulkAdd(selectedLocation, serialNumbers, reference, skus); // Agregado skus
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-[#111827]">
                Confirmar Acción
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#6b7280] hover:text-[#111827] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-[#374151] mb-6">
              ¿Estás seguro de que deseas crear <span className="font-semibold text-[#111827]">{quantity} unidades</span> en la localización <span className="font-semibold text-[#111827]">{selectedLocation}</span>?
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[#111827]">
              {requiresSerialNumber ? "Añadir Todas las Unidades" : "Añadir por Lote de Unidades"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                {requiresSerialNumber 
                  ? "Se crearán automáticamente todas las unidades faltantes del producto."
                  : "Selecciona la cantidad de unidades que deseas crear automáticamente."
                }
              </p>
              <ul className="mt-2 text-xs text-blue-800 list-disc list-inside space-y-1">
                <li>Estado: Disponible</li>
                <li>Localización: La que selecciones abajo</li>
                <li>SKU: Vacío (puedes editarlo después)</li>
                {requiresSerialNumber ? (
                  <li className="text-amber-800 font-medium">N° de Serie: OBLIGATORIO - Debes ingresar {quantity} números de serie</li>
                ) : (
                  <li>N° de Serie: Vacío (puedes editarlo después)</li>
                )}
              </ul>
            </div>
          </div>

          {/* Campo de cantidad (solo para productos sin número de serie) */}
          {!requiresSerialNumber && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Cantidad de Unidades *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setQuantity(value);
                  setQuantityError(""); // Limpiar error al escribir
                }}
                onWheel={(e) => e.currentTarget.blur()}
                className={`w-full px-4 py-2 border ${quantityError ? 'border-red-500' : 'border-[#d1d5db]'} rounded-lg focus:outline-none focus:ring-2 ${quantityError ? 'focus:ring-red-500' : 'focus:ring-[#3b82f6]'}`}
                required
              />
              <p className="mt-1 text-xs text-[#6b7280]">
                Máximo {unitsToAdd} unidades disponibles para añadir
              </p>
              {quantityError && (
                <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {quantityError}
                </p>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6b7280]" />
                Localización *
              </div>
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              required
            >
              <option value="">Selecciona una localización</option>
              {LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Campo de Números de Serie (solo si el producto los requiere) */}
          {requiresSerialNumber && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#6b7280]" />
                  Números de Serie *
                </div>
              </label>
              <textarea
                value={serialNumbersInput}
                onChange={(e) => setSerialNumbersInput(e.target.value)}
                placeholder={`Ingresa ${quantity} números de serie separados por ; (punto y coma)`}
                className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] min-h-[100px] resize-y"
                required
              />
              <p className="mt-2 text-xs text-[#6b7280]">
                Ejemplo: ABC123; DEF456; GHI789
              </p>
              <p className="mt-1 text-xs text-amber-700 font-medium">
                {serialNumbersInput.trim() ? (
                  <>
                    Números de serie detectados: <span className="font-semibold">{serialNumbersInput.split(";").map(s => s.trim()).filter(s => s !== "").length}</span> de {quantity}
                  </>
                ) : (
                  <>⚠ Este producto requiere números de serie. Debes ingresar exactamente {quantity} números de serie.</>
                )}
              </p>
            </div>
          )}

          {/* Campo de SKUs */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              SKUs
            </label>
            <textarea
              value={skusInput}
              onChange={(e) => setSkusInput(e.target.value)}
              placeholder={`Ingresa ${quantity} SKUs separados por ; (punto y coma) - Opcional`}
              className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] min-h-[100px] resize-y"
            />
            <p className="mt-2 text-xs text-[#6b7280]">
              Ejemplo: SKU001; SKU002; SKU003
            </p>
            {skusInput.trim() && (
              <p className="mt-1 text-xs text-blue-700 font-medium">
                SKUs detectados: <span className="font-semibold">{skusInput.split(";").map(s => s.trim()).filter(s => s !== "").length}</span> de {quantity}
              </p>
            )}
          </div>

          {/* Campo de Referencia */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Referencia *
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
            >
              Añadir {quantity} Unidades
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}