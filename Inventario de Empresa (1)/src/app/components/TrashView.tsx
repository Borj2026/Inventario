import { useState } from "react";
import { Trash2, RotateCcw, Trash, Search, Package, AlertCircle, Layers } from "lucide-react";

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
  deletedAt?: string; // Fecha de eliminación
}

interface ProductUnit {
  id: string;
  sku?: string;
  serialNumber: string;
  location: string;
  status: "available" | "in-use" | "maintenance" | "out-of-use";
  deletedAt?: string;
}

interface TrashViewProps {
  deletedProducts: Product[];
  productUnits: Record<string, ProductUnit[]>;
  products: Product[];
  onRestoreProduct: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
  onRestoreUnit: (productId: string, unitId: string) => void;
  onPermanentDeleteUnit: (productId: string, unitId: string) => void;
}

export function TrashView({ 
  deletedProducts, 
  productUnits,
  products,
  onRestoreProduct, 
  onPermanentDelete, 
  onEmptyTrash,
  onRestoreUnit,
  onPermanentDeleteUnit
}: TrashViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"products" | "units">("products");
  const [restoreConfirmUnit, setRestoreConfirmUnit] = useState<{ productId: string; unitId: string; serialNumber: string } | null>(null);

  // Obtener todas las unidades eliminadas
  const deletedUnits: Array<{ 
    productId: string; 
    productName: string; 
    unit: ProductUnit 
  }> = [];
  
  Object.entries(productUnits).forEach(([productId, units]) => {
    const product = products.find(p => p.id === productId) || deletedProducts.find(p => p.id === productId);
    units.forEach(unit => {
      if (unit.deletedAt) {
        deletedUnits.push({
          productId,
          productName: product?.name || "Producto Desconocido",
          unit
        });
      }
    });
  });

  // Filtrar productos eliminados
  const filteredProducts = deletedProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = !filterCompany || product.company === filterCompany;
    const matchesCategory = !filterCategory || product.category === filterCategory;

    return matchesSearch && matchesCompany && matchesCategory;
  });

  // Obtener empresas y categorías únicas
  const companies = [...new Set(deletedProducts.map((p) => p.company))];
  const categories = [...new Set(deletedProducts.map((p) => p.category))];

  const handlePermanentDelete = (id: string) => {
    onPermanentDelete(id);
    setConfirmDeleteId(null);
  };

  const handleEmptyTrash = () => {
    onEmptyTrash();
    setShowConfirmEmpty(false);
  };

  const handleRestoreUnit = (productId: string, unitId: string) => {
    onRestoreUnit(productId, unitId);
    setRestoreConfirmUnit(null);
  };

  const totalDeletedItems = deletedProducts.length + deletedUnits.length;

  if (totalDeletedItems === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Papelera</h2>
          <p className="text-sm text-[#6b7280] mt-1">Productos y unidades eliminados temporalmente</p>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-[#f3f4f6] rounded-full flex items-center justify-center">
            <Trash2 className="w-12 h-12 text-[#9ca3af]" />
          </div>
          <h3 className="text-lg font-medium text-[#111827] mb-2">La papelera está vacía</h3>
          <p className="text-sm text-[#6b7280]">
            Los productos y unidades eliminados aparecerán aquí y podrás restaurarlos si es necesario
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Papelera</h2>
            </div>
            <button
              onClick={() => setShowConfirmEmpty(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash className="w-4 h-4" />
              Vaciar Papelera
            </button>
          </div>
        </div>

        {/* Tabs para cambiar entre Productos y Unidades */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-[#e5e7eb]">
            <button
              onClick={() => setViewType("products")}
              className={`px-4 py-2 font-medium transition-colors ${
                viewType === "products"
                  ? "text-[#3b82f6] border-b-2 border-[#3b82f6]"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              Productos ({deletedProducts.length})
            </button>
            <button
              onClick={() => setViewType("units")}
              className={`px-4 py-2 font-medium transition-colors ${
                viewType === "units"
                  ? "text-[#3b82f6] border-b-2 border-[#3b82f6]"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              Unidades ({deletedUnits.length})
            </button>
          </div>
        </div>

        {/* Vista de Productos */}
        {viewType === "products" && (
          <>
            {/* Filtros */}
            <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
                  />
                </div>

                <select
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
                >
                  <option value="">Todas las compañías</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm || filterCompany || filterCategory) && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterCompany("");
                      setFilterCategory("");
                    }}
                    className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>

            {/* Tabla de productos */}
            <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Eliminado
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[#6b7280]">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="w-12 h-12 text-[#d1d5db]" />
                            <p>No se encontraron productos eliminados</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-[#f9fafb] transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-[#111827]">{product.name}</td>
                          <td className="px-6 py-4 text-sm text-[#374151]">{product.sku}</td>
                          <td className="px-6 py-4 text-sm text-[#374151]">{product.category}</td>
                          <td className="px-6 py-4 text-sm text-[#374151]">{product.company}</td>
                          <td className="px-6 py-4 text-sm text-[#6b7280]">
                            {product.deletedAt || "Hace poco"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => onRestoreProduct(product.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Restaurar producto"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar permanentemente"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Vista de Unidades */}
        {viewType === "units" && (
          <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      N° de Serie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      Localización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {deletedUnits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#6b7280]">
                        <div className="flex flex-col items-center gap-2">
                          <Layers className="w-12 h-12 text-[#d1d5db]" />
                          <p>No hay unidades eliminadas</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    deletedUnits.map(({ productId, productName, unit }) => (
                      <tr key={unit.id} className="hover:bg-[#f9fafb] transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-[#111827]">{productName}</td>
                        <td className="px-6 py-4 text-sm text-[#374151] font-mono">{unit.serialNumber || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-[#374151]">{unit.location}</td>
                        <td className="px-6 py-4 text-sm text-[#374151]">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                            {unit.status === "available" && "Disponible"}
                            {unit.status === "in-use" && "En Uso"}
                            {unit.status === "maintenance" && "Mantenimiento"}
                            {unit.status === "out-of-use" && "Fuera de Uso"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setRestoreConfirmUnit({ 
                                productId, 
                                unitId: unit.id, 
                                serialNumber: unit.serialNumber 
                              })}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Restaurar unidad"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onPermanentDeleteUnit(productId, unit.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar permanentemente"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para vaciar papelera */}
      {showConfirmEmpty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#111827] mb-2">
                  ¿Vaciar papelera?
                </h3>
                <p className="text-sm text-[#6b7280]">
                  Esta acción eliminará permanentemente todos los productos y unidades de la papelera. Esta operación no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmEmpty(false)}
                className="px-4 py-2 text-sm text-[#374151] bg-[#f3f4f6] rounded-lg hover:bg-[#e5e7eb] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEmptyTrash}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Vaciar Papelera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar producto permanentemente */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#111827] mb-2">
                  ¿Eliminar permanentemente?
                </h3>
                <p className="text-sm text-[#6b7280]">
                  Esta acción eliminará el producto de forma permanente. No podrás recuperarlo después.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm text-[#374151] bg-[#f3f4f6] rounded-lg hover:bg-[#e5e7eb] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handlePermanentDelete(confirmDeleteId)}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para restaurar unidad */}
      {restoreConfirmUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#111827] mb-2">
                  ¿Restaurar unidad?
                </h3>
                <p className="text-sm text-[#6b7280]">
                  ¿Deseas restaurar la unidad con N° de Serie <strong>{restoreConfirmUnit.serialNumber}</strong>?
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRestoreConfirmUnit(null)}
                className="px-4 py-2 text-sm text-[#374151] bg-[#f3f4f6] rounded-lg hover:bg-[#e5e7eb] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRestoreUnit(restoreConfirmUnit.productId, restoreConfirmUnit.unitId)}
                className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}