import { Package, TrendingDown, AlertTriangle } from "lucide-react";

interface DashboardProps {
  products: any[];
}

export function Dashboard({ products }: DashboardProps) {
  const totalProducts = products.length;
  const lowStock = products.filter(p => p.minStock !== undefined && p.stock < p.minStock).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  const stats = [
    {
      title: "Total Productos",
      value: totalProducts,
      icon: Package,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Stock Bajo",
      value: lowStock,
      icon: TrendingDown,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
    {
      title: "Sin Stock",
      value: outOfStock,
      icon: AlertTriangle,
      color: "bg-red-500",
      textColor: "text-red-600",
    },
  ];

  const lowStockProducts = products
    .filter(p => p.minStock !== undefined && p.stock < p.minStock && p.stock > 0)
    .slice(0, 5);

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold text-[#111827] mb-4 md:mb-6">Panel de Control</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg border border-[#e5e7eb] p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className={`p-2 md:p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.textColor}`} />
                </div>
              </div>
              <p className="text-xs md:text-sm text-[#6b7280] mb-1">{stat.title}</p>
              <p className="text-lg md:text-2xl font-semibold text-[#111827]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-[#111827] mb-4">Productos con Stock Bajo</h3>
        {lowStockProducts.length === 0 ? (
          <p className="text-[#6b7280] text-sm">No hay productos con stock bajo</p>
        ) : (
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-[#f3f4f6] last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#111827] truncate">{product.name}</p>
                  <p className="text-xs md:text-sm text-[#6b7280]">{product.category}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium text-yellow-600">{product.stock} unidades</p>
                  <p className="text-xs text-[#6b7280]">Mín: {product.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}