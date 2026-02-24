import { useState } from "react";
import { X, Plus, AlertCircle, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CreateInventoryYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateYear: (year: string) => void;
  existingYears: string[];
  inventoryType: "compras" | "ventas";
}

export function CreateInventoryYearModal({ 
  isOpen, 
  onClose, 
  onCreateYear, 
  existingYears,
  inventoryType 
}: CreateInventoryYearModalProps) {
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  const validateYear = (inputYear: string): boolean => {
    // Validar que sea un año de 4 dígitos
    const yearRegex = /^\d{4}$/;
    if (!yearRegex.test(inputYear)) {
      setError("El año debe tener 4 dígitos");
      return false;
    }

    const yearNum = parseInt(inputYear);
    const currentYear = new Date().getFullYear();

    // Validar rango razonable (1900 - año actual + 10)
    if (yearNum < 1900 || yearNum > currentYear + 10) {
      setError(`El año debe estar entre 1900 y ${currentYear + 10}`);
      return false;
    }

    // Validar que no exista ya
    if (existingYears.includes(inputYear)) {
      setError("Este año de inventario ya existe");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!year.trim()) {
      setError("El año es obligatorio");
      return;
    }

    if (validateYear(year)) {
      onCreateYear(year);
      setYear("");
      setError("");
      onClose();
    }
  };

  const handleClose = () => {
    setYear("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3b82f6]/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#111827]">
                Crear Nuevo Inventario
              </h2>
              <p className="text-sm text-[#6b7280]">
                Inventario de {inventoryType === "compras" ? "Compras" : "Ventas"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#6b7280] hover:text-[#111827] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Año del Inventario *
            </label>
            <Input
              type="text"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setError("");
              }}
              placeholder="Ej: 2026"
              maxLength={4}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          {/* Años existentes */}
          {existingYears.length > 0 && (
            <div className="mb-4 p-3 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
              <p className="text-xs font-medium text-[#6b7280] mb-2">
                Años de inventario existentes:
              </p>
              <div className="flex flex-wrap gap-2">
                {existingYears.map((existingYear) => (
                  <span
                    key={existingYear}
                    className="px-2 py-1 bg-white border border-[#e5e7eb] rounded text-xs text-[#374151]"
                  >
                    {existingYear}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mb-6 p-4 bg-[#eff6ff] border border-[#3b82f6]/20 rounded-lg">
            <p className="text-sm text-[#1e40af]">
              Se creará un nuevo inventario de {inventoryType === "compras" ? "compras" : "ventas"} para el año especificado. 
              Este inventario estará vacío hasta que añadas productos.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Inventario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
