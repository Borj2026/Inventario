import { useState } from "react";
import { ArrowRightLeft, Search, MapPin, Hash, Calendar, Package, Filter, User, ChevronDown, ChevronRight } from "lucide-react";

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

interface GroupedMovement {
  id: string;
  productName: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  timestamp: string;
  user?: string;
  employeeId?: string;
  employeeName?: string;
  units: Array<{
    id: string;
    unitId: string;
    sku?: string;
    serialNumber?: string;
  }>;
  hasSerialNumbers: boolean; // true si al menos una unidad tiene número de serie real
}

interface StockMovementsViewProps {
  movements: StockMovement[];
}

export function StockMovementsView({ movements }: StockMovementsViewProps) {
  const [searchProduct, setSearchProduct] = useState("");
  const [searchSerial, setSearchSerial] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Función para determinar si un número de serie es real
  const hasRealSerialNumber = (serialNumber: string) => {
    return serialNumber && 
           serialNumber !== "N/A" && 
           serialNumber !== "-" && 
           serialNumber.trim() !== "";
  };

  // Filtrar movimientos
  const filteredMovements = movements.filter((movement) => {
    const matchesProduct = !searchProduct || movement.productName.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesSerial = !searchSerial || movement.serialNumber.toLowerCase().includes(searchSerial.toLowerCase());
    const matchesLocation = !filterLocation || 
      movement.fromLocation === filterLocation || 
      movement.toLocation === filterLocation;
    
    // Filtrar por fecha
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const movementDate = new Date(movement.timestamp);
      movementDate.setHours(0, 0, 0, 0);
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && movementDate >= fromDate;
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && movementDate <= toDate;
      }
    }
    
    return matchesProduct && matchesSerial && matchesLocation && matchesDate;
  });

  // Ordenar por fecha más reciente
  const sortedMovements = [...filteredMovements].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Agrupar movimientos
  const groupedMovements = sortedMovements.reduce((acc: GroupedMovement[], current) => {
    // Buscar si ya existe un grupo similar para este movimiento
    // Criterios: mismo producto, misma fecha (minuto), mismo origen, mismo destino, mismo empleado
    const existingIndex = acc.findIndex(group => 
      group.productName === current.productName &&
      group.fromLocation === current.fromLocation &&
      group.toLocation === current.toLocation &&
      group.employeeId === current.employeeId &&
      formatDate(group.timestamp) === formatDate(current.timestamp)
    );

    const hasSerial = hasRealSerialNumber(current.serialNumber);

    if (existingIndex > -1) {
      // Agregar al grupo existente
      acc[existingIndex].quantity += 1;
      acc[existingIndex].units.push({
        id: current.id,
        unitId: current.unitId,
        sku: current.productSku,
        serialNumber: hasSerial ? current.serialNumber : undefined,
      });
      // Si alguna unidad tiene número de serie, marcar el grupo
      if (hasSerial) {
        acc[existingIndex].hasSerialNumbers = true;
      }
    } else {
      // Crear nuevo grupo
      acc.push({
        id: `group_${current.id}`,
        productName: current.productName,
        quantity: 1,
        fromLocation: current.fromLocation,
        toLocation: current.toLocation,
        timestamp: current.timestamp,
        user: current.user,
        employeeId: current.employeeId,
        employeeName: current.employeeName,
        units: [{
          id: current.id,
          unitId: current.unitId,
          sku: current.productSku,
          serialNumber: hasSerial ? current.serialNumber : undefined,
        }],
        hasSerialNumbers: hasSerial,
      });
    }

    return acc;
  }, []);

  // Localizaciones para el filtro
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

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <ArrowRightLeft className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#111827]">
            Historial de Movimientos de Stock
          </h2>
        </div>
        <p className="text-sm text-[#6b7280]">
          Registro de todos los movimientos de unidades entre localizaciones
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#6b7280]" />
          <h3 className="text-sm font-medium text-[#111827]">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Buscar por producto..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
            />
          </div>

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

          <div className="relative">
            <label className="block text-xs font-medium text-[#374151] mb-1">
              Fecha de inicio del periodo
            </label>
            <Calendar className="absolute left-3 top-[calc(50%+0.375rem)] -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-medium text-[#374151] mb-1">
              Fecha de fin del periodo
            </label>
            <Calendar className="absolute left-3 top-[calc(50%+0.375rem)] -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
            />
          </div>
        </div>

        {(searchProduct || searchSerial || filterLocation || dateFrom || dateTo) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchProduct("");
                setSearchSerial("");
                setFilterLocation("");
                setDateFrom("");
                setDateTo("");
              }}
              className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[#6b7280]">Total de Movimientos</p>
              <p className="text-2xl font-semibold text-[#111827]">{movements.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[#6b7280]">Movimientos Hoy</p>
              <p className="text-2xl font-semibold text-[#111827]">
                {movements.filter((m) => {
                  const today = new Date().toDateString();
                  const movementDate = new Date(m.timestamp).toDateString();
                  return today === movementDate;
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-[#6b7280]">Productos Movidos</p>
              <p className="text-2xl font-semibold text-[#111827]">
                {new Set(movements.map((m) => m.productName)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Expandir/Contraer todos */}
      {(() => {
        const expandableRows = groupedMovements
          .filter(group => !group.hasSerialNumbers && group.quantity > 1)
          .map(group => group.id);
        
        if (expandableRows.length === 0) return null;
        
        const allExpanded = expandableRows.every(id => expandedRows.has(id));
        const anyExpanded = expandableRows.some(id => expandedRows.has(id));
        
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
            <span className="text-sm text-blue-900 font-medium">
              {expandableRows.length} movimiento{expandableRows.length > 1 ? 's' : ''} con múltiples unidades
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setExpandedRows(new Set(expandableRows))}
                disabled={allExpanded}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  allExpanded 
                    ? 'bg-blue-200 text-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Desplegar todos
              </button>
              <button
                onClick={() => setExpandedRows(new Set())}
                disabled={!anyExpanded}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  !anyExpanded
                    ? 'bg-blue-200 text-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Contraer todos
              </button>
            </div>
          </div>
        );
      })()}

      {/* Tabla de movimientos */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  {/* Columna para expandir */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Producto
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
              {groupedMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#6b7280]">
                    <div className="flex flex-col items-center gap-2">
                      <ArrowRightLeft className="w-12 h-12 text-[#d1d5db]" />
                      <p>
                        {movements.length === 0
                          ? "No hay movimientos registrados todavía"
                          : "No se encontraron movimientos con los filtros aplicados"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                groupedMovements.map((group) => {
                  const isExpanded = expandedRows.has(group.id);
                  const showExpandButton = !group.hasSerialNumbers && group.quantity > 1;
                  
                  return (
                    <>
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
                        <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                          {group.productName}
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
                            <MapPin className="w-4 h-4 text-[#6b7280]" />
                            {group.fromLocation}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#374151]">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#6b7280]" />
                            {group.toLocation}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#374151]">
                          {group.user ? (
                            <span className="text-[#374151]">{group.user}</span>
                          ) : (
                            <span className="text-[#9ca3af]">Sistema</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#374151]">
                          {group.employeeName ? (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-[#6b7280]" />
                              <span className="font-medium">{group.employeeName}</span>
                            </div>
                          ) : (
                            <span className="text-[#9ca3af]">Sin asignar</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#374151] whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#6b7280]" />
                            {formatDate(group.timestamp)}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Fila expandida para mostrar SKU individuales */}
                      {isExpanded && showExpandButton && (
                        <tr className="bg-[#f9fafb]">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="pl-8">
                              <h4 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
                                SKU de las unidades movidas:
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {group.units.map((unit, index) => (
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
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}