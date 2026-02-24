import { useState } from "react";
import { X, MapPin, MoveRight, AlertCircle, User } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

interface BulkMoveUnitsModalProps {
  onClose: () => void;
  onBulkMove: (newLocation: string, employeeId: string, employeeName: string) => void;
  unitsCount: number;
  currentLocations: string[];
  employees: Employee[];
}

// Localizaciones disponibles
const LOCATIONS = [
  "AULA 1 – VC",
  "AULA 2 – VC",
  "AULA 3 – VC",
  "AULA 4 – VC",
  "AULA 5 – VC",
  "AULA 6 – VC",
  "AULA 7 – VC",
  "AULA 8 – VC",
  "AULA 9 – VC",
  "RESTAURANTE – VC",
  "PELUQUERÍA – VC",
  "ESTÉTICA – VC",
  "ANEXO – VC",
  "ALMACÉN – VC",
  "AULA 1 – MF",
  "AULA 2 – MF",
  "AULA 1 – SF",
  "AULA 4 – SF",
  "AULA 5 – SF",
  "AULA 6 – SF",
  "ALMACÉN – SF",
  "PELUQUERÍA - SF",
  "Aula 1 – TF",
  "Aula 2 – TF",
  "Aula 3 – TF",
  "Aula 4 – TF",
  "Aula 5 – TF",
  "Aula 6 – TF",
  "Aula 7 – TF",
  "Aula 8 – TF",
  "Aula 9 – TF",
  "Despacho 1 – TF",
  "Despacho 2 – TF",
  "Secretaría – TF",
  "Almacén – TF",
  "Archivos – TF",
];

export function BulkMoveUnitsModal({ onClose, onBulkMove, unitsCount, currentLocations, employees }: BulkMoveUnitsModalProps) {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      alert("Por favor selecciona una localización de destino");
      return;
    }

    if (!selectedEmployeeId) {
      alert("Por favor selecciona el empleado que realizará el movimiento");
      return;
    }

    // Mostrar pantalla de confirmación
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    const employee = employees.find(e => e.id === selectedEmployeeId);
    if (employee) {
      onBulkMove(selectedLocation, employee.id, employee.name);
    }
  };

  // Obtener localizaciones únicas
  const uniqueLocations = Array.from(new Set(currentLocations));
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-[#111827]">
                Confirmar Movimiento
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#6b7280] hover:text-[#111827] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-[#374151] mb-4">
              ¿Estás seguro de que deseas mover <span className="font-semibold text-[#111827]">{unitsCount} unidades</span> a la localización <span className="font-semibold text-[#111827]">{selectedLocation}</span>?
            </p>

            {uniqueLocations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-blue-900 mb-1">
                  Localizaciones actuales:
                </p>
                <ul className="text-xs text-blue-800 list-disc list-inside">
                  {uniqueLocations.map((loc) => (
                    <li key={loc}>{loc}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedEmployee && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-green-900 mb-1">
                  Empleado responsable:
                </p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-700" />
                  <span className="text-xs text-green-800 font-medium">{selectedEmployee.name}</span>
                  <span className="text-xs text-green-700">({selectedEmployee.department})</span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <MoveRight className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[#111827]">
              Mover {unitsCount} Unidades
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Vas a mover <span className="font-semibold">{unitsCount} unidades</span> seleccionadas a una nueva localización.
              </p>
            </div>
          </div>

          {uniqueLocations.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Localizaciones actuales:
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {uniqueLocations.map((loc) => (
                    <span key={loc} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                      <MapPin className="w-3 h-3" />
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6b7280]" />
                Nueva Localización *
              </div>
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              required
            >
              <option value="">Selecciona una localización</option>
              {LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#6b7280]" />
                Empleado Responsable *
              </div>
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-4 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              required
            >
              <option value="">Selecciona un empleado</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.department}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
            >
              Mover Unidades
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}