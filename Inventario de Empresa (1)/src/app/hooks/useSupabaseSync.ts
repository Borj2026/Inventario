import { useEffect, useState, useRef } from "react";
import * as api from "../utils/api";

interface SyncOptions {
  autoSync?: boolean;
  syncInterval?: number; // en milisegundos
}

export function useSupabaseSync<T>(
  key: string,
  initialValue: T,
  options: SyncOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, boolean, Error | null] {
  const { autoSync = true, syncInterval = 30000 } = options; // 30 segundos por defecto
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const pendingSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
    
    return () => {
      isMountedRef.current = false;
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }
    };
  }, [key]);

  // Auto-sincronización periódica
  useEffect(() => {
    if (!autoSync) return;

    const interval = setInterval(() => {
      loadData();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [key, autoSync, syncInterval]);

  const loadData = async () => {
    try {
      let result;
      
      // Determinar qué API llamar según la clave
      if (key.startsWith("products_")) {
        const company = key.split("_")[1];
        result = await api.getProducts(company);
      } else if (key.startsWith("categories_")) {
        const company = key.split("_")[1];
        result = await api.getCategories(company);
      } else if (key.startsWith("suppliers_")) {
        const company = key.split("_")[1];
        result = await api.getSuppliers(company);
      } else if (key.startsWith("warehouses_")) {
        const company = key.split("_")[1];
        result = await api.getWarehouses(company);
      } else if (key === "employees") {
        result = await api.getEmployees();
      } else if (key === "selectedCompany") {
        result = await api.getSelectedCompany();
      }

      if (isMountedRef.current && result !== undefined) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error(`Error cargando ${key}:`, err);
        setError(err as Error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const saveData = async (newData: T) => {
    try {
      // Determinar qué API llamar según la clave
      if (key.startsWith("products_")) {
        const company = key.split("_")[1];
        await api.saveProducts(company, newData as any);
      } else if (key.startsWith("categories_")) {
        const company = key.split("_")[1];
        await api.saveCategories(company, newData as any);
      } else if (key.startsWith("suppliers_")) {
        const company = key.split("_")[1];
        await api.saveSuppliers(company, newData as any);
      } else if (key.startsWith("warehouses_")) {
        const company = key.split("_")[1];
        await api.saveWarehouses(company, newData as any);
      } else if (key === "employees") {
        await api.saveEmployees(newData as any);
      } else if (key === "selectedCompany") {
        await api.saveSelectedCompany(newData as any);
      }

      setError(null);
    } catch (err) {
      console.error(`Error guardando ${key}:`, err);
      setError(err as Error);
      throw err;
    }
  };

  const updateData = (value: T | ((prev: T) => T)) => {
    setData((prev) => {
      const newValue = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
      
      // Debounce: guardar después de 500ms de inactividad
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }

      pendingSaveRef.current = setTimeout(() => {
        saveData(newValue);
      }, 500);

      return newValue;
    });
  };

  return [data, updateData, isLoading, error];
}

// Hook simplificado para datos por empresa
export function useCompanyData<T>(
  dataType: "products" | "categories" | "suppliers" | "warehouses",
  company: string,
  initialValue: T
) {
  return useSupabaseSync<T>(`${dataType}_${company}`, initialValue);
}
