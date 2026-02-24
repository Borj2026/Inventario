import React, { useState } from "react";
import { ArrowLeft, Search, Package, MapPin, Hash, Filter, Plus, Pencil, AlertCircle, PackagePlus, Layers, CheckSquare, Square, ArrowRightLeft, ChevronDown, ChevronUp, History, ArrowUpCircle, ArrowDownCircle, Check, X, ChevronRight } from "lucide-react";
import { UnitModal } from "./UnitModal";
import { MoveUnitModal } from "./MoveUnitModal";
import { BulkAddUnitsModal } from "./BulkAddUnitsModal";
import { BulkMoveUnitsModal } from "./BulkMoveUnitsModal";
import { ProductStockVariationModal } from "./ProductStockVariationModal";

interface ProductUnit {
  id: string;
  sku?: string; // SKU ahora es opcional
  serialNumber: string;
  location: string;
  status: "available" | "in-use" | "maintenance" | "out-of-use";
  deletedAt?: Date; // Nuevo campo para marcar unidades eliminadas
}

interface Product {
  id: string;
  name: string;
  sku?: string; // SKU ahora es opcional
  category: string;
  company: string;
  supplierId: string;
  warehouse: string;
  price?: number;
  stock: number;
  minStock?: number;
  description: string;
  image?: string;
  manual?: string;
  serialNumber?: string;
  hasSerialNumber?: boolean;
  orderNumber?: string; // Nuevo campo para el número de pedido
}

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

interface StockMovement {
  id: string;
  unitId: string;
  productName: string;
  productSku?: string;
  serialNumber: string;
  fromLocation: string;
  toLocation: string;
  timestamp: string;
  user?: string;
  employeeId?: string;
  employeeName?: string;
}

interface StockHistoryEntry {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  action: "recibido" | "retirado" | "add" | "remove" | "adjust" | "order-received";
  previousStock: number;
  newStock: number;
  quantity: number;
  reason?: string;
  user?: string;
  timestamp: string;
  company: string;
  category: string;
}

interface ProductUnitsViewProps {
  product: Product;
  onBack: () => void;
  units: ProductUnit[];
  onAddUnit: (productId: string, unit: Omit<ProductUnit, "id">) => void;
  onBulkAddUnits: (productId: string, units: Omit<ProductUnit, "id">[]) => void;
  onUpdateUnit: (productId: string, unitId: string, unit: Omit<ProductUnit, "id">, employeeId?: string, employeeName?: string) => void;
  onBulkMoveUnits: (productId: string, unitUpdates: Array<{ unitId: string; newLocation: string }>, employeeId?: string, employeeName?: string) => void;
  onDeleteUnit: (productId: string, unitId: string) => void;
  employees: Employee[];
  movements?: StockMovement[]; // Nuevo prop para los movimientos
  stockHistory?: StockHistoryEntry[]; // Nuevo prop para el historial de stock
  onStockAdjustment?: (
    productId: string,
    type: "add" | "remove",
    quantity: number,
    reason: string,
    details: {
      location?: string;
      unitsToRemove?: string[];
      serialNumbers?: string[];
    }
  ) => void;
  onUpdateProduct?: (id: string, product: Omit<Product, "id">) => void; // Nueva prop para actualizar el producto
}

// Localizaciones disponibles según la imagen
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

