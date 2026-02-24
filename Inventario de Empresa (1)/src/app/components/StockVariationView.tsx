import { useState } from "react";
import { ArrowRightLeft, Search, Plus, Minus, AlertCircle, MapPin, CheckCircle2, ChevronRight, Package, X, History } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku?: string;
  category: string;
  company: string;
  stock: number;
  image?: string;
  department?: string;
  hasSerialNumber?: boolean;
}

interface ProductUnit {
  id: string;
  sku?: string;
  serialNumber: string;
  location: string;
  status: "available" | "in-use" | "maintenance" | "out-of-use";
}

interface StockVariationViewProps {
  products: Product[];
  productUnits: Record<string, ProductUnit[]>;
  onStockAdjustment: (
    productId: string, 
    type: "add" | "remove", 
    quantity: number, 
    reason: string,
    details: {
      location?: string; // Para añadir
      unitsToRemove?: string[]; // Para eliminar
      serialNumbers?: string[]; // Para añadir con SN
    }
  ) => void;
  onNavigateToUnitInventory: (productId: string) => void;
}

// Localizaciones disponibles (Mismas que en otros componentes)
const LOCATIONS = [
  "AULA 1 – VC", "AULA 2 – VC", "AULA 3 – VC", "AULA 4 – VC", "AULA 5 – VC",
  "AULA 6 – VC", "AULA 7 – VC", "AULA 8 – VC", "AULA 9 – VC", "ÁTICO – VC",
  "RESTAURANTE – VC", "PELUQUERÍA – VC", "ESTÉTICA – VC", "ANEXO – VC",
  "ALMACÉN – VC", "AULA 1 – MF", "AULA 2 – MF", "ALMACÉN – MF",
  "AULA 1 – SF", "AULA 4 – SF", "AULA 5 – SF", "AULA 6 – SF",
  "ALMACÉN – SF", "PELUQUERÍA - SF",
  "Aula 1 – TF", "Aula 2 – TF", "Aula 3 – TF", "Aula 4 – TF", "Aula 5 – TF",
  "Aula 6 – TF", "Aula 7 – TF", "Aula 8 – TF", "Aula 9 – TF",
  "Despacho 1 – TF", "Despacho 2 – TF", "Secretaría – TF", "Almacén – TF", "Archivos – TF",
];

