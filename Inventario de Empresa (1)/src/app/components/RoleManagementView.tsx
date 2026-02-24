import { Shield, User, Users, UserCheck, AlertTriangle, AlertCircle, Plus, X, Edit2, Save, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import * as api from "../utils/api";
import { invalidatePermissionsCache } from "../utils/permissions";

interface PermissionItem {
  [key: string]: string | boolean;
  admin: boolean;
  accounting: boolean;
  coordinator: boolean;
  user: boolean;
}

interface ModulePermission extends PermissionItem {
  module: string;
}

interface CrudPermission extends PermissionItem {
  operation: string;
}

interface FeaturePermission extends PermissionItem {
  feature: string;
}

interface DataPermission extends PermissionItem {
  data: string;
}

interface CustomRole {
  id: string;
  name: string;
  icon?: any;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface RoleManagementViewProps {
  onLogout?: () => void;
}

export function RoleManagementView({ onLogout }: RoleManagementViewProps) {
  // Definición de roles predefinidos
  const defaultRoles = [
    {
      id: "admin",
      name: "Administrador",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      id: "accounting",
      name: "Contable",
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: "coordinator",
      name: "Coordinador",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      id: "user",
      name: "Usuario",
      icon: User,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
  ];

  // Estado para roles personalizados
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [deletingRole, setDeletingRole] = useState<CustomRole | null>(null);
  const [editedRoleName, setEditedRoleName] = useState("");

  // Datos iniciales
  const initialModuleAccess: ModulePermission[] = [
    { module: "Dashboard", admin: true, accounting: true, coordinator: true, user: true },
    { module: "Gestión de Inventario", admin: true, accounting: false, coordinator: true, user: false },
    { module: "Sistema de Contabilidad", admin: true, accounting: true, coordinator: false, user: false },
    { module: "Gestión de Productos", admin: true, accounting: false, coordinator: true, user: false },
    { module: "Gestión de Categorías", admin: true, accounting: true, coordinator: false, user: false },
    { module: "Gestión de Proveedores", admin: true, accounting: true, coordinator: false, user: false },
    { module: "Gestión de Clientes", admin: true, accounting: true, coordinator: false, user: false },
    { module: "Gestión de Departamentos", admin: true, accounting: true, coordinator: false, user: false },
    { module: "Reportes y Estadísticas", admin: true, accounting: true, coordinator: true, user: true },
    { module: "Gestión de Roles", admin: true, accounting: false, coordinator: false, user: false },
  ];

  const initialCrudPermissions: CrudPermission[] = [
    { operation: "Crear Productos", admin: true, accounting: false, coordinator: true, user: false },
    { operation: "Editar Productos", admin: true, accounting: false, coordinator: true, user: false },
    { operation: "Eliminar Productos", admin: true, accounting: false, coordinator: false, user: false },
    { operation: "Ver Productos", admin: true, accounting: true, coordinator: true, user: true },
    { operation: "Crear Pedidos", admin: true, accounting: true, coordinator: true, user: false },
    { operation: "Modificar Pedidos", admin: true, accounting: true, coordinator: false, user: false },
    { operation: "Cancelar Pedidos", admin: true, accounting: true, coordinator: false, user: false },
    { operation: "Ver Historial Completo", admin: true, accounting: true, coordinator: true, user: false },
    { operation: "Gestionar Stock", admin: true, accounting: false, coordinator: true, user: false },
    { operation: "Mover Unidades", admin: true, accounting: false, coordinator: true, user: false },
    { operation: "Eliminar Unidades", admin: true, accounting: false, coordinator: false, user: false },
    { operation: "Ver Papelera", admin: true, accounting: false, coordinator: true, user: false },
    { operation: "Restaurar desde Papelera", admin: true, accounting: false, coordinator: false, user: false },
    { operation: "Eliminar Permanentemente de Papelera", admin: true, accounting: false, coordinator: false, user: false },
  ];

  const initialSpecialFeatures: FeaturePermission[] = [
    { feature: "Acceso a Contabilidad", admin: true, accounting: true, coordinator: false, user: false },
    { feature: "Cambiar entre Sistemas", admin: true, accounting: false, coordinator: false, user: false },
    { feature: "Generar PDFs de Pedidos", admin: true, accounting: true, coordinator: true, user: false },
    { feature: "Exportar a Excel", admin: true, accounting: true, coordinator: true, user: false },
    { feature: "Importar Datos Masivos", admin: true, accounting: false, coordinator: false, user: false },
    { feature: "Escanear Códigos QR", admin: true, accounting: false, coordinator: true, user: true },
    { feature: "Ver Precios de Compra", admin: true, accounting: true, coordinator: false, user: false },
    { feature: "Ver Precios de Venta", admin: true, accounting: true, coordinator: true, user: true },
    { feature: "Modificar Configuración", admin: true, accounting: false, coordinator: false, user: false },
    { feature: "Gestionar Usuarios", admin: true, accounting: false, coordinator: false, user: false },
    { feature: "Cambiar Posición Sidebar", admin: true, accounting: true, coordinator: true, user: true },
    { feature: "Ver Ayuda/Soporte", admin: true, accounting: true, coordinator: true, user: true },
    { feature: "Editar Inventario Compras", admin: true, accounting: true, coordinator: true, user: false },
    { feature: "Eliminar Inventario Compras", admin: true, accounting: true, coordinator: false, user: false },
    { feature: "Editar Inventario Ventas", admin: true, accounting: true, coordinator: true, user: false },
    { feature: "Eliminar Inventario Ventas", admin: true, accounting: true, coordinator: false, user: false },
    { feature: "Editar Proveedores", admin: true, accounting: true, coordinator: true, user: false },
    { feature: "Eliminar Proveedores", admin: true, accounting: true, coordinator: false, user: false },
  ];

  const initialFinancialAccess: DataPermission[] = [
    { data: "Inventario de Compras", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Inventario de Ventas", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Datos de Facturación", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Descuentos Aplicados", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Márgenes de Beneficio", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Información de Proveedores", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Información de Clientes", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Salarios de Empleados", admin: true, accounting: false, coordinator: false, user: false },
    { data: "Datos de Departamentos", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Histórico Financiero", admin: true, accounting: true, coordinator: false, user: false },
    { data: "Ubicaciones y Almacenes", admin: true, accounting: true, coordinator: true, user: false },
    { data: "Números de Serie/SKU", admin: true, accounting: false, coordinator: true, user: false },
  ];

  // Estados para los permisos editables (trabajo actual)
  const [moduleAccess, setModuleAccess] = useState<ModulePermission[]>([]);
  const [crudPermissions, setCrudPermissions] = useState<CrudPermission[]>([]);
  const [specialFeatures, setSpecialFeatures] = useState<FeaturePermission[]>([]);
  const [financialAccess, setFinancialAccess] = useState<DataPermission[]>([]);

  // Estados para los permisos guardados (copia de seguridad)
  const [savedModuleAccess, setSavedModuleAccess] = useState<ModulePermission[]>([]);
  const [savedCrudPermissions, setSavedCrudPermissions] = useState<CrudPermission[]>([]);
  const [savedSpecialFeatures, setSavedSpecialFeatures] = useState<FeaturePermission[]>([]);
  const [savedFinancialAccess, setSavedFinancialAccess] = useState<DataPermission[]>([]);
  const [savedCustomRoles, setSavedCustomRoles] = useState<CustomRole[]>([]);

  // Estado para rastrear cambios pendientes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Cargar permisos y roles personalizados desde Supabase (solo al inicio)
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const data = await api.getRolePermissions();
        
        // Filtrar módulos no deseados y combinar con nuevos
        let loadedModuleAccess = data.moduleAccess || initialModuleAccess;
        // Eliminar "Gestión de Empleados" y "Configuración del Sistema"
        loadedModuleAccess = loadedModuleAccess.filter(
          m => m.module !== "Gestión de Empleados" && m.module !== "Configuración del Sistema"
        );
        // Asegurar que todos los módulos del initial estén presentes
        initialModuleAccess.forEach(initModule => {
          if (!loadedModuleAccess.find(m => m.module === initModule.module)) {
            loadedModuleAccess.push(initModule);
          }
        });
        
        // Combinar permisos CRUD antiguos con nuevos
        let loadedCrudPermissions = data.crudPermissions || initialCrudPermissions;
        // Eliminar los 4 permisos de inventario de CRUD si existen
        loadedCrudPermissions = loadedCrudPermissions.filter(
          c => c.operation !== "Editar Inventario Compras" && 
               c.operation !== "Eliminar Inventario Compras" &&
               c.operation !== "Editar Inventario Ventas" &&
               c.operation !== "Eliminar Inventario Ventas"
        );
        // Asegurar que todos los permisos CRUD del initial estén presentes
        initialCrudPermissions.forEach(initCrud => {
          if (!loadedCrudPermissions.find(c => c.operation === initCrud.operation)) {
            loadedCrudPermissions.push(initCrud);
          }
        });
        
        // Combinar características especiales antiguas con nuevas
        let loadedSpecialFeatures = data.specialFeatures || initialSpecialFeatures;
        // Asegurar que todas las características del initial estén presentes
        initialSpecialFeatures.forEach(initFeature => {
          if (!loadedSpecialFeatures.find(f => f.feature === initFeature.feature)) {
            loadedSpecialFeatures.push(initFeature);
          }
        });
        
        const loadedFinancialAccess = data.financialAccess || initialFinancialAccess;
        
        // Establecer estados de trabajo
        setModuleAccess(loadedModuleAccess);
        setCrudPermissions(loadedCrudPermissions);
        setSpecialFeatures(loadedSpecialFeatures);
        setFinancialAccess(loadedFinancialAccess);

        // Establecer copias guardadas
        setSavedModuleAccess(JSON.parse(JSON.stringify(loadedModuleAccess)));
        setSavedCrudPermissions(JSON.parse(JSON.stringify(loadedCrudPermissions)));
        setSavedSpecialFeatures(JSON.parse(JSON.stringify(loadedSpecialFeatures)));
        setSavedFinancialAccess(JSON.parse(JSON.stringify(loadedFinancialAccess)));
        
        // Cargar roles personalizados
        if (data.customRoles) {
          const rolesWithIcons = data.customRoles.map((role: CustomRole) => ({
            ...role,
            icon: UserCheck,
          }));
          setCustomRoles(rolesWithIcons);
          setSavedCustomRoles(JSON.parse(JSON.stringify(rolesWithIcons)));
        } else {
          setCustomRoles([]);
          setSavedCustomRoles([]);
        }
      } catch (error) {
        console.error("Error al cargar permisos:", error);
        toast.error("Error al cargar los permisos desde la nube");
        // Cargar valores iniciales si falla
        setModuleAccess(initialModuleAccess);
        setCrudPermissions(initialCrudPermissions);
        setSpecialFeatures(initialSpecialFeatures);
        setFinancialAccess(initialFinancialAccess);
        setCustomRoles([]);
        
        setSavedModuleAccess(JSON.parse(JSON.stringify(initialModuleAccess)));
        setSavedCrudPermissions(JSON.parse(JSON.stringify(initialCrudPermissions)));
        setSavedSpecialFeatures(JSON.parse(JSON.stringify(initialSpecialFeatures)));
        setSavedFinancialAccess(JSON.parse(JSON.stringify(initialFinancialAccess)));
        setSavedCustomRoles([]);
      }
    };
    
    loadPermissions();
  }, []);

  // Detectar cambios pendientes
  useEffect(() => {
    const hasChanges = 
      JSON.stringify(moduleAccess) !== JSON.stringify(savedModuleAccess) ||
      JSON.stringify(crudPermissions) !== JSON.stringify(savedCrudPermissions) ||
      JSON.stringify(specialFeatures) !== JSON.stringify(savedSpecialFeatures) ||
      JSON.stringify(financialAccess) !== JSON.stringify(savedFinancialAccess) ||
      JSON.stringify(customRoles) !== JSON.stringify(savedCustomRoles);
    
    setHasUnsavedChanges(hasChanges);
  }, [moduleAccess, crudPermissions, specialFeatures, financialAccess, customRoles, savedModuleAccess, savedCrudPermissions, savedSpecialFeatures, savedFinancialAccess, savedCustomRoles]);

  // Función para guardar cambios en la nube
  const handleSaveChanges = async () => {
    try {
      await Promise.all([
        api.saveModuleAccess(moduleAccess),
        api.saveCrudPermissions(crudPermissions),
        api.saveSpecialFeatures(specialFeatures),
        api.saveFinancialAccess(financialAccess),
        api.saveCustomRoles(customRoles),
      ]);

      // Actualizar copias guardadas
      setSavedModuleAccess(JSON.parse(JSON.stringify(moduleAccess)));
      setSavedCrudPermissions(JSON.parse(JSON.stringify(crudPermissions)));
      setSavedSpecialFeatures(JSON.parse(JSON.stringify(specialFeatures)));
      setSavedFinancialAccess(JSON.parse(JSON.stringify(financialAccess)));
      setSavedCustomRoles(JSON.parse(JSON.stringify(customRoles)));

      // Invalidar el cache de permisos para que los sidebars recarguen
      invalidatePermissionsCache();

      toast.success("Cambios guardados correctamente", {
        description: "Todos los permisos y roles han sido sincronizados en la nube",
      });
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      toast.error("Error al guardar los cambios", {
        description: "No se pudieron guardar los permisos en la nube",
      });
    }
  };

  // Función para deshacer cambios
  const handleUndoChanges = () => {
    setModuleAccess(JSON.parse(JSON.stringify(savedModuleAccess)));
    setCrudPermissions(JSON.parse(JSON.stringify(savedCrudPermissions)));
    setSpecialFeatures(JSON.parse(JSON.stringify(savedSpecialFeatures)));
    setFinancialAccess(JSON.parse(JSON.stringify(savedFinancialAccess)));
    setCustomRoles(JSON.parse(JSON.stringify(savedCustomRoles)));

    toast.info("Cambios deshechados", {
      description: "Se han restaurado los permisos guardados anteriormente",
    });
  };

  // Función para añadir rol personalizado
  const addCustomRole = async () => {
    if (!newRoleName.trim()) {
      toast.error("El nombre del rol no puede estar vacío");
      return;
    }

    const roleId = `custom_${Date.now()}`;
    const newRole: CustomRole = {
      id: roleId,
      name: newRoleName.trim(),
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    };

    // Añadir el nuevo rol a todos los permisos con valor false
    const updatedModuleAccess = moduleAccess.map((item) => ({ ...item, [roleId]: false }));
    const updatedCrudPermissions = crudPermissions.map((item) => ({ ...item, [roleId]: false }));
    const updatedSpecialFeatures = specialFeatures.map((item) => ({ ...item, [roleId]: false }));
    const updatedFinancialAccess = financialAccess.map((item) => ({ ...item, [roleId]: false }));
    const updatedCustomRoles = [...customRoles, newRole];

    // Actualizar estados
    setModuleAccess(updatedModuleAccess);
    setCrudPermissions(updatedCrudPermissions);
    setSpecialFeatures(updatedSpecialFeatures);
    setFinancialAccess(updatedFinancialAccess);
    setCustomRoles(updatedCustomRoles);

    setNewRoleName("");
    setShowAddRoleModal(false);

    toast.success(`Rol personalizado "${newRole.name}" creado`, {
      description: "Recuerda hacer clic en 'Guardar Cambios' para sincronizar en la nube",
    });
  };

  // Función para abrir modal de edición
  const openEditModal = (role: CustomRole) => {
    setEditingRole(role);
    setEditedRoleName(role.name);
    setShowEditRoleModal(true);
  };

  // Función para editar rol personalizado
  const editCustomRole = () => {
    if (!editedRoleName.trim()) {
      toast.error("El nombre del rol no puede estar vacío");
      return;
    }

    if (!editingRole) return;

    const updatedRoles = customRoles.map((role) =>
      role.id === editingRole.id ? { ...role, name: editedRoleName.trim() } : role
    );

    setCustomRoles(updatedRoles);
    
    setShowEditRoleModal(false);
    setEditingRole(null);
    setEditedRoleName("");

    toast.success(`Rol renombrado a "${editedRoleName.trim()}"`, {
      description: "Recuerda hacer clic en 'Guardar Cambios' para sincronizar en la nube",
    });
  };

  // Función para abrir modal de confirmación de eliminación
  const openDeleteModal = (role: CustomRole) => {
    setDeletingRole(role);
    setShowDeleteRoleModal(true);
  };

  // Función para eliminar rol personalizado (con confirmación)
  const confirmDeleteCustomRole = () => {
    if (!deletingRole) return;

    const roleId = deletingRole.id;

    // Eliminar el rol de todos los permisos
    const updatedModuleAccess = moduleAccess.map((item) => {
      const { [roleId]: _, ...rest } = item;
      return rest as ModulePermission;
    });
    const updatedCrudPermissions = crudPermissions.map((item) => {
      const { [roleId]: _, ...rest } = item;
      return rest as CrudPermission;
    });
    const updatedSpecialFeatures = specialFeatures.map((item) => {
      const { [roleId]: _, ...rest } = item;
      return rest as FeaturePermission;
    });
    const updatedFinancialAccess = financialAccess.map((item) => {
      const { [roleId]: _, ...rest } = item;
      return rest as DataPermission;
    });
    const updatedCustomRoles = customRoles.filter((r) => r.id !== roleId);

    // Actualizar estados
    setModuleAccess(updatedModuleAccess);
    setCrudPermissions(updatedCrudPermissions);
    setSpecialFeatures(updatedSpecialFeatures);
    setFinancialAccess(updatedFinancialAccess);
    setCustomRoles(updatedCustomRoles);

    setShowDeleteRoleModal(false);
    setDeletingRole(null);

    toast.info(`Rol "${deletingRole.name}" eliminado`, {
      description: "Recuerda hacer clic en 'Guardar Cambios' para sincronizar en la nube",
    });
  };

  // Función para manejar cambios en checkboxes
  const handleCheckboxChange = (
    table: "module" | "crud" | "feature" | "data",
    index: number,
    role: string
  ) => {
    let permissionName = "";
    let currentValue = false;
    let tableName = "";

    switch (table) {
      case "module":
        permissionName = moduleAccess[index].module;
        currentValue = moduleAccess[index][role] as boolean;
        tableName = "módulo";
        setModuleAccess((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], [role]: !updated[index][role] };
          return updated;
        });
        break;
      case "crud":
        permissionName = crudPermissions[index].operation;
        currentValue = crudPermissions[index][role] as boolean;
        tableName = "operación";
        setCrudPermissions((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], [role]: !updated[index][role] };
          return updated;
        });
        break;
      case "feature":
        permissionName = specialFeatures[index].feature;
        currentValue = specialFeatures[index][role] as boolean;
        tableName = "funcionalidad";
        setSpecialFeatures((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], [role]: !updated[index][role] };
          return updated;
        });
        break;
      case "data":
        permissionName = financialAccess[index].data;
        currentValue = financialAccess[index][role] as boolean;
        tableName = "tipo de dato";
        setFinancialAccess((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], [role]: !updated[index][role] };
          return updated;
        });
        break;
    }

    // Mapear el rol al nombre en español
    const roleNames: Record<string, string> = {
      admin: "Administrador",
      accounting: "Contable",
      coordinator: "Coordinador",
      user: "Usuario",
    };

    const customRole = customRoles.find((r) => r.id === role);
    const roleName = customRole ? customRole.name : roleNames[role] || role;

    // Mostrar notificación según si se está activando o desactivando
    if (currentValue) {
      toast.warning(`Permiso marcado para eliminar`, {
        description: `El rol "${roleName}" perderá acceso a ${tableName}: "${permissionName}". Haz clic en Guardar para aplicar.`,
        icon: <AlertTriangle className="w-5 h-5" />,
      });
    } else {
      toast.success(`Permiso marcado para agregar`, {
        description: `El rol "${roleName}" tendrá acceso a ${tableName}: "${permissionName}". Haz clic en Guardar para aplicar.`,
      });
    }
  };

  // Función para renderizar checkbox interactivo
  const renderCheckbox = (
    hasPermission: boolean,
    table: "module" | "crud" | "feature" | "data",
    index: number,
    role: string
  ) => {
    return (
      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={hasPermission}
          onChange={() => handleCheckboxChange(table, index, role)}
          className="w-5 h-5 cursor-pointer accent-green-600 hover:scale-110 transition-transform"
        />
      </div>
    );
  };

  // Combinar roles predefinidos y personalizados
  const allRoles = [...defaultRoles, ...customRoles];

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold text-[#111827] mb-2">Gestión de Roles</h1>
              <p className="text-[#6b7280]">
                Visualiza y modifica los permisos y accesos de cada rol en el sistema.
              </p>
            </div>
            
            {/* Botones de Guardar y Deshacer */}
            {hasUnsavedChanges && (
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <button
                  onClick={handleUndoChanges}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <RotateCcw className="w-5 h-5" />
                  Deshacer Cambios
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </button>
              </div>
            )}
          </div>

          {hasUnsavedChanges && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Tienes cambios sin guardar</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Los cambios realizados no se han guardado en la nube. Haz clic en "Guardar Cambios" para aplicarlos o en "Deshacer Cambios" para revertirlos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Roles Overview Cards con botón para añadir rol */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {allRoles.map((role) => {
            const Icon = role.icon || UserCheck;
            const isCustom = !defaultRoles.find((r) => r.id === role.id);
            return (
              <div
                key={role.id}
                className={`p-6 rounded-lg border-2 ${role.borderColor} ${role.bgColor} relative`}
              >
                {isCustom && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => openEditModal(role)}
                      className="p-1 rounded-full bg-white hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
                      title="Editar rol personalizado"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(role)}
                      className="p-1 rounded-full bg-white hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                      title="Eliminar rol personalizado"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-6 h-6 ${role.color}`} />
                  <h3 className={`font-semibold ${role.color}`}>{role.name}</h3>
                </div>
                <p className="text-sm text-[#6b7280]">
                  {role.id === "admin" && "Acceso completo al sistema"}
                  {role.id === "accounting" && "Acceso a datos financieros"}
                  {role.id === "coordinator" && "Gestión de inventario"}
                  {role.id === "user" && "Solo visualización"}
                  {isCustom && "Rol personalizado"}
                </p>
              </div>
            );
          })}
          
          {/* Botón para añadir rol personalizado */}
          <button
            onClick={() => setShowAddRoleModal(true)}
            className="p-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <Plus className="w-8 h-8" />
            <span className="font-semibold">Añadir Rol Personalizado</span>
          </button>
        </div>

        {/* Modal para añadir rol personalizado */}
        {showAddRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-[#111827] mb-4">Crear Rol Personalizado</h2>
              <p className="text-[#6b7280] mb-4">
                Introduce el nombre del nuevo rol. Los permisos se asignarán desmarcados por defecto y podrás configurarlos después.
              </p>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Nombre del rol (ej: Supervisor, Gerente, etc.)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                onKeyPress={(e) => {
                  if (e.key === "Enter") addCustomRole();
                }}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowAddRoleModal(false);
                    setNewRoleName("");
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addCustomRole}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear Rol
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar rol personalizado */}
        {showEditRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-[#111827] mb-4">Editar Rol Personalizado</h2>
              <p className="text-[#6b7280] mb-4">
                Introduce el nuevo nombre para el rol. Los permisos no se verán afectados.
              </p>
              <input
                type="text"
                value={editedRoleName}
                onChange={(e) => setEditedRoleName(e.target.value)}
                placeholder="Nombre del rol (ej: Supervisor, Gerente, etc.)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                onKeyPress={(e) => {
                  if (e.key === "Enter") editCustomRole();
                }}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowEditRoleModal(false);
                    setEditedRoleName("");
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={editCustomRole}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para confirmar eliminación de rol personalizado */}
        {showDeleteRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-[#111827] mb-4">Confirmar Eliminación</h2>
              <p className="text-[#6b7280] mb-4">
                ¿Estás seguro de que deseas eliminar a <strong>"{deletingRole?.name}"</strong>?
              </p>
              <p className="text-sm text-red-600 mb-6">
                Esta acción no se puede deshacer una vez que guardes los cambios.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteRoleModal(false);
                    setDeletingRole(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteCustomRole}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Eliminar Rol
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Información sobre el sistema de permisos */}
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-red-700">
                Asegúrate de guardar para conservar los cambios
              </p>
            </div>
          </div>
        </div>

        {/* Tabla 1: Acceso a Módulos */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
            <h2 className="text-xl font-semibold text-white">Tabla 1: Acceso a Módulos del Sistema</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f3f4f6]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#111827]">Módulo</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-red-600">Administrador</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-blue-600">Contable</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-green-600">Coordinador</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Usuario</th>
                  {customRoles.map((role) => (
                    <th key={role.id} className={`px-6 py-3 text-center text-sm font-semibold ${role.color}`}>
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {moduleAccess.map((item, index) => (
                  <tr key={index} className="hover:bg-[#f9fafb]">
                    <td className="px-6 py-4 text-sm text-[#374151]">{item.module}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.admin, "module", index, "admin")}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.accounting, "module", index, "accounting")}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.coordinator, "module", index, "coordinator")}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.user, "module", index, "user")}</td>
                    {customRoles.map((role) => (
                      <td key={role.id} className="px-6 py-4">
                        {renderCheckbox(item[role.id] as boolean || false, "module", index, role.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla 2: Permisos CRUD */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
            <h2 className="text-xl font-semibold text-white">Tabla 2: Permisos de Operaciones CRUD</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f3f4f6]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#111827]">Operación</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-red-600">Administrador</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-blue-600">Contable</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-green-600">Coordinador</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Usuario</th>
                  {customRoles.map((role) => (
                    <th key={role.id} className={`px-6 py-3 text-center text-sm font-semibold ${role.color}`}>
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {crudPermissions.map((item, index) => (
                  <tr key={index} className="hover:bg-[#f9fafb]">
                    <td className="px-6 py-4 text-sm text-[#374151]">{item.operation}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.admin, "crud", index, "admin")}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.accounting, "crud", index, "accounting")}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.coordinator, "crud", index, "coordinator")}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.user, "crud", index, "user")}</td>
                    {customRoles.map((role) => (
                      <td key={role.id} className="px-6 py-4">
                        {renderCheckbox(item[role.id] as boolean || false, "crud", index, role.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla 3: Funcionalidades Especiales */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
            <h2 className="text-xl font-semibold text-white">Tabla 3: Acceso a Funcionalidades Especiales</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f3f4f6]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#111827]">Funcionalidad</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-red-600">Administrador</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-blue-600">Contable</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-green-600">Coordinador</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Usuario</th>
                  {customRoles.map((role) => (
                    <th key={role.id} className={`px-6 py-3 text-center text-sm font-semibold ${role.color}`}>
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {specialFeatures.map((item, index) => (
                  <tr key={index} className="hover:bg-[#f9fafb]">
                    <td className="px-6 py-4 text-sm text-[#374151]">{item.feature}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.admin, "feature", index, "admin")}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.accounting, "feature", index, "accounting")}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.coordinator, "feature", index, "coordinator")}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.user, "feature", index, "user")}</td>
                    {customRoles.map((role) => (
                      <td key={role.id} className="px-6 py-4">
                        {renderCheckbox(item[role.id] as boolean || false, "feature", index, role.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla 4: Datos Financieros */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4">
            <h2 className="text-xl font-semibold text-white">Tabla 4: Acceso a Datos Financieros y Sensibles</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f3f4f6]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#111827]">Tipo de Dato</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-red-600">Administrador</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-blue-600">Contable</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-green-600">Coordinador</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Usuario</th>
                  {customRoles.map((role) => (
                    <th key={role.id} className={`px-6 py-3 text-center text-sm font-semibold ${role.color}`}>
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {financialAccess.map((item, index) => (
                  <tr key={index} className="hover:bg-[#f9fafb]">
                    <td className="px-6 py-4 text-sm text-[#374151]">{item.data}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.admin, "data", index, "admin")}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.accounting, "data", index, "accounting")}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.coordinator, "data", index, "coordinator")}</td>
                    <td className="px-6 py-4">{renderCheckbox(item.user, "data", index, "user")}</td>
                    {customRoles.map((role) => (
                      <td key={role.id} className="px-6 py-4">
                        {renderCheckbox(item[role.id] as boolean || false, "data", index, role.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note - ELIMINADO */}
      </div>
    </div>
  );
}