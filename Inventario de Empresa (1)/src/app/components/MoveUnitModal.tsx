import { useState } from "react";
import { X, MapPin, MoveRight, User } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

interface MoveUnitModalProps {
  currentLocation: string;
  onClose: () => void;
  onMove: (newLocation: string, employeeId: string, employeeName: string) => void;
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

export function MoveUnitModal({ currentLocation, onClose, onMove, employees }: MoveUnitModalProps) {
  const [newLocation, setNewLocation] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleMove = () => {
    if (!newLocation) {
      alert("Por favor selecciona una localización");
      return;
    }
    if (!selectedEmployeeId) {
      alert("Por favor selecciona el empleado que realizará el movimiento");
      return;
    }
    if (newLocation === currentLocation) {
      alert("La localización seleccionada es la misma que la actual");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    const employee = employees.find(e => e.id === selectedEmployeeId);
    if (employee) {
      onMove(newLocation, employee.id, employee.name);
    }
    setShowConfirmation(false);
    onClose();
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              ¿Estás seguro?
            </h3>
            <p className="text-sm text-[#6b7280] mb-4">
              Se moverá la unidad de <span className="font-semibold text-[#111827]">{currentLocation}</span> a{" "}
              <span className="font-semibold text-[#111827]">{newLocation}</span>.
            </p>

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

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors text-sm md:text-base"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors text-sm md:text-base"
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#e5e7eb]">
          <h3 className="text-lg md:text-xl font-semibold text-[#111827]">
            Mover Unidad
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6b7280]" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6b7280]" />
                Localización Actual
              </div>
            </label>
            <input
              type="text"
              value={currentLocation}
              disabled
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg bg-[#f9fafb] text-[#6b7280] cursor-not-allowed text-sm md:text-base"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              <div className="flex items-center gap-2">
                <MoveRight className="w-4 h-4 text-[#6b7280]" />
                Nueva Localización *
              </div>
            </label>
            <select
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="">Seleccionar localización</option>
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
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
            >
              <option value="">Seleccionar empleado</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.department}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors text-sm md:text-base"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleMove}
              className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors text-sm md:text-base"
            >
              Mover Unidad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}