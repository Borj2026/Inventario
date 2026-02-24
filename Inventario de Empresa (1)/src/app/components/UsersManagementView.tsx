import { useState, useEffect } from "react";
import { Users, Search, Plus, Settings, Trash2, X, Mail, Building2, Shield, Calendar, UserCog, Ban, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Label } from "./ui/label";

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

interface UsersManagementViewProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
  onUpdateUser: (userId: string, userData: Partial<User>) => void;
}

export function UsersManagementView({ users, onDeleteUser, onUpdateUser }: UsersManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const companies = ["AMS", "CEM", "RUGH", "SADAF"];
  const roles = ["usuario", "coordinador", "administrador", "contable"];

  // Filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompany === "all" || user.company === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  // Estadísticas
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const usersByCompany = companies.map((company) => ({
    company,
    count: users.filter((u) => u.company === company).length,
  }));

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      onDeleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    onUpdateUser(user.id, { isActive: !user.isActive });
  };
  
  const handleRoleClick = (user: User) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };
  
  const handleStatusClick = (user: User) => {
    setSelectedUser(user);
    setIsStatusModalOpen(true);
  };
  
  const handleChangeRole = (newRole: string) => {
    if (selectedUser) {
      onUpdateUser(selectedUser.id, { role: newRole });
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    }
  };
  
  const handleChangeStatus = (newStatus: boolean) => {
    if (selectedUser) {
      onUpdateUser(selectedUser.id, { isActive: newStatus });
      setIsStatusModalOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-[#3b82f6]" />
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#111827]">
                Gestión de Usuarios
              </h1>
              <p className="text-sm text-[#6b7280] mt-1">
                Administra las cuentas de acceso al sistema
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-[#6b7280]">Total Usuarios</p>
                <p className="text-2xl font-semibold text-[#111827]">{totalUsers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[#6b7280]">Activos</p>
                <p className="text-2xl font-semibold text-[#111827]">{activeUsers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-[#6b7280]">Inactivos</p>
                <p className="text-2xl font-semibold text-[#111827]">{inactiveUsers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-[#6b7280]">Empresas</p>
                <p className="text-2xl font-semibold text-[#111827]">{companies.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          >
            <option value="all">Todas las empresas</option>
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#e5e7eb]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-[#3b82f6] flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#111827]">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#6b7280]" />
                        <span className="text-sm text-[#6b7280]">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#6b7280]" />
                        <span className="text-sm text-[#111827]">{user.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#6b7280]" />
                        <span className="text-sm text-[#6b7280]">
                          {new Date(user.createdAt).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRoleClick(user)}
                          className="text-purple-600 hover:text-purple-700 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Cambiar Rol"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusClick(user)}
                          className={`p-2 hover:bg-opacity-10 rounded-lg transition-colors ${
                            user.isActive
                              ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                              : "text-green-600 hover:text-green-700 hover:bg-green-50"
                          }`}
                          title={user.isActive ? "Suspender Usuario" : "Activar Usuario"}
                        >
                          {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar Usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 mx-auto text-[#9ca3af] mb-3" />
                    <p className="text-[#6b7280]">No se encontraron usuarios</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#111827]">Confirmar Eliminación</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-[#6b7280] hover:text-[#111827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-[#6b7280] mb-4">
                ¿Estás seguro de que deseas eliminar la cuenta de usuario?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-[#111827] mb-1">
                  <strong>Usuario:</strong> {selectedUser.name}
                </p>
                <p className="text-sm text-[#6b7280] mb-1">
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p className="text-sm text-[#6b7280]">
                  <strong>Empresa:</strong> {selectedUser.company}
                </p>
              </div>
              <p className="text-sm text-red-600 mt-4">
                ⚠️ Esta acción no se puede deshacer. El usuario perderá el acceso al sistema.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-[#e5e7eb] text-[#111827] hover:bg-[#d1d5db]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
              >
                Eliminar Usuario
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal para Cambiar Rol */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#111827]">Cambiar Rol de Usuario</h2>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-[#6b7280] hover:text-[#111827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-[#111827] mb-1">
                  <strong>Usuario:</strong> {selectedUser.name}
                </p>
                <p className="text-sm text-[#6b7280] mb-1">
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p className="text-sm text-[#6b7280]">
                  <strong>Rol Actual:</strong> <span className="capitalize">{selectedUser.role}</span>
                </p>
              </div>
              <Label className="text-[#374151] mb-2 block">Selecciona el nuevo rol</Label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleChangeRole(role)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedUser.role === role
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{role}</span>
                      {selectedUser.role === role && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          Actual
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setIsRoleModalOpen(false)}
              className="w-full bg-[#e5e7eb] text-[#111827] hover:bg-[#d1d5db]"
            >
              Cancelar
            </Button>
          </Card>
        </div>
      )}

      {/* Modal para Cambiar Estado */}
      {isStatusModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#111827]">Cambiar Estado de Usuario</h2>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-[#6b7280] hover:text-[#111827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-[#111827] mb-1">
                  <strong>Usuario:</strong> {selectedUser.name}
                </p>
                <p className="text-sm text-[#6b7280] mb-1">
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p className="text-sm text-[#6b7280]">
                  <strong>Estado Actual:</strong>{" "}
                  <span className={selectedUser.isActive ? "text-green-600" : "text-red-600"}>
                    {selectedUser.isActive ? "Activo" : "Suspendido"}
                  </span>
                </p>
              </div>
              <p className="text-sm text-[#6b7280] mb-4">
                {selectedUser.isActive
                  ? "¿Deseas suspender este usuario? El usuario no podrá acceder al sistema."
                  : "¿Deseas activar este usuario? El usuario podrá acceder al sistema nuevamente."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsStatusModalOpen(false)}
                className="flex-1 bg-[#e5e7eb] text-[#111827] hover:bg-[#d1d5db]"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleChangeStatus(!selectedUser.isActive)}
                className={`flex-1 text-white ${
                  selectedUser.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {selectedUser.isActive ? "Suspender" : "Activar"}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}