export function ProductUnitsView({ product, onBack, units, onAddUnit, onBulkAddUnits, onUpdateUnit, onBulkMoveUnits, onDeleteUnit, employees, movements, stockHistory, onStockAdjustment, onUpdateProduct }: ProductUnitsViewProps) {
  const [searchSKU, setSearchSKU] = useState("");
  const [searchSerial, setSearchSerial] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterSede, setFilterSede] = useState(""); // Nuevo filtro de Sede
  const [filterStatus, setFilterStatus] = useState("");
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ProductUnit | null>(null);
  const [showStockAddedAlert, setShowStockAddedAlert] = useState(false);
  const [isMoveUnitModalOpen, setIsMoveUnitModalOpen] = useState(false);
  const [movingUnit, setMovingUnit] = useState<ProductUnit | null>(null);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [deleteConfirmUnit, setDeleteConfirmUnit] = useState<ProductUnit | null>(null);
  const [deleteBulkConfirm, setDeleteBulkConfirm] = useState(false);
  const [isUnitsExpanded, setIsUnitsExpanded] = useState(true);
  const [isMovementsExpanded, setIsMovementsExpanded] = useState(true);
  const [isStockHistoryExpanded, setIsStockHistoryExpanded] = useState(true);
  const [isStockVariationModalOpen, setIsStockVariationModalOpen] = useState(false);
  const [isEditingMinStock, setIsEditingMinStock] = useState(false);
  const [minStockValue, setMinStockValue] = useState(product.minStock?.toString() || "");
  const [expandedMovementRows, setExpandedMovementRows] = useState<Set<string>>(new Set());

  // Filtrar unidades (excluir las eliminadas)
  const activeUnits = units.filter((unit) => !unit.deletedAt);
  
  const filteredUnits = activeUnits.filter((unit) => {
    const matchesSKU = !searchSKU || unit.sku?.toLowerCase().includes(searchSKU.toLowerCase());
    const matchesSerial = !searchSerial || unit.serialNumber.toLowerCase().includes(searchSerial.toLowerCase());
    const matchesLocation = !filterLocation || unit.location === filterLocation;
    
    // Filtro de Sede basado en el sufijo de la localización
    let matchesSede = true;
    if (filterSede) {
      if (filterSede === "Vecindario") {
        matchesSede = unit.location.includes("VC");
      } else if (filterSede === "San Fernando") {
        matchesSede = unit.location.includes("SF");
      } else if (filterSede === "Maestro Falla") {
        matchesSede = unit.location.includes("MF");
      } else if (filterSede === "Tenerife") {
        matchesSede = unit.location.includes("TF");
      }
    }
    
    const matchesStatus = !filterStatus || unit.status === filterStatus;
    return matchesSKU && matchesSerial && matchesLocation && matchesSede && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: "Disponible",
      "in-use": "En Uso",
      maintenance: "Mantenimiento",
      "out-of-use": "Fuera de Uso",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: "bg-green-100 text-green-700",
      "in-use": "bg-blue-100 text-blue-700",
      maintenance: "bg-yellow-100 text-yellow-700",
      "out-of-use": "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const handleAddUnit = () => {
    // No permitir crear más unidades si ya se alcanzó el stock
    if (activeUnits.length >= product.stock) {
      alert("No se pueden crear más unidades. El número de unidades ha alcanzado el stock del producto.");
      return;
    }
    setEditingUnit(null);
    setIsUnitModalOpen(true);
  };

  const handleEditUnit = (unit: ProductUnit) => {
    setEditingUnit(unit);
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = (unitData: Omit<ProductUnit, "id"> | Omit<ProductUnit, "id">[]) => {
    if (editingUnit) {
      // Si es edición, solo puede ser una unidad
      onUpdateUnit(product.id, editingUnit.id, unitData as Omit<ProductUnit, "id">);
    } else {
      // Si es creación, puede ser una unidad o un array de unidades
      if (Array.isArray(unitData)) {
        // Múltiples unidades
        onBulkAddUnits(product.id, unitData);
      } else {
        // Una sola unidad
        onAddUnit(product.id, unitData);
      }
    }
    setIsUnitModalOpen(false);
    setEditingUnit(null);
  };

  const handleDeleteUnit = (unit: ProductUnit) => {
    setDeleteConfirmUnit(unit);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmUnit) {
      onDeleteUnit(product.id, deleteConfirmUnit.id);
      setDeleteConfirmUnit(null);
    }
  };

  // Mostrar alerta si las unidades son menores al stock del producto
  const shouldShowAlert = activeUnits.length < product.stock;

  // Verificar si se puede añadir más unidades
  const canAddMoreUnits = activeUnits.length < product.stock;

  const handleMoveUnit = (unit: ProductUnit) => {
    setMovingUnit(unit);
    setIsMoveUnitModalOpen(true);
  };

  const handleConfirmMove = (newLocation: string, employeeId: string, employeeName: string) => {
    if (movingUnit) {
      onUpdateUnit(product.id, movingUnit.id, {
        sku: movingUnit.sku,
        serialNumber: movingUnit.serialNumber,
        location: newLocation,
        status: movingUnit.status,
      }, employeeId, employeeName);
      setIsMoveUnitModalOpen(false);
      setMovingUnit(null);
    }
  };

  const handleBulkAdd = (location: string, serialNumbers?: string[], reference?: string, skus?: string[]) => { // Agregado skus
    // Determinar cuántas unidades crear basándose en lo que se proporcionó
    let quantityToCreate = 0;
    
    // Si hay SKUs, usar esa cantidad
    if (skus && skus.length > 0) {
      quantityToCreate = skus.length;
    }
    // Si hay números de serie, usar esa cantidad
    else if (serialNumbers && serialNumbers.length > 0) {
      quantityToCreate = serialNumbers.length;
    }
    // Si no hay ninguno, calcular todas las unidades faltantes (para productos con número de serie sin datos)
    else {
      quantityToCreate = product.stock - activeUnits.length;
    }
    
    // Crear array con las unidades a añadir
    const newUnits: Omit<ProductUnit, "id">[] = [];
    for (let i = 0; i < quantityToCreate; i++) {
      // Si se proporcionaron números de serie personalizados, usarlos
      // Si no, generar automáticamente si el producto los requiere
      let serialNumber = "";
      if (serialNumbers && serialNumbers.length > i) {
        serialNumber = serialNumbers[i];
      } else if (product.hasSerialNumber) {
        serialNumber = `AUTO-${Date.now()}-${i}`;
      }
      
      // Si se proporcionaron SKUs personalizados, usarlos
      let sku = "";
      if (skus && skus.length > i) {
        sku = skus[i];
      }
      
      newUnits.push({
        sku: sku, // SKU desde el input
        serialNumber: serialNumber,
        location: location,
        status: "available" as const,
        reference: reference || "", // Agregado reference
      });
    }
    
    // Añadir todas las unidades de una vez
    onBulkAddUnits(product.id, newUnits);
    
    setIsBulkAddModalOpen(false);
  };

  const handleSelectUnit = (unitId: string) => {
    if (selectedUnits.includes(unitId)) {
      setSelectedUnits(selectedUnits.filter(id => id !== unitId));
    } else {
      setSelectedUnits([...selectedUnits, unitId]);
    }
  };

  const handleBulkMove = (newLocation: string, employeeId: string, employeeName: string) => {
    const unitUpdates: Array<{ unitId: string; newLocation: string }> = selectedUnits.map(unitId => ({
      unitId,
      newLocation,
    }));
    onBulkMoveUnits(product.id, unitUpdates, employeeId, employeeName);
    setIsBulkMoveModalOpen(false);
    setSelectedUnits([]);
  };

  const handleBulkDelete = () => {
    setDeleteBulkConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    selectedUnits.forEach(unitId => {
      onDeleteUnit(product.id, unitId);
    });
    setDeleteBulkConfirm(false);
    setSelectedUnits([]);
  };

  const handleStockVariation = () => {
    setIsStockVariationModalOpen(true);
  };

  const handleConfirmStockVariation = (
    productId: string,
    type: "add" | "remove",
    quantity: number,
    reason: string,
    details: {
      location?: string;
      unitsToRemove?: string[];
      serialNumbers?: string[];
    }
  ) => {
    if (onStockAdjustment) {
      onStockAdjustment(productId, type, quantity, reason, details);
    }
    setIsStockVariationModalOpen(false);
  };

  // Funciones helper para historial de stock
  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      recibido: "Recibido",
      retirado: "Retirado",
      add: "Agregado",
      remove: "Retirado",
      "order-received": "Pedido Recibido",
      adjust: "Ajuste",
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    // Acciones positivas (Verde)
    if (["recibido", "add", "order-received"].includes(action)) {
      return "bg-green-100 text-green-700";
    }
    // Acciones negativas (Rojo)
    if (["retirado", "remove"].includes(action)) {
      return "bg-red-100 text-red-700";
    }
    // Ajustes (Naranja)
    if (action === "adjust") {
      return "bg-orange-100 text-orange-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  const getActionIcon = (action: string) => {
    // Acciones positivas
    if (["recibido", "add", "order-received"].includes(action)) {
      return <ArrowUpCircle className="w-4 h-4 text-white" />;
    }
    // Acciones negativas
    if (["retirado", "remove"].includes(action)) {
      return <ArrowDownCircle className="w-4 h-4 text-white" />;
    }
    return <History className="w-4 h-4 text-white" />;
  };

  // Función para guardar el stock mínimo
  const handleSaveMinStock = () => {
    if (!onUpdateProduct) return;
    
    const newMinStock = minStockValue === "" ? undefined : parseInt(minStockValue);
    onUpdateProduct(product.id, {
      ...product,
      minStock: newMinStock
    });
    
    setIsEditingMinStock(false);
  };

  // Función para cancelar la edición del stock mínimo
  const handleCancelMinStock = () => {
    setMinStockValue(product.minStock?.toString() || "");
    setIsEditingMinStock(false);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#3b82f6] hover:text-[#2563eb] mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Atrás</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">
              Inventario de Unidades: {product.name}
            </h2>
            <p className="text-sm text-[#6b7280] mt-1">
              {filteredUnits.length} de {activeUnits.length} unidades
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-[#eff6ff] px-4 py-2 rounded-lg text-center">
              <p className="text-xs text-[#6b7280]">Stock</p>
              <p className="text-lg font-semibold text-[#3b82f6]">{product.stock}</p>
            </div>
            <button
              onClick={handleStockVariation}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                shouldShowAlert
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={shouldShowAlert}
              title={shouldShowAlert ? "Debes completar las unidades pendientes antes de ajustar el stock" : "Ajustar stock del producto"}
            >
              <Layers className="w-4 h-4" />
              Ajustar Stock
            </button>
          </div>
        </div>
      </div>

      {/* Alerta de stock añadido */}
      {shouldShowAlert && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 mb-1">
                Se ha añadido stock al producto mediante pedido
              </p>
              <p className="text-xs text-amber-700 mb-3">
                Debes crear las unidades correspondientes haciendo clic en el botón "Nueva Unidad" para registrar cada artículo individualmente.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAddUnit}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Unidad
                </button>
                <button
                  onClick={() => setIsBulkAddModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  {product.hasSerialNumber ? "Añadir todas las unidades" : "Añadir por lote de unidades"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información del producto */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-[#6b7280]">Empresa</p>
            <p className="font-medium text-[#111827]">{product.company}</p>
          </div>
          <div>
            <p className="text-sm text-[#6b7280]">Categoría</p>
            <p className="font-medium text-[#111827]">{product.category}</p>
          </div>
          <div>
            <p className="text-sm text-[#6b7280]">Requiere N° Serie</p>
            <p className="font-medium text-[#111827]">{product.hasSerialNumber ? "Sí" : "No"}</p>
          </div>
        </div>
      </div>

      {/* Filtros de Unidad */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#6b7280]" />
          <h3 className="text-sm font-medium text-[#111827]">Filtros de Unidad</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Buscar por SKU..."
              value={searchSKU}
              onChange={(e) => setSearchSKU(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
            />
          </div>

          {product.hasSerialNumber && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
              <input
                type="text"
                placeholder="Buscar por N° Serie..."
                value={searchSerial}
                onChange={(e) => setSearchSerial(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
              />
            </div>
          )}

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
          >
            <option value="">Todas las localizaciones</option>
            {LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            value={filterSede}
            onChange={(e) => setFilterSede(e.target.value)}
            className="px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
          >
            <option value="">Todas las sedes</option>
            <option value="Vecindario">Vecindario</option>
            <option value="San Fernando">San Fernando</option>
            <option value="Maestro Falla">Maestro Falla</option>
            <option value="Tenerife">Tenerife</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="in-use">En Uso</option>
            <option value="maintenance">Mantenimiento</option>
            <option value="out-of-use">Fuera de Uso</option>
          </select>
        </div>

        {/* Botón para limpiar filtros */}
        {(searchSKU || searchSerial || filterLocation || filterSede || filterStatus) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchSKU("");
                setSearchSerial("");
                setFilterLocation("");
                setFilterSede("");
                setFilterStatus("");
              }}
              className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Sección de Stock Mínimo */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#6b7280]" />
            <div>
              <h3 className="text-sm font-medium text-[#111827]">Stock Mínimo del Producto</h3>
              {!isEditingMinStock && (
                <p className="text-sm text-[#6b7280] mt-1">
                  {product.minStock !== undefined
                    ? `Este producto tiene un stock mínimo configurado de ${product.minStock} unidades`
                    : "Este producto no tiene stock mínimo asignado"}
                </p>
              )}
            </div>
          </div>
          
          {!isEditingMinStock ? (
            <button
              onClick={() => setIsEditingMinStock(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white text-sm rounded-lg hover:bg-[#2563eb] transition-colors"
              disabled={!onUpdateProduct}
              title={!onUpdateProduct ? "No se puede editar el stock mínimo" : "Editar stock mínimo"}
            >
              <Pencil className="w-4 h-4" />
              Editar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1"
                value={minStockValue}
                onChange={(e) => setMinStockValue(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder=""
                className="w-32 px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
              />
              <button
                onClick={handleSaveMinStock}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                title="Guardar"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelMinStock}
                className="flex items-center gap-1 px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Botones de control global de secciones */}
      <div className="mb-6 flex justify-end gap-2">
        <button
          onClick={() => {
            setIsUnitsExpanded(true);
            setIsStockHistoryExpanded(true);
            setIsMovementsExpanded(true);
          }}
          disabled={isUnitsExpanded && isStockHistoryExpanded && isMovementsExpanded}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            isUnitsExpanded && isStockHistoryExpanded && isMovementsExpanded
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#3b82f6] text-white hover:bg-[#2563eb]'
          }`}
          title="Desplegar todas las secciones"
        >
          Desplegar todos
        </button>
        <button
          onClick={() => {
            setIsUnitsExpanded(false);
            setIsStockHistoryExpanded(false);
            setIsMovementsExpanded(false);
          }}
          disabled={!isUnitsExpanded && !isStockHistoryExpanded && !isMovementsExpanded}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            !isUnitsExpanded && !isStockHistoryExpanded && !isMovementsExpanded
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb]'
          }`}
          title="Contraer todas las secciones"
        >
          Contraer todos
        </button>
      </div>

      {/* Tabla de unidades */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden mb-6">
        {/* Header con botón de colapsar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all" onClick={() => setIsUnitsExpanded(!isUnitsExpanded)}>
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-white" />
            <div>
              <h3 className="text-lg font-semibold text-white">Lista de Unidades</h3>
              <p className="text-sm text-blue-100">{filteredUnits.length} unidad{filteredUnits.length !== 1 ? 'es' : ''} registrada{filteredUnits.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title={isUnitsExpanded ? "Comprimir lista" : "Expandir lista"}
          >
            {isUnitsExpanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Botón flotante para mover seleccionadas */}
        {selectedUnits.length > 0 && isUnitsExpanded && (
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedUnits.length} unidad{selectedUnits.length > 1 ? "es" : ""} seleccionada{selectedUnits.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedUnits([])}
                  className="px-3 py-1.5 text-sm text-blue-700 hover:text-blue-900 font-medium transition-colors"
                >
                  Deseleccionar todas
                </button>
                <button
                  onClick={() => setIsBulkMoveModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Mover seleccionadas
                </button>
              </div>
            </div>
          </div>
        )}
        
        {isUnitsExpanded && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    N° Unidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    SKU
                  </th>
                  {product.hasSerialNumber && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      N° de Serie
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    Localización
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                        <PackagePlus className="w-4 h-4 text-white" />
                      </div>
                      <span>Acciones</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={product.hasSerialNumber ? 6 : 5} className="px-6 py-12 text-center text-[#6b7280]">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="w-12 h-12 text-[#d1d5db]" />
                        <p>
                          {activeUnits.length === 0
                            ? "No hay unidades registradas. Haz clic en 'Nueva Unidad' para agregar."
                            : "No se encontraron unidades con los filtros aplicados"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((unit, index) => (
                    <tr key={unit.id} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-[#6b7280]" />
                          {unit.sku}
                        </div>
                      </td>
                      {product.hasSerialNumber && (
                        <td className="px-6 py-4 text-sm text-[#374151] font-mono">
                          {unit.serialNumber || "N/A"}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-[#374151]">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#6b7280]" />
                          {unit.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                            unit.status
                          )}`}
                        >
                          {getStatusLabel(unit.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditUnit(unit)}
                            className="p-2 text-[#3b82f6] hover:bg-[#eff6ff] rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveUnit(unit)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg transition-colors"
                            title="Mover unidad"
                          >
                            Mover a
                          </button>
                          <button
                            onClick={() => handleSelectUnit(unit.id)}
                            className={`p-2 ${selectedUnits.includes(unit.id) ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"} rounded-lg transition-colors`}
                            title="Seleccionar"
                          >
                            {selectedUnits.includes(unit.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección de Historial de Stock */}
      {stockHistory && stockHistory.length > 0 && (
        <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex items-center justify-between cursor-pointer hover:from-green-700 hover:to-green-800 transition-all" onClick={() => setIsStockHistoryExpanded(!isStockHistoryExpanded)}>
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-lg font-semibold text-white">Historial de Stock</h3>
                <p className="text-sm text-green-100">Registro de cambios en el stock para este producto</p>
              </div>
            </div>
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={isStockHistoryExpanded ? "Comprimir historial" : "Expandir historial"}
            >
              {isStockHistoryExpanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
            </button>
          </div>
          
          {isStockHistoryExpanded && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      Stock Anterior
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      Stock Nuevo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      Razon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {stockHistory.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            ["recibido", "add", "order-received"].includes(entry.action) 
                              ? "bg-green-500" 
                              : ["retirado", "remove"].includes(entry.action)
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}>
                            {getActionIcon(entry.action)}
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getActionColor(entry.action)}`}>
                            {getActionLabel(entry.action)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                        {entry.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">
                        {entry.previousStock}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                        {entry.newStock}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">
                        {entry.reason || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">
                        {entry.user || "Sistema"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">
                        {new Date(entry.timestamp).toLocaleString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sección de Historial de Movimientos */}
      {movements && movements.length > 0 && (() => {
        // Función para determinar si un número de serie es real
        const hasRealSerialNumber = (serialNumber: string) => {
          return serialNumber && 
                 serialNumber !== "N/A" && 
                 serialNumber !== "-" && 
                 serialNumber.trim() !== "";
        };

        // Función para formatear fecha
        const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        };

        // Agrupar movimientos
        interface GroupedMovement {
          id: string;
          quantity: number;
          fromLocation: string;
          toLocation: string;
          timestamp: string;
          user?: string;
          employeeId?: string;
          employeeName?: string;
          units: Array<{
            id: string;
            sku?: string;
            serialNumber?: string;
          }>;
          hasSerialNumbers: boolean;
        }

        const groupedMovements = movements.reduce((acc: GroupedMovement[], current) => {
          const hasSerial = hasRealSerialNumber(current.serialNumber);

          // Buscar si ya existe un grupo similar
          const existingIndex = acc.findIndex(group => 
            group.fromLocation === current.fromLocation &&
            group.toLocation === current.toLocation &&
            group.employeeId === current.employeeId &&
            formatDate(group.timestamp) === formatDate(current.timestamp)
          );

          if (existingIndex > -1) {
            // Agregar al grupo existente
            acc[existingIndex].quantity += 1;
            acc[existingIndex].units.push({
              id: current.id,
              sku: current.productSku,
              serialNumber: hasSerial ? current.serialNumber : undefined,
            });
            if (hasSerial) {
              acc[existingIndex].hasSerialNumbers = true;
            }
          } else {
            // Crear nuevo grupo
            acc.push({
              id: `group_${current.id}`,
              quantity: 1,
              fromLocation: current.fromLocation,
              toLocation: current.toLocation,
              timestamp: current.timestamp,
              user: current.user,
              employeeId: current.employeeId,
              employeeName: current.employeeName,
              units: [{
                id: current.id,
                sku: current.productSku,
                serialNumber: hasSerial ? current.serialNumber : undefined,
              }],
              hasSerialNumbers: hasSerial,
            });
          }

          return acc;
        }, []);

        const toggleRowExpansion = (rowId: string) => {
          setExpandedMovementRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(rowId)) {
              newSet.delete(rowId);
            } else {
              newSet.add(rowId);
            }
            return newSet;
          });
        };

        // Identificar filas expandibles
        const expandableRows = groupedMovements
          .filter(group => !group.hasSerialNumbers && group.quantity > 1)
          .map(group => group.id);

        return (
          <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between cursor-pointer hover:from-purple-700 hover:to-purple-800 transition-all" onClick={() => setIsMovementsExpanded(!isMovementsExpanded)}>
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Historial de Movimientos</h3>
                  <p className="text-sm text-purple-100">Registro de traslados entre localizaciones para este producto</p>
                </div>
              </div>
              <button
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={isMovementsExpanded ? "Comprimir historial" : "Expandir historial"}
              >
                {isMovementsExpanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
              </button>
            </div>
            
            {isMovementsExpanded && (
              <>
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        {/* Columna para expandir */}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Ubicación Origen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Ubicación Destino
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Empleado Asignado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {groupedMovements.flatMap((group) => {
                      const isExpanded = expandedMovementRows.has(group.id);
                      const showExpandButton = !group.hasSerialNumbers && group.quantity > 1;
                      
                      const rows = [
                        <tr 
                          key={group.id}
                          className={`hover:bg-[#f9fafb] transition-colors ${showExpandButton ? 'cursor-pointer' : ''}`}
                          onClick={() => showExpandButton && toggleRowExpansion(group.id)}
                        >
                          <td className="px-6 py-4 text-sm text-[#374151] w-10">
                            {showExpandButton && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(group.id);
                                }}
                                className="text-[#6b7280] hover:text-[#111827] transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-5 h-5" />
                                ) : (
                                  <ChevronRight className="w-5 h-5" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              group.quantity > 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {group.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#374151]">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-red-500" />
                              <span className="text-red-700 font-medium">{group.fromLocation}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#374151]">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-green-500" />
                              <span className="text-green-700 font-medium">{group.toLocation}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#374151]">
                            {group.user || "Sistema"}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#374151]">
                            {group.employeeName ? (
                              <span className="text-blue-700 font-medium">{group.employeeName}</span>
                            ) : (
                              "No asignado"
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                            {formatDate(group.timestamp)}
                          </td>
                        </tr>
                      ];
                      
                      // Agregar fila expandida si está expandido
                      if (isExpanded && showExpandButton) {
                        rows.push(
                          <tr key={`${group.id}-expanded`} className="bg-[#f9fafb]">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="pl-8">
                                <h4 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
                                  SKU de las unidades movidas:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {group.units.map((unit) => (
                                    <div 
                                      key={unit.id} 
                                      className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-[#e5e7eb]"
                                    >
                                      <Hash className="w-4 h-4 text-[#6b7280]" />
                                      <span className="text-sm text-[#374151]">
                                        {unit.sku || "Sin SKU"}
                                        {unit.serialNumber && (
                                          <span className="ml-2 text-xs text-[#6b7280] font-mono">
                                            ({unit.serialNumber})
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      
                      return rows;
                    })}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        );
      })()}

      {/* Modals */}
      {/* Modal de Crear/Editar Unidad */}
      {isUnitModalOpen && (
        <UnitModal
          unit={editingUnit}
          onClose={() => {
            setIsUnitModalOpen(false);
            setEditingUnit(null);
          }}
          onSave={handleSaveUnit}
          requiresSerialNumber={product.hasSerialNumber || false}
          productSKU={product.sku}
          defaultReference={product.orderNumber} // Nuevo prop para autocompletar
        />
      )}

      {/* Modal de Mover Unidad */}
      {isMoveUnitModalOpen && movingUnit && (
        <MoveUnitModal
          currentLocation={movingUnit.location}
          onClose={() => {
            setIsMoveUnitModalOpen(false);
            setMovingUnit(null);
          }}
          onMove={handleConfirmMove}
          employees={employees}
        />
      )}

      {/* Modal de Añadir Unidades en Lote */}
      {isBulkAddModalOpen && (
        <BulkAddUnitsModal
          onClose={() => setIsBulkAddModalOpen(false)}
          onBulkAdd={handleBulkAdd}
          unitsToAdd={product.stock - activeUnits.length}
          requiresSerialNumber={product.hasSerialNumber || false}
          defaultReference={product.orderNumber} // Nuevo prop para autocompletar
        />
      )}

      {/* Modal de Mover Unidades en Lote */}
      {isBulkMoveModalOpen && (
        <BulkMoveUnitsModal
          onClose={() => setIsBulkMoveModalOpen(false)}
          onBulkMove={handleBulkMove}
          unitsCount={selectedUnits.length}
          currentLocations={selectedUnits.map(id => units.find(u => u.id === id)?.location || "").filter(loc => loc !== "")}
          employees={employees}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirmUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-red-600 mb-4">Confirmar Eliminación</h3>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro de que deseas eliminar la unidad <strong>{deleteConfirmUnit.serialNumber}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmUnit(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación Masiva */}
      {deleteBulkConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-medium text-red-600 mb-4">Confirmar Eliminación Masiva</h3>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro de que deseas eliminar <strong>{selectedUnits.length} unidad{selectedUnits.length > 1 ? "es" : ""}</strong>? 
              {selectedUnits.length > 1 ? " Estas" : " Esta"} se moverá{selectedUnits.length > 1 ? "n" : ""} a la papelera y podrá{selectedUnits.length > 1 ? "n" : ""} ser restaurada{selectedUnits.length > 1 ? "s" : ""} más tarde.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteBulkConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar {selectedUnits.length} unidad{selectedUnits.length > 1 ? "es" : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ajuste de Stock */}
      {isStockVariationModalOpen && (
        <ProductStockVariationModal
          isOpen={isStockVariationModalOpen}
          onClose={() => setIsStockVariationModalOpen(false)}
          product={product}
          units={activeUnits}
          onStockAdjustment={handleConfirmStockVariation}
        />
      )}
    </div>
  );
}