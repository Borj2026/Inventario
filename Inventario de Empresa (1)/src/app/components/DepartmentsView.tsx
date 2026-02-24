import { Building2, Users, Mail, Plus, Settings, X, UserPlus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  role: string;
}

interface Department {
  name: string;
  description: string;
}

interface DepartmentsViewProps {
  employees: Employee[];
  departments: Department[];
  onAddDepartment: (department: { name: string; description: string }) => void;
  onAddEmployee: (employee: Omit<Employee, "id">) => void;
  onUpdateEmployee: (id: string, employee: Omit<Employee, "id">) => void;
  onDeleteEmployee: (id: string) => void;
}

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-800"
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      badge: "bg-green-100 text-green-800"
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      badge: "bg-orange-100 text-orange-800"
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      badge: "bg-purple-100 text-purple-800"
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      text: "text-indigo-700",
      badge: "bg-indigo-100 text-indigo-800"
    },
    pink: {
      bg: "bg-pink-50",
      border: "border-pink-200",
      text: "text-pink-700",
      badge: "bg-pink-100 text-pink-800"
    }
  };
  return colors[color] || colors.blue;
};

export function DepartmentsView({ employees, departments, onAddDepartment, onAddEmployee, onUpdateEmployee, onDeleteEmployee }: DepartmentsViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentDescription, setNewDepartmentDescription] = useState("");
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeeFormData, setEmployeeFormData] = useState({
    name: "",
    department: "",
    email: "",
    role: "usuario",
  });

  // Estado para roles dinámicos
  const [availableRoles, setAvailableRoles] = useState<Array<{ id: string; name: string }>>([]);

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

  // Agrupar empleados por departamento
  const employeesByDepartment = employees.reduce((acc, employee) => {
    if (!acc[employee.department]) {
      acc[employee.department] = [];
    }
    acc[employee.department].push(employee);
    return acc;
  }, {} as Record<string, Employee[]>);

  const handleAddDepartment = () => {
    if (!newDepartmentName.trim() || !newDepartmentDescription.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    onAddDepartment({
      name: newDepartmentName.trim(),
      description: newDepartmentDescription.trim(),
    });

    setNewDepartmentName("");
    setNewDepartmentDescription("");
    setIsAddModalOpen(false);
  };

  const handleAddEmployee = () => {
    if (!employeeFormData.name.trim() || !employeeFormData.department || !employeeFormData.email.trim()) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    onAddEmployee(employeeFormData);

    setEmployeeFormData({
      name: "",
      department: "",
      email: "",
      role: "usuario",
    });
    setIsAddEmployeeModalOpen(false);
  };

  const handleUpdateEmployee = () => {
    if (!selectedEmployeeId || !employeeFormData.name.trim() || !employeeFormData.department || !employeeFormData.email.trim()) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    onUpdateEmployee(selectedEmployeeId, employeeFormData);

    setSelectedEmployeeId("");
    setEmployeeFormData({
      name: "",
      department: "",
      email: "",
      role: "usuario",
    });
    setIsEditEmployeeModalOpen(false);
  };

  const handleDeleteEmployee = () => {
    if (!selectedEmployeeId) {
      alert("Por favor selecciona un empleado para eliminar");
      return;
    }

    onDeleteEmployee(selectedEmployeeId);

    setSelectedEmployeeId("");
    setEmployeeFormData({
      name: "",
      department: "",
      email: "",
      role: "usuario",
    });
    setIsDeleteConfirmModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#3b82f6]" />
            <h1 className="text-2xl md:text-3xl font-semibold text-[#111827]">
              Departamentos
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Añadir Departamento</span>
              <span className="sm:hidden">Departamento</span>
            </button>
            <button
              onClick={() => setIsAddEmployeeModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <UserPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Añadir Empleado</span>
              <span className="sm:hidden">Empleado</span>
            </button>
            <button
              onClick={() => setIsEditEmployeeModalOpen(true)}
              className="flex items-center justify-center p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
              title="Configurar Empleado"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-[#6b7280]">
          Organización departamental y recursos humanos de la empresa
        </p>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Departamentos</p>
              <p className="text-3xl font-bold">{departments.length}</p>
            </div>
            <Building2 className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Total Empleados</p>
              <p className="text-3xl font-bold">{employees.length}</p>
            </div>
            <Users className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Departamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departments.map((dept) => {
          const deptEmployees = employeesByDepartment[dept.name] || [];
          const colors = getColorClasses(getColorForDepartment(dept.name));
          const icon = getIconForDepartment(dept.name);

          return (
            <div
              key={dept.name}
              className={`bg-white rounded-lg border-2 ${colors.border} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
            >
              {/* Header del departamento */}
              <div className={`${colors.bg} px-6 py-4 border-b-2 ${colors.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{icon}</div>
                    <div>
                      <h3 className={`text-lg font-semibold ${colors.text}`}>
                        {dept.name}
                      </h3>
                      <div className={`flex items-center gap-2 mt-1 text-sm ${colors.text}`}>
                        <Users className="w-4 h-4" />
                        <span className="font-medium">
                          {deptEmployees.length} empleado{deptEmployees.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
                    {deptEmployees.length}
                  </span>
                </div>
              </div>

              {/* Descripción del departamento */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {dept.description}
                </p>
              </div>

              {/* Lista de empleados */}
              <div className="px-6 py-4">
                {deptEmployees.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay empleados asignados a este departamento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deptEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Rol: {getRoleName(employee.role)}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedEmployeeId(employee.id);
                              setEmployeeFormData({
                                name: employee.name,
                                department: employee.department,
                                email: employee.email,
                                role: employee.role,
                              });
                              setIsDeleteConfirmModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Eliminar Empleado"
                          >
                            <Trash2 className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{employee.email}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para añadir departamento */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Añadir Nuevo Departamento
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Departamento
                </label>
                <input
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ej. Recursos Humanos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newDepartmentDescription}
                  onChange={(e) => setNewDepartmentDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe las funciones y responsabilidades del departamento..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewDepartmentName("");
                  setNewDepartmentDescription("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddDepartment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para añadir empleado */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Añadir Nuevo Empleado
              </h3>
              <button
                onClick={() => {
                  setIsAddEmployeeModalOpen(false);
                  setEmployeeFormData({
                    name: "",
                    department: "",
                    email: "",
                    role: "usuario",
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={employeeFormData.name}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento *
                </label>
                <select
                  value={employeeFormData.department}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar departamento</option>
                  {departments.map((dept) => (
                    <option key={dept.name} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={employeeFormData.email}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="juan.perez@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={employeeFormData.role}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar rol</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsAddEmployeeModalOpen(false);
                  setEmployeeFormData({
                    name: "",
                    department: "",
                    email: "",
                    role: "usuario",
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddEmployee}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar empleado */}
      {isEditEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Configurar Empleado
              </h3>
              <button
                onClick={() => {
                  setIsEditEmployeeModalOpen(false);
                  setSelectedEmployeeId("");
                  setEmployeeFormData({
                    name: "",
                    department: "",
                    email: "",
                    role: "usuario",
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Empleado *
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    const employeeId = e.target.value;
                    setSelectedEmployeeId(employeeId);
                    
                    if (employeeId) {
                      const employee = employees.find(emp => emp.id === employeeId);
                      if (employee) {
                        setEmployeeFormData({
                          name: employee.name,
                          department: employee.department,
                          email: employee.email,
                          role: employee.role,
                        });
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Seleccionar empleado...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEmployeeId && (
                <>
                  <div className="border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={employeeFormData.name}
                        onChange={(e) => setEmployeeFormData({ ...employeeFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento *
                    </label>
                    <select
                      value={employeeFormData.department}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">Seleccionar departamento</option>
                      {departments.map((dept) => (
                        <option key={dept.name} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={employeeFormData.email}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol *
                    </label>
                    <select
                      value={employeeFormData.role}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">Seleccionar rol</option>
                      {availableRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditEmployeeModalOpen(false);
                  setSelectedEmployeeId("");
                  setEmployeeFormData({
                    name: "",
                    department: "",
                    email: "",
                    role: "usuario",
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateEmployee}
                disabled={!selectedEmployeeId}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para confirmar eliminación de empleado */}
      {isDeleteConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Confirmar Eliminación
              </h3>
              <button
                onClick={() => {
                  setIsDeleteConfirmModalOpen(false);
                  setSelectedEmployeeId("");
                  setEmployeeFormData({
                    name: "",
                    department: "",
                    email: "",
                    role: "usuario",
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                ¿Estás seguro de que deseas eliminar a <strong>{employeeFormData.name}</strong> del departamento <strong>{employeeFormData.department}</strong>?
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsDeleteConfirmModalOpen(false);
                  setSelectedEmployeeId("");
                  setEmployeeFormData({
                    name: "",
                    department: "",
                    email: "",
                    role: "usuario",
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Función para obtener el color según el nombre del departamento
function getColorForDepartment(deptName: string): string {
  const colorMap: Record<string, string> = {
    "Secretaría": "blue",
    "Contabilidad": "green",
    "Mantenimiento": "orange",
    "Calidad": "purple",
    "Informática": "indigo",
    "Marketing": "pink",
  };
  return colorMap[deptName] || "blue";
}

// Función para obtener el icono según el nombre del departamento
function getIconForDepartment(deptName: string): string {
  const iconMap: Record<string, string> = {
    "Secretaría": "📋",
    "Contabilidad": "💰",
    "Mantenimiento": "🔧",
    "Calidad": "✓",
    "Informática": "💻",
    "Marketing": "📢",
  };
  return iconMap[deptName] || "📁";
}