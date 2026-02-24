import { useState, useRef, useEffect } from "react";
import { Search, Filter, Download, Package, Plus, Calendar, X, Database, Edit2, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { AddSalesProductModal } from "./AddSalesProductModal";
import { CreateInventoryYearModal } from "./CreateInventoryYearModal";
import { SalesInventorySettingsModal } from "./SalesInventorySettingsModal";
import { EditSalesProductModal } from "./EditSalesProductModal";
import { usePermissions } from "../hooks/usePermissions";
import * as XLSX from "xlsx";

interface Product {
  id: string;
  name: string;
  category: string;
  company: string;
  client?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  price: number;
  stock: number;
  discount?: number;
  createdAt?: string;
}

interface ProductUnit {
  id: string;
  sku?: string;
  serialNumber: string;
  location: string;
  status: "available" | "in-use" | "maintenance" | "out-of-use";
  deletedAt?: string;
}

interface SalesInventoryViewProps {
  products: Product[];
  productUnits: Record<string, ProductUnit[]>;
  onAddProduct?: (productData: {
    name: string;
    category: string;
    company: string;
    client: string;
    invoiceNumber: string;
    invoiceDate: string;
    stock: number;
  }) => void;
  onEditProduct?: (productData: {
    id: string;
    name: string;
    category: string;
    company: string;
    client: string;
    invoiceNumber: string;
    invoiceDate: string;
    stock: number;
  }) => void;
  onDeleteProduct?: (productId: string) => void;
  clients?: Array<{ id: string; name: string }>;
  userRole?: "usuario" | "coordinador" | "administrador" | "contable";
}

export function SalesInventoryView({ 
  products, 
  productUnits, 
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  clients = [],
  userRole = "usuario"
}: SalesInventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>("2026");
  const [availableYears, setAvailableYears] = useState<string[]>(["2025", "2026"]);
  const [showCreateYear, setShowCreateYear] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Verificar permisos
  const { canUseFeature } = usePermissions(userRole);
  const canEditSales = canUseFeature("Editar Inventario Ventas");
  const canDeleteSales = canUseFeature("Eliminar Inventario Ventas");

  // Refs para la sincronización del scroll
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const [tableWidth, setTableWidth] = useState(0);

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setCompanyFilter("all");
    setCategoryFilter("all");
    setStartDate("");
    setEndDate("");
  };

  // Filtrar productos - solo categorías de contabilidad
  const accountingCategories = [
    "Manuales",
    "Material Didáctico",
    "Material Finca Agrícola",
    "Uniformes Personal",
    "Menaje",
    "Otro Material"
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.invoiceNumber && product.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCompany = companyFilter === "all" || product.company === companyFilter;
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const isAccountingCategory = product.category && accountingCategories.includes(product.category);
    
    // Filtrar por año del inventario - usando la fecha de factura
    const itemYear = product.invoiceDate ? new Date(product.invoiceDate).getFullYear().toString() : null;
    const matchesYear = itemYear === selectedYear;
    
    // Filtrar por fechas
    let matchesDateRange = true;
    if (startDate) {
      const itemDate = new Date(product.invoiceDate || product.createdAt || new Date());
      const filterStartDate = new Date(startDate);
      matchesDateRange = matchesDateRange && itemDate >= filterStartDate;
    }
    if (endDate) {
      const itemDate = new Date(product.invoiceDate || product.createdAt || new Date());
      const filterEndDate = new Date(endDate);
      matchesDateRange = matchesDateRange && itemDate <= filterEndDate;
    }
    
    return matchesSearch && matchesCompany && matchesCategory && isAccountingCategory && matchesYear && matchesDateRange;
  });

  // Calcular totales
  const totalQuantity = filteredProducts.reduce((sum, product) => sum + product.stock, 0);

  // Obtener empresas únicas de los productos
  const companies = Array.from(new Set(products.filter(p => p.company).map(p => p.company)));

  // Efecto para sincronizar el scroll y calcular el ancho
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const topScroll = topScrollRef.current;

    if (!tableContainer || !topScroll) return;

    // Sincronizar scroll horizontal
    const handleTableScroll = () => {
      if (topScroll.scrollLeft !== tableContainer.scrollLeft) {
        topScroll.scrollLeft = tableContainer.scrollLeft;
      }
    };

    const handleTopScroll = () => {
      if (tableContainer.scrollLeft !== topScroll.scrollLeft) {
        tableContainer.scrollLeft = topScroll.scrollLeft;
      }
    };

    // Actualizar ancho del contenido para el scroll superior
    const updateDimensions = () => {
      setTableWidth(tableContainer.scrollWidth);
    };

    // Inicializar
    updateDimensions();

    // Listeners
    tableContainer.addEventListener('scroll', handleTableScroll);
    topScroll.addEventListener('scroll', handleTopScroll);
    window.addEventListener('resize', updateDimensions);

    // Observer para detectar cambios en el contenido de la tabla
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(tableContainer);

    return () => {
      tableContainer.removeEventListener('scroll', handleTableScroll);
      topScroll.removeEventListener('scroll', handleTopScroll);
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, [filteredProducts]);

  const handleCreateYear = (year: string) => {
    setAvailableYears([...availableYears, year]);
    setSelectedYear(year);
    setShowCreateYear(false);
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = ["Descripción", "Categoría", "Empresa", "Cliente", "Nº Factura", "Fecha Factura", "Cantidad", "Fecha de Creación"];
    const rows = filteredProducts.map(product => {
      const createdDate = product.createdAt ? new Date(product.createdAt) : new Date();
      const invoiceDate = product.invoiceDate ? new Date(product.invoiceDate) : null;
      
      return [
        product.name,
        product.category,
        product.company,
        product.client || "",
        product.invoiceNumber || "",
        invoiceDate ? invoiceDate.toLocaleDateString("es-ES") : "",
        product.stock,
        createdDate.toLocaleDateString("es-ES")
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `inventario_ventas_${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    const headers = ["Descripción", "Categoría", "Empresa", "Cliente", "Nº Factura", "Fecha Factura", "Cantidad", "Fecha de Creación"];
    const rows = filteredProducts.map(product => {
      const createdDate = product.createdAt ? new Date(product.createdAt) : new Date();
      const invoiceDate = product.invoiceDate ? new Date(product.invoiceDate) : null;
      
      return [
        product.name,
        product.category,
        product.company,
        product.client || "",
        product.invoiceNumber || "",
        invoiceDate ? invoiceDate.toLocaleDateString("es-ES") : "",
        product.stock,
        createdDate.toLocaleDateString("es-ES")
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario Ventas");
    XLSX.writeFile(workbook, `inventario_ventas_${selectedYear}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        let importedCount = 0;
        let errorCount = 0;

        jsonData.forEach((row) => {
          // Validar que tenga al menos descripción, empresa y cantidad
          if (row.Descripción && row.Empresa && row.Cantidad) {
            try {
              if (onAddProduct) {
                const invoiceNum = row['Nº Factura'] || "";
                const invoiceDate = row['Fecha Factura'] || new Date().toISOString().split('T')[0];
                
                onAddProduct({
                  name: row.Descripción || "",
                  category: row.Categoría || "Otro Material",
                  company: row.Empresa || "",
                  client: row.Cliente || "",
                  invoiceNumber: invoiceNum,
                  invoiceDate: invoiceDate,
                  stock: parseInt(row.Cantidad) || 0
                });
                importedCount++;
              }
            } catch (error) {
              errorCount++;
            }
          } else {
            errorCount++;
          }
        });

        if (importedCount > 0) {
          const successMsg = '✓ Se importaron ' + importedCount + ' producto(s) correctamente.';
          const errorMsg = errorCount > 0 ? '\n⚠ ' + errorCount + ' fila(s) con errores fueron omitidas.' : '';
          alert(successMsg + errorMsg);
        } else {
          alert("No se pudieron importar productos. Verifica que el archivo tenga el formato correcto.");
        }
      } catch (error) {
        alert("Error al leer el archivo. Asegúrate de que sea un archivo Excel válido (.xlsx).");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Descripción: "Ejemplo Producto",
        Categoría: "Material Didáctico",
        Empresa: "AMS",
        Cliente: "Ejemplo Cliente",
        "Nº Factura": "F-001",
        "Fecha Factura": "01/01/2026",
        Cantidad: 10,
        "Fecha de Creación": "01/01/2026"
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario Ventas");
    XLSX.writeFile(workbook, "plantilla_inventario_ventas.xlsx");
  };

  const handleAddProduct = (product: any) => {
    console.log("Producto añadido:", product);
    // Aquí se integraría con el estado global de la aplicación
    if (onAddProduct) {
      onAddProduct(product);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedProduct: Product) => {
    console.log("Producto actualizado:", updatedProduct);
    // Aquí se integraría con el estado global de la aplicación para actualizar el producto
    if (onEditProduct) {
      onEditProduct(updatedProduct);
    }
    setShowEditModal(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      console.log("Eliminar producto:", productId);
      // Aquí se integraría con el estado global de la aplicación para eliminar el producto
      if (onDeleteProduct) {
        onDeleteProduct(productId);
      }
    }
  };

  // Si no hay año seleccionado, mostrar selector de año
  if (!selectedYear) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#111827]">
            Inventario de Ventas
          </h1>
          <p className="text-[#6b7280] mt-1">
            Selecciona el año del inventario
          </p>
        </div>

        <Card className="p-8 max-w-md mx-auto">
          <div className="text-center mb-6">
            <Calendar className="w-12 h-12 text-[#3b82f6] mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              Seleccionar Año
            </h2>
            <p className="text-sm text-[#6b7280]">
              Elige el año del inventario de ventas que deseas consultar
            </p>
          </div>

          <div className="space-y-3">
            {availableYears.sort((a, b) => parseInt(b) - parseInt(a)).map((year) => (
              <Button
                key={year}
                onClick={() => setSelectedYear(year)}
                className="w-full"
                size="lg"
              >
                {year}
              </Button>
            ))}
            
            <Button
              onClick={() => setShowCreateYear(true)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Nuevo Inventario
            </Button>
          </div>
        </Card>

        <CreateInventoryYearModal
          isOpen={showCreateYear}
          onClose={() => setShowCreateYear(false)}
          onCreateYear={handleCreateYear}
          existingYears={availableYears}
          inventoryType="ventas"
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-[#111827]">
              Inventario de Ventas {selectedYear}
            </h1>
            <Button
              onClick={() => setSelectedYear(null)}
              variant="outline"
              size="sm"
            >
              Cambiar Año
            </Button>
          </div>
          <p className="text-[#6b7280] mt-1">
            Gestión y visualización del inventario de ventas
          </p>
        </div>
        
        {/* Botones de Acción */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowSettingsModal(true)}
            variant="outline"
            size="lg"
            className="px-4 py-6"
            title="Importar/Exportar datos"
          >
            <Database className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            size="lg"
            className="bg-[#10b981] hover:bg-[#059669] text-white font-semibold px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Añadir Producto
          </Button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Primera fila - Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
            <Input
              type="text"
              placeholder="Buscar por descripción o nº factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Segunda fila - Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Filtro por Empresa */}
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por Categoría */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {accountingCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Fecha Inicio */}
            <div className="relative">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Fecha Inicio"
                className="w-full"
              />
            </div>

            {/* Fecha Fin */}
            <div className="relative">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Fecha Fin"
                className="w-full"
              />
            </div>

            {/* Botón Limpiar Filtros */}
            <Button
              onClick={clearFilters}
              variant="outline"
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabla de Productos */}
      <Card className="overflow-hidden">
        {filteredProducts.length > 0 ? (
          <>
            {/* Scroll superior sincronizado */}
            <div 
              ref={topScrollRef}
              className="overflow-x-auto w-full mb-1" 
              style={{ height: '20px' }}
            >
              <div style={{ width: `${tableWidth}px`, height: '1px' }}></div>
            </div>

            <div className="overflow-x-auto" ref={tableContainerRef}>
              <table className="w-full">
                <thead className="bg-[#3b82f6] border-b border-[#2563eb]">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Descripción</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Categoría</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Empresa</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Nº Factura</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Fecha Factura</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Cantidad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Fecha de Creación</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => {
                    const totalPrice = product.price * product.stock;
                    const createdDate = product.createdAt ? new Date(product.createdAt) : new Date();
                    const invoiceDateObj = product.invoiceDate ? new Date(product.invoiceDate) : null;
                    
                    return (
                      <tr 
                        key={product.id} 
                        className={`border-b border-[#e5e7eb] hover:bg-[#f9fafb] ${
                          index % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"
                        }`}
                      >
                        <td className="py-3 px-4 text-sm text-[#111827]">{product.name}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-block px-2 py-1 rounded-md bg-[#dbeafe] text-[#1e40af] text-xs font-medium">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-block px-2 py-1 rounded-md bg-[#d1fae5] text-[#065f46] text-xs font-medium">
                            {product.company}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#111827]">{product.client || "—"}</td>
                        <td className="py-3 px-4 text-sm text-[#111827]">{product.invoiceNumber || "—"}</td>
                        <td className="py-3 px-4 text-sm text-[#6b7280]">
                          {invoiceDateObj ? invoiceDateObj.toLocaleDateString("es-ES") : "—"}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-[#111827]">
                          {product.stock}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#6b7280]">
                          {createdDate.toLocaleDateString("es-ES")}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            {canEditSales && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                title="Editar producto"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit2 className="w-4 h-4 text-[#3b82f6]" />
                              </Button>
                            )}
                            {canDeleteSales && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                title="Eliminar producto"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4 text-[#ef4444]" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Fila de Totales */}
                  <tr className="bg-[#f3f4f6] border-t-2 border-[#3b82f6]">
                    <td colSpan={6} className="py-3 px-4 text-sm font-semibold text-[#111827]">
                      TOTAL
                    </td>
                    <td className="py-3 px-4 text-sm text-center font-semibold text-[#111827]">
                      {totalQuantity}
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
            <p className="text-[#6b7280]">No se encontraron productos</p>
            <p className="text-sm text-[#9ca3af] mt-2">
              {availableYears.length > 1 && selectedYear !== "2025" 
                ? `El inventario de ${selectedYear} está vacío. Añade productos para comenzar.`
                : "No hay productos que coincidan con los filtros seleccionados"}
            </p>
          </div>
        )}
      </Card>

      {/* Modal para Añadir Producto */}
      <AddSalesProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
        clients={clients}
        selectedYear={selectedYear || undefined}
      />

      {/* Modal para Configuración */}
      <SalesInventorySettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onExport={handleExportExcel}
        onImport={handleImport}
        onDownloadTemplate={handleDownloadTemplate}
      />

      {/* Modal para Editar Producto */}
      <EditSalesProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={handleSaveEdit}
        product={editingProduct}
        clients={clients}
        selectedYear={selectedYear || undefined}
      />
    </div>
  );
}