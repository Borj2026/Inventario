import { X, Download, Upload, FileSpreadsheet, Database } from "lucide-react";

interface ProductSettingsModalProps {
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onDownloadTemplate: () => void;
}

export function ProductSettingsModal({
  onClose,
  onExport,
  onImport,
  onDownloadTemplate,
}: ProductSettingsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[#111827]">
              Configuración de Inventario
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-[#6b7280] mb-6">
            Gestiona la importación y exportación de productos en formato Excel
          </p>

          <div className="space-y-3">
            {/* Exportar Inventario */}
            <button
              onClick={() => {
                onExport();
              }}
              className="w-full flex items-center gap-3 p-4 border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] transition-colors text-left group"
            >
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#111827]">Exportar Inventario</h3>
                <p className="text-sm text-[#6b7280]">
                  Descarga productos y pedidos con filtros personalizados
                </p>
              </div>
            </button>

            {/* Importar Inventario */}
            <button
              onClick={() => {
                onImport();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-4 border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] transition-colors text-left group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#111827]">Importar Inventario</h3>
                <p className="text-sm text-[#6b7280]">
                  Carga productos desde un archivo Excel
                </p>
              </div>
            </button>

            {/* Descargar Plantilla */}
            <button
              onClick={() => {
                onDownloadTemplate();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-4 border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] transition-colors text-left group"
            >
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <FileSpreadsheet className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#111827]">Descargar Plantilla</h3>
                <p className="text-sm text-[#6b7280]">
                  Descarga una plantilla Excel en blanco
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#e5e7eb]">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}