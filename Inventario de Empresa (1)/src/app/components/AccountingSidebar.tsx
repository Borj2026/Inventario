import { LayoutDashboard, ShoppingCart, TrendingUp, Tags, Truck, Building2, X, LogOut, PanelLeftClose, HelpCircle, Package, UserCheck, ShieldCheck } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  preloadPermissions,
  hasModuleAccessSync,
  hasFeatureAccessSync,
  hasDataAccessSync,
} from "../utils/permissions";

interface MenuItem {
  id: string;
  icon: any;
  label: string;
  adminOnly?: boolean;
}

interface AccountingSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    name: string;
    email: string;
    company: string;
  } | null;
  onLogout?: () => void;
  onToggleCollapse?: () => void;
  isAdmin?: boolean;
  onSwitchToNormal?: () => void;
  sidebarPosition?: "left" | "right";
  onSidebarPositionChange?: (position: "left" | "right") => void;
  userRole?: "usuario" | "coordinador" | "administrador" | "contable";
}

export function AccountingSidebar({ activeView, onViewChange, isOpen, onClose, currentUser, onLogout, onToggleCollapse, isAdmin, onSwitchToNormal, sidebarPosition = "left", onSidebarPositionChange, userRole }: AccountingSidebarProps) {
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  const loadPermissions = useCallback(async () => {
    await preloadPermissions();
    setPermissionsLoaded(true);
  }, []);

  useEffect(() => {
    loadPermissions();

    const handlePermissionsUpdated = async () => {
      setPermissionsLoaded(false); // Forzar re-render reseteando el estado
      await loadPermissions();
    };
    window.addEventListener("permissions-updated", handlePermissionsUpdated);
    return () => {
      window.removeEventListener("permissions-updated", handlePermissionsUpdated);
    };
  }, [loadPermissions]);

  useEffect(() => {
    if (userRole) {
      loadPermissions();
    }
  }, [userRole, loadPermissions]);

  // Función para verificar si el usuario tiene acceso a un elemento del menú de contabilidad
  const hasMenuItemAccess = (itemId: string): boolean => {
    if (!userRole) return true;
    if (!permissionsLoaded) return false;

    const menuToDataMap: Record<string, string> = {
      "purchases-inventory": "Inventario de Compras",
      "sales-inventory": "Inventario de Ventas",
      "suppliers": "Información de Proveedores",
      "clients": "Información de Clientes",
      "departments": "Datos de Departamentos",
    };

    const menuToModuleMap: Record<string, string> = {
      "accounting-dashboard": "Sistema de Contabilidad",
      "categories": "Gestión de Categorías",
      "accounting-settings": "Configuración del Sistema",
      "role-management": "Gestión de Roles",
    };

    const menuToFeatureMap: Record<string, string> = {
      "accounting-help": "Ver Ayuda/Soporte",
    };

    if (menuToDataMap[itemId]) {
      return hasDataAccessSync(userRole, menuToDataMap[itemId]);
    }

    if (menuToModuleMap[itemId]) {
      return hasModuleAccessSync(userRole, menuToModuleMap[itemId]);
    }

    if (menuToFeatureMap[itemId]) {
      return hasFeatureAccessSync(userRole, menuToFeatureMap[itemId]);
    }

    return true;
  };

  const canAccessRoleManagement = permissionsLoaded
    ? hasModuleAccessSync(userRole || "usuario", "Gestión de Roles")
    : false;

  const baseMenuItems: MenuItem[] = [
    { id: "accounting-dashboard", icon: LayoutDashboard, label: "Panel de Control" },
    { id: "purchases-inventory", icon: ShoppingCart, label: "Inventario de Compras" },
    { id: "sales-inventory", icon: TrendingUp, label: "Inventario de Ventas" },
    { id: "categories", icon: Tags, label: "Categorías" },
    { id: "suppliers", icon: Truck, label: "Proveedores" },
    { id: "clients", icon: UserCheck, label: "Clientes" },
    { id: "departments", icon: Building2, label: "Departamentos", adminOnly: true },
    { id: "accounting-help", icon: HelpCircle, label: "Ayuda/Soporte" },
  ];

  // Filtrar elementos del menú basado en permisos
  const menuItems = baseMenuItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    return hasMenuItemAccess(item.id);
  });

  const handleViewChange = (view: string) => {
    onViewChange(view);
    onClose();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 ${sidebarPosition === "left" ? 'left-0' : 'right-0'} w-60 bg-[#f3f4f6] border-r border-[#e5e7eb] flex flex-col h-screen z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Close button for mobile */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#e5e7eb] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6b7280]" />
          </button>
        </div>
        
        {/* Collapse button for desktop */}
        {onToggleCollapse && (
          <div className="hidden lg:block absolute top-4 right-4">
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-[#e5e7eb] rounded-lg transition-colors"
              title="Ocultar menú"
            >
              <PanelLeftClose className="w-5 h-5 text-[#6b7280]" />
            </button>
          </div>
        )}
        
        <div className="p-6 border-b border-[#e5e7eb]">
          <h1 className="text-xl font-semibold text-[#111827]">Sistema de Inventario</h1>
          <p className="text-sm text-[#6b7280] mt-1">Contabilidad</p>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Skeleton de carga mientras se verifican permisos */}
          {!permissionsLoaded ? (
            <div className="space-y-1 px-1 pt-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg animate-shimmer"
                  style={{ width: `${90 - i * 6}%` }}
                />
              ))}
              <p className="text-xs text-[#9ca3af] text-center pt-2">Cargando permisos…</p>
            </div>
          ) : (
            <>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                      isActive
                        ? "bg-[#3b82f6] text-white"
                        : "text-[#374151] hover:bg-[#e5e7eb]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Gestión de Roles solo si tiene permiso */}
              {canAccessRoleManagement && (
                <button
                  onClick={() => handleViewChange("role-management")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activeView === "role-management"
                      ? "bg-[#3b82f6] text-white"
                      : "text-[#374151] hover:bg-[#e5e7eb]"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Gestión de Roles</span>
                </button>
              )}
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-[#e5e7eb]">
          {currentUser && (
            <div className="mb-4 pb-4 border-b border-[#e5e7eb]">
              <p className="text-xs font-medium text-[#111827] truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-[#6b7280] truncate mt-0.5">
                {currentUser.email}
              </p>
              {userRole && (
                <p className="text-xs text-[#3b82f6] font-medium mt-1">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </p>
              )}
              <p className="text-xs text-[#6b7280] mt-0.5">
                Empresa: {currentUser.company}
              </p>
            </div>
          )}
          <div className="text-xs text-[#6b7280]">
            <p>Versión 1.0.0</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm text-[#dc2626] hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          )}
          {isAdmin && onSwitchToNormal && (
            <button
              onClick={onSwitchToNormal}
              className="w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm text-[#3b82f6] hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Volver al Sistema Normal</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}