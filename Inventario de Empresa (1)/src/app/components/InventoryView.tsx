import { useState, useEffect, useRef } from "react";
import { Plus, Search, Pencil, Trash2, AlertCircle, FileText, Image as ImageIcon, X, Eye, AlertTriangle, CheckCircle, ArrowRight, Database, AlertOctagon } from "lucide-react";
import { ProductModal } from "./ProductModal";
import { ProductUnitsView } from "./ProductUnitsView";
import { ProductSettingsModal } from "./ProductSettingsModal";
import { ExportModal } from "./ExportModal";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Product {
  id: string;
  name: string;
  sku?: string; // SKU ahora es opcional
  category: string;
  company: string;
  supplierId: string;
  warehouse: string;
  price: number;
  stock: number;
  minStock?: number;
  description: string;
  image?: string;
  manual?: string;
  serialNumber?: string;
  hasSerialNumber?: boolean;
  department?: string;
  orderNumber?: string; // Número de pedido asociado
}

interface ProductUnit {
  id: string;
  sku?: string; // SKU ahora es opcional
  serialNumber: string;
  location: string;
  status: "available" | "in-use" | "maintenance" | "out-of-use";
  deletedAt?: Date; // Nuevo campo para marcar unidades eliminadas
}

interface Supplier {
  id: string;
  name: string;
}

interface Category {
  name: string;
  notificationEmail?: string;
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
  products: any[];
}

interface InventoryViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "id">) => void;
  onImportProduct?: (product: Omit<Product, "id">) => void; // exclusivo para importación Excel
  onUpdateProduct: (id: string, product: Omit<Product, "id">) => void;
  onDeleteProduct: (id: string) => void;
  categories: Category[];
  suppliers: Supplier[];
  productUnits: Record<string, ProductUnit[]>;
  onAddUnit: (productId: string, unit: Omit<ProductUnit, "id">) => void;
  onBulkAddUnits: (productId: string, units: Omit<ProductUnit, "id">[]) => void;
  onUpdateUnit: (productId: string, unitId: string, unit: Omit<ProductUnit, "id">, employeeId?: string, employeeName?: string) => void;
  onBulkMoveUnits: (productId: string, unitUpdates: Array<{ unitId: string; newLocation: string }>, employeeId?: string, employeeName?: string) => void;
  onDeleteUnit: (productId: string, unitId: string) => void;
  employees: Employee[];
  initialSelectedProductId?: string; // Nuevo prop para seleccionar producto desde afuera
  onClearSelectedProductId?: () => void; // Callback para limpiar el ID seleccionado
  previousView?: string; // Vista desde la que se accedió
  onNavigateBack?: () => void; // Callback para navegar a la vista anterior
  stockMovements?: StockMovement[]; // Nuevo prop para los movimientos de stock
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
  userRole?: "usuario" | "coordinador" | "administrador" | "contable"; // Nuevo prop para el rol del usuario
  orders?: Order[]; // Prop opcional para orders para la exportación
}

