import { useState, useEffect } from "react";
import { X, Hash, MapPin, AlertCircle } from "lucide-react";

interface ProductUnit {
  id: string;
  sku?: string; // SKU ahora es opcional
  serialNumber: string;
  location: string;
  status: "available" | "in-use" | "maintenance" | "out-of-use";
  reference?: string; // Referencia de la unidad
}

interface UnitModalProps {
  unit: ProductUnit | null;
  onClose: () => void;
  onSave: (unit: Omit<ProductUnit, "id"> | Omit<ProductUnit, "id">[]) => void; // Puede recibir una unidad o un array
  requiresSerialNumber: boolean;
  productSKU: string;
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

export function UnitModal({ unit, onClose, onSave, requiresSerialNumber, productSKU, defaultReference }: UnitModalProps) {
  const [formData, setFormData] = useState({
    sku: productSKU,
    serialNumber: "",
    location: "",
    status: "available" as "available" | "in-use" | "maintenance" | "out-of-use",
    reference: "", // Nuevo campo
  });
  const [skusInput, setSkusInput] = useState(""); // Campo para múltiples SKUs separados por ;
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (unit) {
      setFormData({
        sku: unit.sku,
        serialNumber: unit.serialNumber,
        location: unit.location,
        status: unit.status,
        reference: unit.reference || "", // Nuevo campo
      });
      setSkusInput(""); // En modo edición no se usa el campo de SKUs múltiples
    } else {
      setFormData({
        sku: productSKU,
        serialNumber: "",
        location: "",
        status: "available",
        reference: defaultReference ? `Pedido ${defaultReference}` : "", // Autocompletar con formato "Pedido " + número
      });
      setSkusInput(""); // Resetear campo de SKUs
    }
  }, [unit, productSKU, defaultReference]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que la referencia sea obligatoria
    if (!formData.reference.trim()) {
      alert("El campo Referencia es obligatorio.");
      return;
    }
    
    // Si es edición de una unidad existente, funciona como antes
    if (unit) {
      onSave({
        sku: formData.sku,
        serialNumber: formData.serialNumber,
        location: formData.location,
        status: formData.status,
        reference: formData.reference,
      });
      return;
    }
    
    // Si no hay SKUs, crear una unidad sin SKU
    if (!skusInput.trim()) {
      // Crear una sola unidad sin SKU
      setShowConfirmation(true);
      return;
    }
    
    const skus = skusInput.split(";").map(s => s.trim()).filter(s => s !== "");
    
    // Mostrar confirmación
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    // Si es edición, guardar como antes
    if (unit) {
      onSave({
        sku: formData.sku,
        serialNumber: formData.serialNumber,
        location: formData.location,
        status: formData.status,
        reference: formData.reference,
      });
      return;
    }
    
    // Si no hay SKUs, crear una unidad sin SKU
    if (!skusInput.trim()) {
      onSave({
        sku: "",
        serialNumber: formData.serialNumber,
        location: formData.location,
        status: formData.status,
        reference: formData.reference,
      });
      return;
    }
    
    // Si es creación de nuevas unidades con SKUs múltiples
    const skus = skusInput.split(";").map(s => s.trim()).filter(s => s !== "");
    
    if (skus.length === 1) {
      // Solo un SKU, crear una unidad
      onSave({
        sku: skus[0],
        serialNumber: formData.serialNumber,
        location: formData.location,
        status: formData.status,
        reference: formData.reference,
      });
    } else {
      // Múltiples SKUs, crear múltiples unidades
      const units: Omit<ProductUnit, "id">[] = skus.map((sku, index) => ({
        sku: sku,
        serialNumber: requiresSerialNumber ? `${formData.serialNumber}-${index + 1}` : "",
        location: formData.location,
        status: formData.status,
        reference: formData.reference,
      }));
      onSave(units);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Pantalla de confirmación
  if (showConfirmation) {
    const skus = skusInput.split(";").map(s => s.trim()).filter(s => s !== "");
    const unitsCount = skus.length > 0 ? skus.length : 1; // Si no hay SKUs, es 1 unidad
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
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

          <div className="p-6">
            <p className="text-sm text-[#374151] mb-6">
              ¿Estás seguro de que deseas crear <span className="font-semibold text-[#111827]">{unitsCount} {unitsCount === 1 ? 'unidad' : 'unidades'}</span> en la localización <span className="font-semibold text-[#111827]">{formData.location}</span>?
            </p>

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
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#e5e7eb]">
          <h3 className="text-lg md:text-xl font-semibold text-[#111827]">
            {unit ? "Editar Unidad" : "Nueva Unidad"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6b7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* Campo de SKUs múltiples (solo en modo creación) */}
          {!unit && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                SKU
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 w-4 h-4 text-[#6b7280]" />
                <textarea
                  value={skusInput}
                  onChange={(e) => setSkusInput(e.target.value)}
                  placeholder="Ingresa uno o varios SKUs separados por ; (punto y coma)"
                  className="w-full pl-9 pr-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base min-h-[80px] resize-y"
                />
              </div>
              <p className="mt-2 text-xs text-[#6b7280]">
                Ejemplo: SKU001; SKU002; SKU003
              </p>
              {skusInput.trim() && (
                <p className="mt-1 text-xs text-blue-700 font-medium">
                  SKUs detectados: <span className="font-semibold">{skusInput.split(";").map(s => s.trim()).filter(s => s !== "").length}</span>
                </p>
              )}
            </div>
          )}

          {/* Campo de SKU único (solo en modo edición) */}
          {unit && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                SKU
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
                />
              </div>
            </div>
          )}

          {requiresSerialNumber && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Nº de Serie *
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                required={requiresSerialNumber}
                placeholder="Ej: SN-0001"
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base font-mono"
              />
              {!unit && skusInput.split(";").map(s => s.trim()).filter(s => s !== "").length > 1 && (
                <p className="mt-1 text-xs text-amber-700">
                  Nota: Se añadirá un sufijo numérico a cada número de serie para las múltiples unidades.
                </p>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Localización *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base appearance-none"
              >
                <option value="">Seleccionar localización</option>
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Estado *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="available">Disponible</option>
              <option value="in-use">En Uso</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="out-of-use">Fuera de Uso</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Referencia *
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors text-sm md:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors text-sm md:text-base"
            >
              {unit ? "Actualizar" : "Continuar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}