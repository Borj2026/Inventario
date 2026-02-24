import { useState } from "react";
import { X, Plus, Minus, AlertCircle, CheckCircle2, MapPin, Hash } from "lucide-react";

interface ProductUnit {
  id: string;
  sku?: string;
  serialNumber: string;
  location: string;
  status: "available" | "in-use" | "maintenance" | "out-of-use";
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  hasSerialNumber?: boolean;
}

interface ProductStockVariationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  units: ProductUnit[];
  onStockAdjustment: (
    productId: string,
    type: "add" | "remove",
    quantity: number,
    reason: string,
    details: {
      location?: string;
      unitsToRemove?: string[];
      serialNumbers?: string[];
      skus?: string[];
    }
  ) => void;
}

// Localizaciones disponibles
const LOCATIONS = [
  "AULA 1 – VC", "AULA 2 – VC", "AULA 3 – VC", "AULA 4  VC", "AULA 5 – VC",
  "AULA 6 – VC", "AULA 7 – VC", "AULA 8 – VC", "AULA 9 – VC", "ÁTICO – VC",
  "RESTAURANTE – VC", "PELUQUERÍA – VC", "ESTÉTICA – VC", "ANEXO – VC",
  "ALMACÉN – VC", "AULA 1 – MF", "AULA 2 – MF", "ALMACÉN – MF",
  "AULA 1 – SF", "AULA 4 – SF", "AULA 5 – SF", "AULA 6 – SF",
  "ALMACÉN – SF", "PELUQUERÍA - SF",
  "Aula 1 – TF", "Aula 2 – TF", "Aula 3 – TF", "Aula 4 – TF", "Aula 5 – TF",
  "Aula 6 – TF", "Aula 7 – TF", "Aula 8 – TF", "Aula 9 – TF",
  "Despacho 1 – TF", "Despacho 2 – TF", "Secretaría – TF", "Almacén – TF", "Archivos – TF",
];

