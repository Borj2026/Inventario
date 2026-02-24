import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ReportsViewProps {
  products: any[];
}

export function ReportsView({ products }: ReportsViewProps) {
  const stockData = products
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 10)
    .map(p => ({
      name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
      stock: p.stock,
    }));

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold text-[#111827] mb-4 md:mb-6">Reportes y Estadísticas</h2>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-[#111827] mb-4">Top 10 Productos por Stock</h3>
          {stockData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100} 
                  fontSize={10}
                  interval={0}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="stock" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#6b7280]">
              No hay datos disponibles
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-[#111827] mb-4">Resumen General</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-semibold text-[#3b82f6]">{products.length}</p>
              <p className="text-xs md:text-sm text-[#6b7280] mt-1">Total Productos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-semibold text-[#f59e0b]">
                {products.reduce((sum, p) => sum + p.stock, 0).toLocaleString()}
              </p>
              <p className="text-xs md:text-sm text-[#6b7280] mt-1">Unidades Totales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-semibold text-[#ef4444]">
                {products.filter(p => p.minStock !== undefined && p.stock < p.minStock).length}
              </p>
              <p className="text-xs md:text-sm text-[#6b7280] mt-1">Alertas de Stock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}