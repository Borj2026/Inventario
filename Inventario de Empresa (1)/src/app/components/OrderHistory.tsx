import { useState } from "react";
import { Package, Calendar, User, Building2, MapPin, CheckCircle, Clock, X, Plus, FileText, XCircle, FileSpreadsheet, Divide, AlertCircle, ChevronDown, ChevronUp, Edit } from "lucide-react";
import * as XLSX from "xlsx";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
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
  pdfUrl?: string; // URL del PDF generado
}

interface PendingArrival {
  date: string;
  quantity: number;
}

interface OrderHistoryProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: "recibido" | "cancelado" | "efectuado" | "fungible") => void;
  onAddProductsToInventory: (products: Array<{
    productName: string;
    quantity: number;
    price: number;
    category: string;
    department?: string;
    company: string;
    supplier: string;
    warehouse: string;
    hasSerialNumber?: boolean;
    orderNumber?: string; // Agregado orderNumber
  }>) => void;
  categories: Array<{ name: string; notificationEmail?: string }>;
  onAddCategory: (categoryData: { name: string; notificationEmail?: string }) => void;
  suppliers: Array<{ id: string; name: string }>;
  onAddPendingStock?: (pendingStock: {
    orderNumber: string;
    supplier: string;
    company: string;
    warehouse: string;
    orderDate: string;
    items: Array<{
      productName: string;
      orderedQuantity: number;
      receivedQuantity: number;
      pendingQuantity: number;
      arrivals: PendingArrival[];
    }>;
  }) => void;
}

