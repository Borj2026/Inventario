import { useState } from "react";
import { Users, Plus, Mail, Phone, MapPin, Pencil, Trash2, AlertCircle, FileText, Database, Search } from "lucide-react";
import { SupplierModal } from "./SupplierModal";
import { SupplierSettingsModal } from "./SupplierSettingsModal";
import { DeleteSupplierModal } from "./DeleteSupplierModal";
import { usePermissions } from "../hooks/usePermissions";
import * as XLSX from "xlsx";

interface Supplier {
  id: string;
  name: string;
  cif: string;
  email: string;
  phone: string;
  address: string;
}

interface SupplierViewProps {
  suppliers: Supplier[];
  products: Array<{ supplierId?: string }>;
  onAddSupplier: (supplier: Omit<Supplier, "id">) => void;
  onUpdateSupplier: (id: string, supplier: Omit<Supplier, "id">) => void;
  onDeleteSupplier: (id: string) => void;
  userRole?: "usuario" | "coordinador" | "administrador" | "contable";
}

export function SupplierView({
  suppliers,
  products,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  userRole = "usuario"
}: SupplierViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  
  // Verificar permisos
  const { canUseFeature } = usePermissions(userRole);
  const canEditSuppliers = canUseFeature("Editar Proveedores");
  const canDeleteSuppliers = canUseFeature("Eliminar Proveedores");

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleSave = (supplierData: Omit<Supplier, "id">) => {
    if (editingSupplier) {
      onUpdateSupplier(editingSupplier.id, supplierData);
    } else {
      onAddSupplier(supplierData);
    }
    handleCloseModal();
  };

  const handleDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (supplierToDelete) {
      onDeleteSupplier(supplierToDelete.id);
      setIsDeleteModalOpen(false);
      setSupplierToDelete(null);
    }
  };

  const getProductCount = (supplierId: string) => {
    return products.filter(p => p.supplierId === supplierId).length;
  };

  const handleExport = () => {
    const exportData = suppliers.map(s => ({
      Nombre: s.name,
      CIF: s.cif,
      Email: s.email,
      Teléfono: s.phone,
      Dirección: s.address
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proveedores");
    XLSX.writeFile(workbook, "proveedores.xlsx");
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
          // Validar que tenga al menos nombre y email
          if (row.Nombre && row.Email) {
            try {
              onAddSupplier({
                name: row.Nombre || "",
                cif: row.CIF || "",
                email: row.Email || "",
                phone: row.Teléfono || "",
                address: row.Dirección || ""
              });
              importedCount++;
            } catch (error) {
              errorCount++;
            }
          } else {
            errorCount++;
          }
        });

        if (importedCount > 0) {
          alert(`✓ Se importaron ${importedCount} proveedor(es) correctamente en ambos sistemas de inventario.${errorCount > 0 ? `\\n⚠ ${errorCount} fila(s) con errores fueron omitidas.` : ""}`);
        } else {
          alert("No se pudieron importar proveedores. Verifica que el archivo tenga el formato correcto.");
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
        Nombre: "Ejemplo Proveedor S.L.",
        CIF: "B12345678",
        Email: "contacto@ejemplo.com",
        Teléfono: "928123456",
        Dirección: "Calle Ejemplo, 123"
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proveedores");
    XLSX.writeFile(workbook, "plantilla_proveedores.xlsx");
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.cif.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Proveedores</h2>
          <p className="text-sm text-[#6b7280] mt-1">Gestiona la información de tus proveedores (compartidos entre inventario y contabilidad)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 border border-[#d1d5db] text-[#374151] bg-white rounded-lg hover:bg-[#f9fafb] transition-colors"
            title="Importar/Exportar datos"
          >
            <Database className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Proveedor</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      {suppliers.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono, CIF o dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
            />
          </div>
        </div>
      )}

      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-12 text-center">
          <Users className="w-16 h-16 text-[#d1d5db] mx-auto mb-4" />
          {searchQuery ? (
            <>
              <h3 className="text-lg font-medium text-[#111827] mb-2">No se encontraron resultados</h3>
              <p className="text-[#6b7280] mb-4">No hay proveedores que coincidan con "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
              >
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-[#111827] mb-2">No hay proveedores registrados</h3>
              <p className="text-[#6b7280] mb-4">Comienza agregando tu primer proveedor</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar Proveedor
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredSuppliers.map((supplier) => {
            const productCount = getProductCount(supplier.id);
            
            return (
              <div
                key={supplier.id}
                className="bg-white p-4 md:p-6 rounded-lg border border-[#e5e7eb] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[#111827] truncate">{supplier.name}</h3>
                    <p className="text-sm text-[#6b7280] mt-1">
                      Proveedor
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-12 h-12 bg-[#eff6ff] rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#3b82f6]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-[#6b7280]">
                    <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="break-all">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                  {supplier.cif && (
                    <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span>{supplier.cif}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start gap-2 text-sm text-[#6b7280]">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-[#e5e7eb]">
                  {canEditSuppliers && (
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[#3b82f6] bg-[#eff6ff] rounded-lg hover:bg-[#dbeafe] transition-colors text-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                  )}
                  {canDeleteSuppliers && (
                    <button
                      onClick={() => handleDelete(supplier)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm"
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

      {isModalOpen && (
        <SupplierModal
          supplier={editingSupplier}
          suppliers={suppliers}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}

      {isSettingsModalOpen && (
        <SupplierSettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          onExport={handleExport}
          onImport={handleImport}
          onDownloadTemplate={handleDownloadTemplate}
        />
      )}

      {isDeleteModalOpen && supplierToDelete && (() => {
        const productCount = getProductCount(supplierToDelete.id);
        return (
          <DeleteSupplierModal
            supplierName={supplierToDelete.name}
            productCount={productCount}
            onConfirm={confirmDelete}
            onCancel={() => {
              setIsDeleteModalOpen(false);
              setSupplierToDelete(null);
            }}
          />
        );
      })()}
    </div>
  );
}