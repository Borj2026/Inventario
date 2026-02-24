import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  cif: string;
  email: string;
  phone: string;
  address: string;
}

interface SupplierModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (supplier: Omit<Supplier, "id">) => void;
  suppliers?: Supplier[]; // Para validar CIF único
}

export function SupplierModal({ supplier, onClose, onSave, suppliers = [] }: SupplierModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    cif: "",
    email: "",
    phone: "",
    address: "",
  });
  const [cifError, setCifError] = useState("");

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        cif: supplier.cif || "",
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
      });
    }
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que el CIF sea único (excepto si estamos editando el mismo proveedor)
    const cifExists = suppliers.some(
      s => s.cif && formData.cif && s.cif.toUpperCase() === formData.cif.toUpperCase() && s.id !== supplier?.id
    );
    
    if (cifExists) {
      setCifError("Este CIF ya está registrado para otro proveedor");
      return;
    }
    
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Si es el campo CIF, limpiar el error
    if (name === "cif") {
      setCifError("");
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#e5e7eb]">
          <h3 className="text-lg md:text-xl font-semibold text-[#111827]">
            {supplier ? "Editar Proveedor" : "Nuevo Proveedor"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6b7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Nombre del Proveedor *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              CIF *
            </label>
            <input
              type="text"
              name="cif"
              value={formData.cif}
              onChange={handleChange}
              required
              placeholder="Ej: B12345678"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm md:text-base ${
                cifError 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-[#d1d5db] focus:ring-[#3b82f6]"
              }`}
            />
            {cifError && (
              <p className="mt-1 text-sm text-red-600">{cifError}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Correo Electrónico *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Dirección
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] resize-none text-sm md:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors text-sm md:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors text-sm md:text-base"
            >
              {supplier ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}