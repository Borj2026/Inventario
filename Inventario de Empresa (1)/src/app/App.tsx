import { useState, useEffect, useCallback } from "react";
import { Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { AccountingSidebar } from "./components/AccountingSidebar";
import { Dashboard } from "./components/Dashboard";
import { AccountingDashboard } from "./components/AccountingDashboard";
import { AccountingHelpView } from "./components/AccountingHelpView";
import { AccountingSettingsView } from "./components/AccountingSettingsView";
import { PurchasesInventoryView } from "./components/PurchasesInventoryView";
import { SalesInventoryView } from "./components/SalesInventoryView";
import { InventoryView } from "./components/InventoryView";
import { CategoriesView } from "./components/CategoriesView";
import { SupplierView } from "./components/SupplierView";
import { ClientView } from "./components/ClientView";
import { ReportsView } from "./components/ReportsView";
import { SettingsView } from "./components/SettingsView";
import { HelpView } from "./components/HelpView";
import { LoginView } from "./components/LoginView";
import { RegisterView } from "./components/RegisterView";
import { OrderHistory } from "./components/OrderHistory";
import { OrderGenerator } from "./components/OrderGenerator";
import { QRScannerView } from "./components/QRScannerView";
import { ProductModal } from "./components/ProductModal";
import { TrashView } from "./components/TrashView";
import { StockHistoryView } from "./components/StockHistoryView";
import { StockMovementsView } from "./components/StockMovementsView";
import { EmployeesView } from "./components/EmployeesView";
import { DepartmentsView } from "./components/DepartmentsView";
import { StockVariationView } from "./components/StockVariationView";
import { PendingStockHistory } from "./components/PendingStockHistory";
import { RoleManagementView } from "./components/RoleManagementView";
import { UsersManagementView } from "./components/UsersManagementView";
import { AccessDeniedView } from "./components/AccessDeniedView";
import { SyncIndicator } from "./components/SyncIndicator";
import { Toaster } from "./components/ui/sonner";
import * as api from "./utils/api";
import { toast } from "sonner";
import { usePermissions } from "./hooks/usePermissions";

interface Product {
  id: string;
  name: string;
  sku?: string; // SKU ahora es opcional
  category: string;
  company: string;
  department?: string; // Departamento responsable
  supplierId: string;
  warehouse: string;
  price: number;
  stock: number;
  minStock?: number; // Opcional
  description: string;
  image?: string;
  manual?: string;
  serialNumber?: string; // Número de serie opcional
  deletedAt?: string; // Fecha de eliminación
  hasSerialNumber?: boolean; // Indica si requiere número de serie
  orderNumber?: string; // Número de pedido asociado
  invoiceNumber?: string; // Número de factura
  invoiceDate?: string; // Fecha de factura
  discount?: number; // Descuento aplicado (porcentaje)
  createdAt?: string; // Fecha de creación
}

interface ProductUnit {
  id: string;
  sku?: string; // SKU ahora es opcional
  serialNumber: string;
  location: string;
  status: "available" | "in-use" | "maintenance" | "out-of-use";
  deletedAt?: string; // Fecha de eliminación
  reference?: string; // Referencia de la unidad
}

interface Supplier {
  id: string;
  name: string;
  cif: string;
  email: string;
  phone: string;
  address: string;
}

interface Client {
  id: string;
  name: string;
  cif: string;
  email: string;
  phone: string;
  address: string;
}

interface Category {
  name: string;
  notificationEmail?: string;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  supplier: string;
  company: string;
  warehouse: string;
  date: string;
  total: number;
  items: number;
  status: "efectuado" | "recibido" | "cancelado" | "fungible";
  products: OrderItem[];
  pdfUrl?: string; // URL del PDF generado
}

interface StockHistoryEntry {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  action: "add" | "remove" | "adjust" | "order-received";
  previousStock: number;
  newStock: number;
  quantity: number;
  reason?: string;
  user?: string;
  timestamp: string;
  company: string;
  warehouse: string;
  category: string;
  reference?: string; // Nueva referencia para trazabilidad
}

interface StockMovement {
  id: string;
  unitId: string;
  productName: string;
  productSku?: string;
  serialNumber: string;
  fromLocation: string;
  toLocation: string;
  timestamp: string;
  user?: string;
  employeeId?: string;
  employeeName?: string;
}

interface PendingStockItem {
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  pendingQuantity: number;
  arrivals: Array<{
    date: string;
    quantity: number;
  }>;
}

interface PendingStock {
  id: string;
  orderNumber: string;
  supplier: string;
  company: string;
  warehouse: string;
  orderDate: string;
  items: PendingStockItem[];
}

interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  role: "usuario" | "coordinador" | "administrador" | "contable";
}

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

interface Department {
  name: string;
  description: string;
}

const initialDepartments: Department[] = [
  {
    name: "Secretaría",
    description: "Gestin administrativa, atención al público, organización de documentación y coordinación de comunicaciones internas y externas.",
  },
  {
    name: "Contabilidad",
    description: "Control financiero, gestión contable, elaboración de presupuestos, fiscalidad y reporting económico de la organización.",
  },
  {
    name: "Mantenimiento",
    description: "Conservación y reparación de instalaciones, equipamiento técnico, mantenimiento preventivo y correctivo de infraestructuras.",
  },
  {
    name: "Calidad",
    description: "Supervisión de procesos, control de estándares, auditorías internas, mejora continua y certificaciones de calidad.",
  },
  {
    name: "Informática",
    description: "Soporte técnico, gestión de sistemas, mantenimiento de redes, seguridad informática y desarrollo de soluciones tecnológicas.",
  },
  {
    name: "Marketing",
    description: "Estrategias de comunicación, publicidad, gestión de redes sociales, branding y promoción de servicios institucionales.",
  },
];

const initialSuppliers: Supplier[] = [];


const companies = ["AMS", "CEM", "RUGH", "SADAF"];

const initialEnterpriseCategories: Category[] = [
  { name: "Electrónica" },
  { name: "Muebles" },
  { name: "Oficina" },
];

const initialAccountingCategories: Category[] = [
  { name: "Manuales" },
  { name: "Material Didáctico" },
  { name: "Material Finca Agrícola" },
  { name: "Uniformes Personal" },
  { name: "Menaje" },
  { name: "Otro Material" },
];

const initialProducts: Product[] = [];

const initialEmployees: Employee[] = [];

