import { useState } from "react";
import { X, Plus, AlertCircle, Eye, ChevronLeft, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AddSalesProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: {
    name: string;
    category: string;
    company: string;
    client: string;
    invoiceNumber: string;
    invoiceDate: string;
    stock: number;
  }) => void;
  clients?: Array<{ id: string; name: string }>;
  selectedYear?: string;
}

export function AddSalesProductModal({ isOpen, onClose, onAdd, clients = [], selectedYear }: AddSalesProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    company: "",
    client: "",
    invoiceNumber: "",
    invoiceDate: selectedYear
      ? `${selectedYear}-01-01`
      : new Date().toISOString().split("T")[0],
    stock: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const accountingCategories = [
    "Manuales",
    "Material Didáctico",
    "Material Finca Agrícola",
    "Uniformes Personal",
    "Menaje",
    "Otro Material"
  ];

  const companies = ["AMS", "CEM", "RUGH", "SADAF"];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "La descripción es obligatoria";
    }
    if (!formData.category) {
      newErrors.category = "Selecciona una categoría";
    }
    if (!formData.company) {
      newErrors.company = "Selecciona una empresa";
    }
    if (!formData.client.trim()) {
      newErrors.client = "El cliente es obligatorio";
    } else {
      // Verificar que el cliente existe en la lista de clientes registrados
      const clientExists = clients.some(
        c => c.name.toLowerCase() === formData.client.trim().toLowerCase()
      );
      if (!clientExists) {
        newErrors.client = "El cliente debe estar registrado en el sistema";
      }
    }
    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = "El número de factura es obligatorio";
    }
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = "La fecha de factura es obligatoria";
    }
    if (!formData.stock || Number(formData.stock) <= 0) {
      newErrors.stock = "La cantidad debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Mostrar previsualización
    setShowPreview(true);
  };

  const handleConfirm = () => {
    onAdd({
      name: formData.name.trim(),
      category: formData.category,
      company: formData.company,
      client: formData.client,
      invoiceNumber: formData.invoiceNumber.trim(),
      invoiceDate: formData.invoiceDate,
      stock: Number(formData.stock),
    });

    // Reset form
    setFormData({
      name: "",
      category: "",
      company: "",
      client: "",
      invoiceNumber: "",
      invoiceDate: selectedYear
        ? `${selectedYear}-01-01`
        : new Date().toISOString().split("T")[0],
      stock: "",
    });
    setErrors({});
    setShowPreview(false);
    onClose();
  };

  const handleBackToForm = () => {
    setShowPreview(false);
  };

  const handleCloseModal = () => {
    setFormData({
      name: "",
      category: "",
      company: "",
      client: "",
      invoiceNumber: "",
      invoiceDate: selectedYear
        ? `${selectedYear}-01-01`
        : new Date().toISOString().split("T")[0],
      stock: "",
    });
    setErrors({});
    setShowPreview(false);
    setShowClientDropdown(false);
    setClientSearch("");
    onClose();
  };

  // Filtrar clientes según la búsqueda
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClientSearch(value);
    setFormData({ ...formData, client: value });
    setShowClientDropdown(true);
  };

  const handleClientSelect = (clientName: string) => {
    setFormData({ ...formData, client: clientName });
    setClientSearch(clientName);
    setShowClientDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {!showPreview ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-[#111827]">
                    Añadir Producto de Venta
                  </h2>
                  {selectedYear && (
                    <span className="px-3 py-1 bg-[#10b981] text-white text-sm font-medium rounded-full">
                      Año {selectedYear}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6b7280] mt-1">
                  Completa los campos para registrar un nuevo producto de venta
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-[#6b7280] hover:text-[#111827] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Descripción del Producto *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Manual de Conducción Profesional"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Categoría *
                  </label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountingCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Empresa */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Empresa *
                  </label>
                  <Select value={formData.company} onValueChange={(value) => setFormData({ ...formData, company: value })}>
                    <SelectTrigger className={errors.company ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona una empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company} value={company}>{company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.company && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.company}
                    </p>
                  )}
                </div>

                {/* Cliente */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Cliente *
                  </label>
                  <Input
                    type="text"
                    value={formData.client}
                    onChange={handleClientInputChange}
                    onFocus={() => setShowClientDropdown(true)}
                    onBlur={() => {
                      // Delay para permitir el clic en la opción
                      setTimeout(() => setShowClientDropdown(false), 200);
                    }}
                    placeholder="Escribe para buscar un cliente..."
                    className={errors.client ? "border-red-500" : ""}
                  />
                  {showClientDropdown && filteredClients.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-[#e5e7eb] rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredClients.map(client => (
                        <div
                          key={client.id}
                          className="px-4 py-2 cursor-pointer hover:bg-[#f3f4f6] text-sm text-[#111827] transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleClientSelect(client.name);
                          }}
                        >
                          <div className="font-medium">{client.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {showClientDropdown && filteredClients.length === 0 && clientSearch && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-[#e5e7eb] rounded-md shadow-lg p-3">
                      <p className="text-sm text-[#6b7280]">
                        No se encontraron clientes con "{clientSearch}"
                      </p>
                    </div>
                  )}
                  {errors.client && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.client}
                    </p>
                  )}
                </div>

                {/* Número de Factura - OBLIGATORIO */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Nº Factura *
                  </label>
                  <Input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="Ej: VEN-2025-001"
                    className={errors.invoiceNumber ? "border-red-500" : ""}
                  />
                  {errors.invoiceNumber && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.invoiceNumber}
                    </p>
                  )}
                </div>

                {/* Fecha de Factura - OBLIGATORIO */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Fecha Factura *
                  </label>
                  <Input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    className={errors.invoiceDate ? "border-red-500" : ""}
                  />
                  {errors.invoiceDate && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.invoiceDate}
                    </p>
                  )}
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Cantidad *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="Ej: 25"
                    className={errors.stock ? "border-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" : "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"}
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.stock}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-[#e5e7eb]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#10b981] hover:bg-[#059669]"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Previsualizar
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Preview Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb] bg-gradient-to-r from-[#10b981] to-[#059669]">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Confirmar Producto de Venta
                </h2>
                <p className="text-sm text-white/90 mt-1">
                  Revisa los datos antes de confirmar
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-6">
              <div className="bg-[#f9fafb] rounded-lg p-6 border-2 border-[#10b981]/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#6b7280] mb-1">Descripción</p>
                    <p className="text-sm font-semibold text-[#111827]">{formData.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-[#6b7280] mb-1">Categoría</p>
                    <p className="text-sm font-semibold text-[#111827]">{formData.category}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-[#6b7280] mb-1">Empresa</p>
                    <p className="text-sm font-semibold text-[#111827]">{formData.company}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-[#6b7280] mb-1">Cliente</p>
                    <p className="text-sm font-semibold text-[#111827]">{formData.client}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-[#6b7280] mb-1">Nº Factura</p>
                    <p className="text-sm font-semibold text-[#111827]">{formData.invoiceNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-[#6b7280] mb-1">Fecha Factura</p>
                    <p className="text-sm font-semibold text-[#111827]">
                      {new Date(formData.invoiceDate).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-[#6b7280] mb-1">Cantidad</p>
                    <p className="text-sm font-semibold text-[#111827]">{formData.stock} unidades</p>
                  </div>
                </div>
              </div>

              {/* Confirmation message */}
              <div className="mt-6 bg-[#fef3c7] border border-[#fbbf24] rounded-lg p-4">
                <p className="text-sm text-[#92400e] font-medium">
                  ⚠️ ¿Estás seguro de que deseas añadir este producto al inventario de ventas?
                </p>
                <p className="text-xs text-[#92400e] mt-1">
                  Esta acción agregará el producto con todos los datos mostrados.
                </p>
              </div>

              {/* Preview Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToForm}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Volver a Editar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 bg-[#10b981] hover:bg-[#059669]"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar y Añadir
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}