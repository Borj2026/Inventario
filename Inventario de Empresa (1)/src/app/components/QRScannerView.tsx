import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QrCode, X, Camera, AlertCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  company: string;
  supplierId: string;
  warehouse: string;
  price: number;
  stock: number;
  minStock?: number;
  description: string;
  image?: string;
  manual?: string;
}

interface QRScannerViewProps {
  products: Product[];
  onProductFound: (product: Product) => void;
}

export function QRScannerView({ products, onProductFound }: QRScannerViewProps) {
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const handleScan = (result: any) => {
    if (result && result[0]?.rawValue) {
      const scannedCode = result[0].rawValue;
      
      // Evitar escaneos duplicados rápidos
      if (scannedCode === lastScanned) return;
      setLastScanned(scannedCode);

      // Buscar producto por SKU o ID
      const product = products.find(
        p => p.sku === scannedCode || p.id === scannedCode
      );

      if (product) {
        setError("");
        setScanning(false);
        onProductFound(product);
      } else {
        setError(`No se encontró ningún producto con el código: ${scannedCode}`);
      }
    }
  };

  const handleError = (error: any) => {
    console.error("Error al escanear:", error);
    
    // Determinar el tipo de error y mostrar mensaje apropiado
    let errorMessage = "Error al acceder a la cámara.";
    
    if (error?.name === "NotAllowedError" || error?.message?.includes("Permission denied")) {
      errorMessage = "Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.";
      setPermissionDenied(true);
    } else if (error?.name === "NotFoundError") {
      errorMessage = "No se encontró ninguna cámara en este dispositivo.";
    } else if (error?.name === "NotReadableError") {
      errorMessage = "La cámara está siendo utilizada por otra aplicación. Por favor, cierra otras aplicaciones que puedan estar usando la cámara.";
    } else if (error?.name === "OverconstrainedError") {
      errorMessage = "No se pudo acceder a la cámara con las configuraciones solicitadas.";
    } else if (error?.name === "TypeError") {
      errorMessage = "Error de configuración de la cámara. Por favor, recarga la página e intenta nuevamente.";
    }
    
    setError(errorMessage);
    setScanning(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">
          Lector de QR
        </h2>
        <p className="text-sm text-[#6b7280] mt-1">
          Escanea un código QR para abrir el producto
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
        {!scanning ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-[#eff6ff] rounded-full flex items-center justify-center">
              <QrCode className="w-12 h-12 text-[#3b82f6]" />
            </div>
            <h3 className="text-lg font-medium text-[#111827] mb-2">
              Escanear Código QR
            </h3>
            <p className="text-sm text-[#6b7280] mb-6 max-w-md mx-auto">
              Haz clic en el botón para activar la cámara y escanear un código QR
              asociado a un producto
            </p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-left">
                    <p className="text-sm text-red-800 font-medium mb-2">{error}</p>
                    
                    {permissionDenied && (
                      <div className="text-xs text-red-700 space-y-2 mt-3">
                        <p className="font-semibold">📱 Cómo permitir el acceso a la cámara:</p>
                        <div className="space-y-1">
                          <p><strong>En Chrome/Edge:</strong></p>
                          <p>• Haz clic en el icono del candado 🔒 en la barra de direcciones</p>
                          <p>• Selecciona "Configuración del sitio"</p>
                          <p>• Cambia "Cámara" a "Permitir"</p>
                          <p>• Recarga la página</p>
                        </div>
                        <div className="space-y-1 mt-2">
                          <p><strong>En Safari (iOS):</strong></p>
                          <p>• Ve a Configuración → Safari → Cámara</p>
                          <p>• Selecciona "Preguntar" o "Permitir"</p>
                        </div>
                        <div className="space-y-1 mt-2">
                          <p><strong>En Android:</strong></p>
                          <p>• Ve a Configuración → Aplicaciones</p>
                          <p>• Selecciona tu navegador</p>
                          <p>• Ve a Permisos → Cámara → Permitir</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={() => {
                setScanning(true);
                setError("");
                setPermissionDenied(false);
                setLastScanned("");
              }}
              className="px-6 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors inline-flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {error ? "Reintentar" : "Iniciar Escaneo"}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-[#111827]">
                Escaneando...
              </h3>
              <button
                onClick={() => {
                  setScanning(false);
                  setError("");
                }}
                className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#6b7280]" />
              </button>
            </div>

            <div className="relative bg-black rounded-lg overflow-hidden">
              <Scanner
                onScan={handleScan}
                onError={handleError}
                constraints={{
                  facingMode: "environment",
                }}
                styles={{
                  container: {
                    width: "100%",
                    paddingTop: "75%",
                    position: "relative",
                  },
                  video: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  },
                }}
              />
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="mt-4 p-4 bg-[#f9fafb] rounded-lg">
              <p className="text-sm text-[#6b7280]">
                <strong>Instrucciones:</strong> Coloca el código QR frente a la
                cámara. El escaneo se realizará automáticamente cuando el código
                sea detectado.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4">
        <h4 className="text-sm font-medium text-[#1e40af] mb-2">
          ℹ️ Información importante
        </h4>
        <ul className="text-sm text-[#1e3a8a] space-y-1">
          <li>• El código QR debe contener el SKU o ID del producto</li>
          <li>• Asegúrate de permitir el acceso a la cámara cuando se solicite</li>
          <li>
            • Una vez detectado el producto, se abrirá automáticamente en modo
            edición
          </li>
        </ul>
      </div>
    </div>
  );
}