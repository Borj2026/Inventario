import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";

interface Category {
  name: string;
  notificationEmail?: string;
}

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: (categoryData: { name: string; notificationEmail?: string }) => void;
}

export function CategoryModal({ category, onClose, onSave }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    notificationEmail: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        notificationEmail: category.notificationEmail || "",
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave({
        name: formData.name.trim(),
        notificationEmail: formData.notificationEmail.trim() || undefined,
      });
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#e5e7eb]">
          <h3 className="text-lg md:text-xl font-semibold text-[#111827]">
            {category ? "Editar Categoría" : "Nueva Categoría"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6b7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ej: Electrónica, Muebles, Oficina..."
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Email de Notificación
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
              <input
                type="email"
                name="notificationEmail"
                value={formData.notificationEmail}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full pl-10 pr-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
              />
            </div>
            <p className="mt-2 text-sm text-[#6b7280] italic">
              Se notificará a esta dirección de correo si algún producto de esta categoría llega a stock bajo.
            </p>
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
              {category ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