export function InventoryView({
  products,
  onAddProduct,
  onImportProduct,
  onUpdateProduct,
  onDeleteProduct,
  categories,
  suppliers,
  productUnits,
  onAddUnit,
  onBulkAddUnits,
  onUpdateUnit,
  onBulkMoveUnits,
  onDeleteUnit,
  employees,
  initialSelectedProductId,
  onClearSelectedProductId,
  previousView,
  onNavigateBack,
  stockMovements,
  stockHistory,
  onStockAdjustment,
  userRole = "usuario",
  orders = [],
}: InventoryViewProps) {
  const { canUseCrud, canUseFeature } = usePermissions(userRole);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [selectedProductForUnits, setSelectedProductForUnits] = useState<Product | null>(null);
  const [stockReductionData, setStockReductionData] = useState<{
    product: Product;
    newStock: number;
    reduction: number;
  } | null>(null);
  const [updateConfirmData, setUpdateConfirmData] = useState<{
    oldProduct: Product;
    newProduct: Omit<Product, "id">;
  } | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [unknownSupplierModal, setUnknownSupplierModal] = useState<{
    show: boolean;
    unknownSuppliers: Array<{ supplierName: string; products: string[] }>;
  }>({ show: false, unknownSuppliers: [] });
  const importFileRef = useRef<HTMLInputElement>(null);

  // Detectar si se pasa un producto inicial para seleccionar
  useEffect(() => {
    if (initialSelectedProductId) {
      const product = products.find(p => p.id === initialSelectedProductId);
      if (product) {
        setSelectedProductForUnits(product);
      }
    }
  }, [initialSelectedProductId, products]);

  const availableCategories = Array.from(new Set(products.map(p => p.category)));
  const companies = ["AMS", "CEM", "RUGH", "SADAF"];
  const departments = ["Secretaría", "Informática", "Marketing", "Calidad", "Mantenimiento", "Contabilidad"];
  
  // Crear objetos Department para ExportModal
  const departmentObjects = departments.map(name => ({
    name,
    description: "" // Descripción vacía ya que no se usa en el filtro
  }));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    const matchesCompany = filterCompany === "all" || product.company === filterCompany;
    const matchesSupplier = filterSupplier === "all" || product.supplierId === filterSupplier;
    const matchesStatus = filterStatus === "all" || getStockStatus(product.stock, product.minStock).label === filterStatus;
    const matchesDepartment = filterDepartment === "all" || product.department === filterDepartment;
    return matchesSearch && matchesCategory && matchesCompany && matchesSupplier && matchesStatus && matchesDepartment;
  }).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = (productData: Omit<Product, "id">) => {
    if (editingProduct) {
      // Mostrar modal de confirmación de cambios
      handleCloseModal();
      setUpdateConfirmData({
        oldProduct: editingProduct,
        newProduct: productData,
      });
    } else {
      onAddProduct(productData);
      handleCloseModal();
    }
  };

  const handleConfirmUpdate = () => {
    if (!updateConfirmData) return;

    const { oldProduct, newProduct } = updateConfirmData;
    const oldStock = oldProduct.stock;
    const newStock = newProduct.stock;

    // Detectar si cambió el stock (aumentó o disminuyó)
    if (newStock < oldStock) {
      const reduction = oldStock - newStock;
      
      // Si requiere número de serie, mostrar error
      if (oldProduct.hasSerialNumber) {
        setUpdateConfirmData(null);
        setStockReductionData({
          product: oldProduct,
          newStock,
          reduction,
        });
        return;
      }
      
      // Si NO requiere número de serie, pedir confirmación
      if (!oldProduct.hasSerialNumber) {
        setUpdateConfirmData(null);
        setStockReductionData({
          product: oldProduct,
          newStock,
          reduction,
        });
        return;
      }
    }
    
    // Si se aumentó el stock, actualizar y redirigir al inventario de unidades
    if (newStock > oldStock) {
      onUpdateProduct(oldProduct.id, newProduct);
      setUpdateConfirmData(null);
      // Redirigir al inventario de unidades con los datos actualizados
      setSelectedProductForUnits({ ...newProduct, id: oldProduct.id });
      return;
    }
    
    // Si no cambió el stock, actualizar normalmente
    onUpdateProduct(oldProduct.id, newProduct);
    setUpdateConfirmData(null);
  };

  const handleExport = () => {
    setShowSettingsModal(false);
    setShowExportModal(true);
  };

  const handleImport = () => {
    importFileRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        // ── PASO 1: Detectar proveedores desconocidos ANTES de importar ──
        const unknownMap: Record<string, string[]> = {};

        rows.forEach((row) => {
          const productName = String(row["Nombre"] || row["name"] || row["producto"] || "").trim();
          const supplierName = String(row["Proveedor"] || row["supplier"] || "").trim();

          if (!productName) return; // fila vacía, ignorar

          if (supplierName) {
            const found = suppliers.find(
              (s) => s.name.toLowerCase() === supplierName.toLowerCase()
            );
            if (!found) {
              if (!unknownMap[supplierName]) unknownMap[supplierName] = [];
              unknownMap[supplierName].push(productName);
            }
          }
        });

        // ── PASO 2: Si hay proveedores desconocidos → mostrar modal y CANCELAR importación
        if (Object.keys(unknownMap).length > 0) {
          const unknownSuppliers = Object.entries(unknownMap).map(
            ([supplierName, prods]) => ({ supplierName, products: prods })
          );
          setUnknownSupplierModal({ show: true, unknownSuppliers });
          // Limpiar input
          if (importFileRef.current) importFileRef.current.value = "";
          return; // IMPORTANTE: detener la importación aquí
        }

        // ── PASO 3: Todos los proveedores son válidos → proceder con la importación ──
        const addFn = onImportProduct ?? onAddProduct;
        let importedCount = 0;
        let errorCount = 0;

        rows.forEach((row) => {
          try {
            const productName = String(row["Nombre"] || row["name"] || row["producto"] || "").trim();
            if (!productName) { errorCount++; return; }

            const supplierName = String(row["Proveedor"] || row["supplier"] || "").trim();
            const supplier = suppliers.find(
              (s) => s.name.toLowerCase() === supplierName.toLowerCase()
            );

            const newProduct = {
              name: productName,
              sku: String(row["SKU"] || row["sku"] || ""),
              category: String(row["Categoría"] || row["category"] || "Sin Categoría"),
              company: String(row["Empresa"] || row["company"] || "AMS"),
              department: String(row["Departamento"] || row["department"] || ""),
              supplierId: supplier?.id || "",
              warehouse: String(row["Almacén"] || row["warehouse"] || ""),
              price: Number(row["Precio"] || row["price"] || 0),
              stock: Number(row["Stock"] || row["stock"] || 0), // se respeta como unidades pendientes
              minStock: row["Stock Mínimo"] !== undefined ? Number(row["Stock Mínimo"]) : undefined,
              description: String(row["Descripción"] || row["description"] || ""),
            };

            addFn(newProduct);
            importedCount++;
          } catch {
            errorCount++;
          }
        });

        if (importedCount > 0) {
          toast.success(
            `${importedCount} producto(s) importado(s) correctamente` +
            (errorCount > 0 ? `. ${errorCount} fila(s) con errores omitidas.` : ".")
          );
        } else {
          toast.error("No se pudieron importar productos. Verifica el formato del archivo.");
        }
      } catch {
        toast.error("Error al leer el archivo. Asegúrate de que sea un Excel válido (.xlsx).");
      }
    };

    reader.readAsBinaryString(file);
    if (importFileRef.current) importFileRef.current.value = "";
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        "Nombre": "Ejemplo Producto",
        "SKU": "SKU-001",
        "Categoría": "Electrónica",
        "Empresa": "AMS",
        "Departamento": "Informática",
        "Proveedor": "TechGlobal S.A.",
        "Almacén": "ALMACÉN – VC",
        "Precio": 100,
        "Stock": 10,
        "Stock Mínimo": 2,
        "Descripción": "Descripción del producto",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, "plantilla_productos.xlsx");
  };

  const getStockStatus = (stock: number, minStock?: number) => {
    if (stock === 0) return { color: "text-red-600", bg: "bg-red-50", label: "Sin stock" };
    if (minStock !== undefined && stock < minStock) return { color: "text-yellow-600", bg: "bg-yellow-50", label: "Stock bajo" };
    return { color: "text-green-600", bg: "bg-green-50", label: "En stock" };
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    // Si no se encuentra por ID, devolvemos el supplierId tal cual (asumiendo que es un nombre importado)
    // a menos que sea el valor por defecto genérico que queramos ocultar
    if (supplier) return supplier.name;
    if (supplierId && supplierId !== "Proveedor General") return supplierId;
    return "Sin proveedor";
  };

  // Si hay un producto seleccionado, mostrar su vista de unidades
  if (selectedProductForUnits) {
    // Filtrar los movimientos correspondientes a este producto
    const productMovements = stockMovements?.filter(
      movement => movement.productName === selectedProductForUnits.name
    ) || [];
    
    // Filtrar el historial de stock correspondiente a este producto
    const productStockHistory = stockHistory?.filter(
      entry => entry.productId === selectedProductForUnits.id
    ) || [];
    
    return (
      <ProductUnitsView
        product={selectedProductForUnits}
        onBack={() => {
          setSelectedProductForUnits(null);
          if (onClearSelectedProductId) {
            onClearSelectedProductId();
          }
          // Si hay una vista anterior, navegar a ella
          if (previousView && onNavigateBack) {
            onNavigateBack();
          }
        }}
        units={productUnits[selectedProductForUnits.id] || []}
        onAddUnit={onAddUnit}
        onBulkAddUnits={onBulkAddUnits}
        onUpdateUnit={onUpdateUnit}
        onBulkMoveUnits={onBulkMoveUnits}
        onDeleteUnit={onDeleteUnit}
        employees={employees}
        movements={productMovements}
        stockHistory={productStockHistory}
        onStockAdjustment={onStockAdjustment}
        onUpdateProduct={onUpdateProduct}
      />
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Inventario de Productos</h2>
        <div className="flex items-center gap-2">
          {/* Botón de Configuración (Importar/Exportar) */}
          <button
            onClick={() => setShowSettingsModal(true)}
            title="Importar/Exportar datos"
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
          >
            <Database className="w-5 h-5" />
          </button>

          {/* Botón Nuevo Producto */}
          {canUseCrud("Crear Productos") && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nuevo Producto</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#e5e7eb] mb-4 md:mb-6">
        <div className="p-3 md:p-4 border-b border-[#e5e7eb]">
          {/* Primera fila de filtros */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="all">Todas las categorías</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="all">Todas las compañias</option>
              {companies.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>
          
          {/* Segunda fila de filtros */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="flex-1 px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="all">Todos los departamentos</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="flex-1 px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="all">Todos los proveedores</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="all">Todos los estados</option>
              <option value="Sin stock">Sin stock</option>
              <option value="Stock bajo">Stock bajo</option>
              <option value="En stock">En stock</option>
            </select>
          </div>
        </div>

        {/* Botón para limpiar filtros */}
        {(searchTerm || filterCategory !== "all" || filterCompany !== "all" || filterSupplier !== "all" || filterStatus !== "all" || filterDepartment !== "all") && (
          <div className="px-3 md:px-4 pb-3 md:pb-4">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("all");
                setFilterCompany("all");
                setFilterSupplier("all");
                setFilterStatus("all");
                setFilterDepartment("all");
              }}
              className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {filteredProducts.length === 0 ? (
            <div className="px-4 py-12 text-center text-[#6b7280]">
              <AlertCircle className="w-12 h-12 text-[#d1d5db] mx-auto mb-2" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e7eb]">
              {filteredProducts.map((product) => {
                const status = getStockStatus(product.stock, product.minStock);
                return (
                  <div key={product.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#111827] truncate">{product.name}</h3>
                      </div>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color} whitespace-nowrap`}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-[#6b7280]">Empresa</p>
                        <p className="font-medium text-[#111827]">{product.company}</p>
                      </div>
                      <div>
                        <p className="text-[#6b7280]">Categoría</p>
                        <p className="font-medium text-[#111827]">{product.category}</p>
                      </div>
                      <div>
                        <p className="text-[#6b7280]">Departamento</p>
                        <p className="font-medium text-[#111827]">{product.department || "Sin asignar"}</p>
                      </div>
                      <div>
                        <p className="text-[#6b7280]">Proveedor</p>
                        <p className="font-medium text-[#111827]">{getSupplierName(product.supplierId)}</p>
                      </div>

                      <div>
                        <p className="text-[#6b7280]">Stock</p>
                        <p className="font-medium text-[#111827]">{product.stock} unidades</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {canUseCrud("Editar Productos") && (
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[#3b82f6] bg-[#eff6ff] rounded-lg transition-colors text-sm"
                        >
                          <Pencil className="w-4 h-4" />
                          Editar
                        </button>
                      )}
                      {canUseCrud("Eliminar Productos") && (
                        <button
                          onClick={() => setDeleteConfirmProduct(product)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div 
          className="hidden lg:block overflow-x-auto overflow-y-auto"
          style={{ height: 'calc(100vh - 250px)' }}
        >
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <th className="sticky left-0 z-20 text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider bg-[#f9fafb] border-r border-[#e5e7eb]">Producto</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider bg-[#f9fafb]">Imagen</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider bg-[#f9fafb]">Manual</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider bg-[#f9fafb]">Unidades</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider bg-[#f9fafb]">Empresa</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider bg-[#f9fafb]">Categoría</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider bg-[#f9fafb]">Departamento</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider bg-[#f9fafb]">Proveedor</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider bg-[#f9fafb]">Stock</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider bg-[#f9fafb]">Nº de Pedido</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider bg-[#f9fafb]">Estado</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider bg-[#f9fafb]">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#e5e7eb]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-[#6b7280]">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-12 h-12 text-[#d1d5db]" />
                      <p>No se encontraron productos</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock, product.minStock);
                  const units = productUnits[product.id] || [];
                  const activeUnits = units.filter(unit => !unit.deletedAt);
                  const unitsCount = activeUnits.length;
                  const hasUnitsWarning = product.stock > 0 && unitsCount < product.stock;
                  const isZeroStock = product.stock === 0 && unitsCount === 0;
                  
                  return (
                    <tr 
                      key={product.id} 
                      className="group hover:bg-[#f9fafb] transition-colors cursor-pointer"
                      onClick={() => setSelectedProductForUnits(product)}
                    >
                      <td className="sticky left-0 z-10 px-6 py-4 bg-white group-hover:bg-[#f9fafb] border-r border-[#e5e7eb] transition-colors">
                        <div>
                          <p className="font-medium text-[#111827]">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-[#6b7280] truncate max-w-xs">{product.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.image ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage({ url: product.image!, name: product.name });
                              setImageModalOpen(true);
                            }}
                            className="inline-block hover:opacity-80 transition-opacity cursor-pointer"
                          >
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg mx-auto"
                            />
                          </button>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-[#d1d5db] mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.manual ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(product.manual, '_blank');
                            }}
                            className="inline-flex items-center justify-center p-2 text-[#ef4444] hover:bg-red-50 rounded-lg transition-colors"
                            title="Ver manual en PDF"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        ) : (
                          <FileText className="w-5 h-5 text-[#d1d5db] mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isZeroStock ? (
                          <span className="text-sm text-[#6b7280]">Sin Aviso</span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <p className={`text-sm font-medium ${hasUnitsWarning ? 'text-amber-600' : 'text-[#111827]'}`}>
                              {unitsCount} / {product.stock}
                            </p>
                            {hasUnitsWarning && (
                              <div className="flex items-center gap-1" title={`Faltan ${product.stock - unitsCount} unidades por crear`}>
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                <span className="text-xs text-amber-600">Pendiente</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-[#eff6ff] text-[#3b82f6]">
                          {product.company}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-[#374151]">{product.department || "Sin asignar"}</td>
                      <td className="px-6 py-4 text-sm text-[#374151]">{getSupplierName(product.supplierId)}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div>
                          <p className="font-medium text-[#111827]">{product.stock}</p>
                          <p className="text-xs text-[#6b7280]">Mín: {product.minStock || 0}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.orderNumber ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-[#eff6ff] text-[#3b82f6]">
                            {product.orderNumber}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-500">
                            Sin pedido
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {canUseCrud("Editar Productos") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(product);
                              }}
                              className="p-2 text-[#3b82f6] hover:bg-[#eff6ff] rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {canUseCrud("Eliminar Productos") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmProduct(product);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={handleCloseModal}
          onSave={handleSave}
          categories={categories}
          suppliers={suppliers}
        />
      )}

      {/* Image Preview Modal */}
      {imageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb]">
              <h3 className="text-lg font-semibold text-[#111827]">{selectedImage.name}</h3>
              <button
                onClick={() => setImageModalOpen(false)}
                className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#6b7280]" />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.name}
                className="w-full h-auto max-h-[70vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setDeleteConfirmProduct(null)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Eliminar Producto</h3>
                    <p className="text-red-100 text-sm mt-0.5">Esta acción moverá el producto a la papelera</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteConfirmProduct(null)}
                  className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Body con información del producto */}
            <div className="p-6">
              {/* Preview del producto */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  {deleteConfirmProduct.image ? (
                    <img 
                      src={deleteConfirmProduct.image} 
                      alt={deleteConfirmProduct.name}
                      className="w-20 h-20 object-cover rounded-lg shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-[#111827] mb-1 truncate">
                      {deleteConfirmProduct.name}
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm text-[#6b7280]">
                        <span className="font-medium">SKU:</span> {deleteConfirmProduct.sku}
                      </p>
                      <p className="text-sm text-[#6b7280]">
                        <span className="font-medium">Stock:</span> {deleteConfirmProduct.stock} unidades
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-[#eff6ff] text-[#3b82f6]">
                          {deleteConfirmProduct.company}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-purple-50 text-purple-600">
                          {deleteConfirmProduct.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensaje de advertencia */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">
                      El producto se moverá a la papelera
                    </p>
                    <p className="text-xs text-amber-700">
                      Podrás restaurarlo desde la sección "Papelera" en el menú de Inventario si lo necesitas más adelante.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmProduct(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onDeleteProduct(deleteConfirmProduct.id);
                    setDeleteConfirmProduct(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-[1.02]"
                >
                  Mover a Papelera
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Reduction Confirmation/Error Modal */}
      {stockReductionData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setStockReductionData(null)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {stockReductionData.product.hasSerialNumber ? (
              // Modal de ERROR para productos CON número de serie
              <>
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Operación Inválida</h3>
                        <p className="text-red-100 text-sm mt-0.5">No se puede reducir el stock</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStockReductionData(null)}
                      className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900 mb-2">
                          Este producto requiere número de serie
                        </p>
                        <p className="text-xs text-red-700 mb-3">
                          No puedes reducir el stock directamente desde este formulario. Debes ir al inventario de unidades 
                          y seleccionar específicamente qué unidades deseas eliminar.
                        </p>
                        <p className="text-xs text-red-600 font-medium">
                          Stock actual: {stockReductionData.product.stock} unidades<br/>
                          Stock intentado: {stockReductionData.newStock} unidades<br/>
                          Reducción: {stockReductionData.reduction} unidades
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStockReductionData(null)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        setStockReductionData(null);
                        setSelectedProductForUnits(stockReductionData.product);
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-[1.02]"
                    >
                      Ir al Inventario
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Modal de CONFIRMACIÓN para productos SIN número de serie
              <>
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-t-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Confirmar Eliminación de Stock</h3>
                        <p className="text-amber-100 text-sm mt-0.5">Se eliminarán unidades del inventario</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStockReductionData(null)}
                      className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 mb-2">
                          ¿Deseas confirmar la reducción de stock?
                        </p>
                        <p className="text-xs text-amber-700 mb-3">
                          Se eliminarán {stockReductionData.reduction} unidad{stockReductionData.reduction > 1 ? "es" : ""} del producto <strong>{stockReductionData.product.name}</strong>. 
                          Esta acción no se puede deshacer.
                        </p>
                        <div className="bg-white border border-amber-200 rounded-lg p-3 mt-3">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <p className="text-xs text-amber-700 mb-1">Stock Actual</p>
                              <p className="text-lg font-bold text-amber-900">{stockReductionData.product.stock}</p>
                            </div>
                            <div>
                              <p className="text-xs text-amber-700 mb-1">A Eliminar</p>
                              <p className="text-lg font-bold text-red-600">-{stockReductionData.reduction}</p>
                            </div>
                            <div>
                              <p className="text-xs text-amber-700 mb-1">Nuevo Stock</p>
                              <p className="text-lg font-bold text-green-600">{stockReductionData.newStock}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStockReductionData(null)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        // Eliminar las últimas N unidades
                        const units = productUnits[stockReductionData.product.id] || [];
                        const unitsToDelete = units.slice(-stockReductionData.reduction);
                        unitsToDelete.forEach(unit => {
                          onDeleteUnit(stockReductionData.product.id, unit.id);
                        });
                        
                        // Actualizar el stock del producto
                        onUpdateProduct(stockReductionData.product.id, {
                          ...stockReductionData.product,
                          stock: stockReductionData.newStock,
                        });
                        
                        // Redirigir al inventario de unidades
                        setSelectedProductForUnits(stockReductionData.product);
                        setStockReductionData(null);
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-[1.02]"
                    >
                      Sí, Eliminar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Update Confirmation Modal */}
      {updateConfirmData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setUpdateConfirmData(null)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Confirmar Actualización de Producto</h3>
                    <p className="text-amber-100 text-sm mt-0.5">Se actualizarán los datos del producto</p>
                  </div>
                </div>
                <button
                  onClick={() => setUpdateConfirmData(null)}
                  className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-2">
                      ¿Deseas confirmar la actualización del producto?
                    </p>
                    <p className="text-xs text-amber-700 mb-3">
                      Se actualizarán los datos del producto <strong>{updateConfirmData.oldProduct.name}</strong>. 
                      Esta acción no se puede deshacer.
                    </p>
                    <div className="bg-white border border-amber-200 rounded-lg p-3 mt-3">
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <p className="text-xs text-amber-700 mb-1">Stock Actual</p>
                          <p className="text-lg font-bold text-amber-900">{updateConfirmData.oldProduct.stock}</p>
                        </div>
                        <div>
                          <p className="text-xs text-amber-700 mb-1">Nuevo Stock</p>
                          <p className="text-lg font-bold text-green-600">{updateConfirmData.newProduct.stock}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setUpdateConfirmData(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-[1.02]"
                >
                  Sí, Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input oculto para importar archivo */}
      <input
        type="file"
        accept=".xlsx,.xls"
        ref={importFileRef}
        onChange={handleImportFile}
        className="hidden"
      />

      {/* Modal de Configuración (Importar/Exportar) */}
      {showSettingsModal && (
        <ProductSettingsModal
          onClose={() => setShowSettingsModal(false)}
          onExport={handleExport}
          onImport={() => {
            handleImport();
            setShowSettingsModal(false);
          }}
          onDownloadTemplate={() => {
            handleDownloadTemplate();
            setShowSettingsModal(false);
          }}
        />
      )}

      {/* Modal de Exportación con filtros */}
      {showExportModal && (
        <ExportModal
          products={products}
          orders={orders || []}
          suppliers={suppliers}
          departments={departmentObjects}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Modal de Proveedor Desconocido */}
      {unknownSupplierModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-[#e5e7eb]">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertOctagon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111827]">Proveedor Desconocido</h2>
                <p className="text-sm text-[#6b7280] mt-0.5">
                  La importación ha sido cancelada. Los siguientes proveedores no existen en el sistema.
                </p>
              </div>
            </div>

            {/* Lista de proveedores desconocidos y sus productos */}
            <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
              {unknownSupplierModal.unknownSuppliers.map((entry, i) => (
                <div key={i} className="border border-red-200 rounded-xl bg-red-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="font-semibold text-red-700">"{entry.supplierName}"</span>
                    <span className="text-xs text-red-500 ml-auto">
                      {entry.products.length} producto{entry.products.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <ul className="space-y-1 ml-6">
                    {entry.products.map((productName, j) => (
                      <li key={j} className="text-sm text-red-700 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {productName}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Instrucción */}
            <div className="mx-6 mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-sm text-amber-800">
                <strong>¿Cómo solucionarlo?</strong> Añade primero los proveedores en el apartado <strong>Proveedores</strong> del sistema, o corrige los nombres en el archivo Excel para que coincidan exactamente con los existentes.
              </p>
            </div>

            {/* Botón cerrar */}
            <div className="flex justify-end p-6 pt-0">
              <button
                onClick={() => setUnknownSupplierModal({ show: false, unknownSuppliers: [] })}
                className="px-6 py-2.5 bg-[#111827] text-white rounded-lg hover:bg-[#374151] transition-colors font-medium"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}