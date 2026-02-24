import { useState, useRef, useEffect } from "react";
import { Search, Filter, Download, ShoppingCart, Package, Plus, Calendar, X, Database, Edit2, Trash2 } from "lucide-react";
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
import { AddPurchaseProductModal } from "./AddPurchaseProductModal";
import { CreateInventoryYearModal } from "./CreateInventoryYearModal";
import { PurchasesInventorySettingsModal } from "./PurchasesInventorySettingsModal";
import { EditPurchaseProductModal } from "./EditPurchaseProductModal";
import { usePermissions } from "../hooks/usePermissions";
import * as XLSX from "xlsx";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  category?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  discount?: number;
  createdAt?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  supplier: string;
  company: string;
  warehouse: string;
  date: string;
  total: number;
  items: number;
  status: "efectuado" | "recibido" | "cancelado";
  products: OrderItem[];
  pdfUrl?: string;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
}

interface PurchasesInventoryViewProps {
  orders: Order[];
  suppliers?: Supplier[];
  onAddProduct?: (productData: {
    productName: string;
    category: string;
    company: string;
    supplier: string;
    invoiceNumber: string;
    invoiceDate: string;
    quantity: number;
  }) => void;
  onEditProduct?: (productData: {
    id: string;
    productName: string;
    category: string;
    company: string;
    supplier: string;
    invoiceNumber: string;
    invoiceDate: string;
    quantity: number;
  }) => void;
  onDeleteProduct?: (productId: string) => void;
  userRole?: "usuario" | "coordinador" | "administrador" | "contable";
}

