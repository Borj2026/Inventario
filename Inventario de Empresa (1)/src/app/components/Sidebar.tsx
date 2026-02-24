import { LayoutDashboard, Package, Tags, BarChart3, X, Truck, HelpCircle, LogOut, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft, QrCode, Trash2, History, ArrowRightLeft, Users, Building2, FileText, Calculator, ShieldCheck } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  preloadPermissions,
  hasModuleAccessSync,
  hasFeatureAccessSync,
} from "../utils/permissions";

interface MenuItem {
  id: string;
  icon: any;
  label: string;
  hasSubmenu?: boolean;
  mobileOnly?: boolean;
  adminOnly?: boolean;
}

interface SidebarProps {
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
  onSwitchToAccounting?: () => void;
  sidebarPosition?: "left" | "right";
  onSidebarPositionChange?: (position: "left" | "right") => void;
  userRole?: "usuario" | "coordinador" | "administrador" | "contable";
}

export function Sidebar({ activeView, onViewChange, isOpen, onClose, currentUser, onLogout, onToggleCollapse, isAdmin, onSwitchToAccounting, sidebarPosition = "left", onSidebarPositionChange, userRole }: SidebarProps) {
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Cargar permisos de forma asíncrona y actualizar el cache síncrono
  const loadPermissions = useCallback(async () => {
    await preloadPermissions();
    setPermissionsLoaded(true);
  }, []);

  useEffect(() => {
    loadPermissions();

    // Escuchar evento de actualización de permisos
    const handlePermissionsUpdated = async () => {
      setPermissionsLoaded(false); // Forzar re-render reseteando el estado
      await loadPermissions();
    };
    window.addEventListener("permissions-updated", handlePermissionsUpdated);
    return () => {
      window.removeEventListener("permissions-updated", handlePermissionsUpdated);
    };
  }, [loadPermissions]);

  // Recargar permisos cuando cambia el rol del usuario
  useEffect(() => {
    if (userRole) {
      loadPermissions();
    }
  }, [userRole, loadPermissions]);

  // Función para verificar si el usuario tiene acceso a un elemento del menú
  const hasMenuItemAccess = (itemId: string): boolean => {
    if (!userRole) return true;
    if (!permissionsLoaded) return false; // Esperar a que carguen los permisos

    const menuToModuleMap: Record<string, string> = {
      "dashboard": "Dashboard",
      "reports": "Reportes y Estadísticas",
      "inventory": "Gestión de Inventario",
      "suppliers": "Gestión de Proveedores",
      "categories": "Gestión de Categorías",
      "departments": "Gestión de Departamentos",
      "role-management": "Gestión de Roles",
      "orders": "Gestión de Productos",
    };

    const menuToFeatureMap: Record<string, string> = {
      "qr-scanner": "Escanear Códigos QR",
      "help": "Ver Ayuda/Soporte",
    };

    if (menuToModuleMap[itemId]) {
      return hasModuleAccessSync(userRole, menuToModuleMap[itemId]);
    }

    if (menuToFeatureMap[itemId]) {
      return hasFeatureAccessSync(userRole, menuToFeatureMap[itemId]);
    }

    return true;
  };

  // Verificar acceso a Contabilidad de forma síncrona
  const canAccessAccounting = permissionsLoaded
    ? hasFeatureAccessSync(userRole || "usuario", "Acceso a Contabilidad")
    : false;

  // Verificar acceso a Gestión de Roles de forma síncrona
  const canAccessRoleManagement = permissionsLoaded
    ? hasModuleAccessSync(userRole || "usuario", "Gestión de Roles")
    : false;

  // Menú para coordinadores y usuarios
  const coordinatorUserMenuItems: MenuItem[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Panel" },
    { id: "reports", icon: BarChart3, label: "Reportes" },
    { id: "inventory", icon: Package, label: "Inventario", hasSubmenu: true },
    { id: "qr-scanner", icon: QrCode, label: "Lector QR", mobileOnly: true },
    { id: "orders", icon: FileText, label: "Pedidos", hasSubmenu: true },
    { id: "suppliers", icon: Truck, label: "Proveedores" },
    { id: "categories", icon: Tags, label: "Categorías" },
    { id: "help", icon: HelpCircle, label: "Ayuda/Soporte" },
  ];

  // Menú para administradores
  const adminMenuItems: MenuItem[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Panel" },
    { id: "reports", icon: BarChart3, label: "Reportes" },
    { id: "inventory", icon: Package, label: "Inventario", hasSubmenu: true },
    { id: "qr-scanner", icon: QrCode, label: "Lector QR", mobileOnly: true },
    { id: "orders", icon: FileText, label: "Pedidos", hasSubmenu: true },
    { id: "suppliers", icon: Truck, label: "Proveedores" },
    { id: "categories", icon: Tags, label: "Categorías" },
    { id: "departments", icon: Building2, label: "Departamentos", adminOnly: true },
    { id: "help", icon: HelpCircle, label: "Ayuda/Soporte" },
  ];

  // Seleccionar el menú según el rol
  const menuItems = userRole === "administrador" ? adminMenuItems : coordinatorUserMenuItems;

  const ordersSubMenu = [
    { id: "order-generator", label: "Generador de Pedidos" },
    { id: "order-history", label: "Historial de Pedidos" },
    { id: "pending-stock-history", label: "Historial Stock Pendiente" },
  ];

  const inventorySubMenu = [
    { id: "inventory", label: "Todos los Productos", icon: Package },
    { id: "stock-variation", label: "Variación de Stock", icon: ArrowRightLeft },
    { id: "stock-history", label: "Historial de Stock", icon: History },
    { id: "trash", label: "Papelera", icon: Trash2 },
  ];

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
          <p className="text-sm text-[#6b7280] mt-1">Gestión Empresarial</p>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Skeleton de carga mientras se verifican permisos */}
          {!permissionsLoaded ? (
            <div className="space-y-1 px-1 pt-1">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg animate-shimmer"
                  style={{ width: `${90 - i * 5}%` }}
                />
              ))}
              <p className="text-xs text-[#9ca3af] text-center pt-2">Cargando permisos…</p>
            </div>
          ) : (
            <>
              {menuItems.filter(item => hasMenuItemAccess(item.id)).map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                
                if (item.hasSubmenu) {
                  const isOrders = item.id === "orders";
                  const isInventory = item.id === "inventory";
                  const submenuOpen = isOrders ? ordersOpen : inventoryOpen;
                  const submenuItems = isOrders ? ordersSubMenu : inventorySubMenu;
                  const toggleSubmenu = isOrders ? () => setOrdersOpen(!ordersOpen) : () => setInventoryOpen(!inventoryOpen);
                  
                  const submenuActive = submenuItems.some(subItem => activeView === subItem.id);
                  
                  return (
                    <div key={item.id} className="mb-1">
                      <button
                        onClick={toggleSubmenu}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                          submenuActive
                            ? "bg-[#3b82f6] text-white"
                            : "text-[#374151] hover:bg-[#e5e7eb]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        {submenuOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {submenuOpen && (
                        <div className="ml-7 mt-1 space-y-1">
                          {submenuItems.map((subItem) => {
                            const SubIcon = subItem.icon || ChevronRight;
                            return (
                              <button
                                key={subItem.id}
                                onClick={() => handleViewChange(subItem.id)}
                                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                                  activeView === subItem.id
                                    ? "bg-[#3b82f6] text-white"
                                    : "text-[#374151] hover:bg-[#e5e7eb]"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <SubIcon className="w-3 h-3" />
                                  {subItem.label}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                      item.mobileOnly ? 'lg:hidden' : ''
                    } ${
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
              
              {/* Enlace a Contabilidad solo si tiene permiso */}
              {canAccessAccounting && (
                <button
                  onClick={onSwitchToAccounting}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activeView === "accounting-dashboard" || 
                    activeView === "purchases-inventory" || 
                    activeView === "sales-inventory" || 
                    activeView === "accounting-settings" || 
                    activeView === "accounting-help"
                      ? "bg-[#3b82f6] text-white"
                      : "text-[#374151] hover:bg-[#e5e7eb]"
                  }`}
                >
                  <Calculator className="w-5 h-5" />
                  <span>Contabilidad</span>
                </button>
              )}
              
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
              
              {/* Gestión de Usuarios solo para administradores */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleViewChange("users-management")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                      activeView === "users-management"
                        ? "bg-[#3b82f6] text-white"
                        : "text-[#374151] hover:bg-[#e5e7eb]"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Gestión de Usuarios</span>
                  </button>
                </>
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
        </div>
      </div>
    </>
  );
}