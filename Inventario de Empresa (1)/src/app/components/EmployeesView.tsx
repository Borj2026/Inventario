import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, AlertCircle, X, User } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  role: string; // Cambiado de tipo específico a string genérico para soportar roles personalizados
}

interface EmployeesViewProps {
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, "id">) => void;
  onUpdateEmployee: (id: string, employee: Omit<Employee, "id">) => void;
  onDeleteEmployee: (id: string) => void;
}

export function EmployeesView({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}: EmployeesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmEmployee, setDeleteConfirmEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    email: "",
    role: "usuario",
  });
  
  // Estado para roles dinámicos
  const [availableRoles, setAvailableRoles] = useState<Array<{ id: string; name: string }>>([]);

  const departments = ["Secretaría", "Informática", "Marketing", "Calidad", "Mantenimiento", "Contabilidad"];
  
  // Cargar roles desde localStorage (roles predefinidos + personalizados)
  useEffect(() => {
    const defaultRoles = [
      { id: "administrador", name: "Administrador" },
      { id: "contable", name: "Contabilidad" },
      { id: "coordinador", name: "Coordinador" },
      { id: "usuario", name: "Usuario" },
    ];

    // Cargar roles personalizados desde localStorage
    const savedCustomRoles = localStorage.getItem("rolePermissions_customRoles");
    let customRoles: Array<{ id: string; name: string }> = [];
    
    if (savedCustomRoles) {
      try {
        const parsed = JSON.parse(savedCustomRoles);
        customRoles = parsed.map((role: any) => ({
          id: role.id,
          name: role.name,
        }));
      } catch (error) {
        console.error("Error al cargar roles personalizados:", error);
      }
    }

    // Combinar roles predefinidos con personalizados
    setAvailableRoles([...defaultRoles, ...customRoles]);
  }, []);

  // Función para obtener el nombre del rol desde su ID
  const getRoleName = (roleId: string): string => {
    const role = availableRoles.find((r) => r.id === roleId);
    return role ? role.name : roleId;
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        department: employee.department,
        email: employee.email,
        role: employee.role,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: "",
        department: "",
        email: "",
        role: "usuario",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({
      name: "",
      department: "",
      email: "",
      role: "usuario",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      onUpdateEmployee(editingEmployee.id, formData);
    } else {
      onAddEmployee(formData);
    }
    handleCloseModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Gestión de Empleados</h2>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (window.confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los empleados de la base de datos. ¿Estás seguro?')) {
                // Limpiar completamente los empleados
                const { saveEmployees } = await import('../utils/api');
                await saveEmployees([]);
                window.location.reload();
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Limpiar Todo</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Empleado</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#e5e7eb] mb-4 md:mb-6">
        <div className="p-3 md:p-4 border-b border-[#e5e7eb]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Buscar por nombre o departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            />
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {filteredEmployees.length === 0 ? (
            <div className="px-4 py-12 text-center text-[#6b7280]">
              <AlertCircle className="w-12 h-12 text-[#d1d5db] mx-auto mb-2" />
              <p>No se encontraron empleados</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e7eb]">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#eff6ff] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#3b82f6]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#111827]">{employee.name}</h3>
                        <p className="text-sm text-[#6b7280]">{employee.department}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-[#6b7280]">Departamento</p>
                      <p className="font-medium text-[#111827]">{employee.department}</p>
                    </div>
                    <div>
                      <p className="text-[#6b7280]">Rol</p>
                      <p className="font-medium text-[#111827] capitalize">{getRoleName(employee.role)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[#6b7280]">Email</p>
                      <p className="font-medium text-[#111827] truncate">{employee.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(employee)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[#3b82f6] bg-[#eff6ff] rounded-lg transition-colors text-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteConfirmEmployee(employee)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Empleado
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Departamento
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Rol
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Email
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#e5e7eb]">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#6b7280]">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-12 h-12 text-[#d1d5db]" />
                      <p>No se encontraron empleados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#eff6ff] rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-[#3b82f6]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#111827]">{employee.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#374151]">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-[#eff6ff] text-[#3b82f6]">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#374151]">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-700 capitalize">
                        {getRoleName(employee.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#374151]">{employee.email}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(employee)}
                          className="p-2 text-[#3b82f6] hover:bg-[#eff6ff] rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmEmployee(employee)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#e5e7eb]">
              <h3 className="text-lg md:text-xl font-semibold text-[#111827]">
                {editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#6b7280]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Nombre Completo *
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
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
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Email *
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
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Rol *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
                >
                  <option value="">Seleccionar rol</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors text-sm md:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors text-sm md:text-base"
                >
                  {editingEmployee ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmEmployee && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteConfirmEmployee(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Eliminar Empleado</h3>
                    <p className="text-red-100 text-sm mt-0.5">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteConfirmEmployee(null)}
                  className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#eff6ff] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-[#3b82f6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-[#111827] mb-1">{deleteConfirmEmployee.name}</h4>
                    <p className="text-sm text-[#6b7280]">{deleteConfirmEmployee.department}</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">
                      ¿Estás seguro de eliminar este empleado?
                    </p>
                    <p className="text-xs text-amber-700">
                      Esta acción eliminará permanentemente al empleado del sistema.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmEmployee(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onDeleteEmployee(deleteConfirmEmployee.id);
                    setDeleteConfirmEmployee(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-[1.02]"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}