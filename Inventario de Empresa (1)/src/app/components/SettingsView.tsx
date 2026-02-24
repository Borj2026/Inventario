import { Save, Download, Upload, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { utils, writeFile, read } from "xlsx";
import { toast } from "sonner";
import { ExportModal } from "./ExportModal";

interface Product {
  id: string;
  name: string;
  sku: string;
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

interface Supplier {
  id: string;
  name: string;
}

interface SettingsViewProps {
  products: Product[];
  orders: Order[];
  suppliers: Supplier[];
  onImportData: (data: any[]) => void;
}

export function SettingsView({ products, orders, suppliers, onImportData }: SettingsViewProps) {
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExport = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventario_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      ["SKU", "Nombre", "Categoría", "Empresa", "Proveedor", "Stock", "Nº de Serie", "Descripción", "URL_imagen", "URL_Manual"]
    ];
    const wb = utils.book_new();
    const ws = utils.aoa_to_sheet(headers);
    
    // Ajustar ancho de columnas para mejor visualización
    const columnWidths = [
      { wch: 12 },  // SKU
      { wch: 30 },  // Nombre
      { wch: 15 },  // Categoría
      { wch: 10 },  // Empresa
      { wch: 25 },  // Proveedor
      { wch: 8 },   // Stock
      { wch: 15 },  // Nº de Serie
      { wch: 40 },  // Descripción
      { wch: 30 },  // URL_imagen
      { wch: 30 },  // URL_Manual
    ];
    ws['!cols'] = columnWidths;
    
    utils.book_append_sheet(wb, ws, "Plantilla Importación");
    writeFile(wb, "plantilla_inventario.xlsx");
    
    toast.success("Plantilla descargada", {
      description: "La plantilla de Excel se ha descargado correctamente."
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = read(event.target?.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = utils.sheet_to_json(worksheet);

          const importedProducts = jsonData.map((row: any) => {
            // Lógica para encontrar el proveedor por nombre
            const supplierNameInput = row['Proveedor'] || '';
            const foundSupplier = suppliers.find(s => 
              s.name.toLowerCase().trim() === String(supplierNameInput).toLowerCase().trim() ||
              s.name.toLowerCase().includes(String(supplierNameInput).toLowerCase())
            );
            
            // Si encontramos el proveedor usamos su ID, si no, usamos el nombre tal cual
            const supplierId = foundSupplier ? foundSupplier.id : (supplierNameInput || 'Proveedor General');
            
            return {
              id: crypto.randomUUID(),
              name: row['Nombre'] || row['Producto'] || 'Nuevo Producto',
              sku: row['SKU'] || `SKU-${Math.floor(Math.random() * 100000)}`,
              category: row['Categoría'] || 'General',
              company: row['Empresa'] || 'AMS',
              department: row['Departamento'] || '',
              supplierId: supplierId,
              warehouse: row['Departamento'] || 'Vecindario',
              price: 0,
              stock: Number(row['Stock']) || 0,
              minStock: 5,
              serialNumber: row['Nº de Serie'] || '',
              description: row['Descripción'] || 'Importado desde Excel',
              image: row['URL_imagen'] || '',
              manual: row['URL_Manual'] || ''
            };
          });

          if (importedProducts.length > 0) {
            onImportData([...products, ...importedProducts]);
            toast.success("Inventario actualizado correctamente", {
              description: `Se han añadido ${importedProducts.length} nuevos productos al inventario existente.`
            });
          } else {
            toast.warning("Archivo vacío", {
              description: "El archivo no contiene datos válidos para importar."
            });
          }
        } catch (error) {
          console.error("Error importing file:", error);
          toast.error("Error al importar", {
            description: "No se pudo leer el archivo Excel. Verifique que el formato sea correcto."
          });
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold text-[#111827] mb-4 md:mb-6">Configuración</h2>

      <div className="max-w-2xl space-y-4 md:space-y-6">
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-[#111827] mb-4">Información del Sistema</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-sm text-[#6b7280]">Versión</span>
              <span className="font-medium text-[#111827] text-sm">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-sm text-[#6b7280]">Productos Registrados</span>
              <span className="font-medium text-[#111827] text-sm">{products.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-sm text-[#6b7280]">Última Actualización</span>
              <span className="font-medium text-[#111827] text-sm">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-[#111827] mb-4">Gestión de Datos</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#6b7280] mb-3">
                Exporta productos y pedidos a un archivo Excel (.xlsx) con filtros personalizados.
              </p>
              <button
                onClick={() => setShowExportModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors text-sm md:text-base"
              >
                <Download className="w-5 h-5" />
                Exportar Inventario
              </button>
            </div>

            <div className="pt-4 border-t border-[#e5e7eb]">
              <p className="text-sm text-[#6b7280] mb-3">
                Importa productos desde un archivo Excel (.xlsx). Esto reemplazará los datos actuales.
              </p>
              <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] cursor-pointer transition-colors text-sm md:text-base">
                <Upload className="w-5 h-5" />
                Importar Inventario
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-[#e5e7eb]">
              <p className="text-sm text-[#6b7280] mb-3">
                Descarga la plantilla Excel de referencia para importar tus datos correctamente.
              </p>
              <button
                onClick={handleDownloadTemplate}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors text-sm md:text-base"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Descargar Plantilla
              </button>
            </div>
          </div>
        </div>


      </div>
      
      {/* Modal de exportación */}
      {showExportModal && (
        <ExportModal 
          products={products}
          orders={orders}
          suppliers={suppliers}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}