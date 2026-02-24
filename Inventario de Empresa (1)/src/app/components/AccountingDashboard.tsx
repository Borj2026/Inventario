import { TrendingUp, TrendingDown, ShoppingCart, Package, Euro, AlertTriangle, Calendar, FileText, Users } from "lucide-react";
import { Card } from "./ui/card";

interface Product {
  id: string;
  name: string;
  category: string;
  company: string;
  warehouse: string;
  price: number;
  stock: number;
  minStock?: number;
  invoiceDate?: string;
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
}

interface AccountingDashboardProps {
  products: Product[];
  orders: Order[];
}

export function AccountingDashboard({ products, orders }: AccountingDashboardProps) {
  // Calcular estadísticas de inventario
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

  // Calcular estadísticas de pedidos
  const totalPurchases = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const purchasesCount = orders.length;
  
  // Calcular total de ventas (simulado como el valor del inventario disponible)
  const totalSales = totalInventoryValue;

  // Calcular estadísticas adicionales
  const averagePurchase = purchasesCount > 0 ? totalPurchases / purchasesCount : 0;
  const averageProductValue = totalProducts > 0 ? totalInventoryValue / totalProducts : 0;

  // Obtener productos recientes (últimos 5)
  const recentProducts = products
    .sort((a, b) => {
      const dateA = a.invoiceDate ? new Date(a.invoiceDate).getTime() : 0;
      const dateB = b.invoiceDate ? new Date(b.invoiceDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // Obtener pedidos recientes (últimos 5)
  const recentOrders = orders
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Contar empresas únicas
  const uniqueCompanies = new Set([...products.map(p => p.company), ...orders.map(o => o.company)]).size;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#111827]">
          Panel de Control - Contabilidad
        </h1>
        <p className="text-[#6b7280] mt-1">
          Resumen general del inventario y finanzas
        </p>
      </div>

      {/* Tarjetas de estadísticas principales - Primera Fila */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Valor Total del Inventario */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm text-[#6b7280] mb-1">Valor Total Inventario</h3>
          <p className="text-2xl font-semibold text-[#111827]">
            {totalInventoryValue.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </p>
        </Card>

        {/* Total de Productos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm text-[#6b7280] mb-1">Total Productos</h3>
          <p className="text-2xl font-semibold text-[#111827]">{totalProducts}</p>
        </Card>

        {/* Total Ventas */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm text-[#6b7280] mb-1">Total Ventas</h3>
          <p className="text-2xl font-semibold text-[#111827]">
            {totalSales.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </p>
        </Card>

        {/* Total de Compras */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm text-[#6b7280] mb-1">Total Compras</h3>
          <p className="text-2xl font-semibold text-[#111827]">
            {totalPurchases.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </p>
        </Card>
      </div>

      {/* Productos y Pedidos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos Recientes */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827]">Productos Recientes</h3>
          </div>
          <div className="space-y-3">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-[#e5e7eb] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{product.name}</p>
                    <p className="text-xs text-[#6b7280]">{product.company} • {product.category}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-[#111827]">
                      {(product.price || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })}€
                    </p>
                    <p className="text-xs text-[#6b7280]">Stock: {product.stock || 0}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#6b7280]">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay productos registrados</p>
              </div>
            )}
          </div>
        </Card>

        {/* Pedidos Recientes */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827]">Compras Recientes</h3>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-[#e5e7eb] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{order.orderNumber}</p>
                    <p className="text-xs text-[#6b7280]">{order.company} • {order.supplier}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-[#111827]">
                      {(order.total || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })}€
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      {new Date(order.date).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#6b7280]">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay compras registradas</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}