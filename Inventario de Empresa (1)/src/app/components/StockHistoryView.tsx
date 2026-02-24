import { useState } from "react";
import { History, Package, Calendar, Search, Filter, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

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

interface StockHistoryViewProps {
  stockHistory: StockHistoryEntry[];
  onViewProductUnits?: (productId: string) => void;
}

export function StockHistoryView({ stockHistory, onViewProductUnits }: StockHistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Filtrar historial
  const filteredHistory = stockHistory.filter((entry) => {
    const matchesSearch =
      entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.productSku.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de acción mejorado
    let matchesAction = !filterAction;
    if (filterAction) {
      if (filterAction === "positive") {
        matchesAction = ["recibido", "add", "order-received"].includes(entry.action) || 
                       (entry.action === "adjust" && entry.newStock > entry.previousStock);
      } else if (filterAction === "negative") {
        matchesAction = ["retirado", "remove"].includes(entry.action) || 
                       (entry.action === "adjust" && entry.newStock < entry.previousStock);
      } else {
        matchesAction = entry.action === filterAction;
      }
    }

    const matchesCompany = !filterCompany || entry.company === filterCompany;
    const matchesCategory = !filterCategory || entry.category === filterCategory;

    // Filtro de fecha
    let matchesDate = true;
    if (selectedDate) {
      const entryDate = new Date(entry.timestamp);
      const filterDate = new Date(selectedDate);
      
      // Comparar solo las fechas (sin horas)
      matchesDate = entryDate.toDateString() === filterDate.toDateString();
    }

    return matchesSearch && matchesAction && matchesCompany && matchesCategory && matchesDate;
  });

  // Obtener valores únicos para filtros
  const companies = [...new Set(stockHistory.map((h) => h.company))];
  const categories = [...new Set(stockHistory.map((h) => h.category))];

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
    // Ajustes (Depende, por ahora Amarillo/Naranja o Gris)
    if (action === "adjust") {
      return "bg-orange-100 text-orange-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  const getActionIcon = (action: string) => {
    if (["recibido", "add", "order-received"].includes(action)) {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
          <ArrowDownCircle className="w-5 h-5 text-white" />
        </div>
      );
    } else if (["retirado", "remove"].includes(action)) {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
          <ArrowUpCircle className="w-5 h-5 text-white" />
        </div>
      );
    } else if (action === "adjust") {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
          <Filter className="w-5 h-5 text-white" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-sm">
        <Package className="w-5 h-5 text-white" />
      </div>
    );
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (stockHistory.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Historial de Stock</h2>
          <p className="text-sm text-[#6b7280] mt-1">Registro de todos los cambios en el inventario</p>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-[#f3f4f6] rounded-full flex items-center justify-center">
            <History className="w-12 h-12 text-[#9ca3af]" />
          </div>
          <h3 className="text-lg font-medium text-[#111827] mb-2">No hay historial de stock</h3>
          <p className="text-sm text-[#6b7280]">
            Los cambios en el inventario aparecerán aquí automáticamente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Historial de Stock</h2>
        <p className="text-sm text-[#6b7280] mt-1">
          {filteredHistory.length} movimiento{filteredHistory.length !== 1 ? "s" : ""} registrado
          {filteredHistory.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#6b7280]" />
          <h3 className="text-sm font-medium text-[#111827]">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
          >
            <option value="">Todas las acciones</option>
            <option value="positive">Entradas (Recibido/Agregado)</option>
            <option value="negative">Salidas (Retirado)</option>
            <option value="adjust">Ajustes</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
          >
            <option value="">Todas las empresas</option>
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
          />
        </div>

        {/* Botón para limpiar filtros */}
        {(searchTerm || filterAction || filterCategory || filterCompany || selectedDate) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterAction("");
                setFilterCategory("");
                setFilterCompany("");
                setSelectedDate("");
              }}
              className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla de historial */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Referencia / Motivo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Stock Anterior
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Stock Nuevo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {filteredHistory.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-6 py-4">
                    {onViewProductUnits ? (
                      <button
                        onClick={() => onViewProductUnits(entry.productId)}
                        className="text-left hover:bg-[#eff6ff] px-2 py-1 rounded transition-colors"
                      >
                        <p className="text-sm font-medium text-[#3b82f6] hover:text-[#2563eb]">
                          {entry.productName}
                        </p>
                      </button>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{entry.productName}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getActionIcon(entry.action)}
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getActionColor(
                          entry.action
                        )}`}
                      >
                        {getActionLabel(entry.action)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6b7280]">
                    {entry.reason || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-sm font-medium ${
                        ["recibido", "add", "order-received"].includes(entry.action) || (entry.action === "adjust" && entry.newStock > entry.previousStock)
                          ? "text-green-600"
                          : ["retirado", "remove"].includes(entry.action) || (entry.action === "adjust" && entry.newStock < entry.previousStock)
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {entry.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-[#6b7280]">
                    {entry.previousStock}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-[#111827]">
                    {entry.newStock}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#374151]">{entry.company}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                      <Calendar className="w-4 h-4" />
                      {formatDate(entry.timestamp)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredHistory.length === 0 && stockHistory.length > 0 && (
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-8 text-center mt-6">
          <Package className="w-12 h-12 text-[#9ca3af] mx-auto mb-4" />
          <p className="text-sm text-[#6b7280]">No se encontraron movimientos con los filtros aplicados</p>
        </div>
      )}
    </div>
  );
}