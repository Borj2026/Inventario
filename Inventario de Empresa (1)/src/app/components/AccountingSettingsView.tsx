import { Save, Download, Upload } from "lucide-react";
import { Card } from "./ui/card";

interface AccountingSettingsViewProps {
  totalProducts: number;
  totalPurchases: number;
  totalSales: number;
}

export function AccountingSettingsView({ 
  totalProducts, 
  totalPurchases, 
  totalSales 
}: AccountingSettingsViewProps) {
  
  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalProducts,
      totalPurchases,
      totalSales,
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventario_contabilidad_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold text-[#111827] mb-4 md:mb-6">
        Configuración
      </h2>

      <div className="max-w-2xl space-y-4 md:space-y-6">
        {/* Información del Sistema */}
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-[#111827] mb-4">
            Información del Sistema
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-sm text-[#6b7280]">Versión</span>
              <span className="font-medium text-[#111827] text-sm">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-sm text-[#6b7280]">Módulo</span>
              <span className="font-medium text-[#111827] text-sm">Contabilidad</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-sm text-[#6b7280]">Total Productos</span>
              <span className="font-medium text-[#111827] text-sm">{totalProducts}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-sm text-[#6b7280]">Total Compras</span>
              <span className="font-medium text-[#111827] text-sm">{totalPurchases}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-sm text-[#6b7280]">Total Ventas</span>
              <span className="font-medium text-[#111827] text-sm">{totalSales}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-sm text-[#6b7280]">Última Actualización</span>
              <span className="font-medium text-[#111827] text-sm">
                {new Date().toLocaleDateString("es-ES")}
              </span>
            </div>
          </div>
        </Card>

        {/* Gestión de Datos */}
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-[#111827] mb-4">
            Gestión de Datos
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#6b7280] mb-3">
                Exporta el inventario completo a un archivo Excel (.xlsx).
              </p>
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Inventario</span>
              </button>
            </div>

            <div className="pt-4 border-t border-[#e5e7eb]">
              <p className="text-sm text-[#6b7280] mb-3">
                Importa el inventario desde un archivo Excel (.xlsx). Esto actualizará los datos.
              </p>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Importar Inventario</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      alert("Funcionalidad de importación en desarrollo");
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Aviso de Seguridad */}
        <Card className="p-4 md:p-6 bg-[#fef3c7] border-[#fbbf24]">
          <h3 className="text-base font-semibold text-[#92400e] mb-2">
            Aviso de Seguridad
          </h3>
          <p className="text-sm text-[#78350f]">
            Los cambios en la configuración afectan a todas las empresas del sistema. 
            Asegúrate de tener permisos antes de realizar modificaciones importantes.
          </p>
        </Card>
      </div>
    </div>
  );
}
