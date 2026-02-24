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

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
}

interface AddPurchaseProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: {
    productName: string;
    category: string;
    company: string;
    supplier: string;
    invoiceNumber: string;
    invoiceDate: string;
    quantity: number;
  }) => void;
  selectedYear?: string;
  suppliers?: Supplier[];
}

export function AddPurchaseProductModal({ isOpen, onClose, onAdd, selectedYear, suppliers = [] }: AddPurchaseProductModalProps) {
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    company: "RUGH",
    supplier: "",
    invoiceNumber: "",
    invoiceDate: selectedYear
      ? `${selectedYear}-01-01`
      : new Date().toISOString().split("T")[0],
    quantity: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState("");

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

    if (!formData.productName.trim()) {
      newErrors.productName = "La descripción es obligatoria";
    }
    if (!formData.category) {
      newErrors.category = "Selecciona una categoría";
    }
    if (!formData.company) {
      newErrors.company = "Selecciona una empresa";
    }
    if (!formData.supplier.trim()) {
      newErrors.supplier = "El proveedor es obligatorio";
    } else {
      // Verificar que el proveedor existe en la lista de proveedores registrados
      const supplierExists = suppliers.some(
        s => s.name.toLowerCase() === formData.supplier.trim().toLowerCase()
      );
      if (!supplierExists) {
        newErrors.supplier = "El proveedor debe estar registrado en el sistema";
      }
    }
    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = "El número de factura es obligatorio";
    }
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = "La fecha de factura es obligatoria";
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = "La cantidad debe ser mayor a 0";
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
      productName: formData.productName.trim(),
      category: formData.category,
      company: formData.company,
      supplier: formData.supplier.trim(),
      invoiceNumber: formData.invoiceNumber.trim(),
      invoiceDate: formData.invoiceDate,
      quantity: Number(formData.quantity),
    });

    // Reset form
    setFormData({
      productName: "",
      category: "",
      company: "RUGH",
      supplier: "",
      invoiceNumber: "",
      invoiceDate: selectedYear
        ? `${selectedYear}-01-01`
        : new Date().toISOString().split("T")[0],
      quantity: "",
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
      productName: "",
      category: "",
      company: "RUGH",
      supplier: "",
      invoiceNumber: "",
      invoiceDate: selectedYear
        ? `${selectedYear}-01-01`
        : new Date().toISOString().split("T")[0],
      quantity: "",
    });
    setErrors({});
    setShowPreview(false);
    setShowSupplierDropdown(false);
    setSupplierSearch("");
    onClose();
  };

  // Filtrar proveedores según la búsqueda
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const handleSupplierInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSupplierSearch(value);
    setFormData({ ...formData, supplier: value });
    setShowSupplierDropdown(true);
  };

  const handleSupplierSelect = (supplierName: string) => {
    setFormData({ ...formData, supplier: supplierName });
    setSupplierSearch(supplierName);
    setShowSupplierDropdown(false);
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
                    Añadir Producto de Compra
                  </h2>
                  {selectedYear && (
                    <span className="px-3 py-1 bg-[#3b82f6] text-white text-sm font-medium rounded-full">
                      Año {selectedYear}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6b7280] mt-1">
                  Completa los campos para registrar un nuevo producto de compra
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
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="Ej: Manual de Formación Básica"
                    className={errors.productName ? "border-red-500" : ""}
                  />
                  {errors.productName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.productName}
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

                {/* Proveedor */}
                <div className="md:col-span-2 relative">
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Proveedor *
                  </label>
                  <Input
                    type="text"
                    value={formData.supplier}
                    onChange={handleSupplierInputChange}
                    onFocus={() => setShowSupplierDropdown(true)}
                    onBlur={() => {
                      // Delay para permitir el clic en la opción
                      setTimeout(() => setShowSupplierDropdown(false), 200);
                    }}
                    placeholder="Escribe para buscar un proveedor..."
                    className={errors.supplier ? "border-red-500" : ""}
                  />
                  {showSupplierDropdown && filteredSuppliers.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-[#e5e7eb] rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredSuppliers.map(supplier => (
                        <div
                          key={supplier.id}
                          className="px-4 py-2 cursor-pointer hover:bg-[#f3f4f6] text-sm text-[#111827] transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSupplierSelect(supplier.name);
                          }}
                        >
                          <div className="font-medium">{supplier.name}</div>
                          {supplier.contact && (
                            <div className="text-xs text-[#6b7280] mt-1">{supplier.contact}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {showSupplierDropdown && filteredSuppliers.length === 0 && supplierSearch && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-[#e5e7eb] rounded-md shadow-lg p-3">
                      <p className="text-sm text-[#6b7280]">
                        No se encontraron proveedores con "{supplierSearch}"
                      </p>
                    </div>
                  )}
                  {errors.supplier && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.supplier}
                    </p>
                  )}
                </div>

                {/* Número de Factura */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Nº Factura *
                  </label>
                  <Input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="Ej: FAC-2025-001"
                    className={errors.invoiceNumber ? "border-red-500" : ""}
                  />
                  {errors.invoiceNumber && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.invoiceNumber}
                    </p>
                  )}
                </div>

                {/* Fecha de Factura */}
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Cantidad *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="Ej: 50"
                    className={errors.quantity ? "border-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" : "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.quantity}
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
                  className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb]"
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
            <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb] bg-gradient-to-r from-[#3b82f6] to-[#2563eb]">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Confirmar Producto de Compra
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
              <div className="bg-[#f9fafb] rounded-lg p-6 border-2 border-[#3b82f6]/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#6b7280] mb-1">Descripción</p>
                    <p className="text-sm font-semibold text-[#111827]">{formData.productName}</p>
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
                    <p className="text-xs font-medium text-[#6b7280] mb-1">Proveedor</p>
                    <p className="text-sm font-semibold text-[#111827]">{formData.supplier}</p>
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
                    <p className="text-sm font-semibold text-[#111827]">{formData.quantity} unidades</p>
                  </div>
                </div>
              </div>

              {/* Confirmation message */}
              <div className="mt-6 bg-[#fef3c7] border border-[#fbbf24] rounded-lg p-4">
                <p className="text-sm text-[#92400e] font-medium">
                  ⚠️ ¿Estás seguro de que deseas añadir este producto al inventario de compras?
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
                  className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb]"
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