export function OrderHistory({ orders, onUpdateOrderStatus, onAddProductsToInventory, categories, onAddCategory, suppliers, onAddPendingStock }: OrderHistoryProps) {
  const departments = ["Informática", "Contabilidad", "Calidad", "Marketing", "Mantenimiento", "Secretaría"];
  
  const [filters, setFilters] = useState({
    company: "",
    supplier: "",
    startDate: "", // Fecha de inicio
    endDate: "", // Fecha final
    status: "",
    orderNumber: "", // Nuevo filtro de búsqueda por número de pedido
  });
  
  // Estado para controlar qué fechas están expandidas (por defecto todas expandidas)
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    order: Order | null;
  }>({
    isOpen: false,
    order: null
  });

  const [productCategories, setProductCategories] = useState<Record<string, string>>({});
  const [productDepartments, setProductDepartments] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmail, setNewCategoryEmail] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState<Record<string, boolean>>({});
  const [productHasSerialNumber, setProductHasSerialNumber] = useState<Record<string, boolean>>({});
  
  // Estados para la funcionalidad de repartición
  const [distributionModal, setDistributionModal] = useState<{
    isOpen: boolean;
    order: Order | null;
  }>({
    isOpen: false,
    order: null
  });
  const [distributionData, setDistributionData] = useState<Record<string, {
    receivedQuantity: number;
    arrivals: PendingArrival[];
  }>>({});
  
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
  }>({
    isOpen: false,
    orderId: null
  });
  
  // Estados para los modales de advertencia
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
  
  // Estados para modificar pedidos fungibles a no fungibles
  const [editFungibleModal, setEditFungibleModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
  }>({
    isOpen: false,
    orderId: null
  });
  
  const [confirmChangeFungibleModal, setConfirmChangeFungibleModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
  }>({
    isOpen: false,
    orderId: null
  });
  
  // Estados para modificar pedidos efectuados a fungibles
  const [editToFungibleModal, setEditToFungibleModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
  }>({
    isOpen: false,
    orderId: null
  });
  
  const [confirmChangeToFungibleModal, setConfirmChangeToFungibleModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
  }>({
    isOpen: false,
    orderId: null
  });
  
  // Obtener valores únicos para los filtros
  const uniqueCompanies = [...new Set(orders.map(order => order.company))];
  const uniqueSuppliers = [...new Set(orders.map(order => order.supplier))];

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    if (filters.company && order.company !== filters.company) return false;
    if (filters.supplier && order.supplier !== filters.supplier) return false;
    
    // Filtro de rango de fechas
    if (filters.startDate || filters.endDate) {
      // El order.date está en formato DD/MM/YYYY, lo convertimos a Date para comparar
      const [day, month, year] = order.date.split('/');
      const orderDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      orderDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (orderDate < startDate) return false;
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(0, 0, 0, 0);
        if (orderDate > endDate) return false;
      }
    }
    
    if (filters.status && order.status !== filters.status) return false;
    if (filters.orderNumber && !order.orderNumber.includes(filters.orderNumber)) return false; // Nuevo filtro de búsqueda por número de pedido
    return true;
  });

  // Ordenar pedidos por fecha (más recientes primero)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split('/');
    const [dayB, monthB, yearB] = b.date.split('/');
    const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
    const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
    return dateB.getTime() - dateA.getTime(); // Descendente (más reciente primero)
  });

  // Agrupar pedidos por fecha
  const groupedOrders = sortedOrders.reduce((groups, order) => {
    const date = order.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(order);
    return groups;
  }, {} as Record<string, Order[]>);

  // Ordenar las fechas de más reciente a más antigua
  const sortedDates = Object.keys(groupedOrders).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('/');
    const [dayB, monthB, yearB] = b.split('/');
    const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
    const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
    return dateB.getTime() - dateA.getTime(); // Descendente (más reciente primero)
  });

  // Función para generar colores basados en la fecha
  const getDateColor = (dateString: string) => {
    const colors = [
      { from: "from-blue-600", to: "to-blue-700", light: "blue-100" },
      { from: "from-purple-600", to: "to-purple-700", light: "purple-100" },
      { from: "from-indigo-600", to: "to-indigo-700", light: "indigo-100" },
      { from: "from-teal-600", to: "to-teal-700", light: "teal-100" },
      { from: "from-emerald-600", to: "to-emerald-700", light: "emerald-100" },
      { from: "from-cyan-600", to: "to-cyan-700", light: "cyan-100" },
      { from: "from-sky-600", to: "to-sky-700", light: "sky-100" },
      { from: "from-violet-600", to: "to-violet-700", light: "violet-100" },
      { from: "from-fuchsia-600", to: "to-fuchsia-700", light: "fuchsia-100" },
      { from: "from-pink-600", to: "to-pink-700", light: "pink-100" },
    ];
    
    // Generar un índice basado en la fecha
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Función para toggle expansión de fecha
  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  // Verificar si una fecha está expandida (por defecto sí)
  const isDateExpanded = (date: string) => {
    return expandedDates[date] !== false;
  };

  const handleAddToStock = (order: Order) => {
    // Inicializar categorías vacías para obligar a seleccionar
    const initialCategories: Record<string, string> = {};
    order.products.forEach(product => {
      initialCategories[product.id] = "";
    });
    setProductCategories(initialCategories);
    setShowNewCategoryInput({});
    setNewCategoryName("");
    setNewCategoryEmail("");
    setConfirmModal({ isOpen: true, order });
  };

  const handleCategoryChange = (productId: string, value: string) => {
    if (value === "new") {
      setShowNewCategoryInput({ ...showNewCategoryInput, [productId]: true });
    } else {
      setProductCategories({ ...productCategories, [productId]: value });
      setShowNewCategoryInput({ ...showNewCategoryInput, [productId]: false });
    }
  };

  const handleAddNewCategory = (productId: string) => {
    if (newCategoryName.trim()) {
      const categoryData = {
        name: newCategoryName.trim(),
        notificationEmail: newCategoryEmail.trim() || undefined
      };
      
      // Verificar si la categoría ya existe
      const categoryExists = categories.some(c => c.name.toLowerCase() === categoryData.name.toLowerCase());
      
      if (categoryExists) {
        alert('Esta categoría ya existe. Por favor elige un nombre diferente.');
        return;
      }
      
      // Agregar la nueva categoría
      onAddCategory(categoryData);
      
      // Asignar la nueva categoría al producto
      setProductCategories({ ...productCategories, [productId]: newCategoryName.trim() });
      
      // Limpiar el formulario
      setShowNewCategoryInput({ ...showNewCategoryInput, [productId]: false });
      setNewCategoryName("");
      setNewCategoryEmail("");
    } else {
      alert('Por favor ingresa un nombre para la categoría.');
    }
  };

  const canConfirm = confirmModal.order?.products.every(product => 
    productCategories[product.id] && 
    productCategories[product.id].trim() !== "" &&
    productDepartments[product.id] &&
    productDepartments[product.id].trim() !== ""
  ) || false;

  const confirmAddToStock = () => {
    if (confirmModal.order) {
      // Preparar productos con categorías para añadir al inventario
      const productsToAdd = confirmModal.order.products.map(product => ({
        productName: product.productName,
        quantity: product.quantity,
        price: product.price,
        category: productCategories[product.id],
        department: productDepartments[product.id],
        company: confirmModal.order!.company,
        supplier: confirmModal.order!.supplier,
        warehouse: confirmModal.order!.warehouse,
        hasSerialNumber: productHasSerialNumber[product.id] || false,
        orderNumber: confirmModal.order!.orderNumber // Añadir número de pedido
      }));
      
      // Añadir productos al inventario
      onAddProductsToInventory(productsToAdd);
      
      // Actualizar el estado del pedido
      onUpdateOrderStatus(confirmModal.order.id, "recibido");
      
      // Cerrar el modal
      setConfirmModal({ isOpen: false, order: null });
      setProductCategories({});
      setProductHasSerialNumber({});
      setShowNewCategoryInput({});
      setNewCategoryName("");
      setNewCategoryEmail("");
    }
  };

  const handleDistributionConfirm = () => {
    if (distributionModal.order && onAddPendingStock) {
      // Validar que la cantidad total (recibida + llegadas) no exceda la cantidad del pedido
      const hasOverAllocation = distributionModal.order.products.some(product => {
        const distData = distributionData[product.id] || { receivedQuantity: 0, arrivals: [] };
        const totalArrivals = distData.arrivals.reduce((sum, arr) => sum + (arr.quantity || 0), 0);
        const totalAllocated = distData.receivedQuantity + totalArrivals;
        return totalAllocated > product.quantity;
      });

      if (hasOverAllocation) {
        setWarningModal({ 
          isOpen: true, 
          message: "La suma de la cantidad recibida y las llegadas previstas no puede superar la cantidad total del pedido." 
        });
        return;
      }

      // Preparar productos con la cantidad recibida para añadir al inventario
      const productsToAdd = distributionModal.order.products.map(product => {
        const distData = distributionData[product.id] || { receivedQuantity: 0, arrivals: [] };
        return {
          productName: product.productName,
          quantity: distData.receivedQuantity,
          price: product.price,
          category: productCategories[product.id],
          department: productDepartments[product.id],
          company: distributionModal.order!.company,
          supplier: distributionModal.order!.supplier,
          warehouse: distributionModal.order!.warehouse,
          hasSerialNumber: productHasSerialNumber[product.id] || false,
          orderNumber: distributionModal.order!.orderNumber
        };
      });
      
      // Añadir productos recibidos al inventario
      onAddProductsToInventory(productsToAdd);
      
      // Guardar stock pendiente
      const pendingStock = {
        orderNumber: distributionModal.order.orderNumber,
        supplier: distributionModal.order.supplier,
        company: distributionModal.order.company,
        warehouse: distributionModal.order.warehouse,
        orderDate: distributionModal.order.date,
        items: distributionModal.order.products.map(product => {
          const distData = distributionData[product.id] || { receivedQuantity: 0, arrivals: [] };
          return {
            productName: product.productName,
            orderedQuantity: product.quantity,
            receivedQuantity: distData.receivedQuantity,
            pendingQuantity: product.quantity - distData.receivedQuantity,
            arrivals: distData.arrivals.filter(arr => arr.quantity > 0) // Solo guardar llegadas con cantidad
          };
        })
      };
      
      onAddPendingStock(pendingStock);
      
      // Actualizar el estado del pedido a recibido (parcialmente)
      onUpdateOrderStatus(distributionModal.order.id, "recibido");
      
      // Cerrar el modal de repartición
      setDistributionModal({ isOpen: false, order: null });
      setProductCategories({});
      setProductHasSerialNumber({});
      setShowNewCategoryInput({});
      setNewCategoryName("");
      setNewCategoryEmail("");
      setDistributionData({});
      
      // Mostrar mensaje de éxito
      setSuccessModal({ 
        isOpen: true, 
        message: "Repartición guardada correctamente. Los productos recibidos se han añadido al inventario." 
      });
    }
  };

  const closeModal = () => {
    setConfirmModal({ isOpen: false, order: null });
    setProductCategories({});
    setShowNewCategoryInput({});
    setNewCategoryName("");
    setNewCategoryEmail("");
    setDistributionData({});
  };

  // Función para generar y descargar Excel de un pedido
  const downloadOrderExcel = (order: Order) => {
    const workbook = XLSX.utils.book_new();
    
    // Convertir estado a texto legible
    const estadoTexto = order.status === "recibido" 
      ? "Recibido" 
      : order.status === "cancelado" 
        ? "Cancelado" 
        : order.status === "fungible"
          ? "Fungible"
          : "Efectuado";
    
    const worksheetData = [
      ["PEDIDO"],
      ["Número de Pedido", order.orderNumber],
      ["Fecha", order.date],
      ["Proveedor", order.supplier],
      ["Empresa", order.company],
      ["Almacén", order.warehouse],
      ["Estado", estadoTexto],
      [],
      ["PRODUCTOS"],
      ["Descripción", "Cantidad", "Precio Unitario", "Importe"]
    ];

    // Calcular subtotal correctamente
    let subtotalCalculado = 0;
    
    order.products.forEach(item => {
      const importe = item.quantity * item.price;
      subtotalCalculado += importe;
      
      worksheetData.push([
        item.productName, 
        item.quantity, 
        parseFloat(item.price.toFixed(2)), 
        parseFloat(importe.toFixed(2))
      ]);
    });

    const tax = 0; // 0% de impuestos
    const total = subtotalCalculado + tax;

    worksheetData.push([]);
    worksheetData.push(["Subtotal", "", "", parseFloat(subtotalCalculado.toFixed(2))]);
    worksheetData.push(["Tipo Impositivo", "", "", "0%"]);
    worksheetData.push(["Impuestos", "", "", parseFloat(tax.toFixed(2))]);
    worksheetData.push(["TOTAL", "", "", parseFloat(total.toFixed(2))]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Ajustar anchos de columna
    worksheet['!cols'] = [
      { wch: 30 }, // Descripción
      { wch: 10 }, // Cantidad
      { wch: 18 }, // Precio Unitario
      { wch: 18 }  // Importe
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedido");
    XLSX.writeFile(workbook, `Pedido_${order.orderNumber}.xlsx`);
  };

  if (orders.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Historial de Pedidos</h2>
          <p className="text-sm text-[#6b7280] mt-1">Consulta todos los pedidos realizados a proveedores</p>
        </div>
        
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-12 text-center">
          <Package className="w-16 h-16 text-[#9ca3af] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#111827] mb-2">No hay pedidos registrados</h3>
          <p className="text-sm text-[#6b7280]">Los pedidos que generes aparecerán aquí</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Historial de Pedidos</h2>
          <p className="text-sm text-[#6b7280] mt-1">Consulta todos los pedidos realizados a proveedores</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 md:p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Fecha Final
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
              >
                <option value="">Todos</option>
                <option value="efectuado">Efectuado</option>
                <option value="recibido">Recibido</option>
                <option value="cancelado">Cancelado</option>
                <option value="fungible">Fungible</option>
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
          {(filters.company || filters.supplier || filters.startDate || filters.endDate || filters.status || filters.orderNumber) && (
            <div className="mt-4">
              <button
                onClick={() => setFilters({ company: "", supplier: "", startDate: "", endDate: "", status: "", orderNumber: "" })}
                className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Botones de Expandir/Contraer todos */}
        {sortedDates.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
            <span className="text-sm text-blue-900 font-medium">
              {sortedDates.length} fecha{sortedDates.length > 1 ? 's' : ''} con pedidos
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const allExpanded: Record<string, boolean> = {};
                  sortedDates.forEach(date => { allExpanded[date] = true; });
                  setExpandedDates(allExpanded);
                }}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Desplegar todos
              </button>
              <button
                onClick={() => {
                  const allCollapsed: Record<string, boolean> = {};
                  sortedDates.forEach(date => { allCollapsed[date] = false; });
                  setExpandedDates(allCollapsed);
                }}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contraer todos
              </button>
            </div>
          </div>
        )}

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-6">
          {sortedDates.map((date) => {
            const dateColor = getDateColor(date);
            const isExpanded = isDateExpanded(date);
            
            return (
              <div key={date} className="space-y-3">
                {/* Encabezado de fecha */}
                <button
                  onClick={() => toggleDateExpansion(date)}
                  className={`w-full bg-gradient-to-r ${dateColor.from} ${dateColor.to} px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity`}
                >
                  <Calendar className="w-5 h-5 text-white" />
                  <h3 className="text-base font-semibold text-white">{date}</h3>
                  <span className={`ml-auto text-sm text-${dateColor.light} mr-2`}>
                    {groupedOrders[date].length} pedido{groupedOrders[date].length !== 1 ? 's' : ''}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-white" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white" />
                  )}
                </button>
                
                {/* Tarjetas de pedidos para esta fecha */}
                {isExpanded && groupedOrders[date].map((order) => (
                <div key={order.id} className="bg-white rounded-lg border border-[#e5e7eb] p-4">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[#111827]">{order.orderNumber}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${
                        order.status === "recibido" 
                          ? "bg-green-100 text-green-700" 
                          : order.status === "cancelado"
                            ? "bg-red-100 text-red-700"
                            : order.status === "fungible"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status === "recibido" ? <CheckCircle className="w-3 h-3" /> : order.status === "cancelado" ? <XCircle className="w-3 h-3" /> : order.status === "fungible" ? <Package className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {order.status === "recibido" ? "Recibido" : order.status === "cancelado" ? "Cancelado" : order.status === "fungible" ? "Fungible" : "Efectuado"}
                      </span>
                    </div>
                    <p className="text-sm text-[#6b7280] mt-1">{order.supplier}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-[#6b7280]">
                      <Building2 className="w-4 h-4" />
                      <span>{order.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6b7280]">
                      <MapPin className="w-4 h-4" />
                      <span>{order.warehouse}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6b7280]">
                      <Package className="w-4 h-4" />
                      <span>{order.items} productos</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-end gap-2">
                    {order.status === "efectuado" && (
                      <>
                        <button
                          onClick={() => handleAddToStock(order)}
                          className="px-3 py-2 text-sm bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors"
                        >
                          Añadir a stock
                        </button>
                        <button
                          onClick={() => setEditToFungibleModal({ isOpen: true, orderId: order.id })}
                          className="px-3 py-2 text-sm bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                      </>
                    )}
                    {order.status === "fungible" && (
                      <button
                        onClick={() => setEditFungibleModal({ isOpen: true, orderId: order.id })}
                        className="px-3 py-2 text-sm bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                    )}
                  </div>
                </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block space-y-6">
          {sortedDates.map((date) => {
            const dateColor = getDateColor(date);
            const isExpanded = isDateExpanded(date);
            
            return (
              <div key={date} className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
                {/* Encabezado de fecha */}
                <button
                  onClick={() => toggleDateExpansion(date)}
                  className={`w-full bg-gradient-to-r ${dateColor.from} ${dateColor.to} px-6 py-3 flex items-center gap-3 hover:opacity-90 transition-opacity`}
                >
                  <Calendar className="w-5 h-5 text-white" />
                  <h3 className="text-base font-semibold text-white">{date}</h3>
                  <span className={`ml-auto text-sm text-${dateColor.light} mr-2`}>
                    {groupedOrders[date].length} pedido{groupedOrders[date].length !== 1 ? 's' : ''}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-white" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white" />
                  )}
                </button>
                
                {/* Tabla de pedidos para esta fecha */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        N° Pedido
                      </th>
                      <th className="text-center px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        PDF
                      </th>
                      <th className="text-center px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Excel
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Proveedor
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Almacén
                      </th>
                      <th className="text-center px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Productos
                      </th>
                      <th className="text-center px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#e5e7eb]">
                    {groupedOrders[date].map((order) => (
                  <tr key={order.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {order.pdfUrl ? (
                        <a href={order.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-4 h-4 text-[#3b82f6] hover:text-[#2563eb] transition-colors" />
                        </a>
                      ) : (
                        <FileText className="w-4 h-4 text-[#9ca3af] cursor-not-allowed" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <button
                        onClick={() => downloadOrderExcel(order)}
                        title="Descargar Excel"
                        className="inline-flex items-center justify-center"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-[#10b981] hover:text-[#059669] transition-colors cursor-pointer" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#374151]">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#6b7280]" />
                        {order.supplier}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#374151]">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-[#eff6ff] text-[#3b82f6]">
                        {order.company}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#374151]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#6b7280]" />
                        {order.warehouse}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${
                        order.status === "recibido" 
                          ? "bg-green-100 text-green-700" 
                          : order.status === "cancelado"
                            ? "bg-red-100 text-red-700"
                            : order.status === "fungible"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status === "recibido" ? <CheckCircle className="w-3 h-3" /> : order.status === "cancelado" ? <XCircle className="w-3 h-3" /> : order.status === "fungible" ? <Package className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {order.status === "recibido" ? "Recibido" : order.status === "cancelado" ? "Cancelado" : order.status === "fungible" ? "Fungible" : "Efectuado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-[#374151]">
                      {order.items}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {order.status === "efectuado" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAddToStock(order)}
                            className="px-3 py-2 text-sm bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors"
                          >
                            Añadir a stock
                          </button>
                          <button
                            onClick={() => setCancelModal({ isOpen: true, orderId: order.id })}
                            className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Cancelar Pedido
                          </button>
                          <button
                            onClick={() => setEditToFungibleModal({ isOpen: true, orderId: order.id })}
                            className="px-3 py-2 text-sm bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                        </div>
                      ) : order.status === "fungible" ? (
                        <button
                          onClick={() => setEditFungibleModal({ isOpen: true, orderId: order.id })}
                          className="px-3 py-2 text-sm bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 mx-auto"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                      ) : (
                        <span className="text-xs text-[#6b7280]">-</span>
                      )}
                    </td>
                  </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                )}
              </div>
            );
          })}
        </div>

        {sortedOrders.length === 0 && (
          <div className="bg-white rounded-lg border border-[#e5e7eb] p-12 text-center mt-6">
            <Package className="w-16 h-16 text-[#9ca3af] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#111827] mb-2">No se encontraron pedidos</h3>
            <p className="text-sm text-[#6b7280]">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {confirmModal.isOpen && confirmModal.order && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#111827]">Confirmar recepción</h3>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-[#f3f4f6] rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b7280]" />
                </button>
              </div>

              <p className="text-sm text-[#374151] mb-4">
                ¿Estás seguro que quieres añadir este pedido al stock?
              </p>

              <div className="bg-[#f9fafb] rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
                <h4 className="text-sm font-semibold text-[#111827] mb-3">Selecciona la categoría para cada producto:</h4>
                <div className="space-y-4">
                  {confirmModal.order.products.map((product) => (
                    <div key={product.id} className="bg-white p-3 rounded-lg border border-[#e5e7eb]">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#111827]">{product.productName}</p>
                          <p className="text-xs text-[#6b7280]">Cantidad: {product.quantity} • Precio: {product.price.toFixed(2)} </p>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-[#374151] mb-1">
                          Categoría
                        </label>
                        {!showNewCategoryInput[product.id] ? (
                          <select
                            value={productCategories[product.id] || ""}
                            onChange={(e) => handleCategoryChange(product.id, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                          >
                            <option value="">Seleccionar categoría</option>
                            {categories.map(cat => (
                              <option key={cat.name} value={cat.name}>{cat.name}</option>
                            ))}
                            <option value="new">+ Crear nueva categoría</option>
                          </select>
                        ) : (
                          <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <p className="text-xs font-medium text-blue-900">Nueva Categoría</p>
                            </div>
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="Nombre de la categoría *"
                              className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] bg-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddNewCategory(product.id);
                                }
                              }}
                            />
                            <input
                              type="email"
                              value={newCategoryEmail}
                              onChange={(e) => setNewCategoryEmail(e.target.value)}
                              placeholder="Email de notificación (opcional)"
                              className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] bg-white"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddNewCategory(product.id);
                                }
                              }}
                            />
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleAddNewCategory(product.id)}
                                className="flex-1 px-3 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors text-sm font-medium flex items-center justify-center gap-1"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Crear</span>
                              </button>
                              <button
                                onClick={() => {
                                  setShowNewCategoryInput({ ...showNewCategoryInput, [product.id]: false });
                                  setNewCategoryName("");
                                  setNewCategoryEmail("");
                                  // Restaurar a la primera categoría
                                  setProductCategories({ ...productCategories, [product.id]: categories[0]?.name || "" });
                                }}
                                className="px-3 py-2 bg-[#f3f4f6] text-[#374151] rounded-lg hover:bg-[#e5e7eb] transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Departamento */}
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-[#374151] mb-1">
                          Departamento *
                        </label>
                        <select
                          value={productDepartments[product.id] || ""}
                          onChange={(e) => setProductDepartments({ ...productDepartments, [product.id]: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                        >
                          <option value="">Seleccionar departamento</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Checkbox para número de serie */}
                      <div className="mt-3 pt-3 border-t border-[#e5e7eb]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={productHasSerialNumber[product.id] || false}
                            onChange={(e) => setProductHasSerialNumber({ ...productHasSerialNumber, [product.id]: e.target.checked })}
                            className="w-4 h-4 text-[#3b82f6] border-[#d1d5db] rounded focus:ring-2 focus:ring-[#3b82f6]"
                          />
                          <span className="text-xs font-medium text-[#374151]">
                            Este producto lleva número de serie
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-[#111827]">Total del pedido:</span>
                    <span className="font-semibold text-[#111827]">
                      {confirmModal.order.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón de Repartici��n y texto explicativo */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    // Verificar que se han seleccionado categorías y departamentos antes de abrir el modal de repartición
                    if (!canConfirm) {
                      setWarningModal({ 
                        isOpen: true, 
                        message: "Por favor completa la selección de categoría y departamento para cada producto antes de proceder con la repartición." 
                      });
                      return;
                    }
                    
                    // Cerrar modal de confirmación y abrir modal de repartición
                    setDistributionModal({ isOpen: true, order: confirmModal.order });
                    setConfirmModal({ isOpen: false, order: null });
                  }}
                  className="w-full px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center justify-center gap-2"
                >
                  <Divide className="w-4 h-4" />
                  Repartición
                </button>
                <p className="text-xs text-[#6b7280] mt-2 text-center">
                  Pulsa Repartición si no ha llegado todo el stock o el stock se divide en varios lugares
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAddToStock}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                    canConfirm 
                      ? 'bg-[#10b981] hover:bg-[#059669]' 
                      : 'bg-[#9ca3af] cursor-not-allowed'
                  }`}
                  disabled={!canConfirm}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de repartición */}
      {distributionModal.isOpen && distributionModal.order && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#111827]">Repartición de Stock</h3>
                <button
                  onClick={() => setDistributionModal({ isOpen: false, order: null })}
                  className="p-1 hover:bg-[#f3f4f6] rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b7280]" />
                </button>
              </div>

              <p className="text-sm text-[#374151] mb-4">
                Distribuye el stock recibido entre los productos del pedido.
              </p>

              <div className="bg-[#f9fafb] rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
                <h4 className="text-sm font-semibold text-[#111827] mb-3">Repartir stock para cada producto:</h4>
                <div className="space-y-4">
                  {distributionModal.order.products.map((product) => {
                    const distData = distributionData[product.id] || {
                      receivedQuantity: 0,
                      arrivals: [{ date: "", quantity: 0 }]
                    };
                    
                    const totalArrivals = distData.arrivals.reduce((sum, arr) => sum + (arr.quantity || 0), 0);
                    const totalAllocated = distData.receivedQuantity + totalArrivals;
                    const isOverAllocated = totalAllocated > product.quantity;
                    const pendingQuantity = product.quantity - distData.receivedQuantity;

                    return (
                      <div key={product.id} className={`bg-white p-3 rounded-lg border ${isOverAllocated ? 'border-red-300 ring-1 ring-red-300' : 'border-[#e5e7eb]'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-[#111827]">{product.productName}</p>
                            <p className="text-xs text-[#6b7280]">Cantidad total pedida: {product.quantity}</p>
                          </div>
                          {isOverAllocated && (
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                              Exceso: {totalAllocated - product.quantity}
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
                              max={product.quantity}
                              value={distData.receivedQuantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setDistributionData({
                                  ...distributionData,
                                  [product.id]: {
                                    ...distData,
                                    receivedQuantity: Math.min(value, product.quantity)
                                  }
                                });
                              }}
                              className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                            />
                          </div>

                          {/* Cantidad pendiente (auto-calculada) */}
                          <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-xs font-medium text-yellow-800">
                              Pendiente: <strong>{pendingQuantity}</strong> unidades
                            </p>
                          </div>

                          {/* Llegadas futuras */}
                          {pendingQuantity > 0 && (
                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-[#374151]">
                                Llegadas previstas (opcional)
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
                                              [product.id]: {
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
                                              [product.id]: {
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
                                            [product.id]: {
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
                                              [product.id]: {
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
                                    [product.id]: {
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
                <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-[#111827]">Total del pedido:</span>
                    <span className="font-semibold text-[#111827]">
                      {distributionModal.order.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDistributionModal({ isOpen: false, order: null })}
                  className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDistributionConfirm}
                  className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
                >
                  Confirmar Repartición
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cancelar pedido */}
      {cancelModal.isOpen && cancelModal.orderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#111827]">Cancelar Pedido</h3>
                <button
                  onClick={() => setCancelModal({ isOpen: false, orderId: null })}
                  className="p-1 hover:bg-[#f3f4f6] rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b7280]" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-sm text-[#374151]">
                  ¿Est��s seguro que quieres cancelar pedido?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCancelModal({ isOpen: false, orderId: null })}
                  className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors"
                >
                  No, volver
                </button>
                <button
                  onClick={() => {
                    if (cancelModal.orderId) {
                      onUpdateOrderStatus(cancelModal.orderId, "cancelado");
                      setCancelModal({ isOpen: false, orderId: null });
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sí, cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de advertencia */}
      {warningModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#111827]">Advertencia</h3>
                <button
                  onClick={() => setWarningModal({ isOpen: false, message: "" })}
                  className="p-1 hover:bg-[#f3f4f6] rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b7280]" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-sm text-[#374151]">
                  {warningModal.message}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setWarningModal({ isOpen: false, message: "" })}
                  className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
                >
                  Entendido
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

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-[#374151]">
                  {successModal.message}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSuccessModal({ isOpen: false, message: "" })}
                  className="px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de editar pedido fungible */}
      {editFungibleModal.isOpen && editFungibleModal.orderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#111827]">Modificar Pedido</h3>
                <button
                  onClick={() => setEditFungibleModal({ isOpen: false, orderId: null })}
                  className="p-1 hover:bg-[#f3f4f6] rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b7280]" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-[#374151]">
                  ¿Se trata de un pedido No Fungible?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditFungibleModal({ isOpen: false, orderId: null })}
                  className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setConfirmChangeFungibleModal({ isOpen: true, orderId: editFungibleModal.orderId });
                    setEditFungibleModal({ isOpen: false, orderId: null });
                  }}
                  className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
                >
                  Modificar a No Fungible
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cambio a no fungible */}
      {confirmChangeFungibleModal.isOpen && confirmChangeFungibleModal.orderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#111827]">Confirmar Modificación</h3>
                <button
                  onClick={() => setConfirmChangeFungibleModal({ isOpen: false, orderId: null })}
                  className="p-1 hover:bg-[#f3f4f6] rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b7280]" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-[#374151]">
                  ¿Confirmas que deseas cambiar este pedido de <strong>Fungible</strong> a <strong>Efectuado</strong>?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmChangeFungibleModal({ isOpen: false, orderId: null })}
                  className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (confirmChangeFungibleModal.orderId) {
                      onUpdateOrderStatus(confirmChangeFungibleModal.orderId, "efectuado");
                      setConfirmChangeFungibleModal({ isOpen: false, orderId: null });
                      setSuccessModal({ 
                        isOpen: true, 
                        message: "El pedido ha sido modificado a estado Efectuado correctamente." 
                      });
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de editar pedido efectuado a fungible */}
      {editToFungibleModal.isOpen && editToFungibleModal.orderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#111827]">Modificar Pedido</h3>
                <button
                  onClick={() => setEditToFungibleModal({ isOpen: false, orderId: null })}
                  className="p-1 hover:bg-[#f3f4f6] rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b7280]" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-[#374151]">
                  ¿Se trata de un pedido Fungible?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditToFungibleModal({ isOpen: false, orderId: null })}
                  className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setConfirmChangeToFungibleModal({ isOpen: true, orderId: editToFungibleModal.orderId });
                    setEditToFungibleModal({ isOpen: false, orderId: null });
                  }}
                  className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
                >
                  Modificar a Fungible
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cambio a fungible */}
      {confirmChangeToFungibleModal.isOpen && confirmChangeToFungibleModal.orderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#111827]">Confirmar Modificación</h3>
                <button
                  onClick={() => setConfirmChangeToFungibleModal({ isOpen: false, orderId: null })}
                  className="p-1 hover:bg-[#f3f4f6] rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#6b7280]" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-[#374151]">
                  ¿Confirmas que deseas cambiar este pedido de <strong>Efectuado</strong> a <strong>Fungible</strong>?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmChangeToFungibleModal({ isOpen: false, orderId: null })}
                  className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (confirmChangeToFungibleModal.orderId) {
                      onUpdateOrderStatus(confirmChangeToFungibleModal.orderId, "fungible");
                      setConfirmChangeToFungibleModal({ isOpen: false, orderId: null });
                      setSuccessModal({ 
                        isOpen: true, 
                        message: "El pedido ha sido modificado a estado Fungible correctamente." 
                      });
                    }
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
    </>
  );
}