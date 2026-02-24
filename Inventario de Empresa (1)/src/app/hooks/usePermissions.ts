import { useState, useEffect, useCallback } from "react";
import {
  preloadPermissions,
  hasModuleAccessSync,
  hasCrudPermissionSync,
  hasFeatureAccessSync,
  hasDataAccessSync,
} from "../utils/permissions";

/**
 * Hook para gestión de permisos en componentes React.
 * Carga los permisos de forma asíncrona y expone funciones síncronas para verificarlos.
 */
export function usePermissions(userRole?: string) {
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    await preloadPermissions();
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();

    const handlePermissionsUpdated = () => {
      setLoaded(false);
      load();
    };
    window.addEventListener("permissions-updated", handlePermissionsUpdated);
    return () => window.removeEventListener("permissions-updated", handlePermissionsUpdated);
  }, [load]);

  // Recargar cuando cambia el rol
  useEffect(() => {
    if (userRole) load();
  }, [userRole, load]);

  const canAccessModule = useCallback(
    (moduleName: string): boolean => {
      if (!loaded || !userRole) return false;
      return hasModuleAccessSync(userRole, moduleName);
    },
    [loaded, userRole]
  );

  const canUseCrud = useCallback(
    (operation: string): boolean => {
      if (!loaded || !userRole) return false;
      return hasCrudPermissionSync(userRole, operation);
    },
    [loaded, userRole]
  );

  const canUseFeature = useCallback(
    (featureName: string): boolean => {
      if (!loaded || !userRole) return false;
      return hasFeatureAccessSync(userRole, featureName);
    },
    [loaded, userRole]
  );

  const canAccessData = useCallback(
    (dataName: string): boolean => {
      if (!loaded || !userRole) return false;
      return hasDataAccessSync(userRole, dataName);
    },
    [loaded, userRole]
  );

  return {
    loaded,
    canAccessModule,
    canUseCrud,
    canUseFeature,
    canAccessData,
  };
}
