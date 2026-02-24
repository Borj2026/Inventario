import { useState } from "react";
import { Package, Calendar, Building2, MapPin, AlertCircle, CheckCircle, Plus, X, Save, Undo } from "lucide-react";

interface PendingStockItem {
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  pendingQuantity: number;
  arrivals: Array<{
    date: string;
    quantity: number;
  }>;
}

interface PendingStock {
  id: string;
  orderNumber: string;
  supplier: string;
  company: string;
  warehouse: string;
  orderDate: string;
  items: PendingStockItem[];
}

interface PendingStockHistoryProps {
  pendingStocks: PendingStock[];
  onUpdatePendingStock?: (stockId: string, updatedItems: PendingStockItem[]) => void;
  onAddProductsToInventory?: (products: Array<{
    productName: string;
    quantity: number;
    company: string;
    supplier: string;
    warehouse: string;
  }>) => void;
}

export function PendingStockHistory({ pendingStocks, onUpdatePendingStock, onAddProductsToInventory }: PendingStockHistoryProps) {
  const [filters, setFilters] = useState({
    company: "",
    supplier: "",
    orderNumber: "",
  });

  // Estados para el modal de añadir stock
  const [addStockModal, setAddStockModal] = useState<{
    isOpen: boolean;
    stock: PendingStock | null;
  }>({
    isOpen: false,
    stock: null
  });

  const [distributionData, setDistributionData] = useState<Record<string, {
    receivedQuantity: number;
    arrivals: Array<{ date: string; quantity: number }>;
  }>>({});

  const [warningModal, setWarningModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ""
  });

  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ""
  });

  // Estado para cambios pendientes
  const [pendingChanges, setPendingChanges] = useState<Record<string, {
    items: PendingStockItem[];
    productsToAdd: Array<{
      productName: string;
      quantity: number;
      company: string;
      supplier: string;
      warehouse: string;
    }>;
  }>>({});

  // Estado para modales de confirmación
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "distribution" | "save" | null;
    message: string;
  }>({
    isOpen: false,
    type: null,
    message: ""
  });

  // Obtener valores únicos para los filtros
  const uniqueCompanies = [...new Set(pendingStocks.map(stock => stock.company))];
  const uniqueSuppliers = [...new Set(pendingStocks.map(stock => stock.supplier))];

  // Función para manejar la confirmación de añadir stock (guardar temporalmente)
  const handleAddStockConfirm = () => {
    if (!addStockModal.stock) return;

    // Validar que no se exceda la cantidad pendiente
    const hasOverAllocation = addStockModal.stock.items.some(item => {
      const distData = distributionData[item.productName] || { receivedQuantity: 0, arrivals: [] };
      const totalArrivals = distData.arrivals.reduce((sum, arr) => sum + (arr.quantity || 0), 0);
      const totalAllocated = distData.receivedQuantity + totalArrivals;
      return totalAllocated > item.pendingQuantity;
    });

    if (hasOverAllocation) {
      setWarningModal({
        isOpen: true,
        message: "La suma de la cantidad recibida y las llegadas previstas no puede superar la cantidad pendiente."
      });
      return;
    }

    // Preparar productos a añadir al inventario
    const productsToAdd = addStockModal.stock.items
      .filter(item => {
        const distData = distributionData[item.productName];
        return distData && distData.receivedQuantity > 0;
      })
      .map(item => {
        const distData = distributionData[item.productName];
        return {
          productName: item.productName,
          quantity: distData.receivedQuantity,
          company: addStockModal.stock!.company,
          supplier: addStockModal.stock!.supplier,
          warehouse: addStockModal.stock!.warehouse
        };
      });

    // Actualizar el stock pendiente (temporalmente)
    const updatedItems = addStockModal.stock.items.map(item => {
      const distData = distributionData[item.productName] || { receivedQuantity: 0, arrivals: [] };
      const newReceivedQuantity = item.receivedQuantity + distData.receivedQuantity;
      const newPendingQuantity = item.orderedQuantity - newReceivedQuantity;

      return {
        ...item,
        receivedQuantity: newReceivedQuantity,
        pendingQuantity: newPendingQuantity,
        arrivals: distData.arrivals.filter(arr => arr.quantity > 0) // Solo mantener llegadas con cantidad
      };
    });

    // Guardar cambios temporalmente
    setPendingChanges({
      ...pendingChanges,
      [addStockModal.stock.id]: {
        items: updatedItems,
        productsToAdd
      }
    });

    // Cerrar modal y limpiar estado
    setAddStockModal({ isOpen: false, stock: null });
    setDistributionData({});

    // Mostrar mensaje informativo en rojo
    setWarningModal({
      isOpen: true,
      message: "Debes pulsar en 'Guardar Cambios' para conservar los valores."
    });
  };

  // Función para guardar todos los cambios pendientes
  const handleSaveAllChanges = () => {
    if (!onUpdatePendingStock || !onAddProductsToInventory) return;

    // Aplicar todos los cambios pendientes
    Object.entries(pendingChanges).forEach(([stockId, changes]) => {
      // Añadir productos al inventario
      if (changes.productsToAdd.length > 0) {
        onAddProductsToInventory(changes.productsToAdd);
      }

      // Actualizar el stock pendiente
      onUpdatePendingStock(stockId, changes.items);
    });

    // Limpiar cambios pendientes
    setPendingChanges({});

    // Mostrar mensaje de éxito
    setSuccessModal({
      isOpen: true,
      message: "Todos los cambios se han aplicado correctamente. Los productos recibidos se han añadido al inventario."
    });
  };

  // Filtrar stocks pendientes
  const filteredStocks = pendingStocks.filter(stock => {
    if (filters.company && stock.company !== filters.company) return false;
    if (filters.supplier && stock.supplier !== filters.supplier) return false;
    if (filters.orderNumber && !stock.orderNumber.includes(filters.orderNumber)) return false;
    return true;
  });

  if (pendingStocks.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Historial Stock Pendiente</h2>
          <p className="text-sm text-[#6b7280] mt-1">Consulta los stocks pendientes de recibir</p>
        </div>
        
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-12 text-center">
          <Package className="w-16 h-16 text-[#9ca3af] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#111827] mb-2">No hay stock pendiente</h3>
          <p className="text-sm text-[#6b7280]">Los pedidos con entregas parciales aparecerán aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Historial Stock Pendiente</h2>
          <p className="text-sm text-[#6b7280] mt-1">Consulta los stocks pendientes de recibir</p>
        </div>
        {/* Botones Guardar Cambios y Deshacer */}
        {Object.keys(pendingChanges).length > 0 && (
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPendingChanges({});
                  setSuccessModal({
                    isOpen: true,
                    message: "Todos los cambios pendientes han sido descartados."
                  });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Undo className="w-4 h-4" />
                Deshacer Cambios
              </button>
              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    type: "save",
                    message: "¿Estás seguro de que deseas guardar todos los cambios? Los productos recibidos se añadirán al inventario y se actualizarán los registros de stock pendiente."
                  });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
            <p className="text-sm text-red-600 font-medium">Acuérdate de guardar los cambios</p>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 md:p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#111827] mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Empresa
            </label>
            <select
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
            >
              <option value="">Todas</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Proveedor
            </label>
            <select
              value={filters.supplier}
              onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
            >
              <option value="">Todos</option>
              {uniqueSuppliers.map(supplier => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              N° Pedido
            </label>
            <input
              type="text"
              value={filters.orderNumber}
              onChange={(e) => setFilters({ ...filters, orderNumber: e.target.value })}
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
              placeholder="Buscar por número de pedido"
            />
          </div>
        </div>

        {/* Botón para limpiar filtros */}
        {(filters.company || filters.supplier || filters.orderNumber) && (
          <div className="mt-4">
            <button
              onClick={() => setFilters({ company: "", supplier: "", orderNumber: "" })}
              className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de stocks pendientes */}
      <div className="space-y-4">
        {filteredStocks.map((stock) => (
          <div key={stock.id} className="bg-white rounded-lg border border-[#e5e7eb] p-4 md:p-6">
            {/* Cabecera del pedido */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-[#e5e7eb]">
              <div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">{stock.orderNumber}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-[#6b7280]">
                    <Building2 className="w-4 h-4" />
                    <span>{stock.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6b7280]">
                    <MapPin className="w-4 h-4" />
                    <span>{stock.warehouse}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6b7280]">
                    <Package className="w-4 h-4" />
                    <span>{stock.supplier}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6b7280]">
                    <Calendar className="w-4 h-4" />
                    <span>{stock.orderDate}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 md:mt-0">
                <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded bg-yellow-100 text-yellow-700">
                  <AlertCircle className="w-4 h-4" />
                  Pendiente
                </span>
              </div>
            </div>

            {/* Productos del pedido */}
            <div className="space-y-4">
              {stock.items.map((item, idx) => (
                <div key={idx} className="bg-[#f9fafb] rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-[#111827] mb-1">{item.productName}</h4>
                      <div className="flex flex-wrap gap-4 text-sm text-[#6b7280]">
                        <span>Total pedido: <strong>{item.orderedQuantity}</strong></span>
                        <span className="text-green-600">Recibido: <strong>{item.receivedQuantity}</strong></span>
                        <span className="text-yellow-600">Pendiente: <strong>{item.pendingQuantity}</strong></span>
                      </div>
                    </div>
                    {/* Barra de progreso */}
                    <div className="mt-3 md:mt-0 md:ml-4 w-full md:w-48">
                      <div className="relative pt-1">
                        <div className="flex mb-1 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-green-600">
                              {Math.round((item.receivedQuantity / item.orderedQuantity) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-[#e5e7eb]">
                          <div
                            style={{ width: `${(item.receivedQuantity / item.orderedQuantity) * 100}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fechas de llegada previstas */}
                  {item.arrivals.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#e5e7eb]">
                      <p className="text-xs font-medium text-[#6b7280] mb-2">Llegadas previstas:</p>
                      <div className="space-y-1">
                        {item.arrivals.map((arrival, arrivalIdx) => (
                          <div key={arrivalIdx} className="flex items-center gap-2 text-sm">
                            <Calendar className="w-3 h-3 text-[#6b7280]" />
                            <span className="text-[#374151]">
                              <strong>{arrival.quantity}</strong> unidades{arrival.date === "unknown" ? " - " : " el "}<strong className={arrival.date === "unknown" ? "text-amber-600" : ""}>{arrival.date === "unknown" ? "Fecha desconocida" : arrival.date}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Botón para añadir stock */}
            <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
              <button
                onClick={() => {
                  // Inicializar distributionData con los datos actuales del pedido
                  const initialData: Record<string, { receivedQuantity: number; arrivals: Array<{ date: string; quantity: number }> }> = {};
                  stock.items.forEach(item => {
                    initialData[item.productName] = {
                      receivedQuantity: 0,
                      arrivals: item.arrivals.length > 0 ? item.arrivals : [{ date: "", quantity: 0 }]
                    };
                  });
                  setDistributionData(initialData);
                  setAddStockModal({ isOpen: true, stock });
                }}
                className="w-full px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Añadir Stock
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-12 text-center">
          <Package className="w-16 h-16 text-[#9ca3af] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#111827] mb-2">No se encontraron stocks pendientes</h3>
          <p className="text-sm text-[#6b7280]">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Modal de añadir stock */}
      {addStockModal.isOpen && addStockModal.stock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#111827]">Añadir Stock Recibido</h3>
              <button
                onClick={() => setAddStockModal({ isOpen: false, stock: null })}
                className="p-1 hover:bg-[#f3f4f6] rounded transition-colors"
              >
                <X className="w-5 h-5 text-[#6b7280]" />
              </button>
            </div>

            <p className="text-sm text-[#374151] px-6 pt-4">
              Distribuye el stock recibido entre los productos del pedido <strong>{addStockModal.stock.orderNumber}</strong>.
            </p>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {addStockModal.stock.items.map((item) => {
                  const distData = distributionData[item.productName] || {
                    receivedQuantity: 0,
                    arrivals: [{ date: "", quantity: 0 }]
                  };
                  
                  const totalArrivals = distData.arrivals.reduce((sum, arr) => sum + (arr.quantity || 0), 0);
                  const totalAllocated = distData.receivedQuantity + totalArrivals;
                  const isOverAllocated = totalAllocated > item.pendingQuantity;
                  const newPendingQuantity = item.pendingQuantity - distData.receivedQuantity;

                  return (
                    <div key={item.productName} className={`bg-white p-4 rounded-lg border ${isOverAllocated ? 'border-red-300 ring-1 ring-red-300' : 'border-[#e5e7eb]'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-[#111827]">{item.productName}</p>
                          <p className="text-xs text-[#6b7280]">Cantidad pendiente: {item.pendingQuantity}</p>
                        </div>
                        {isOverAllocated && (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            Exceso: {totalAllocated - item.pendingQuantity}
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* Cantidad recibida */}
                        <div>
                          <label className="block text-xs font-medium text-[#374151] mb-1">
                            Cantidad recibida ahora
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={item.pendingQuantity}
                            value={distData.receivedQuantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setDistributionData({
                                ...distributionData,
                                [item.productName]: {
                                  ...distData,
                                  receivedQuantity: Math.min(value, item.pendingQuantity)
                                }
                              });
                            }}
                            className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                          />
                        </div>

                        {/* Nueva cantidad pendiente (auto-calculada) */}
                        <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                          <p className="text-xs font-medium text-yellow-800">
                            Nueva cantidad pendiente: <strong>{Math.max(0, newPendingQuantity)}</strong> unidades
                          </p>
                        </div>

                        {/* Llegadas futuras */}
                        {newPendingQuantity > 0 && (
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-[#374151]">
                              Actualizar llegadas previstas (opcional)
                            </label>
                            {distData.arrivals.map((arrival, arrivalIdx) => {
                              const isUnknownDate = arrival.date === "unknown";
                              
                              return (
                                <div key={arrivalIdx} className="space-y-2">
                                  <div className="flex gap-2 items-start">
                                    <div className="flex-1">
                                      <input
                                        type="date"
                                        value={isUnknownDate ? "" : arrival.date}
                                        onChange={(e) => {
                                          const newArrivals = [...distData.arrivals];
                                          newArrivals[arrivalIdx].date = e.target.value;
                                          setDistributionData({
                                            ...distributionData,
                                            [item.productName]: {
                                              ...distData,
                                              arrivals: newArrivals
                                            }
                                          });
                                        }}
                                        disabled={isUnknownDate}
                                        className={`w-full px-2 py-1 text-xs border border-[#d1d5db] rounded focus:outline-none focus:ring-2 focus:ring-[#3b82f6] ${isUnknownDate ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                      />
                                    </div>
                                    <div className="w-20">
                                      <input
                                        type="number"
                                        min="0"
                                        value={arrival.quantity}
                                        onChange={(e) => {
                                          const newArrivals = [...distData.arrivals];
                                          newArrivals[arrivalIdx].quantity = parseInt(e.target.value) || 0;
                                          setDistributionData({
                                            ...distributionData,
                                            [item.productName]: {
                                              ...distData,
                                              arrivals: newArrivals
                                            }
                                          });
                                        }}
                                        placeholder="Cant."
                                        className="w-full px-2 py-1 text-xs border border-[#d1d5db] rounded focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                                      />
                                    </div>
                                    <button
                                      onClick={() => {
                                        const newArrivals = distData.arrivals.filter((_, idx) => idx !== arrivalIdx);
                                        setDistributionData({
                                          ...distributionData,
                                          [item.productName]: {
                                            ...distData,
                                            arrivals: newArrivals.length > 0 ? newArrivals : [{ date: "", quantity: 0 }]
                                          }
                                        });
                                      }}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  
                                  {/* Checkbox para marcar fecha como desconocida */}
                                  <div className="ml-1">
                                    <label className="flex items-center gap-2 text-xs text-[#6b7280] cursor-pointer hover:text-[#374151]">
                                      <input
                                        type="checkbox"
                                        checked={isUnknownDate}
                                        onChange={(e) => {
                                          const newArrivals = [...distData.arrivals];
                                          newArrivals[arrivalIdx].date = e.target.checked ? "unknown" : "";
                                          setDistributionData({
                                            ...distributionData,
                                            [item.productName]: {
                                              ...distData,
                                              arrivals: newArrivals
                                            }
                                          });
                                        }}
                                        className="w-3 h-3 text-[#3b82f6] border-gray-300 rounded focus:ring-2 focus:ring-[#3b82f6]"
                                      />
                                      <span className={isUnknownDate ? "font-medium text-amber-600" : ""}>
                                        Fecha desconocida
                                      </span>
                                    </label>
                                  </div>
                                </div>
                              );
                            })}
                            <button
                              onClick={() => {
                                setDistributionData({
                                  ...distributionData,
                                  [item.productName]: {
                                    ...distData,
                                    arrivals: [...distData.arrivals, { date: "", quantity: 0 }]
                                  }
                                });
                              }}
                              className="text-xs text-[#3b82f6] hover:text-[#2563eb] flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Añadir fecha de llegada
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-[#e5e7eb] flex gap-3">
              <button
                onClick={() => setAddStockModal({ isOpen: false, stock: null })}
                className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    type: "distribution",
                    message: "¿Estás seguro de que deseas confirmar esta repartición? Los cambios se guardarán temporalmente."
                  });
                }}
                className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
              >
                Confirmar Repartición
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de advertencia */}
      {warningModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border-2 border-red-500">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-700">Advertencia</h3>
                <button
                  onClick={() => setWarningModal({ isOpen: false, message: "" })}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>
              <div className="flex items-start gap-3 bg-red-50 p-4 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{warningModal.message}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setWarningModal({ isOpen: false, message: "" })}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {successModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#111827]">Éxito</h3>
                <button
                  onClick={() => setSuccessModal({ isOpen: false, message: "" })}
                  className="p-1 hover:bg-[#f3f4f6] rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b7280]" />
                </button>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#374151]">{successModal.message}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSuccessModal({ isOpen: false, message: "" })}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#111827]">Confirmación</h3>
                <button
                  onClick={() => setConfirmModal({ isOpen: false, type: null, message: "" })}
                  className="p-1 hover:bg-[#f3f4f6] rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b7280]" />
                </button>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#374151]">{confirmModal.message}</p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, type: null, message: "" })}
                  className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (confirmModal.type === "distribution") {
                      handleAddStockConfirm();
                    } else if (confirmModal.type === "save") {
                      handleSaveAllChanges();
                    }
                    setConfirmModal({ isOpen: false, type: null, message: "" });
                  }}
                  className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
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