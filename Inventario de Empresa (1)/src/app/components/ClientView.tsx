import { useState } from "react";
import { UserCheck, Plus, Mail, Phone, MapPin, Pencil, Trash2, AlertCircle, Database, FileText, Search } from "lucide-react";
import { ClientModal } from "./ClientModal";
import { ClientSettingsModal } from "./ClientSettingsModal";
import * as XLSX from "xlsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface Client {
  id: string;
  name: string;
  cif: string;
  email: string;
  phone: string;
  address: string;
}

interface ClientViewProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, "id">) => void;
  onUpdateClient: (id: string, client: Omit<Client, "id">) => void;
  onDeleteClient: (id: string) => void;
}

export function ClientView({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}: ClientViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSave = (clientData: Omit<Client, "id">) => {
    if (editingClient) {
      onUpdateClient(editingClient.id, clientData);
    } else {
      onAddClient(clientData);
    }
    handleCloseModal();
  };

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      onDeleteClient(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  const handleExport = () => {
    const exportData = clients.map(c => ({
      Nombre: c.name,
      CIF: c.cif,
      Email: c.email,
      Teléfono: c.phone,
      Dirección: c.address
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, "clientes.xlsx");
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
              onAddClient({
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
          alert(`✓ Se importaron ${importedCount} cliente(s) correctamente.${errorCount > 0 ? `\n⚠ ${errorCount} fila(s) con errores fueron omitidas.` : ""}`);
        } else {
          alert("No se pudieron importar clientes. Verifica que el archivo tenga el formato correcto.");
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
        Nombre: "Ejemplo Cliente",
        CIF: "12345678A",
        Email: "cliente@ejemplo.com",
        Teléfono: "928123456",
        Dirección: "Calle Ejemplo, 123"
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, "plantilla_clientes.xlsx");
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.cif.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Clientes</h2>
          <p className="text-sm text-[#6b7280] mt-1">Gestiona la información de tus clientes</p>
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
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      {clients.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono, CIF o dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
            />
          </div>
        </div>
      )}

      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-12 text-center">
          <UserCheck className="w-16 h-16 text-[#d1d5db] mx-auto mb-4" />
          {searchQuery ? (
            <>
              <h3 className="text-lg font-medium text-[#111827] mb-2">No se encontraron resultados</h3>
              <p className="text-[#6b7280] mb-4">No hay clientes que coincidan con "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors"
              >
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-[#111827] mb-2">No hay clientes registrados</h3>
              <p className="text-[#6b7280] mb-4">Comienza agregando tu primer cliente</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar Cliente
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredClients.map((client) => {
            return (
              <div
                key={client.id}
                className="bg-white p-4 md:p-6 rounded-lg border border-[#e5e7eb] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[#111827] truncate">{client.name}</h3>
                    <p className="text-sm text-[#6b7280] mt-1">
                      Cliente
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-12 h-12 bg-[#d1fae5] rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-[#10b981]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-[#6b7280]">
                    <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="break-all">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  {client.cif && (
                    <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span>{client.cif}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-2 text-sm text-[#6b7280]">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{client.address}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-[#e5e7eb]">
                  <button
                    onClick={() => handleEdit(client)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[#10b981] bg-[#d1fae5] rounded-lg hover:bg-[#a7f3d0] transition-colors text-sm"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <ClientModal
          client={editingClient}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}

      {clientToDelete && (
        <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de eliminar el cliente?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Eliminará el cliente "{clientToDelete.name}" de tu lista.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setClientToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {isSettingsModalOpen && (
        <ClientSettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          onExport={handleExport}
          onImport={handleImport}
          onDownloadTemplate={handleDownloadTemplate}
        />
      )}
    </div>
  );
}