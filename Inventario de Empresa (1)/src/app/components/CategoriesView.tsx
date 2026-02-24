import { Package, Edit2 } from "lucide-react";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { CategoryModal } from "./CategoryModal";
import { DeleteCategoryModal } from "./DeleteCategoryModal";
import { SystemCategoryAlert } from "./SystemCategoryAlert";

interface Category {
  name: string;
  notificationEmail?: string;
}

interface CategoriesViewProps {
  products: any[];
  categories: Category[];
  onAddCategory: (categoryData: { name: string; notificationEmail?: string }) => void;
  onUpdateCategory: (oldName: string, categoryData: { name: string; notificationEmail?: string }) => void;
  onDeleteCategory: (name: string) => void;
  isAccountingUser?: boolean;
}

export function CategoriesView({ products, categories, onAddCategory, onUpdateCategory, onDeleteCategory, isAccountingUser }: CategoriesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryName, setDeleteCategoryName] = useState<string | null>(null);
  const [showSystemAlert, setShowSystemAlert] = useState<"eliminar" | "editar" | null>(null);
  
  // Categorías de contabilidad
  const accountingCategories = [
    "Manuales",
    "Material Didáctico",
    "Material Finca Agrícola",
    "Uniformes Personal",
    "Menaje",
    "Otro Material"
  ];
  
  // Filtrar categorías si es usuario de contabilidad
  const filteredCategories = isAccountingUser 
    ? categories.filter(cat => accountingCategories.includes(cat.name))
    : categories;
  
  const categoryStats = products.reduce((acc, product) => {
    // Si es usuario de contabilidad, solo incluir productos de categorías contables
    if (isAccountingUser && !accountingCategories.includes(product.category)) {
      return acc;
    }
    
    if (!acc[product.category]) {
      acc[product.category] = {
        count: 0,
        totalStock: 0,
      };
    }
    acc[product.category].count++;
    acc[product.category].totalStock += product.stock;
    return acc;
  }, {} as Record<string, { count: number; totalStock: number }>);
  
  const categoriesWithStats = Object.entries(categoryStats).sort((a, b) => b[1].count - a[1].count);
  
  // Categorías sin productos (filtradas si es usuario de contabilidad)
  const emptyCategories = filteredCategories.filter(cat => !categoryStats[cat.name]);

  const handleDeleteCategory = (categoryName: string) => {
    // Prevenir eliminar la categoría "Sin Categoría"
    if (categoryName === "Sin Categoría") {
      setShowSystemAlert("eliminar");
      return;
    }
    
    // Mostrar el modal de confirmación
    setDeleteCategoryName(categoryName);
  };
  
  const confirmDeleteCategory = () => {
    if (deleteCategoryName) {
      onDeleteCategory(deleteCategoryName);
      setDeleteCategoryName(null);
    }
  };
  
  const handleEditCategory = (categoryName: string) => {
    // Prevenir editar la categoría "Sin Categoría"
    if (categoryName === "Sin Categoría") {
      setShowSystemAlert("editar");
      return;
    }
    
    const category = categories.find(c => c.name === categoryName);
    if (category) {
      setEditingCategory(category);
      setIsModalOpen(true);
    }
  };
  
  const handleSaveCategory = (categoryData: { name: string; notificationEmail?: string }) => {
    if (editingCategory) {
      onUpdateCategory(editingCategory.name, categoryData);
    } else {
      onAddCategory(categoryData);
    }
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Categorías de Productos</h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {categoriesWithStats.map(([categoryName, stats]) => {
          const category = categories.find(c => c.name === categoryName);
          return (
            <div key={categoryName} className="bg-white rounded-lg border border-[#e5e7eb] p-4 md:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 md:gap-4 flex-1">
                  <div className="p-2 md:p-3 bg-[#3b82f6] bg-opacity-10 rounded-lg">
                    <Package className="w-5 h-5 md:w-6 md:h-6 text-[#3b82f6]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-[#111827]">{categoryName}</h3>
                    {category?.notificationEmail && (
                      <p className="text-xs text-[#6b7280] truncate mt-1" title={category.notificationEmail}>
                        📧 {category.notificationEmail}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditCategory(categoryName)}
                    className="p-2 text-[#3b82f6] hover:bg-[#3b82f6] hover:bg-opacity-10 rounded-lg transition-colors"
                    title="Editar categoría"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(categoryName)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar categora"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#6b7280]">Productos</span>
                  <span className="font-medium text-[#111827]">{stats.count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#6b7280]">Stock Total</span>
                  <span className="font-medium text-[#111827]">{stats.totalStock} unidades</span>
                </div>
              </div>
            </div>
          );
        })}
        
        {emptyCategories.map((category) => (
          <div key={category.name} className="bg-white rounded-lg border border-[#e5e7eb] border-dashed p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 md:gap-4 flex-1">
                <div className="p-2 md:p-3 bg-[#d1d5db] bg-opacity-30 rounded-lg">
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-[#6b7280]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold text-[#6b7280]">{category.name}</h3>
                  {category.notificationEmail && (
                    <p className="text-xs text-[#9ca3af] truncate mt-1" title={category.notificationEmail}>
                      📧 {category.notificationEmail}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditCategory(category.name)}
                  className="p-2 text-[#6b7280] hover:bg-[#f3f4f6] rounded-lg transition-colors"
                  title="Editar categoría"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar categoría"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-center py-4">
              <p className="text-sm text-[#6b7280]">Sin productos asignados</p>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#6b7280]">
            <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-[#d1d5db]" />
            <p>No hay categorías disponibles</p>
            <p className="text-sm mt-2">Crea tu primera categoría para comenzar</p>
          </div>
        )}
      </div>
      
      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
        />
      )}
      
      {deleteCategoryName && (() => {
        const productCount = products.filter(p => p.category === deleteCategoryName).length;
        return (
          <DeleteCategoryModal
            categoryName={deleteCategoryName}
            productCount={productCount}
            onConfirm={confirmDeleteCategory}
            onCancel={() => setDeleteCategoryName(null)}
          />
        );
      })()}
      
      {showSystemAlert && (
        <SystemCategoryAlert
          action={showSystemAlert}
          onClose={() => setShowSystemAlert(null)}
        />
      )}
    </div>
  );
}