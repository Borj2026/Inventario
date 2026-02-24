import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as api from "../utils/api";

interface SyncButtonProps {
  onSyncComplete?: () => void;
  className?: string;
}

export function SyncButton({ onSyncComplete, className = "" }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      toast.info("Sincronizando con la nube...", {
        description: "Obteniendo datos actualizados",
      });
      
      // Obtener todos los datos actualizados
      await api.syncAll();
      
      toast.success("Sincronización completada", {
        description: "Todos los datos están actualizados",
      });
      
      // Recargar la página para aplicar los cambios
      if (onSyncComplete) {
        onSyncComplete();
      } else {
        // Si no hay callback, recargar la página
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error al sincronizar:", error);
      toast.error("Error en la sincronización", {
        description: "No se pudieron obtener los datos actualizados",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors ${className}`}
      title="Sincronizar datos con la nube"
    >
      <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
      <span className="hidden sm:inline">
        {isSyncing ? "Sincronizando..." : "Sincronizar"}
      </span>
    </button>
  );
}