export function StockVariationView({ products, productUnits, onStockAdjustment, onNavigateToUnitInventory }: StockVariationViewProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [operationType, setOperationType] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [targetLocation, setTargetLocation] = useState<string>(""); // Para añadir
  const [serialNumbersInput, setSerialNumbersInput] = useState<string>(""); // Para añadir con SN
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showUnitSelectionModal, setShowUnitSelectionModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  const [selectedUnitsToRemove, setSelectedUnitsToRemove] = useState<string[]>([]);
  
  // Estado para la lista de modificados recientemente
  const [recentlyModified, setRecentlyModified] = useState<string[]>([]);

  // Estado para alertas personalizadas
  const [alertConfig, setAlertConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "warning" | "error" | "info";
  }>({
    show: false,
    title: "",
    message: "",
    type: "info"
  });

  const showAlert = (title: string, message: string, type: "warning" | "error" | "info" = "warning") => {
    setAlertConfig({ show: true, title, message, type });
  };

  // Búsqueda de productos
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  
  // Listas únicas para los filtros
  const departments = [...new Set(products.map(p => p.department).filter(Boolean))];
  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = !filterDepartment || p.department === filterDepartment;
    const matchesCat = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesDept && matchesCat;
  });

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const currentUnits = selectedProductId ? (productUnits[selectedProductId] || []) : [];
  
  // Calcular stock disponible por localización
  const unitsByLocation = currentUnits.reduce((acc, unit) => {
    if (!acc[unit.location]) acc[unit.location] = [];
    acc[unit.location].push(unit);
    return acc;
  }, {} as Record<string, ProductUnit[]>);

  const availableStock = currentUnits.length;

  const handleApply = () => {
    if (!selectedProductId || !quantity || !reference) {
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

        // Validación de Números de Serie si el producto lo requiere
        let serials: string[] = [];
        if (selectedProduct?.hasSerialNumber) {
            if (!serialNumbersInput.trim()) {
                showAlert("N° Serie Requeridos", "Este producto requiere números de serie. Por favor introdúcelos separados por punto y coma (;).", "warning");
                return;
            }
            serials = serialNumbersInput.split(";").map(s => s.trim()).filter(Boolean);
            if (serials.length !== qty) {
                showAlert("Cantidad de N° Serie Incorrecta", `Has introducido ${serials.length} números de serie, pero la cantidad a añadir es ${qty}.`, "warning");
                return;
            }
        }
        
        // Solicitar confirmación para AUMENTO
        setPendingAction(() => () => {
            onStockAdjustment(selectedProductId, "add", qty, reference, { 
                location: targetLocation,
                serialNumbers: serials 
            });
            addToRecentlyModified(selectedProductId);
            resetForm();
            setShowConfirmation(false);
        });
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

        // Abrir modal de selección de unidades (filtrado por la localización seleccionada)
        setSelectedUnitsToRemove([]);
        setShowUnitSelectionModal(true);
    }
  };

  const handleConfirmRemoval = () => {
    const qty = parseInt(quantity);
    if (selectedUnitsToRemove.length !== qty) {
        showAlert("Selección Incompleta", `Debes seleccionar exactamente ${qty} unidades para eliminar.`, "warning");
        return;
    }

    // Solicitar confirmación para BAJA DEFINITIVA
    setPendingAction(() => () => {
        onStockAdjustment(selectedProductId, "remove", qty, reference, { unitsToRemove: selectedUnitsToRemove });
        addToRecentlyModified(selectedProductId);
        setShowUnitSelectionModal(false);
        resetForm();
        setShowConfirmation(false);
    });
    setShowConfirmation(true);
  };

  const addToRecentlyModified = (id: string) => {
    setRecentlyModified(prev => {
        const newSet = new Set([id, ...prev]);
        return Array.from(newSet).slice(0, 5); // Guardar los últimos 5
    });
  };

  const resetForm = () => {
    setQuantity("");
    setReference("");
    setTargetLocation("");
    setSerialNumbersInput("");
    // No reseteamos producto ni tipo para facilitar operaciones consecutivas
  };

  // Filtrar unidades para el modal: solo mostrar las de la localización seleccionada si es operación de eliminar
  const unitsToShowInModal = operationType === "remove" && targetLocation 
    ? { [targetLocation]: unitsByLocation[targetLocation] || [] }
    : unitsByLocation;

  const toggleUnitSelection = (unitId: string) => {
    const qty = parseInt(quantity);
    setSelectedUnitsToRemove(prev => {
        if (prev.includes(unitId)) {
            return prev.filter(id => id !== unitId);
        } else {
            if (prev.length >= qty) return prev; // No permitir seleccionar más de la cantidad
            return [...prev, unitId];
        }
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-[#3b82f6]" />
            Variación de Stock
        </h2>
        <p className="text-[#6b7280]">Ajuste manual de inventario con justificación.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario Principal */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6">
                
                {/* 1. Selección de Producto */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-[#374151] mb-2">
                        1. Seleccionar Producto
                    </label>
                    
                    {/* Filtros extra */}
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                        >
                            <option value="">Todos los Departamentos</option>
                            {departments.map(d => <option key={d as string} value={d as string}>{d}</option>)}
                        </select>
                         <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                        >
                            <option value="">Todas las Categorías</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                            <input
                                type="text"
                                placeholder="Escribe para buscar producto..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowProductDropdown(true);
                                }}
                                onFocus={() => setShowProductDropdown(true)}
                                className="w-full pl-9 pr-10 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] bg-white"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => {
                                        setSearchTerm("");
                                        setShowProductDropdown(false);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {showProductDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-[#e5e7eb] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedProductId(p.id);
                                                setSearchTerm(p.name);
                                                setShowProductDropdown(false);
                                                setTargetLocation("");
                                            }}
                                            className={`px-4 py-2 cursor-pointer hover:bg-[#f3f4f6] flex justify-between items-center ${
                                                selectedProductId === p.id ? "bg-blue-50 text-[#3b82f6]" : "text-[#374151]"
                                            }`}
                                        >
                                            <span className="font-medium">{p.name}</span>
                                            <span className="text-xs text-[#6b7280]">
                                                Stock: {productUnits[p.id]?.length || 0}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-[#6b7280] text-center">
                                        No se encontraron productos
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Overlay para cerrar el dropdown al hacer click fuera */}
                        {showProductDropdown && (
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowProductDropdown(false)}
                            />
                        )}
                    </div>
                </div>

                {selectedProductId && (
                    <>
                        {/* 2. Tipo de Operación */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#374151] mb-2">
                                2. Tipo de Variación
                            </label>
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

                        {/* 3. Datos de la Variación */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">
                                        Cantidad
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                                        placeholder="0"
                                    />
                                </div>
                                
                                {operationType === "add" && (
                                    <div>
                                        <label className="block text-sm font-medium text-[#374151] mb-2">
                                            Localización a incrementar stock
                                        </label>
                                        <select
                                            value={targetLocation}
                                            onChange={(e) => setTargetLocation(e.target.value)}
                                            className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                                        >
                                            <option value="">Seleccionar localización...</option>
                                            {/* Mostrar localizaciones donde ya existe el producto primero */}
                                            {Object.keys(unitsByLocation).length > 0 && (
                                                <optgroup label="Localizaciones actuales">
                                                    {Object.keys(unitsByLocation).sort().map(loc => (
                                                        <option key={loc} value={loc}>
                                                            {loc} ({unitsByLocation[loc].length} unid. actuales)
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            )}
                                            <optgroup label="Otras localizaciones">
                                                {LOCATIONS.filter(loc => !unitsByLocation[loc]).map(loc => (
                                                    <option key={loc} value={loc}>{loc}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                )}
                                
                                {operationType === "remove" && (
                                    <div>
                                        <label className="block text-sm font-medium text-[#374151] mb-2">
                                            Localización de origen
                                        </label>
                                        <select
                                            value={targetLocation}
                                            onChange={(e) => setTargetLocation(e.target.value)}
                                            className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                                        >
                                            <option value="">Seleccionar donde retirar...</option>
                                            {Object.keys(unitsByLocation).sort().map(loc => (
                                                <option key={loc} value={loc}>
                                                    {loc} ({unitsByLocation[loc]?.length || 0} unid.)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {operationType === "add" && selectedProduct?.hasSerialNumber && (
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

                        {/* Botón de Acción */}
                        <div className="mt-8">
                            <button
                                onClick={handleApply}
                                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                                    operationType === "add"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                                {operationType === "add" ? "Confirmar Aumento de Stock" : "Seleccionar Unidades a Eliminar"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* Panel Lateral: Modificados Recientemente */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 h-full">
                <h3 className="text-lg font-semibold text-[#111827] mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-[#6b7280]" />
                    Modificados Recientemente
                </h3>
                
                {recentlyModified.length === 0 ? (
                    <div className="text-center py-8 text-[#9ca3af]">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aquí aparecerán los productos que modifiques.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentlyModified.map(id => {
                            const prod = products.find(p => p.id === id);
                            if (!prod) return null;
                            return (
                                <button
                                    key={id}
                                    onClick={() => onNavigateToUnitInventory(id)}
                                    className="w-full text-left p-3 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] hover:border-[#3b82f6] transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-[#111827] group-hover:text-[#3b82f6]">
                                                {prod.name}
                                            </p>
                                            <p className="text-xs text-[#6b7280]">
                                                Stock actual: <span className="font-semibold">{productUnits[id]?.length || 0}</span>
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#9ca3af] group-hover:text-[#3b82f6]" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Modal de Selección de Unidades para Eliminar */}
      {showUnitSelectionModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-[#e5e7eb] flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-[#111827]">Seleccionar Unidades</h3>
                        <p className="text-sm text-[#6b7280]">
                            Selecciona exactamente <span className="font-bold text-[#111827]">{quantity}</span> unidades para dar de baja.
                        </p>
                    </div>
                    <button onClick={() => setShowUnitSelectionModal(false)} className="text-[#6b7280] hover:text-[#111827]">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    {Object.entries(unitsToShowInModal).map(([loc, units]) => (
                        <div key={loc} className="mb-6 last:mb-0">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#374151] mb-3 bg-gray-50 p-2 rounded">
                                <MapPin className="w-4 h-4" />
                                {loc}
                                <span className="text-xs font-normal text-[#6b7280] ml-auto">
                                    {units.length} unidades disponibles
                                </span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {units.map(unit => {
                                    const isSelected = selectedUnitsToRemove.includes(unit.id);
                                    return (
                                        <div
                                            key={unit.id}
                                            onClick={() => toggleUnitSelection(unit.id)}
                                            className={`
                                                cursor-pointer border rounded-lg p-3 flex items-center justify-between transition-all
                                                ${isSelected 
                                                    ? 'border-red-500 bg-red-50 ring-1 ring-red-500' 
                                                    : 'border-[#e5e7eb] hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-mono text-[#374151] truncate">
                                                    SN: {unit.serialNumber || "N/A"}
                                                </p>
                                                <p className="text-[10px] text-[#6b7280] truncate">
                                                    SKU: {unit.sku || "N/A"}
                                                </p>
                                            </div>
                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-[#e5e7eb] bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-[#6b7280]">
                            Seleccionados: <span className="font-bold text-[#111827]">{selectedUnitsToRemove.length}</span> / {quantity}
                        </span>
                    </div>
                    <button
                        onClick={handleConfirmRemoval}
                        disabled={selectedUnitsToRemove.length !== parseInt(quantity)}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                            selectedUnitsToRemove.length === parseInt(quantity)
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        Confirmar Baja Definitiva
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Ventana Emergente de Alerta (Reemplazo de Alerts) */}
      {alertConfig.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className={`p-6 flex flex-col items-center text-center space-y-4`}>
              <div className={`p-3 rounded-full ${
                alertConfig.type === 'error' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <AlertCircle className={`w-10 h-10 ${
                  alertConfig.type === 'error' ? 'text-red-600' : 'text-amber-600'
                }`} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {alertConfig.title}
                </h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {alertConfig.message}
                </p>
              </div>

              <button
                onClick={() => setAlertConfig(prev => ({ ...prev, show: false }))}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                  alertConfig.type === 'error' 
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200' 
                    : 'bg-[#3b82f6] hover:bg-[#2563eb] shadow-lg shadow-blue-200'
                }`}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Acción */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <ArrowRightLeft className="w-8 h-8 text-[#3b82f6]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#111827]">¿Estás seguro?</h3>
                <p className="text-[#6b7280]">
                    {operationType === "add" 
                        ? `Vas a incrementar el stock de "${selectedProduct?.name}" en ${quantity} unidades.`
                        : `Vas a dar de baja definitivamente ${quantity} unidades de "${selectedProduct?.name}".`}
                </p>
                <p className="text-sm font-medium text-[#374151] bg-gray-50 p-2 rounded-lg mt-2">
                    Referencia: {reference}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => pendingAction()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                    operationType === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}