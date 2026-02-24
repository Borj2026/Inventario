import { useState, useEffect } from "react";
import { X, Link } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku?: string; // SKU ahora es opcional
  category: string;
  company: string;
  department?: string; // Departamento responsable
  supplierId: string;
  warehouse: string;
  price?: number;
  stock: number;
  minStock?: number;
  description: string;
  image?: string;
  manual?: string;
  serialNumber?: string;
  hasSerialNumber?: boolean; // Indica si requiere número de serie
  orderNumber?: string; // Número de pedido asociado
}

interface Supplier {
  id: string;
  name: string;
}

interface Category {
  name: string;
  notificationEmail?: string;
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (product: Omit<Product, "id">) => void;
  categories: Category[];
  suppliers: Supplier[];
}

export function ProductModal({ product, onClose, onSave, categories, suppliers }: ProductModalProps) {
  const companies = ["AMS", "CEM", "RUGH", "SADAF"];
  const departments = ["Informática", "Contabilidad", "Calidad", "Marketing", "Mantenimiento", "Secretaría"];
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    company: "",
    department: "",
    supplierId: "",
    description: "",
    image: "",
    manual: "",
    hasSerialNumber: "no",
    stock: "",
    minStock: "",
    orderNumber: "", // Nuevo campo
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        company: product.company,
        department: product.department || "",
        supplierId: product.supplierId,
        description: product.description,
        image: product.image || "",
        manual: product.manual || "",
        hasSerialNumber: product.hasSerialNumber ? "yes" : "no",
        stock: product.stock.toString(),
        minStock: product.minStock !== undefined ? product.minStock.toString() : "",
        orderNumber: product.orderNumber || "", // Nuevo campo
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      sku: product ? product.sku : "", // Se mantiene el SKU existente o vacío para nuevos
      category: formData.category,
      company: formData.company,
      department: formData.department,
      supplierId: formData.supplierId,
      warehouse: product ? product.warehouse : "", // Se mantiene el warehouse existente o vacío
      stock: product ? parseInt(formData.stock) : 0, // Solo en edición, nuevo siempre 0
      minStock: product && formData.minStock ? parseInt(formData.minStock) : undefined,
      description: formData.description,
      image: formData.image,
      manual: formData.manual,
      serialNumber: product ? product.serialNumber : undefined,
      hasSerialNumber: formData.hasSerialNumber === "yes",
      orderNumber: formData.orderNumber || undefined, // Nuevo campo
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#e5e7eb]">
          <h3 className="text-lg md:text-xl font-semibold text-[#111827]">
            {product ? "Editar Producto" : "Nuevo Producto"}
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
              Nombre del Producto *
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
              Categoría *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="">Seleccionar categoría</option>
              {categories && categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Empresa *
            </label>
            <select
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="">Seleccionar empresa</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Departamento *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="">Seleccionar departamento</option>
              {departments.map(department => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Proveedor *
            </label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="">Seleccionar proveedor</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] resize-none text-sm md:text-base"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                URL Imagen
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full pl-10 pr-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
                />
              </div>
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Vista previa" 
                    className="w-20 h-20 object-cover rounded border border-[#d1d5db]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12">Error</text></svg>';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                URL Manual
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                <input
                  type="url"
                  name="manual"
                  value={formData.manual}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/manual.pdf"
                  className="w-full pl-10 pr-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
                />
              </div>
              {formData.manual && (
                <p className="mt-2 text-sm text-[#10b981] flex items-center gap-1">
                  <Link className="w-4 h-4" />
                  URL del manual configurada
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              ¿Añadir número de serie? *
            </label>
            <select
              name="hasSerialNumber"
              value={formData.hasSerialNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="no">No</option>
              <option value="yes">Sí</option>
            </select>
          </div>

          {/* Solo mostrar Stock Mínimo en modo edición */}
          {product && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Stock Mínimo
              </label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock === 0 ? '' : formData.minStock}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                  setFormData({ ...formData, minStock: isNaN(value) ? 0 : Math.max(0, value) });
                }}
                onWheel={(e) => e.currentTarget.blur()}
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
                placeholder=""
              />
            </div>
          )}

          {product && product.orderNumber && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Número de Pedido
              </label>
              <input
                type="text"
                name="orderNumber"
                value={formData.orderNumber}
                readOnly
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg bg-[#f9fafb] text-[#6b7280] cursor-not-allowed text-sm md:text-base"
                placeholder="Sin número de pedido"
              />
            </div>
          )}

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
              {product ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}