const initialOrders: Order[] = [];

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Configuración de posición del sidebar (izquierda/derecha)
  const [sidebarPosition, setSidebarPosition] = useState<"left" | "right">(() => {
    const savedPosition = localStorage.getItem("sidebarPosition");
    return (savedPosition === "left" || savedPosition === "right") ? savedPosition : "left";
  });
  
  // Categorías separadas para cada sistema
  const [accountingCategories, setAccountingCategories] = useState<Category[]>(initialAccountingCategories);
  const [enterpriseCategories, setEnterpriseCategories] = useState<Category[]>(initialEnterpriseCategories);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  // Restaurar sesión desde localStorage si keepSession estaba activado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const keepSession = localStorage.getItem("keepSession");
      const savedSession = localStorage.getItem("userSession");
      return keepSession === "true" && savedSession !== null;
    } catch {
      return false;
    }
  });
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    company: string;
  } | null>(() => {
    try {
      const keepSession = localStorage.getItem("keepSession");
      const savedSession = localStorage.getItem("userSession");
      if (keepSession === "true" && savedSession) {
        const parsed = JSON.parse(savedSession);
        return parsed.currentUser || null;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isAccountingUser, setIsAccountingUser] = useState<boolean>(() => {
    try {
      const keepSession = localStorage.getItem("keepSession");
      const savedSession = localStorage.getItem("userSession");
      if (keepSession === "true" && savedSession) {
        const parsed = JSON.parse(savedSession);
        return parsed.isAccountingUser || false;
      }
      return false;
    } catch {
      return false;
    }
  });

  // Estado para modal de producto desde QR
  const [qrProductToEdit, setQrProductToEdit] = useState<Product | null>(null);
  const [showQrProductModal, setShowQrProductModal] = useState(false);
  
  // Estado para las unidades de productos (productId -> array de unidades)
  const [productUnits, setProductUnits] = useState<Record<string, ProductUnit[]>>({});
  
  // Estado para navegar a un producto específico desde el historial
  const [selectedProductIdFromHistory, setSelectedProductIdFromHistory] = useState<string | undefined>(undefined);
  
  // Estado para recordar desde qué vista se accedió a las unidades
  const [previousView, setPreviousView] = useState<string | undefined>(undefined);
  
  // Estado para stocks pendientes
  const [pendingStocks, setPendingStocks] = useState<PendingStock[]>([]);
  
  // Estado de carga inicial desde Supabase
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>("AMS");

  // VALORES DERIVADOS SIMPLES: Calcular después de todos los useState pero antes de otros hooks
  // Categorías activas según el modo de usuario
  const categories = isAccountingUser ? accountingCategories : enterpriseCategories;

  // HOOKS DERIVADOS: Calcular userRole y cargar permisos INMEDIATAMENTE después de los useState
  const currentUserData = users.find(u => u.email.toLowerCase() === currentUser?.email?.toLowerCase());
  const userRole = (currentUserData?.role || "usuario") as "usuario" | "coordinador" | "administrador" | "contable";
  const isAdmin = userRole === "administrador";
  
  // Hook de permisos: carga asíncrona y verificaciones síncronas
  const { loaded: permissionsLoaded, canAccessModule, canUseFeature, canAccessData } = usePermissions(userRole);

  // Cargar datos iniciales desde Supabase al montar el componente
  useEffect(() => {
    // Mostrar mensaje de ayuda en la consola
    console.log(
      "%c🚀 Sistema de Gestión de Inventario v2.0.0",
      "color: #3b82f6; font-size: 18px; font-weight: bold;"
    );
    console.log(
      "%c⚠️ ¿Error 'Could not find table users'?",
      "color: #f59e0b; font-size: 14px; font-weight: bold;"
    );
    console.log(
      "%cHaz clic en el botón naranja 'Configurar BD' en la esquina superior derecha",
      "color: #6b7280; font-size: 12px;"
    );
    console.log(
      "%cO consulta: /LEEME_PRIMERO.md",
      "color: #6b7280; font-size: 12px;"
    );
    console.log("");
    
    const loadInitialData = async () => {
      try {
        setIsLoadingData(true);
        
        // Cargar empresa seleccionada
        const company = await api.getSelectedCompany();
        setSelectedCompany(company);
        
        // Cargar empleados (compartidos entre todas las empresas)
        const employeesData = await api.getEmployees();
        if (employeesData) {
          setEmployees(employeesData);
        }
        
        // Cargar usuarios registrados desde Supabase
        try {
          const usersData = await api.getUsers();
          if (usersData) {
            // Mapear propiedades de snake_case a camelCase
            const mappedUsers = usersData.map((user: any) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              company: user.company,
              role: user.role,
              createdAt: user.created_at || user.createdAt,
              isActive: user.is_active !== undefined ? user.is_active : user.isActive,
            }));
            setUsers(mappedUsers);
          }
        } catch (error) {
          console.log("No se pudieron cargar usuarios:", error);
        }
        
        // Cargar productos de la empresa actual
        const productsData = await api.getProducts(company);
        if (productsData) {
          setProducts(productsData);
        }
        
        // Cargar categorías empresariales de la empresa actual
        const categoriesData = await api.getCategories(company);
        if (categoriesData) {
          setEnterpriseCategories(categoriesData);
        }
        
        // Cargar proveedores de la empresa actual
        const suppliersData = await api.getSuppliers(company);
        if (suppliersData) {
          setSuppliers(suppliersData);
        }
        
        // Cargar papelera de la empresa actual
        const deletedProductsData = await api.getDeletedProducts(company);
        if (deletedProductsData) {
          setDeletedProducts(deletedProductsData);
        }
        
        toast.success("Datos cargados desde la nube", {
          description: `Conectado a la empresa: ${company}`,
        });
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        toast.error("Error al conectar con la nube", {
          description: "Usando datos locales por defecto",
        });
      } finally {
        // Asegurarse SIEMPRE de que se ponga en false
        console.log("✅ Carga inicial completada, desactivando pantalla de carga");
        setIsLoadingData(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Auto-guardar productos cuando cambien
  useEffect(() => {
    if (!isLoadingData) {
      const saveTimeout = setTimeout(() => {
        api.saveProducts(selectedCompany, products)
          .then(() => {
            console.log("✅ Productos sincronizados con la nube");
          })
          .catch((error) => {
            console.error("Error al guardar productos:", error);
            toast.error("Error al sincronizar productos", {
              description: "Los cambios se guardarán localmente",
            });
          });
      }, 1000); // Debounce de 1 segundo
      
      return () => clearTimeout(saveTimeout);
    }
  }, [products, selectedCompany, isLoadingData]);

  // Auto-guardar empleados cuando cambien
  useEffect(() => {
    if (!isLoadingData && employees.length > 0) {
      const saveTimeout = setTimeout(() => {
        api.saveEmployees(employees)
          .then(() => {
            console.log("✅ Empleados sincronizados con la nube");
          })
          .catch((error) => {
            console.error("Error al guardar empleados:", error);
          });
      }, 1000);
      
      return () => clearTimeout(saveTimeout);
    }
  }, [employees, isLoadingData]);

  // Auto-guardar categorías empresariales cuando cambien
  useEffect(() => {
    if (!isLoadingData && enterpriseCategories.length > 0) {
      const saveTimeout = setTimeout(() => {
        api.saveCategories(selectedCompany, enterpriseCategories)
          .then(() => {
            console.log("✅ Categorías sincronizadas con la nube");
          })
          .catch((error) => {
            console.error("Error al guardar categorías:", error);
          });
      }, 1000);
      
      return () => clearTimeout(saveTimeout);
    }
  }, [enterpriseCategories, selectedCompany, isLoadingData]);

  // Auto-guardar proveedores cuando cambien
  useEffect(() => {
    if (!isLoadingData) {
      const saveTimeout = setTimeout(() => {
        api.saveSuppliers(selectedCompany, suppliers)
          .then(() => {
            console.log("✅ Proveedores sincronizados con la nube");
          })
          .catch((error) => {
            console.error("Error al guardar proveedores:", error);
          });
      }, 1000);
      
      return () => clearTimeout(saveTimeout);
    }
  }, [suppliers, selectedCompany, isLoadingData]);

  // Auto-guardar papelera cuando cambie
  useEffect(() => {
    if (!isLoadingData) {
      const saveTimeout = setTimeout(() => {
        api.saveDeletedProducts(selectedCompany, deletedProducts)
          .then(() => {
            console.log("✅ Papelera sincronizada con la nube");
          })
          .catch((error) => {
            console.error("Error al guardar papelera:", error);
          });
      }, 1000);
      
      return () => clearTimeout(saveTimeout);
    }
  }, [deletedProducts, selectedCompany, isLoadingData]);

  // Guardar empresa seleccionada cuando cambie
  useEffect(() => {
    if (!isLoadingData) {
      api.saveSelectedCompany(selectedCompany)
        .then(() => {
          console.log("✅ Empresa seleccionada guardada");
        })
        .catch((error) => {
          console.error("Error al guardar empresa seleccionada:", error);
        });
    }
  }, [selectedCompany, isLoadingData]);

  // Guardar posición del sidebar en localStorage cuando cambie
  const handleSidebarPositionChange = (position: "left" | "right") => {
    setSidebarPosition(position);
    localStorage.setItem("sidebarPosition", position);
  };

  /**
   * Renderiza una vista protegida por permisos.
   * - Mientras los permisos cargan: muestra un skeleton sutil
   * - Si no tiene acceso: muestra AccessDeniedView
   * - Si tiene acceso: renderiza el contenido
   * IMPORTANTE: debe estar ANTES de cualquier return condicional para cumplir las Reglas de Hooks.
   */
  const renderProtected = useCallback(
    (view: string, content: React.ReactNode): React.ReactNode => {
      const viewPermissionMap: Record<string, () => boolean> = {
        "dashboard":              () => canAccessModule("Dashboard"),
        "inventory":              () => canAccessModule("Gestión de Inventario"),
        "stock-variation":        () => canAccessModule("Gestión de Inventario"),
        "stock-history":          () => canAccessModule("Gestión de Inventario"),
        "trash":                  () => canAccessModule("Gestión de Inventario"),
        "reports":                () => canAccessModule("Reportes y Estadísticas"),
        "categories":             () => canAccessModule("Gestión de Categorías"),
        "suppliers":              () => canAccessModule("Gestión de Proveedores"),
        "clients":                () => canAccessModule("Gestión de Clientes"),
        "departments":            () => canAccessModule("Gestión de Departamentos"),
        "role-management":        () => canAccessModule("Gestión de Roles"),
        "order-generator":        () => canAccessModule("Gestión de Productos"),
        "order-history":          () => canAccessModule("Gestión de Productos"),
        "pending-stock-history":  () => canAccessModule("Gestión de Productos"),
        "qr-scanner":             () => canUseFeature("Escanear Códigos QR"),
        "help":                   () => canUseFeature("Ver Ayuda/Soporte"),
        "accounting-dashboard":   () => canUseFeature("Acceso a Contabilidad"),
        "accounting-help":        () => canUseFeature("Ver Ayuda/Soporte"),
        "purchases-inventory":    () => canAccessData("Inventario de Compras"),
        "sales-inventory":        () => canAccessData("Inventario de Ventas"),
      };

      const viewNames: Record<string, string> = {
        "dashboard": "Panel", "inventory": "Inventario", "stock-variation": "Variación de Stock",
        "stock-history": "Historial de Stock", "trash": "Papelera", "reports": "Reportes",
        "categories": "Categorías", "suppliers": "Proveedores", "clients": "Clientes",
        "departments": "Departamentos", "role-management": "Gestión de Roles",
        "order-generator": "Generador de Pedidos", "order-history": "Historial de Pedidos",
        "pending-stock-history": "Stock Pendiente", "qr-scanner": "Lector QR",
        "help": "Ayuda/Soporte", "accounting-dashboard": "Contabilidad",
        "accounting-help": "Ayuda Contabilidad", "purchases-inventory": "Inventario de Compras",
        "sales-inventory": "Inventario de Ventas",
      };

      const checkFn = viewPermissionMap[view];
      if (!checkFn) return content;
      if (!permissionsLoaded) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 gap-4">
            <div className="flex flex-col gap-3 w-full max-w-md">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-200 rounded animate-pulse"
                  style={{ width: `${85 - i * 8}%`, opacity: 1 - i * 0.15 }}
                />
              ))}
            </div>
            <p className="text-sm text-[#9ca3af] mt-2">Verificando permisos…</p>
          </div>
        );
      }
      if (!checkFn()) {
        return (
          <AccessDeniedView
            viewName={viewNames[view]}
            onGoBack={() => setActiveView("dashboard")}
          />
        );
      }
      return content;
    },
    [permissionsLoaded, canAccessModule, canUseFeature, canAccessData, setActiveView]
  );

  const handleLogin = async (email: string, password: string, userType?: "normal" | "accounting") => {
    try {
      // Llamar a la API de login que valida contra Supabase
      const response = await api.loginUser(email, password);
      
      if (!response.success) {
        // Devolver el error específico para que LoginView lo maneje
        return {
          success: false,
          error: response.error || "Credenciales incorrectas",
        };
      }

      const user = response.user;
      
      // Buscar el usuario en la lista local
      let userData = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Si el usuario no está en la lista local, agregarlo
      if (!userData && user) {
        userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company || "AMS",
          role: user.role || "usuario",
          createdAt: user.created_at || new Date().toISOString(),
          isActive: user.is_active !== undefined ? user.is_active : true,
        };
        setUsers(prevUsers => [...prevUsers, userData!]);
      }
      
      // Detectar si es usuario de contabilidad (por rol)
      const isAccounting = userData?.role === "contable" || userType === "accounting";
      
      const newCurrentUser = {
        name: user.name || userData?.name || "Usuario",
        email: user.email,
        company: user.company || "AMS",
      };

      setCurrentUser(newCurrentUser);
      setIsAccountingUser(isAccounting);
      setIsAuthenticated(true);

      // Si el usuario eligió mantener la sesión, guardar datos en localStorage
      try {
        const keepSession = localStorage.getItem("keepSession");
        if (keepSession === "true") {
          localStorage.setItem("userSession", JSON.stringify({
            currentUser: newCurrentUser,
            isAccountingUser: isAccounting,
          }));
        }
      } catch (e) {
        console.warn("No se pudo guardar la sesión en localStorage:", e);
      }
      
      // Mostrar mensaje de bienvenida
      toast.success("¡Bienvenido!", {
        description: `Has iniciado sesión como ${user.name || userData?.name || "Usuario"}`,
        duration: 3000,
      });
      
      // Establecer la vista inicial según el tipo de usuario
      if (isAccounting) {
        setActiveView("accounting-dashboard");
      } else {
        setActiveView("dashboard");
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return {
        success: false,
        error: "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.",
      };
    }
  };

  const handleRegister = async (userData: {
    name: string;
    email: string;
    password: string;
    company: string;
  }) => {
    try {
      // Guardar el usuario en Supabase
      const newUserFromDB = await api.saveUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        company: userData.company,
        role: "usuario",
        status: "active",
        createdAt: new Date().toISOString(),
      });

      // Actualizar el estado de usuarios para que aparezca en Gestión de Usuarios
      const userForState: User = {
        id: newUserFromDB?.id || Date.now().toString(),
        name: userData.name,
        email: userData.email,
        company: userData.company,
        role: "usuario",
        createdAt: newUserFromDB?.created_at || new Date().toISOString(),
        isActive: true,
      };
      setUsers(prevUsers => [...prevUsers, userForState]);

      // Iniciar sesión automáticamente después del registro
      setCurrentUser({
        name: userData.name,
        email: userData.email,
        company: userData.company,
      });
      setIsAuthenticated(true);
      setIsAccountingUser(false);
      setActiveView("dashboard");
      
      // Mostrar mensaje de éxito con toast
      toast.success("¡Registro exitoso!", {
        description: `Bienvenido al sistema, ${userData.name}`,
        duration: 4000,
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      const errorMessage = error instanceof Error ? error.message : "El correo podría estar ya en uso.";
      
      toast.error("Error al registrar", {
        description: errorMessage,
        duration: 5000,
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const handleLogout = () => {
    // Limpiar sesión persistida de localStorage
    try {
      localStorage.removeItem("userSession");
      localStorage.removeItem("keepSession");
    } catch (e) {
      console.warn("No se pudo limpiar la sesión de localStorage:", e);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAccountingUser(false);
    setActiveView("dashboard");
  };
  
  // Función para cambiar al sistema de contabilidad (solo para admin)
  const handleSwitchToAccounting = () => {
    setIsAccountingUser(true);
    setActiveView("accounting-dashboard");
  };
  
  // Función para volver al sistema normal (solo para admin)
  const handleSwitchToNormal = () => {
    setIsAccountingUser(false);
    setActiveView("dashboard");
  };
  
  const handleQRProductFound = (product: Product) => {
    setQrProductToEdit(product);
    setShowQrProductModal(true);
  };

  // Función helper para registrar movimientos en el historial de stock
  const addStockHistoryEntry = (
    product: Product,
    action: "add" | "remove" | "adjust" | "order-received",
    previousStock: number,
    newStock: number,
    reason?: string,
    reference?: string // Nuevo parámetro para la referencia
  ) => {
    const entry: StockHistoryEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      productId: product.id,
      productName: product.name,
      productSku: product.sku || "",
      action,
      previousStock,
      newStock,
      quantity: Math.abs(newStock - previousStock),
      reason,
      user: currentUser?.name || "Usuario",
      timestamp: new Date().toISOString(),
      company: product.company,
      warehouse: product.warehouse,
      category: product.category,
      reference, // Añadir referencia
    };
    
    setStockHistory(prevHistory => [entry, ...prevHistory]);
  };

  // Función para variación manual de stock
  const handleStockAdjustment = (
    productId: string,
    type: "add" | "remove",
    quantity: number,
    reason: string,
    details: {
      location?: string;
      unitsToRemove?: string[];
      serialNumbers?: string[];
      skus?: string[];
    }
  ) => {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    const product = products[productIndex];
    const previousStock = productUnits[productId]?.length || 0;
    
    if (type === "add") {
      const serials = details.serialNumbers || [];
      const skus = details.skus || [];
      const newUnits: ProductUnit[] = Array.from({ length: quantity }).map((_, i) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + i,
        sku: skus[i] || "",
        serialNumber: serials[i] || "",
        location: details.location || "ALMACÉN – VC",
        status: "available",
      }));

      // Actualizar unidades
      setProductUnits(prev => ({
        ...prev,
        [productId]: [...(prev[productId] || []), ...newUnits]
      }));

      // Actualizar stock total en producto
      const updatedProducts = [...products];
      updatedProducts[productIndex] = {
        ...product,
        stock: previousStock + quantity
      };
      setProducts(updatedProducts);

      // Registrar historial
      addStockHistoryEntry(product, "add", previousStock, previousStock + quantity, reason);
    } else {
      // Remover unidades (soft delete)
      const unitsToRemove = details.unitsToRemove || [];
      if (unitsToRemove.length === 0) return;

      // Actualizar unidades (remover las seleccionadas)
      setProductUnits(prev => ({
        ...prev,
        [productId]: (prev[productId] || []).filter(u => !unitsToRemove.includes(u.id))
      }));
      
      // Mover a papelera (opcional, si queremos mantener rastro de unidades eliminadas)
      // Por ahora simplemente las eliminamos del array activo, pero podríamos moverlas a otro estado

      // Actualizar stock total en producto
      const updatedProducts = [...products];
      updatedProducts[productIndex] = {
        ...product,
        stock: previousStock - quantity
      };
      setProducts(updatedProducts);

      // Registrar historial
      addStockHistoryEntry(product, "remove", previousStock, previousStock - quantity, reason);
    }
  };

  const handleAddProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      stock: 0, // Todos los productos nuevos inician con stock 0
    };
    setProducts([...products, newProduct]);
  };

  // Handler exclusivo para importación desde Excel:
  // respeta el valor de stock del archivo como "unidades pendientes"
  const handleImportProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      // stock se usa como objetivo de unidades (unidades pendientes), NO se fuerza a 0
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const handleUpdateProduct = (id: string, productData: Omit<Product, "id">) => {
    const oldProduct = products.find(p => p.id === id);
    const wasStockOk = oldProduct && oldProduct.minStock !== undefined && oldProduct.stock >= oldProduct.minStock;
    const isStockLowNow = productData.minStock !== undefined && productData.stock < productData.minStock && productData.stock > 0;
    
    setProducts(products.map(p => p.id === id ? { ...productData, id } : p));
    
    // Enviar notificación si el producto tiene stock bajo y la categoría tiene un email configurado
    if (wasStockOk && isStockLowNow) {
      const category = categories.find(c => c.name === productData.category);
      if (category?.notificationEmail) {
        sendLowStockNotification(productData.name, category.notificationEmail);
      }
    }
  };

  const handleDeleteProduct = (id: string) => {
    const deletedProduct = products.find(p => p.id === id);
    if (deletedProduct) {
      // Agregar fecha de eliminación
      const now = new Date();
      const deletedWithDate = {
        ...deletedProduct,
        deletedAt: now.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setDeletedProducts([...deletedProducts, deletedWithDate]);
    }
    setProducts(products.filter(p => p.id !== id));
  };

  const handleRestoreProduct = (id: string) => {
    const productToRestore = deletedProducts.find(p => p.id === id);
    if (productToRestore) {
      // Remover deletedAt antes de restaurar
      const { deletedAt, ...restoredProduct } = productToRestore;
      setProducts([...products, restoredProduct as Product]);
      setDeletedProducts(deletedProducts.filter(p => p.id !== id));
    }
  };

  const handlePermanentDelete = (id: string) => {
    setDeletedProducts(deletedProducts.filter(p => p.id !== id));
  };

  const handleEmptyTrash = () => {
    setDeletedProducts([]);
  };

  // Funciones para gestión de unidades
  const handleBulkAddUnits = (productId: string, unitsData: Omit<ProductUnit, "id">[]) => {
    if (unitsData.length === 0) return;
    
    // Obtener el producto y unidades actuales
    const product = products.find(p => p.id === productId);
    const currentUnits = productUnits[productId] || [];
    const previousStock = currentUnits.length;
    
    // Crear todas las nuevas unidades
    const newUnits = unitsData.map(unitData => ({
      ...unitData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }));
    
    setProductUnits(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), ...newUnits],
    }));
    
    // Registrar en el historial de stock UNA SOLA VEZ con la cantidad total
    if (product) {
      const newStock = previousStock + unitsData.length;
      
      // Obtener la referencia de la primera unidad (todas deberían tener la misma)
      const reference = unitsData[0]?.reference;
      
      addStockHistoryEntry(
        product,
        "add",
        previousStock,
        newStock,
        reference || (unitsData.length === 1 
          ? "Unidad añadida al inventario" 
          : `${unitsData.length} unidades añadidas al inventario`),
        reference // Pasar la referencia al historial
      );
    }
  };
  
  const handleAddUnit = (productId: string, unitData: Omit<ProductUnit, "id">) => {
    // Llamar a la función bulk con una sola unidad
    handleBulkAddUnits(productId, [unitData]);
  };

  const handleUpdateUnit = (productId: string, unitId: string, unitData: Omit<ProductUnit, "id">, employeeId?: string, employeeName?: string) => {
    // Obtener la unidad anterior para detectar cambios de localización
    const currentUnits = productUnits[productId] || [];
    const oldUnit = currentUnits.find(unit => unit.id === unitId);
    
    // Verificar si cambió la localización
    if (oldUnit && oldUnit.location !== unitData.location) {
      const product = products.find(p => p.id === productId);
      
      // Registrar movimiento
      const movement: StockMovement = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        unitId: unitId,
        productName: product?.name || "Producto Desconocido",
        productSku: unitData.sku || oldUnit.sku,
        serialNumber: unitData.serialNumber || oldUnit.serialNumber,
        fromLocation: oldUnit.location,
        toLocation: unitData.location,
        timestamp: new Date().toISOString(),
        user: currentUser?.name || "Usuario",
        employeeId,
        employeeName,
      };
      
      setStockMovements(prev => [movement, ...prev]);
    }
    
    setProductUnits(prev => ({
      ...prev,
      [productId]: (prev[productId] || []).map(unit =>
        unit.id === unitId ? { ...unitData, id: unitId } : unit
      ),
    }));
  };

  // Función para mover múltiples unidades en lote y registrar todos los movimientos
  const handleBulkMoveUnits = (
    productId: string, 
    unitUpdates: Array<{ unitId: string; newLocation: string }>,
    employeeId?: string,
    employeeName?: string
  ) => {
    const product = products.find(p => p.id === productId);
    const currentUnits = productUnits[productId] || [];
    const newMovements: StockMovement[] = [];
    
    // Preparar todos los movimientos
    unitUpdates.forEach((update, index) => {
      const oldUnit = currentUnits.find(u => u.id === update.unitId);
      
      if (oldUnit && oldUnit.location !== update.newLocation) {
        // Crear movimiento con timestamp único
        const movement: StockMovement = {
          id: (Date.now() + index).toString() + Math.random().toString(36).substr(2, 9),
          unitId: update.unitId,
          productName: product?.name || "Producto Desconocido",
          productSku: oldUnit.sku,
          serialNumber: oldUnit.serialNumber,
          fromLocation: oldUnit.location,
          toLocation: update.newLocation,
          timestamp: new Date().toISOString(),
          user: currentUser?.name || "Usuario",
          employeeId,
          employeeName,
        };
        newMovements.push(movement);
      }
    });
    
    // Actualizar las unidades
    setProductUnits(prev => ({
      ...prev,
      [productId]: (prev[productId] || []).map(unit => {
        const update = unitUpdates.find(u => u.unitId === unit.id);
        if (update) {
          return {
            ...unit,
            location: update.newLocation
          };
        }
        return unit;
      }),
    }));
    
    // Registrar todos los movimientos de una vez
    if (newMovements.length > 0) {
      setStockMovements(prev => [...newMovements, ...prev]);
    }
  };

  const handleDeleteUnit = (productId: string, unitId: string) => {
    // Obtener la unidad a eliminar
    const unit = productUnits[productId]?.find(u => u.id === unitId);
    const product = products.find(p => p.id === productId);
    
    if (unit && product) {
      const previousStock = product.stock;
      const newStock = Math.max(0, previousStock - 1);
      
      // Marcar como eliminada con fecha
      const now = new Date();
      const deletedAt = now.toISOString();
      
      setProductUnits(prev => ({
        ...prev,
        [productId]: (prev[productId] || []).map(u =>
          u.id === unitId ? { ...u, deletedAt } : u
        ),
      }));
      
      // Reducir el stock del producto en 1
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId ? { ...p, stock: newStock } : p
        )
      );
      
      // Registrar en el historial de stock
      addStockHistoryEntry(
        product,
        "remove",
        previousStock,
        newStock,
        "Unidad eliminada del inventario"
      );
    }
  };

  const handleRestoreUnit = (productId: string, unitId: string) => {
    setProductUnits(prev => ({
      ...prev,
      [productId]: (prev[productId] || []).map(u =>
        u.id === unitId ? { ...u, deletedAt: undefined } : u
      ),
    }));
    
    // Aumentar el stock del producto en 1
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId ? { ...p, stock: p.stock + 1 } : p
      )
    );
  };

  const handlePermanentDeleteUnit = (productId: string, unitId: string) => {
    // Eliminar permanentemente la unidad
    // El stock ya fue reducido cuando se marcó como eliminada, no hace falta volver a reducirlo
    setProductUnits(prev => ({
      ...prev,
      [productId]: (prev[productId] || []).filter(u => u.id !== unitId),
    }));
  };

  const handleImportData = (data: Product[]) => {
    setProducts(data);
  };

  const handleAddCategory = (categoryData: { name: string; notificationEmail?: string }) => {
    if (!categories.some(c => c.name === categoryData.name)) {
      if (isAccountingUser) {
        setAccountingCategories([...accountingCategories, categoryData]);
      } else {
        setEnterpriseCategories([...enterpriseCategories, categoryData]);
      }
    } else {
      alert("Esta categoría ya existe");
    }
  };
  
  const handleUpdateCategory = (oldName: string, categoryData: { name: string; notificationEmail?: string }) => {
    if (isAccountingUser) {
      setAccountingCategories(accountingCategories.map(c => c.name === oldName ? categoryData : c));
    } else {
      setEnterpriseCategories(enterpriseCategories.map(c => c.name === oldName ? categoryData : c));
    }
    
    // Actualizar la categoría en todos los productos que la usen
    if (oldName !== categoryData.name) {
      setProducts(products.map(p => p.category === oldName ? { ...p, category: categoryData.name } : p));
    }
  };

  const handleDeleteCategory = (name: string) => {
    // Cambiar todos los productos de esta categoría a "Sin Categoría"
    setProducts(products.map(p => 
      p.category === name ? { ...p, category: "Sin Categor��a" } : p
    ));
    
    // Eliminar la categoría
    if (isAccountingUser) {
      setAccountingCategories(accountingCategories.filter(c => c.name !== name));
    } else {
      setEnterpriseCategories(enterpriseCategories.filter(c => c.name !== name));
    }
  };

  const handleAddSupplier = (supplierData: Omit<Supplier, "id">) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now().toString(),
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const handleUpdateSupplier = (id: string, supplierData: Omit<Supplier, "id">) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...supplierData, id } : s));
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const handleAddClient = (clientData: Omit<Client, "id">) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
    };
    setClients([...clients, newClient]);
  };

  const handleUpdateClient = (id: string, clientData: Omit<Client, "id">) => {
    setClients(clients.map(c => c.id === id ? { ...clientData, id } : c));
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const handleAddEmployee = async (employeeData: Omit<Employee, "id">) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString(),
    };
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    
    // Guardar en Supabase
    try {
      await api.saveEmployees(updatedEmployees);
      toast.success("Empleado agregado correctamente");
    } catch (error) {
      console.error("Error al guardar empleado:", error);
      toast.error("Error al guardar empleado en la nube");
    }
  };

  const handleUpdateEmployee = async (id: string, employeeData: Omit<Employee, "id">) => {
    const updatedEmployees = employees.map(e => e.id === id ? { ...employeeData, id } : e);
    setEmployees(updatedEmployees);
    
    // Guardar en Supabase
    try {
      await api.saveEmployees(updatedEmployees);
      toast.success("Empleado actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      toast.error("Error al actualizar empleado en la nube");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    const updatedEmployees = employees.filter(e => e.id !== id);
    setEmployees(updatedEmployees);
    
    // Guardar en Supabase
    try {
      await api.saveEmployees(updatedEmployees);
      toast.success("Empleado eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      toast.error("Error al eliminar empleado de la nube");
    }
  };

  // Funciones de gestión de usuarios
  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast.success("Usuario eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar usuario");
      console.error("Error:", error);
    }
  };

  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    try {
      const updatedUser = await api.updateUser(userId, userData);
      
      // Mapear la respuesta de snake_case a camelCase
      const mappedUser = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company,
        role: updatedUser.role,
        createdAt: updatedUser.created_at || updatedUser.createdAt,
        isActive: updatedUser.is_active !== undefined ? updatedUser.is_active : updatedUser.isActive,
      };
      
      setUsers(users.map(u => u.id === userId ? mappedUser : u));
      toast.success("Usuario actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar usuario");
      console.error("Error:", error);
    }
  };

  const handleAddDepartment = (departmentData: { name: string; description: string }) => {
    if (!departments.some(d => d.name === departmentData.name)) {
      setDepartments([...departments, departmentData]);
    } else {
      alert("Este departamento ya existe");
    }
  };

  const handleAddOrder = (order: Order) => {
    setOrders([...orders, order]);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: "recibido" | "cancelado" | "efectuado" | "fungible") => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  // Función para añadir stock pendiente
  const handleAddPendingStock = (pendingStock: Omit<PendingStock, "id">) => {
    const newPendingStock: PendingStock = {
      ...pendingStock,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setPendingStocks(prev => [newPendingStock, ...prev]);
  };

  // Función para actualizar stock pendiente
  const handleUpdatePendingStock = (stockId: string, updatedItems: PendingStockItem[]) => {
    setPendingStocks(prev => {
      return prev.map(stock => {
        if (stock.id === stockId) {
          // Filtrar items que ya no tienen stock pendiente
          const filteredItems = updatedItems.filter(item => item.pendingQuantity > 0);
          
          // Si no quedan items pendientes, eliminar el registro completo
          if (filteredItems.length === 0) {
            return null;
          }
          
          return {
            ...stock,
            items: filteredItems
          };
        }
        return stock;
      }).filter((stock): stock is PendingStock => stock !== null); // Eliminar nulls
    });
  };

  // Función para añadir productos al inventario desde stock pendiente
  const handleAddProductsFromPendingStock = (productsData: Array<{
    productName: string;
    quantity: number;
    company: string;
    supplier: string;
    warehouse: string;
  }>) => {
    productsData.forEach(productData => {
      // Buscar si el producto ya existe
      const existingProduct = products.find(p => 
        p.name.toLowerCase() === productData.productName.toLowerCase() &&
        p.company === productData.company
      );

      if (existingProduct) {
        // Actualizar stock del producto existente
        handleUpdateProduct(existingProduct.id, {
          ...existingProduct,
          stock: existingProduct.stock + productData.quantity
        });
      }
      // Si no existe, no hacemos nada porque el producto debería existir desde el pedido original
    });
  };

  // Función para añadir productos al inventario de compras
  const handleAddPurchaseProduct = (productData: {
    productName: string;
    category: string;
    company: string;
    supplier: string;
    invoiceNumber: string;
    invoiceDate: string;
    quantity: number;
    price: number;
    discount: number;
  }) => {
    // Crear un nuevo pedido con el producto
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: productData.invoiceNumber,
      supplier: productData.supplier,
      company: productData.company,
      warehouse: "Vecindario", // Valor por defecto
      date: productData.invoiceDate,
      total: productData.price * productData.quantity,
      items: 1,
      status: "recibido",
      products: [
        {
          id: `comp-prod-${Date.now()}`,
          productName: productData.productName,
          quantity: productData.quantity,
          price: productData.price,
          category: productData.category,
          invoiceNumber: productData.invoiceNumber,
          invoiceDate: productData.invoiceDate,
          discount: productData.discount,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ],
    };
    
    setOrders([...orders, newOrder]);
  };

  // Función para añadir productos al inventario de ventas
  const handleAddSalesProduct = (productData: {
    name: string;
    category: string;
    company: string;
    invoiceNumber: string;
    invoiceDate: string;
    stock: number;
    price: number;
    discount: number;
  }) => {
    // Encontrar un proveedor por defecto
    const defaultSupplier = suppliers[0];
    
    // Crear un nuevo producto
    const newProduct: Product = {
      id: `acc-${Date.now()}`,
      name: productData.name,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      category: productData.category,
      company: productData.company,
      supplierId: defaultSupplier?.id || "3",
      warehouse: "Vecindario", // Valor por defecto
      price: productData.price,
      stock: productData.stock,
      description: "",
      invoiceNumber: productData.invoiceNumber,
      invoiceDate: productData.invoiceDate,
      discount: productData.discount,
      createdAt: new Date().toISOString().split("T")[0],
    };
    
    setProducts([...products, newProduct]);
  };

  // Función para editar productos del inventario de compras
  const handleEditPurchaseProduct = (updatedData: {
    id: string;
    productName: string;
    category: string;
    company: string;
    supplier: string;
    invoiceNumber: string;
    invoiceDate: string;
    quantity: number;
  }) => {
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        // Buscar si alguno de los productos del pedido coincide
        const hasProduct = order.products.some(p => p.id === updatedData.id);
        if (!hasProduct) return order;

        // Actualizar el producto dentro del pedido
        const updatedProducts = order.products.map(product => {
          if (product.id === updatedData.id) {
            return {
              ...product,
              productName: updatedData.productName,
              quantity: updatedData.quantity,
              category: updatedData.category,
              invoiceNumber: updatedData.invoiceNumber,
              invoiceDate: updatedData.invoiceDate,
            };
          }
          return product;
        });

        // También actualizar los datos del pedido si es necesario
        return {
          ...order,
          company: updatedData.company,
          supplier: updatedData.supplier,
          orderNumber: updatedData.invoiceNumber,
          date: updatedData.invoiceDate,
          products: updatedProducts,
        };
      });
    });
  };

  // Función para eliminar productos del inventario de compras
  const handleDeletePurchaseProduct = (productId: string) => {
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        // Filtrar el producto del pedido
        const updatedProducts = order.products.filter(p => p.id !== productId);
        
        // Si el pedido se queda sin productos, podríamos eliminarlo completamente
        if (updatedProducts.length === 0) {
          return null; // Lo marcaremos para eliminar
        }

        return {
          ...order,
          products: updatedProducts,
          items: updatedProducts.length,
        };
      }).filter(order => order !== null) as Order[]; // Eliminar pedidos nulos
    });
  };

  // Función para editar productos del inventario de ventas
  const handleEditSalesProduct = (updatedData: {
    id: string;
    name: string;
    category: string;
    company: string;
    client: string;
    invoiceNumber: string;
    invoiceDate: string;
    stock: number;
  }) => {
    setProducts(prevProducts => {
      return prevProducts.map(product => {
        if (product.id === updatedData.id) {
          return {
            ...product,
            name: updatedData.name,
            category: updatedData.category,
            company: updatedData.company,
            invoiceNumber: updatedData.invoiceNumber,
            invoiceDate: updatedData.invoiceDate,
            stock: updatedData.stock,
          };
        }
        return product;
      });
    });
  };

  // Función para eliminar productos del inventario de ventas
  const handleDeleteSalesProduct = (productId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };

  const handleAddProductsToInventory = (productsToAdd: Array<{
    productName: string;
    quantity: number;
    price: number;
    category: string;
    department?: string;
    company: string;
    supplier: string;
    warehouse: string;
    hasSerialNumber?: boolean;
    orderNumber?: string; // Agregado orderNumber
  }>) => {
    const updatedProducts = [...products];
    
    productsToAdd.forEach(newProduct => {
      // Buscar el ID del proveedor por nombre
      const supplier = suppliers.find(s => s.name === newProduct.supplier);
      const supplierId = supplier?.id || "";
      
      // Buscar si el producto ya existe comparando TODOS los atributos relevantes
      // (sin contar stock, id, SKU generado, deletedAt, serialNumber individual, department)
      const existingProductIndex = updatedProducts.findIndex(p => 
        p.name.toLowerCase() === newProduct.productName.toLowerCase() &&
        p.category === newProduct.category &&
        p.company === newProduct.company &&
        p.supplierId === supplierId &&
        p.warehouse === newProduct.warehouse &&
        p.price === newProduct.price &&
        (p.hasSerialNumber || false) === (newProduct.hasSerialNumber || false) &&
        !p.deletedAt // No considerar productos en papelera
      );
      
      if (existingProductIndex !== -1) {
        // Si existe un producto con las mismas características, sumar al stock existente
        const previousStock = updatedProducts[existingProductIndex].stock;
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          stock: updatedProducts[existingProductIndex].stock + newProduct.quantity,
          // Actualizar departamento si se proporcionó
          department: newProduct.department || updatedProducts[existingProductIndex].department,
          // Actualizar orderNumber si se proporcionó
          orderNumber: newProduct.orderNumber || updatedProducts[existingProductIndex].orderNumber
        };
        
        // NO registrar movimiento en el historial de stock al añadir desde pedidos
      } else {
        // Si no existe, crear nuevo producto
        const newProductData: Product = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: newProduct.productName,
          sku: `SKU-${Date.now().toString().slice(-6)}`,
          category: newProduct.category,
          company: newProduct.company,
          department: newProduct.department,
          supplierId: supplierId,
          warehouse: newProduct.warehouse,
          price: newProduct.price,
          stock: newProduct.quantity,
          // No establecer minStock, será undefined (opcional)
          description: "",
          hasSerialNumber: newProduct.hasSerialNumber || false,
          orderNumber: newProduct.orderNumber // Agregado orderNumber
        };
        updatedProducts.push(newProductData);
        
        // NO registrar movimiento en el historial de stock al añadir desde pedidos
      }
    });
    
    setProducts(updatedProducts);
  };

  // Mostrar pantalla de carga mientras se cargan los datos iniciales
  if (isLoadingData) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f9fafb]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-[#111827] mb-2">Cargando datos desde la nube</h2>
          <p className="text-[#6b7280]">Sincronizando inventario...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar pantalla de login o registro
  if (!isAuthenticated) {
    if (authView === "login") {
      return (
        <LoginView
          onLogin={handleLogin}
          onSwitchToRegister={() => setAuthView("register")}
        />
      );
    } else {
      return (
        <RegisterView
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthView("login")}
        />
      );
    }
  }

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      {!isSidebarCollapsed && (
        isAccountingUser ? (
          <AccountingSidebar 
            activeView={activeView} 
            onViewChange={setActiveView}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            currentUser={currentUser}
            onLogout={handleLogout}
            onToggleCollapse={() => setIsSidebarCollapsed(true)}
            isAdmin={isAdmin}
            onSwitchToNormal={handleSwitchToNormal}
            sidebarPosition={sidebarPosition}
            onSidebarPositionChange={handleSidebarPositionChange}
            userRole={userRole}
          />
        ) : (
          <Sidebar 
            activeView={activeView} 
            onViewChange={setActiveView}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            currentUser={currentUser}
            onLogout={handleLogout}
            onToggleCollapse={() => setIsSidebarCollapsed(true)}
            isAdmin={isAdmin}
            onSwitchToAccounting={handleSwitchToAccounting}
            sidebarPosition={sidebarPosition}
            onSidebarPositionChange={handleSidebarPositionChange}
            userRole={userRole}
          />
        )
      )}
      
      <main className="flex-1 overflow-y-auto relative">
        {/* Toggle Sidebar Button (Desktop - shown when collapsed) */}
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="hidden lg:flex fixed top-4 left-4 z-40 items-center justify-center w-10 h-10 bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6] transition-colors shadow-sm"
            title="Mostrar menú"
          >
            <PanelLeft className="w-5 h-5 text-[#374151]" />
          </button>
        )}
        
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#e5e7eb] px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-[#374151]" />
            </button>
            <h1 className="font-semibold text-[#111827]">
              {isAccountingUser ? "Sistema Contabilidad" : "Sistema de Inventario"}
            </h1>
            <SyncIndicator />
          </div>
        </div>

        {/* Barra de carga de permisos (top progress bar) */}
        {!permissionsLoaded && (
          <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-blue-100 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: "40%", animation: "permissions-loading 1.4s ease-in-out infinite" }}
            />
          </div>
        )}
        
        {/* Vistas del Sistema de Contabilidad */}
        {activeView === "accounting-dashboard" && renderProtected("accounting-dashboard",
          <AccountingDashboard 
            products={products.filter(p => p.id.startsWith('acc-'))} 
            orders={orders.filter(o => o.id.startsWith('ord-'))} 
          />
        )}
        {activeView === "purchases-inventory" && renderProtected("purchases-inventory",
          <PurchasesInventoryView 
            orders={orders} 
            suppliers={suppliers} 
            onAddProduct={handleAddPurchaseProduct}
            onEditProduct={handleEditPurchaseProduct}
            onDeleteProduct={handleDeletePurchaseProduct}
            userRole={userRole}
          />
        )}
        {activeView === "sales-inventory" && renderProtected("sales-inventory",
          <SalesInventoryView 
            products={products} 
            productUnits={productUnits} 
            onAddProduct={handleAddSalesProduct}
            onEditProduct={handleEditSalesProduct}
            onDeleteProduct={handleDeleteSalesProduct}
            clients={clients}
            userRole={userRole}
          />
        )}
        {activeView === "accounting-settings" && (
          <AccountingSettingsView 
            totalProducts={products.length}
            totalPurchases={orders.filter(o => o.status === "recibido").length}
            totalSales={products.reduce((sum, p) => sum + p.stock, 0)}
          />
        )}
        {activeView === "accounting-help" && renderProtected("accounting-help",
          <AccountingHelpView />
        )}
        
        {/* Vistas del Sistema Normal */}
        {activeView === "dashboard" && renderProtected("dashboard", <Dashboard products={products} />)}
        {activeView === "inventory" && renderProtected("inventory",
          <InventoryView
            products={products}
            onAddProduct={handleAddProduct}
            onImportProduct={handleImportProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            categories={categories}
            suppliers={suppliers}
            productUnits={productUnits}
            onAddUnit={handleAddUnit}
            onBulkAddUnits={handleBulkAddUnits}
            onUpdateUnit={handleUpdateUnit}
            onBulkMoveUnits={handleBulkMoveUnits}
            onDeleteUnit={handleDeleteUnit}
            employees={employees}
            initialSelectedProductId={selectedProductIdFromHistory}
            onClearSelectedProductId={() => setSelectedProductIdFromHistory(undefined)}
            previousView={previousView}
            onNavigateBack={() => {
              if (previousView) {
                setActiveView(previousView);
                setPreviousView(undefined);
                setSelectedProductIdFromHistory(undefined);
              }
            }}
            stockMovements={stockMovements}
            stockHistory={stockHistory}
            onStockAdjustment={handleStockAdjustment}
            userRole={userRole}
            orders={orders}
          />
        )}
        
        {/* Vistas Compartidas */}
        {activeView === "categories" && renderProtected("categories",
          <CategoriesView 
            products={products}
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            isAccountingUser={isAccountingUser}
          />
        )}

        {activeView === "suppliers" && renderProtected("suppliers",
          <SupplierView 
            suppliers={suppliers}
            products={products}
            onAddSupplier={handleAddSupplier}
            onUpdateSupplier={handleUpdateSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            userRole={userRole}
          />
        )}
        {activeView === "clients" && renderProtected("clients",
          <ClientView 
            clients={clients}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        )}
        {activeView === "departments" && renderProtected("departments",
          <DepartmentsView 
            employees={employees}
            departments={departments}
            onAddDepartment={handleAddDepartment}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}
        {activeView === "role-management" && renderProtected("role-management",
          <RoleManagementView 
            key="role-management" 
            onLogout={handleLogout}
          />
        )}
        {activeView === "users-management" && isAdmin && (
          <UsersManagementView 
            users={users}
            onDeleteUser={handleDeleteUser}
            onUpdateUser={handleUpdateUser}
          />
        )}
        
        {/* Vistas Solo para Sistema Normal */}
        {!isAccountingUser && (
          <>
            {activeView === "reports" && renderProtected("reports", <ReportsView products={products} />)}
            {activeView === "help" && renderProtected("help", <HelpView />)}
            {activeView === "order-history" && renderProtected("order-history",
              <OrderHistory 
                orders={orders} 
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onAddProductsToInventory={handleAddProductsToInventory}
                categories={categories}
                onAddCategory={handleAddCategory}
                suppliers={suppliers}
                onAddPendingStock={handleAddPendingStock}
              />
            )}
            {activeView === "order-generator" && renderProtected("order-generator",
              <OrderGenerator 
                suppliers={suppliers} 
                onAddOrder={handleAddOrder}
              />
            )}
            {activeView === "qr-scanner" && renderProtected("qr-scanner",
              <QRScannerView 
                products={products}
                onProductFound={handleQRProductFound}
              />
            )}
            {activeView === "product-modal" && (
              <ProductModal 
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                categories={categories}
                suppliers={suppliers}
              />
            )}
            {showQrProductModal && qrProductToEdit && (
              <ProductModal 
                product={qrProductToEdit}
                onClose={() => {
                  setShowQrProductModal(false);
                  setQrProductToEdit(null);
                }}
                onSave={(productData) => {
                  handleUpdateProduct(qrProductToEdit.id, productData);
                  setShowQrProductModal(false);
                  setQrProductToEdit(null);
                }}
                categories={categories}
                suppliers={suppliers}
              />
            )}
            {activeView === "trash" && renderProtected("trash",
              <TrashView 
                deletedProducts={deletedProducts}
                productUnits={productUnits}
                products={products}
                onRestoreProduct={handleRestoreProduct}
                onPermanentDelete={handlePermanentDelete}
                onEmptyTrash={handleEmptyTrash}
                onRestoreUnit={handleRestoreUnit}
                onPermanentDeleteUnit={handlePermanentDeleteUnit}
              />
            )}
            {activeView === "stock-variation" && renderProtected("stock-variation",
              <StockVariationView 
                products={products.filter(p => !p.deletedAt)} 
                productUnits={productUnits}
                onStockAdjustment={handleStockAdjustment}
                onNavigateToUnitInventory={(productId) => {
                    setPreviousView("stock-variation");
                    setSelectedProductIdFromHistory(productId);
                    setActiveView("inventory");
                }}
              />
            )}
            {activeView === "stock-history" && renderProtected("stock-history",
              <StockHistoryView 
                stockHistory={stockHistory}
                onViewProductUnits={(productId) => {
                  setPreviousView("stock-history");
                  setSelectedProductIdFromHistory(productId);
                  setActiveView("inventory");
                }}
              />
            )}
            {activeView === "pending-stock-history" && renderProtected("pending-stock-history",
              <PendingStockHistory 
                pendingStocks={pendingStocks}
                onUpdatePendingStock={handleUpdatePendingStock}
                onAddProductsToInventory={handleAddProductsFromPendingStock}
              />
            )}
          </>
        )}
      </main>
      <Toaster />
    </div>
  );
}

// Función para enviar notificaciones de stock bajo
function sendLowStockNotification(productName: string, email: string) {
  // Simulación de envío de correo electrónico
  // En producción, esto llamaría a un API backend que enviaría el correo real
  
  const emailSubject = "Alerta: Stock Bajo";
  const emailBody = `Este producto ${productName} tiene el stock bajo.`;
  
  console.log(`
  ====================================
  📧 NOTIFICACIÓN DE STOCK BAJO
  ====================================
  Para: ${email}
  Asunto: ${emailSubject}
  Mensaje: ${emailBody}
  ====================================
  `);
  
  // Mostrar notificación visual al usuario
  alert(`✅ Notificación enviada a ${email}\n\nAsunto: ${emailSubject}\nMensaje: ${emailBody}`);
}