export function PurchasesInventoryView({ 
  orders, 
  suppliers = [], 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct, 
  userRole = "usuario" 
}: PurchasesInventoryViewProps) {
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
  const [editingProduct, setEditingProduct] = useState<OrderItem | null>(null);

  // Verificar permisos
  const { canUseFeature } = usePermissions(userRole);
  const canEditPurchases = canUseFeature("Editar Inventario Compras");
  const canDeletePurchases = canUseFeature("Eliminar Inventario Compras");

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

  const accountingCategories = [
    "Manuales",
    "Material Didáctico",
    "Material Finca Agrícola",
    "Uniformes Personal",
    "Menaje",
    "Otro Material"
  ];

  // Crear lista aplanada de todos los productos en todos los pedidos
  const allPurchaseItems = orders.flatMap(order =>
    order.products.map(product => ({
      ...product,
      company: order.company,
      supplier: order.supplier,
      orderDate: order.date,
      status: order.status,
      orderNumber: order.orderNumber,
      category: product.category || "Otro Material",
      invoiceNumber: product.invoiceNumber || order.orderNumber,
      invoiceDate: product.invoiceDate || order.date,
      discount: product.discount || 0,
      createdAt: product.createdAt || order.date,
    }))
  );

  // Filtrar productos
  const filteredItems = allPurchaseItems.filter(item => {
    const matchesSearch = 
      (item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCompany = companyFilter === "all" || item.company === companyFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    // Filtrar por año del inventario - usando la fecha de factura
    const itemYear = item.invoiceDate ? new Date(item.invoiceDate).getFullYear().toString() : null;
    const matchesYear = itemYear === selectedYear;
    
    // Filtrar por fechas
    let matchesDateRange = true;
    if (startDate) {
      const itemDate = new Date(item.invoiceDate);
      const filterStartDate = new Date(startDate);
      matchesDateRange = matchesDateRange && itemDate >= filterStartDate;
    }
    if (endDate) {
      const itemDate = new Date(item.invoiceDate);
      const filterEndDate = new Date(endDate);
      matchesDateRange = matchesDateRange && itemDate <= filterEndDate;
    }
    
    return matchesSearch && matchesCompany && matchesCategory && matchesYear && matchesDateRange;
  });

  // Calcular totales
  const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);

  // Obtener empresas únicas
  const companies = Array.from(new Set(orders.filter(o => o.company).map(o => o.company)));

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
  }, [filteredItems]);

  const handleCreateYear = (year: string) => {
    setAvailableYears([...availableYears, year]);
    setSelectedYear(year);
    setShowCreateYear(false);
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = ["Descripción", "Categoría", "Empresa", "Proveedor", "Nº Factura", "Fecha Factura", "Cantidad", "Fecha de Creación"];
    const rows = filteredItems.map(item => [
      item.productName,
      item.category,
      item.company,
      item.supplier || "",
      item.invoiceNumber || "",
      new Date(item.invoiceDate).toLocaleDateString("es-ES"),
      item.quantity,
      new Date(item.createdAt).toLocaleDateString("es-ES")
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `inventario_compras_${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    const headers = ["Descripción", "Categoría", "Empresa", "Proveedor", "Nº Factura", "Fecha Factura", "Cantidad", "Fecha de Creación"];
    const rows = filteredItems.map(item => [
      item.productName,
      item.category,
      item.company,
      item.supplier || "",
      item.invoiceNumber || "",
      new Date(item.invoiceDate).toLocaleDateString("es-ES"),
      item.quantity,
      new Date(item.createdAt).toLocaleDateString("es-ES")
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario Compras");
    XLSX.writeFile(workbook, `inventario_compras_${selectedYear}_${new Date().toISOString().split("T")[0]}.xlsx`);
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
                  productName: row.Descripción || "",
                  category: row.Categoría || "Otro Material",
                  company: row.Empresa || "",
                  supplier: row.Proveedor || "",
                  invoiceNumber: invoiceNum,
                  invoiceDate: invoiceDate,
                  quantity: parseInt(row.Cantidad) || 0
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
        Proveedor: "Ejemplo Proveedor",
        "Nº Factura": "F-001",
        "Fecha Factura": "01/01/2026",
        Cantidad: 10,
        "Fecha de Creación": "01/01/2026"
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario Compras");
    XLSX.writeFile(workbook, "plantilla_inventario_compras.xlsx");
  };

  const handleAddProduct = (product: any) => {
    console.log("Producto añadido:", product);
    // Aquí se integraría con el estado global de la aplicación
    if (onAddProduct) {
      onAddProduct({
        productName: product.productName,
        category: product.category,
        company: product.company,
        supplier: product.supplier,
        invoiceNumber: product.invoiceNumber,
        invoiceDate: product.invoiceDate,
        quantity: product.quantity,
        price: product.price,
        discount: product.discount,
      });
    }
  };

  const handleEditProduct = (product: OrderItem) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedProduct: OrderItem) => {
    console.log("Producto actualizado:", updatedProduct);
    // Aquí se integraría con el estado global de la aplicación para actualizar el producto
    if (onEditProduct) {
      onEditProduct({
        id: updatedProduct.id,
        productName: updatedProduct.productName,
        category: updatedProduct.category,
        company: updatedProduct.company,
        supplier: updatedProduct.supplier,
        invoiceNumber: updatedProduct.invoiceNumber,
        invoiceDate: updatedProduct.invoiceDate,
        quantity: updatedProduct.quantity,
      });
    }
    setShowEditModal(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (onDeleteProduct) {
      onDeleteProduct(productId);
    }
  };

  // Si no hay año seleccionado, mostrar selector de año
  if (!selectedYear) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#111827]">
            Inventario de Compras
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
              Elige el año del inventario de compras que deseas consultar
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
          inventoryType="compras"
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
              Inventario de Compras {selectedYear}
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
            Gestión y seguimiento de compras realizadas
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
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all"
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

      {/* Tabla de Compras */}
      <Card className="overflow-hidden">
        {filteredItems.length > 0 ? (
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Proveedor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Nº Factura</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Fecha Factura</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Cantidad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Fecha de Creación</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-white whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, index) => {
                    const totalPrice = item.price * item.quantity;
                    const createdDate = new Date(item.createdAt);
                    const invoiceDate = new Date(item.invoiceDate);
                    
                    return (
                      <tr 
                        key={`${item.id}-${index}`} 
                        className={`border-b border-[#e5e7eb] hover:bg-[#f9fafb] ${
                          index % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"
                        }`}
                      >
                        <td className="py-3 px-4 text-sm text-[#111827]">{item.productName}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-block px-2 py-1 rounded-md bg-[#dbeafe] text-[#1e40af] text-xs font-medium">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-block px-2 py-1 rounded-md bg-[#d1fae5] text-[#065f46] text-xs font-medium">
                            {item.company}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#111827]">{item.supplier || "—"}</td>
                        <td className="py-3 px-4 text-sm text-[#111827]">{item.invoiceNumber}</td>
                        <td className="py-3 px-4 text-sm text-[#6b7280]">
                          {invoiceDate.toLocaleDateString("es-ES")}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-[#111827]">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#6b7280]">
                          {createdDate.toLocaleDateString("es-ES")}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            {canEditPurchases && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                title="Editar producto"
                                onClick={() => handleEditProduct(item)}
                              >
                                <Edit2 className="w-4 h-4 text-[#3b82f6]" />
                              </Button>
                            )}
                            {canDeletePurchases && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                title="Eliminar producto"
                                onClick={() => handleDeleteProduct(item.id)}
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
            <ShoppingCart className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
            <p className="text-[#6b7280]">No se encontraron compras</p>
            <p className="text-sm text-[#9ca3af] mt-2">
              {availableYears.length > 1 && selectedYear !== "2025" 
                ? `El inventario de ${selectedYear} está vacío. Añade productos para comenzar.`
                : "No hay productos que coincidan con los filtros seleccionados"}
            </p>
          </div>
        )}
      </Card>

      {/* Modal para Añadir Producto */}
      <AddPurchaseProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
        selectedYear={selectedYear || undefined}
        suppliers={suppliers}
      />

      {/* Modal para Configuración */}
      <PurchasesInventorySettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onExport={handleExportExcel}
        onImport={handleImport}
        onDownloadTemplate={handleDownloadTemplate}
      />

      {/* Modal para Editar Producto */}
      <EditPurchaseProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={handleSaveEdit}
        product={editingProduct}
        selectedYear={selectedYear || undefined}
        suppliers={suppliers}
      />
    </div>
  );
}