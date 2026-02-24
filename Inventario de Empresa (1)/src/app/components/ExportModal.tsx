import { useState } from "react";
import { X, Download, FileSpreadsheet, CheckSquare, Square, Filter } from "lucide-react";
import * as XLSX from "xlsx";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  company: string;
  department?: string; // Campo opcional de departamento
  supplierId: string;
  warehouse: string;
  price: number;
  stock: number;
  minStock?: number;
  description: string;
  image?: string;
  manual?: string;
  serialNumber?: string;
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
  status: "efectuado" | "recibido" | "cancelado" | "fungible";
  products: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Supplier {
  id: string;
  name: string;
}

interface Department {
  name: string;
  description: string;
}

interface ExportModalProps {
  products: Product[];
  orders: Order[];
  suppliers: Supplier[];
  departments?: Department[]; // Nuevo prop opcional
  onClose: () => void;
}

export function ExportModal({ products, orders, suppliers, departments = [], onClose }: ExportModalProps) {
  const [exportProducts, setExportProducts] = useState(true);
  const [exportOrders, setExportOrders] = useState(false);
  
  // Filtros para productos
  const [productCompany, setProductCompany] = useState("all");
  const [productSupplier, setProductSupplier] = useState("all");
  const [productCategory, setProductCategory] = useState("all");
  const [productDepartment, setProductDepartment] = useState("all"); // Nuevo filtro
  const [productStockStatus, setProductStockStatus] = useState("all");
  
  // Filtros para pedidos
  const [orderCompany, setOrderCompany] = useState("all");
  const [orderWarehouse, setOrderWarehouse] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");
  const [orderSupplier, setOrderSupplier] = useState("all");
  
  const companies = ["AMS", "CEM", "RUGH", "SADAF"];
  const warehouses = ["Vecindario", "San Fernando", "Tenerife", "Maestro Falla"];
  const availableCategories = Array.from(new Set(products.map(p => p.category)));
  
  // Función para obtener nombre del proveedor
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : "Sin proveedor";
  };
  
  // Filtrar productos
  const filteredProducts = products.filter(product => {
    if (productCompany !== "all" && product.company !== productCompany) return false;
    if (productSupplier !== "all" && product.supplierId !== productSupplier) return false;
    if (productCategory !== "all" && product.category !== productCategory) return false;
    if (productDepartment !== "all" && product.department !== productDepartment) return false;
    
    if (productStockStatus !== "all") {
      if (productStockStatus === "sin-stock" && product.stock !== 0) return false;
      if (productStockStatus === "stock-bajo" && 
          !(product.minStock !== undefined && product.stock < product.minStock && product.stock > 0)) return false;
      if (productStockStatus === "en-stock" && 
          (product.stock === 0 || (product.minStock !== undefined && product.stock < product.minStock))) return false;
    }
    
    return true;
  });
  
  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    if (orderCompany !== "all" && order.company !== orderCompany) return false;
    if (orderWarehouse !== "all" && order.warehouse !== orderWarehouse) return false;
    if (orderStatus !== "all" && order.status !== orderStatus) return false;
    if (orderSupplier !== "all" && order.supplier !== orderSupplier) return false;
    return true;
  });
  
  const handleExport = () => {
    if (!exportProducts && !exportOrders) {
      alert("Debes seleccionar al menos una opción para exportar");
      return;
    }
    
    const workbook = XLSX.utils.book_new();
    
    // Exportar productos si está seleccionado
    if (exportProducts) {
      const productsData = filteredProducts.map(product => ({
        "SKU": product.sku,
        "Nombre": product.name,
        "Categoría": product.category,
        "Empresa": product.company,
        "Proveedor": getSupplierName(product.supplierId),
        // "Almacén": product.warehouse, // Eliminado
        // "Precio": product.price, // Eliminado
        "Stock": product.stock,
        "Stock Mínimo": product.minStock || 0,
        "Nº de Serie": product.serialNumber || "",
        "Descripción": product.description,
        "URL Imagen": product.image || "",
        "URL Manual": product.manual || "",
      }));
      
      const productsSheet = XLSX.utils.json_to_sheet(productsData);
      
      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 12 }, // SKU
        { wch: 30 }, // Nombre
        { wch: 15 }, // Categoría
        { wch: 10 }, // Empresa
        { wch: 25 }, // Proveedor
        // { wch: 15 }, // Almacén (Eliminado)
        // { wch: 10 }, // Precio (Eliminado)
        { wch: 8 },  // Stock
        { wch: 12 }, // Stock Mínimo
        { wch: 15 }, // Nº de Serie
        { wch: 40 }, // Descripción
        { wch: 30 }, // URL Imagen
        { wch: 30 }, // URL Manual
      ];
      productsSheet["!cols"] = columnWidths;
      
      XLSX.utils.book_append_sheet(workbook, productsSheet, "Productos");
    }
    
    // Exportar pedidos si está seleccionado
    if (exportOrders) {
      const ordersData = filteredOrders.map(order => ({
        "N° Pedido": order.orderNumber,
        "Proveedor": order.supplier,
        "Empresa": order.company,
        "Almacén": order.warehouse,
        "Fecha": new Date(order.date).toLocaleDateString("es-ES"),
        "Total": order.total,
        "N° Items": order.items,
        "Estado": order.status.charAt(0).toUpperCase() + order.status.slice(1),
      }));
      
      const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
      
      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 15 }, // N° Pedido
        { wch: 25 }, // Proveedor
        { wch: 10 }, // Empresa
        { wch: 15 }, // Almacén
        { wch: 12 }, // Fecha
        { wch: 12 }, // Total
        { wch: 10 }, // N° Items
        { wch: 12 }, // Estado
      ];
      ordersSheet["!cols"] = columnWidths;
      
      XLSX.utils.book_append_sheet(workbook, ordersSheet, "Pedidos");
      
      // Agregar detalles de pedidos en otra hoja
      const orderDetailsData: any[] = [];
      filteredOrders.forEach(order => {
        order.products.forEach(item => {
          orderDetailsData.push({
            "N° Pedido": order.orderNumber,
            "Producto": item.productName,
            "Cantidad": item.quantity,
            "Precio Unitario": item.price,
            "Subtotal": item.quantity * item.price,
          });
        });
      });
      
      if (orderDetailsData.length > 0) {
        const detailsSheet = XLSX.utils.json_to_sheet(orderDetailsData);
        const detailColumnWidths = [
          { wch: 15 }, // N° Pedido
          { wch: 35 }, // Producto
          { wch: 10 }, // Cantidad
          { wch: 15 }, // Precio Unitario
          { wch: 15 }, // Subtotal
        ];
        detailsSheet["!cols"] = detailColumnWidths;
        XLSX.utils.book_append_sheet(workbook, detailsSheet, "Detalle Pedidos");
      }
    }
    
    // Generar archivo
    const fileName = `exportacion_inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    onClose();
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 transform transition-all animate-scaleIn max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Exportar Inventario</h3>
                <p className="text-blue-100 text-sm mt-0.5">Selecciona los datos y filtros para exportar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Body - scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Selección de datos a exportar */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
            <h4 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              Selecciona qué exportar
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={exportProducts}
                    onChange={(e) => setExportProducts(e.target.checked)}
                    className="peer w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  {exportProducts ? (
                    <CheckSquare className="absolute inset-0 w-5 h-5 text-blue-600 pointer-events-none" />
                  ) : (
                    <Square className="absolute inset-0 w-5 h-5 text-gray-400 pointer-events-none" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#111827] group-hover:text-blue-600 transition-colors">
                    Lista de Productos
                  </p>
                  <p className="text-sm text-[#6b7280]">
                    {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} 
                    {productCompany !== "all" || productSupplier !== "all" || 
                     productCategory !== "all" || productDepartment !== "all" || productStockStatus !== "all" ? " (filtrados)" : ""}
                  </p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={exportOrders}
                    onChange={(e) => setExportOrders(e.target.checked)}
                    className="peer w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  {exportOrders ? (
                    <CheckSquare className="absolute inset-0 w-5 h-5 text-blue-600 pointer-events-none" />
                  ) : (
                    <Square className="absolute inset-0 w-5 h-5 text-gray-400 pointer-events-none" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#111827] group-hover:text-blue-600 transition-colors">
                    Lista de Pedidos
                  </p>
                  <p className="text-sm text-[#6b7280]">
                    {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} 
                    {orderCompany !== "all" || orderWarehouse !== "all" || 
                     orderStatus !== "all" || orderSupplier !== "all" ? " (filtrados)" : ""}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Filtros para productos */}
          {exportProducts && (
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-600" />
                Filtros de Productos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Empresa
                  </label>
                  <select
                    value={productCompany}
                    onChange={(e) => setProductCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas las empresas</option>
                    {companies.map(comp => (
                      <option key={comp} value={comp}>{comp}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Proveedor
                  </label>
                  <select
                    value={productSupplier}
                    onChange={(e) => setProductSupplier(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los proveedores</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Categoría
                  </label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas las categorías</option>
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Departamento
                  </label>
                  <select
                    value={productDepartment}
                    onChange={(e) => setProductDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los departamentos</option>
                    {departments.map(dept => (
                      <option key={dept.name} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Estado de Stock
                  </label>
                  <select
                    value={productStockStatus}
                    onChange={(e) => setProductStockStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="en-stock">En stock</option>
                    <option value="stock-bajo">Stock bajo</option>
                    <option value="sin-stock">Sin stock</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-[#6b7280]">
                  Se exportarán <span className="font-semibold text-[#111827]">{filteredProducts.length}</span> productos
                </p>
              </div>
            </div>
          )}

          {/* Filtros para pedidos */}
          {exportOrders && (
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-green-600" />
                Filtros de Pedidos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Empresa
                  </label>
                  <select
                    value={orderCompany}
                    onChange={(e) => setOrderCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas las empresas</option>
                    {companies.map(comp => (
                      <option key={comp} value={comp}>{comp}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Almacén
                  </label>
                  <select
                    value={orderWarehouse}
                    onChange={(e) => setOrderWarehouse(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los almacenes</option>
                    {warehouses.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Estado
                  </label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="efectuado">Efectuado</option>
                    <option value="recibido">Recibido</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="fungible">Fungible</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Proveedor
                  </label>
                  <select
                    value={orderSupplier}
                    onChange={(e) => setOrderSupplier(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los proveedores</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-[#6b7280]">
                  Se exportarán <span className="font-semibold text-[#111827]">{filteredOrders.length}</span> pedidos
                </p>
              </div>
            </div>
          )}

          {/* Información del archivo */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h4 className="font-semibold text-[#111827] mb-3">📄 Información del archivo</h4>
            <ul className="space-y-2 text-sm text-[#374151]">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Formato: <strong>Excel (.xlsx)</strong></span>
              </li>
              {exportProducts && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Hoja "Productos" con toda la información de productos</span>
                </li>
              )}
              {exportOrders && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Hoja "Pedidos" con el resumen de pedidos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Hoja "Detalle Pedidos" con los productos de cada pedido</span>
                  </li>
                </>
              )}
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Los filtros aplicados se reflejarán en los datos exportados</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              disabled={!exportProducts && !exportOrders}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exportar Inventario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}