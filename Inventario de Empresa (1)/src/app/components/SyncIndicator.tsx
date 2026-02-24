import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import * as api from "../utils/api";

interface SyncIndicatorProps {
  className?: string;
}

export function SyncIndicator({ className = "" }: SyncIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<"connected" | "syncing" | "error">("connected");
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    // Verificar conexión cada 30 segundos
    const checkConnection = async () => {
      try {
        setSyncStatus("syncing");
        await api.healthCheck();
        setSyncStatus("connected");
        setLastSync(new Date());
      } catch (error) {
        console.error("Error al verificar conexión:", error);
        setSyncStatus("error");
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (syncStatus) {
      case "connected":
        return "text-green-600";
      case "syncing":
        return "text-blue-600";
      case "error":
        return "text-red-600";
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case "connected":
        return <Cloud className="w-4 h-4" />;
      case "syncing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "error":
        return <CloudOff className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case "connected":
        return "Sincronizado";
      case "syncing":
        return "Sincronizando...";
      case "error":
        return "Sin conexión";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border shadow-sm ${className}`}
      title={`Última sincronización: ${formatTime(lastSync)}`}
    >
      <div className={getStatusColor()}>{getStatusIcon()}</div>
      <span className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</span>
    </div>
  );
}