export function ProductStockVariationModal({
  isOpen,
  onClose,
  product,
  units,
  onStockAdjustment,
}: ProductStockVariationModalProps) {
  const [operationType, setOperationType] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [targetLocation, setTargetLocation] = useState<string>("");
  const [serialNumbersInput, setSerialNumbersInput] = useState<string>("");
  const [skusInput, setSkusInput] = useState<string>("");
  const [showUnitSelectionModal, setShowUnitSelectionModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedUnitsToRemove, setSelectedUnitsToRemove] = useState<string[]>([]);
  const [alertConfig, setAlertConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "warning" | "error" | "info";
  }>({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (title: string, message: string, type: "warning" | "error" | "info" = "warning") => {
    setAlertConfig({ show: true, title, message, type });
  };

  // Calcular stock disponible por localización
  const unitsByLocation = units.reduce((acc, unit) => {
    if (!acc[unit.location]) acc[unit.location] = [];
    acc[unit.location].push(unit);
    return acc;
  }, {} as Record<string, ProductUnit[]>);

  const handleApply = () => {
    if (!quantity || !reference) {
      showAlert("Campos Obligatorios", "Por favor completa todos los campos obligatorios.", "warning");
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      showAlert("Cantidad Inválida", "La cantidad debe ser un número positivo.", "warning");
      return;
    }

    if (operationType === "add") {
      if (!targetLocation) {
        showAlert("Localización Requerida", "Debes seleccionar una localización para las nuevas unidades.", "warning");
        return;
      }

      // Validación de SKUs si se ingresaron
      let skus: string[] = [];
      if (skusInput.trim()) {
        skus = skusInput.split(";").map((s) => s.trim()).filter(Boolean);
        if (skus.length !== qty) {
          showAlert("Cantidad de SKUs Incorrecta", `Has introducido ${skus.length} SKUs, pero la cantidad a añadir es ${qty}.`, "warning");
          return;
        }
      }

      // Validación de Números de Serie si el producto lo requiere
      let serials: string[] = [];
      if (product?.hasSerialNumber) {
        if (!serialNumbersInput.trim()) {
          showAlert("N° Serie Requeridos", "Este producto requiere números de serie. Por favor introdúcelos separados por punto y coma (;).", "warning");
          return;
        }
        serials = serialNumbersInput.split(";").map((s) => s.trim()).filter(Boolean);
        if (serials.length !== qty) {
          showAlert("Cantidad de N° Serie Incorrecta", `Has introducido ${serials.length} números de serie, pero la cantidad a añadir es ${qty}.`, "warning");
          return;
        }
      }

      setShowConfirmation(true);
    } else {
      // Validación para BAJAR STOCK
      if (!targetLocation) {
        showAlert("Localización Requerida", "Debes seleccionar de qué localización se retirarán las unidades.", "warning");
        return;
      }

      const stockInLocation = unitsByLocation[targetLocation]?.length || 0;

      // Validación de stock suficiente en la localización específica
      if (qty > stockInLocation) {
        showAlert(
          "Error no hay suficientes unidades",
          `No hay suficientes unidades en "${targetLocation}".\nSolicitado: ${qty}\nDisponible: ${stockInLocation}`,
          "error"
        );
        return;
      }

      // Abrir modal de selección de unidades
      setSelectedUnitsToRemove([]);
      setShowUnitSelectionModal(true);
    }
  };

  const handleConfirmAdd = () => {
    const qty = parseInt(quantity);
    let serials: string[] = [];
    if (product?.hasSerialNumber) {
      serials = serialNumbersInput.split(";").map((s) => s.trim()).filter(Boolean);
    }
    
    let skus: string[] = [];
    if (skusInput.trim()) {
      skus = skusInput.split(";").map((s) => s.trim()).filter(Boolean);
    }

    onStockAdjustment(product.id, "add", qty, reference, {
      location: targetLocation,
      serialNumbers: serials,
      skus: skus,
    });
    resetForm();
    setShowConfirmation(false);
    onClose();
  };

  const handleConfirmRemoval = () => {
    const qty = parseInt(quantity);
    if (selectedUnitsToRemove.length !== qty) {
      showAlert("Selección Incompleta", `Debes seleccionar exactamente ${qty} unidades para eliminar.`, "warning");
      return;
    }

    setShowConfirmation(true);
    setShowUnitSelectionModal(false);
  };

  const handleFinalConfirmRemoval = () => {
    const qty = parseInt(quantity);
    onStockAdjustment(product.id, "remove", qty, reference, { unitsToRemove: selectedUnitsToRemove });
    resetForm();
    setShowConfirmation(false);
    onClose();
  };

  const resetForm = () => {
    setQuantity("");
    setReference("");
    setTargetLocation("");
    setSerialNumbersInput("");
    setSkusInput("");
    setSelectedUnitsToRemove([]);
    setAlertConfig({ show: false, title: "", message: "", type: "info" });
  };

  const toggleUnitSelection = (unitId: string) => {
    const qty = parseInt(quantity);
    setSelectedUnitsToRemove((prev) => {
      if (prev.includes(unitId)) {
        return prev.filter((id) => id !== unitId);
      } else {
        if (prev.length >= qty) return prev;
        return [...prev, unitId];
      }
    });
  };

  // Filtrar unidades para el modal
  const unitsToShowInModal =
    operationType === "remove" && targetLocation
      ? { [targetLocation]: unitsByLocation[targetLocation] || [] }
      : unitsByLocation;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#e5e7eb] flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-[#111827]">Variación de Stock</h3>
              <p className="text-sm text-[#6b7280] mt-1">{product.name}</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="text-[#6b7280] hover:text-[#111827] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Alerta */}
            {alertConfig.show && (
              <div
                className={`mb-4 p-4 rounded-lg border ${
                  alertConfig.type === "error"
                    ? "bg-red-50 border-red-200"
                    : alertConfig.type === "warning"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      alertConfig.type === "error"
                        ? "text-red-600"
                        : alertConfig.type === "warning"
                        ? "text-amber-600"
                        : "text-blue-600"
                    }`}
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        alertConfig.type === "error"
                          ? "text-red-900"
                          : alertConfig.type === "warning"
                          ? "text-amber-900"
                          : "text-blue-900"
                      }`}
                    >
                      {alertConfig.title}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        alertConfig.type === "error"
                          ? "text-red-700"
                          : alertConfig.type === "warning"
                          ? "text-amber-700"
                          : "text-blue-700"
                      }`}
                    >
                      {alertConfig.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setAlertConfig({ ...alertConfig, show: false })}
                    className={`${
                      alertConfig.type === "error"
                        ? "text-red-600 hover:text-red-800"
                        : alertConfig.type === "warning"
                        ? "text-amber-600 hover:text-amber-800"
                        : "text-blue-600 hover:text-blue-800"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Info del producto */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#6b7280]">Stock actual (unidades)</p>
                  <p className="font-semibold text-[#111827]">{units.length}</p>
                </div>
                <div>
                  <p className="text-[#6b7280]">Requiere N° Serie</p>
                  <p className="font-semibold text-[#111827]">{product.hasSerialNumber ? "Sí" : "No"}</p>
                </div>
              </div>
            </div>

            {/* Tipo de Operación */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#374151] mb-2">Tipo de Variación</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setOperationType("add")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                    operationType === "add"
                      ? "border-green-500 bg-green-50 text-green-700 font-bold"
                      : "border-[#e5e7eb] hover:bg-gray-50 text-[#6b7280]"
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  Subir Stock
                </button>
                <button
                  onClick={() => setOperationType("remove")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                    operationType === "remove"
                      ? "border-red-500 bg-red-50 text-red-700 font-bold"
                      : "border-[#e5e7eb] hover:bg-gray-50 text-[#6b7280]"
                  }`}
                >
                  <Minus className="w-5 h-5" />
                  Bajar Stock
                </button>
              </div>
            </div>

            {/* Datos de la Variación */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    {operationType === "add" ? "Localización a incrementar stock" : "Localización de origen"}
                  </label>
                  <select
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  >
                    <option value="">
                      {operationType === "add" ? "Seleccionar localización..." : "Seleccionar donde retirar..."}
                    </option>
                    {operationType === "add" ? (
                      <>
                        {Object.keys(unitsByLocation).length > 0 && (
                          <optgroup label="Localizaciones actuales">
                            {Object.keys(unitsByLocation)
                              .sort()
                              .map((loc) => (
                                <option key={loc} value={loc}>
                                  {loc} ({unitsByLocation[loc].length} unid. actuales)
                                </option>
                              ))}
                          </optgroup>
                        )}
                        <optgroup label="Otras localizaciones">
                          {LOCATIONS.filter((loc) => !unitsByLocation[loc]).map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </optgroup>
                      </>
                    ) : (
                      Object.keys(unitsByLocation)
                        .sort()
                        .map((loc) => (
                          <option key={loc} value={loc}>
                            {loc} ({unitsByLocation[loc]?.length || 0} unid.)
                          </option>
                        ))
                    )}
                  </select>
                </div>
              </div>

              {operationType === "add" && product?.hasSerialNumber && (
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Números de Serie (Obligatorio para este producto)
                  </label>
                  <textarea
                    value={serialNumbersInput}
                    onChange={(e) => setSerialNumbersInput(e.target.value)}
                    className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    rows={2}
                    placeholder="Ej: SN123; SN124; SN125 (Separados por ;)"
                  />
                  <p className="text-[10px] text-[#6b7280] mt-1">
                    Debes introducir exactamente {quantity || "X"} números de serie.
                  </p>
                </div>
              )}

              {operationType === "add" && (
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    SKUs (Opcional para este producto)
                  </label>
                  <textarea
                    value={skusInput}
                    onChange={(e) => setSkusInput(e.target.value)}
                    className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    rows={2}
                    placeholder="Ej: SKU123; SKU124; SKU125 (Separados por ;)"
                  />
                  <p className="text-[10px] text-[#6b7280] mt-1">
                    Debes introducir exactamente {quantity || "X"} SKUs.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Referencia / Justificación (Obligatorio)
                </label>
                <textarea
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  rows={3}
                  placeholder="Explique el motivo del ajuste..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#e5e7eb] flex justify-end gap-3">
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-[#6b7280] hover:text-[#111827] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                operationType === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {operationType === "add" ? "Confirmar Aumento" : "Seleccionar Unidades"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Selección de Unidades */}
      {showUnitSelectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-[#e5e7eb] flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[#111827]">Seleccionar Unidades</h3>
                <p className="text-sm text-[#6b7280]">
                  Selecciona exactamente <span className="font-bold text-[#111827]">{quantity}</span> unidades para dar
                  de baja.
                </p>
              </div>
              <button onClick={() => setShowUnitSelectionModal(false)} className="text-[#6b7280] hover:text-[#111827]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {Object.entries(unitsToShowInModal).map(([loc, locUnits]) => (
                <div key={loc} className="mb-6 last:mb-0">
                  <h4 className="font-semibold text-[#111827] mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#6b7280]" />
                    {loc} ({locUnits.length} unidades)
                  </h4>
                  <div className="space-y-2">
                    {locUnits.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => toggleUnitSelection(unit.id)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                          selectedUnitsToRemove.includes(unit.id)
                            ? "border-red-500 bg-red-50"
                            : "border-[#e5e7eb] hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {unit.sku && (
                                <span className="text-sm font-medium text-[#111827] flex items-center gap-1">
                                  <Hash className="w-3 h-3 text-[#6b7280]" />
                                  {unit.sku}
                                </span>
                              )}
                              <span className="text-xs text-[#6b7280] font-mono">{unit.serialNumber}</span>
                            </div>
                            <span className="text-xs text-[#6b7280]">Estado: {unit.status}</span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedUnitsToRemove.includes(unit.id)
                                ? "border-red-500 bg-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedUnitsToRemove.includes(unit.id) && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-[#e5e7eb] flex justify-between items-center">
              <p className="text-sm text-[#6b7280]">
                Seleccionadas: <span className="font-bold text-[#111827]">{selectedUnitsToRemove.length}</span> /{" "}
                {quantity}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUnitSelectionModal(false)}
                  className="px-4 py-2 text-[#6b7280] hover:text-[#111827] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmRemoval}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={selectedUnitsToRemove.length !== parseInt(quantity)}
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Final */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  operationType === "add" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {operationType === "add" ? (
                  <Plus className={`w-6 h-6 text-green-600`} />
                ) : (
                  <Minus className={`w-6 h-6 text-red-600`} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111827] mb-1">Confirmar Variación</h3>
                <p className="text-sm text-[#6b7280]">
                  Estás a punto de {operationType === "add" ? "añadir" : "eliminar"} <span className="font-bold">{quantity}</span> unidades{" "}
                  {operationType === "add" ? "en" : "de"} {targetLocation}.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-xs text-[#6b7280] mb-1">Referencia:</p>
              <p className="text-sm text-[#111827]">{reference}</p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  if (operationType === "remove") {
                    setShowUnitSelectionModal(true);
                  }
                }}
                className="px-4 py-2 text-[#6b7280] hover:text-[#111827] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={operationType === "add" ? handleConfirmAdd : handleFinalConfirmRemoval}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                  operationType === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}