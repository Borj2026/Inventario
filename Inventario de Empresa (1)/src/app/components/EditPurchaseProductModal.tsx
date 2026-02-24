import { useState, useEffect } from "react";
import { X, AlertCircle, ChevronDown } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
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

interface EditPurchaseProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (productData: {
    id: string;
    productName: string;
    category: string;
    company: string;
    supplier: string;
    invoiceNumber: string;
    invoiceDate: string;
    quantity: number;
  }) => void;
  product: {
    id: string;
    productName: string;
    category: string;
    company: string;
    supplier: string;
    invoiceNumber: string;
    invoiceDate: string;
    quantity: number;
  } | null;
  suppliers?: Supplier[];
  selectedYear?: string;
}

export function EditPurchaseProductModal({ isOpen, onClose, onEdit, product, suppliers = [], selectedYear }: EditPurchaseProductModalProps) {
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    company: "",
    supplier: "",
    invoiceNumber: "",
    invoiceDate: "",
    quantity: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
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

  // Actualizar formData cuando cambie el producto
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        productName: product.productName,
        category: product.category,
        company: product.company,
        supplier: product.supplier,
        invoiceNumber: product.invoiceNumber,
        invoiceDate: product.invoiceDate,
        quantity: product.quantity.toString(),
      });
      setSupplierSearch(product.supplier);
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.productName.trim()) {
      newErrors.productName = "La descripción del producto es obligatoria";
    }
    if (!formData.category) {
      newErrors.category = "La categoría es obligatoria";
    }
    if (!formData.company) {
      newErrors.company = "La empresa es obligatoria";
    }
    if (!formData.supplier.trim()) {
      const supplierExists = suppliers.some(s => 
        s.name.toLowerCase() === formData.supplier.toLowerCase()
      );
      if (!supplierExists) {
        newErrors.supplier = "Selecciona un proveedor válido de la lista";
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

    onEdit({
      id: product?.id || "",
      productName: formData.productName.trim(),
      category: formData.category,
      company: formData.company,
      supplier: formData.supplier.trim(),
      invoiceNumber: formData.invoiceNumber.trim(),
      invoiceDate: formData.invoiceDate,
      quantity: Number(formData.quantity),
    });

    onClose();
  };

  const handleClose = () => {
    setErrors({});
    setShowSupplierDropdown(false);
    setSupplierSearch("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e7eb] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-[#111827]">Editar Producto</h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Descripción del Producto *
              </label>
              <Input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className={errors.productName ? "border-red-500" : ""}
                placeholder="Ej: Cuaderno espiral A4"
              />
              {errors.productName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.productName}
                </p>
              )}
            </div>

            {/* Categoría y Empresa */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Categoría *
                </label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountingCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Empresa *
                </label>
                <Select value={formData.company} onValueChange={(value) => setFormData({ ...formData, company: value })}>
                  <SelectTrigger className={errors.company ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((comp) => (
                      <SelectItem key={comp} value={comp}>{comp}</SelectItem>
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
            </div>

            {/* Proveedor */}
            <div className="relative">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Proveedor *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => {
                    setSupplierSearch(e.target.value);
                    setFormData({ ...formData, supplier: e.target.value });
                    setShowSupplierDropdown(true);
                  }}
                  onFocus={() => setShowSupplierDropdown(true)}
                  className={errors.supplier ? "border-red-500" : ""}
                  placeholder="Buscar o escribir proveedor"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
              </div>
              {errors.supplier && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.supplier}
                </p>
              )}
              
              {showSupplierDropdown && filteredSuppliers.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-[#e5e7eb] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredSuppliers.map((supplier) => (
                    <button
                      key={supplier.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, supplier: supplier.name });
                        setSupplierSearch(supplier.name);
                        setShowSupplierDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#f3f4f6] text-sm text-[#111827]"
                    >
                      <div className="font-medium">{supplier.name}</div>
                      {supplier.contact && (
                        <div className="text-xs text-[#6b7280]">{supplier.contact}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nº Factura y Fecha */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Nº Factura *
                </label>
                <Input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className={errors.invoiceNumber ? "border-red-500" : ""}
                  placeholder="Ej: F-2026-001"
                />
                {errors.invoiceNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.invoiceNumber}
                  </p>
                )}
              </div>

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
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Cantidad *
              </label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={errors.quantity ? "border-red-500" : ""}
                placeholder="Ej: 50"
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.quantity}
                </p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#e5e7eb]">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}