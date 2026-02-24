import { Mail, Phone, MessageSquare, FileText, HelpCircle } from "lucide-react";
import { Card } from "./ui/card";

export function AccountingHelpView() {
  const contactEmail = "soporte@centromaster.com";
  const contactPhone = "+34 928 123 456";

  const helpTopics = [
    {
      title: "Gestión de Inventario de Compras",
      description: "Aprende a registrar y gestionar las compras de la empresa",
      icon: FileText,
    },
    {
      title: "Gestión de Inventario de Ventas",
      description: "Administra el inventario de ventas y su facturación",
      icon: FileText,
    },
    {
      title: "Categorías de Contabilidad",
      description: "Organiza los productos según categorías contables",
      icon: FileText,
    },
    {
      title: "Gestión de Proveedores",
      description: "Administra la información de los proveedores",
      icon: FileText,
    },
    {
      title: "Panel de Control",
      description: "Visualiza métricas clave del inventario",
      icon: FileText,
    },
    {
      title: "Exportación de Datos",
      description: "Exporta información a CSV para análisis",
      icon: FileText,
    },
  ];

  const faqs = [
    {
      question: "¿Cómo añado un nuevo producto en el Inventario de Compras?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Accede a <strong>Inventario de Compras</strong></li>
          <li>Selecciona el año correspondiente (actualmente 2026)</li>
          <li>Haz clic en <strong>'Añadir Producto'</strong></li>
          <li>Completa los campos obligatorios:
            <ul className="list-circle pl-5 mt-1">
              <li>Descripción del producto</li>
              <li>Categoría (Manuales, Material Didáctico, Material Finca Agrícola, Uniformes Personal, Menaje u Otro Material)</li>
              <li>Empresa (AMS, CEM, RUGH o SADAF)</li>
              <li>Proveedor</li>
              <li>Nº Factura</li>
              <li>Fecha Factura</li>
              <li>Cantidad</li>
              <li>Precio Unitario</li>
              <li>Descuento (%)</li>
            </ul>
          </li>
          <li>El Precio Total y Fecha de Creación se generan automáticamente</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo registro un producto en el Inventario de Ventas?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Ve a <strong>Inventario de Ventas</strong></li>
          <li>Selecciona el año correspondiente</li>
          <li>Haz clic en <strong>'Añadir Producto'</strong></li>
          <li>Introduce los siguientes datos:
            <ul className="list-circle pl-5 mt-1">
              <li>Descripción del artículo vendido</li>
              <li>Categoría contable</li>
              <li>Empresa que realiza la venta</li>
              <li>Cliente que compra (obligatorio)</li>
              <li>Nº Factura de venta</li>
              <li>Fecha de Factura</li>
              <li>Cantidad vendida</li>
              <li>Precio Unitario de venta</li>
              <li>Descuento aplicado</li>
            </ul>
          </li>
          <li>El sistema calculará automáticamente el precio total y registrará la fecha de creación</li>
        </ul>
      ),
    },
    {
      question: "¿Qué categorías contables están disponibles y para qué sirven?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Las categorías disponibles son específicas para contabilidad:</li>
          <li><strong>Manuales:</strong> manuales de autoescuela y formación</li>
          <li><strong>Material Didáctico:</strong> cuadernos de test, material educativo</li>
          <li><strong>Material Finca Agrícola:</strong> herramientas y equipos agrícolas</li>
          <li><strong>Uniformes Personal:</strong> uniformes y ropa laboral</li>
          <li><strong>Menaje:</strong> vajillas, utensilios, mobiliario</li>
          <li><strong>Otro Material:</strong> extintores, señalización, etc.</li>
          <li>Estas categorías permiten clasificación precisa para reporting contable y fiscal</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo funciona la división de inventarios por años?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Tanto Inventario de Compras como Inventario de Ventas están organizados por años fiscales</li>
          <li>Al acceder a cualquiera, primero seleccionas el año (actualmente 2026)</li>
          <li>Esto permite mantener registros históricos separados por ejercicio fiscal</li>
          <li>Puedes crear nuevos inventarios para años futuros mediante el botón <strong>'Crear Nuevo Inventario'</strong></li>
          <li>Útil para planificación anticipada o cierre de ejercicios</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo veo el total acumulado de compras o ventas?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>En la parte inferior de las tablas de Inventario de Compras e Inventario de Ventas encontrarás una fila de sumatorio automático</li>
          <li>Muestra:
            <ul className="list-circle pl-5 mt-1">
              <li>Cantidad total de artículos registrados</li>
              <li>Precio total acumulado de todos los productos listados</li>
            </ul>
          </li>
          <li>Este sumatorio se actualiza en tiempo real al filtrar o modificar datos</li>
          <li>Proporciona totales exactos de los registros visibles</li>
        </ul>
      ),
    },
    {
      question: "¿Puedo exportar los datos del inventario para análisis?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Sí, cada inventario (Compras y Ventas) tiene un botón de configuración (⚙️)</li>
          <li>Al hacer clic, puedes seleccionar <strong>'Exportar inventario'</strong></li>
          <li>Se descarga un archivo Excel con todos los datos filtrados actualmente visibles</li>
          <li>El archivo incluye todas las columnas:
            <ul className="list-circle pl-5 mt-1">
              <li>Descripción, Categoría, Empresa</li>
              <li>Nº Factura, Fecha</li>
              <li>Cantidad, Precios, Descuento</li>
              <li>Fecha Creación</li>
            </ul>
          </li>
          <li>Puede abrirse en Excel, Google Sheets u otras herramientas de análisis</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo utilizo los filtros en el inventario?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Encima de la tabla encontrarás múltiples filtros:</li>
          <li><strong>Barra de búsqueda:</strong> busca en descripción y nº de factura</li>
          <li><strong>Filtro de Empresa:</strong> AMS, CEM, RUGH, SADAF</li>
          <li><strong>Filtro de Categoría:</strong> según categorías contables</li>
          <li><strong>Filtros de fecha:</strong> fecha inicio y fecha fin</li>
          <li>Los filtros se aplican inmediatamente al seleccionar</li>
          <li>Se pueden combinar múltiples filtros</li>
          <li>El sumatorio de la tabla se recalcula automáticamente mostrando solo los totales de los productos filtrados</li>
        </ul>
      ),
    },
    {
      question: "¿Qué métricas muestra el Panel de Control de contabilidad?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>El Panel de Control muestra cuatro métricas principales en tiempo real:</li>
          <li><strong>Valor Total del Inventario:</strong> suma del valor de todos los productos en stock</li>
          <li><strong>Total de Productos registrados:</strong> cantidad de artículos diferentes</li>
          <li><strong>Total de Ventas realizadas:</strong> número de transacciones de venta</li>
          <li><strong>Total de Compras efectuadas:</strong> número de pedidos de compra recibidos</li>
          <li>Estas métricas se actualizan automáticamente al modificar cualquier inventario</li>
        </ul>
      ),
    },
    {
      question: "¿Qué información completa se registra por cada producto?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Cada producto incluye 10 campos de información:</li>
          <li><strong>Descripción</strong> detallada del artículo</li>
          <li><strong>Categoría</strong> contable asignada</li>
          <li><strong>Empresa</strong> responsable (AMS/CEM/RUGH/SADAF)</li>
          <li><strong>Proveedor o Cliente</strong> según el tipo de inventario</li>
          <li><strong>Número de Factura</strong> (trazabilidad fiscal)</li>
          <li><strong>Fecha de Factura</strong> (fecha real del documento)</li>
          <li><strong>Cantidad</strong> adquirida o vendida</li>
          <li><strong>Precio Unitario</strong></li>
          <li><strong>Precio Total</strong> (calculado automáticamente)</li>
          <li><strong>Descuento</strong> aplicado (porcentaje)</li>
          <li><strong>Fecha de Creación</strong> (timestamp automático)</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo gestiono la base de datos de proveedores?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>En la sección <strong>Proveedores</strong> (menú lateral) puedes añadir, editar o eliminar proveedores</li>
          <li>Registra:
            <ul className="list-circle pl-5 mt-1">
              <li>Nombre de la empresa proveedora</li>
              <li>Email de contacto comercial</li>
              <li>Teléfono directo</li>
              <li>Dirección completa (útil para correspondencia y fiscalidad)</li>
            </ul>
          </li>
          <li>Los proveedores se vinculan directamente a los productos del Inventario de Compras</li>
          <li>Mantiene trazabilidad completa y facilita la reconciliación con facturas</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo funciona la gestión de clientes?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>En la sección <strong>Clientes</strong> (menú lateral, con identidad visual verde) puedes gestionar tu base de clientes</li>
          <li>Similar a proveedores, registra:
            <ul className="list-circle pl-5 mt-1">
              <li>Nombre del cliente o empresa</li>
              <li>Email de contacto</li>
              <li>Teléfono</li>
              <li>Dirección fiscal</li>
            </ul>
          </li>
          <li>Los clientes se asignan obligatoriamente a cada producto en el Inventario de Ventas</li>
          <li>Permite seguimiento de ventas por cliente</li>
          <li>Generación de reportes de facturación por destinatario</li>
        </ul>
      ),
    },
    {
      question: "¿Qué empresas maneja el sistema de contabilidad?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>El sistema gestiona inventarios contables para cuatro empresas del grupo:</li>
          <li><strong>AMS</strong></li>
          <li><strong>CEM</strong></li>
          <li><strong>RUGH</strong></li>
          <li><strong>SADAF</strong></li>
          <li>Cada empresa mantiene sus propios registros de compras y ventas de forma completamente independiente</li>
          <li>Permite contabilidad separada por entidad</li>
          <li>Facilita el reporting individual por empresa y consolidado del grupo</li>
          <li>Cumplimiento de obligaciones fiscales específicas de cada una</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo edito o elimino un producto ya registrado?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>En la tabla del inventario, cada producto tiene botones de acción a la derecha:</li>
          <li><strong>Icono de lápiz</strong> para Editar (abre modal con todos los datos para modificación)</li>
          <li><strong>Icono de basura</strong> para Eliminar</li>
          <li>Al editar, puedes cambiar cualquier campo excepto las fechas automáticas</li>
          <li>Al eliminar, se solicita confirmación para evitar borrados accidentales</li>
          <li>Los cambios se reflejan inmediatamente en el sumatorio y en el Panel de Control</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo cambio entre el sistema de contabilidad y el sistema empresarial?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Si eres usuario contable (Maite, Berta) solo tendrás acceso al sistema de contabilidad</li>
          <li>Si eres administrador (Jorge), encontrarás en el menú lateral un botón <strong>'Volver al Sistema Normal'</strong> al final</li>
          <li>Al hacer clic, cambias al sistema empresarial completo</li>
          <li>Cada sistema mantiene sus propias categorías, inventarios y funcionalidades específicas</li>
          <li>La configuración del sidebar (posición izquierda/derecha) se mantiene entre ambos sistemas</li>
        </ul>
      ),
    },
    {
      question: "¿Dónde configuro las opciones del sistema de contabilidad?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Cada inventario tiene su propio botón de configuración (⚙️) en el header</li>
          <li>Desde ahí puedes acceder a:
            <ul className="list-circle pl-5 mt-1">
              <li>Exportar inventario a Excel</li>
              <li>Importar desde Excel</li>
              <li>Descargar plantilla de importación</li>
            </ul>
          </li>
          <li>También puedes gestionar preferencias de usuario</li>
          <li>Realizar copias de seguridad de la información contable</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo cambio la posición del menú lateral?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Al final del menú lateral de contabilidad encontrarás el botón <strong>'Cambiar Posición del Sidebar'</strong></li>
          <li>Al hacer clic, el menú se moverá de izquierda a derecha o viceversa según tu preferencia personal</li>
          <li>Esta configuración se guarda automáticamente en tu navegador local</li>
          <li>Permanecerá activa en futuras sesiones</li>
          <li>La preferencia es compartida entre el sistema empresarial y el de contabilidad</li>
        </ul>
      ),
    },
    {
      question: "¿Qué es el campo 'Cliente' en el Inventario de Ventas?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>El campo 'Cliente' es obligatorio en cada producto de venta</li>
          <li>Se selecciona de tu base de datos de clientes</li>
          <li>Permite identificar quién compró cada artículo</li>
          <li>Facilita:
            <ul className="list-circle pl-5 mt-1">
              <li>Seguimiento de ventas por cliente</li>
              <li>Generación de reportes de facturación individualizados</li>
              <li>Análisis de clientes más frecuentes</li>
              <li>Trazabilidad completa para auditorías</li>
            </ul>
          </li>
          <li>Debes tener al menos un cliente registrado antes de añadir productos de venta</li>
        </ul>
      ),
    },
    {
      question: "¿Puedo ver históricos de años anteriores?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Sí, el sistema mantiene todos los inventarios de años anteriores</li>
          <li>Al acceder a Inventario de Compras o Ventas, selecciona el año que deseas consultar del selector de años</li>
          <li>Los datos históricos se mantienen intactos y solo en modo lectura (salvo que sean del año actual)</li>
          <li>Esto permite:
            <ul className="list-circle pl-5 mt-1">
              <li>Consulta de ejercicios fiscales cerrados</li>
              <li>Comparativa año sobre año</li>
              <li>Auditorías de períodos pasados</li>
              <li>Conservación legal de registros contables</li>
            </ul>
          </li>
        </ul>
      ),
    },
    {
      question: "¿Cómo gestiono empleados del departamento de contabilidad?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>En la sección <strong>Empleados</strong> puedes gestionar todo el personal, incluyendo el equipo contable</li>
          <li>Los empleados contables (como Maite y Berta) tienen rol específico 'contable' que les da acceso exclusivo al sistema de contabilidad</li>
          <li>Registra:
            <ul className="list-circle pl-5 mt-1">
              <li>Nombre</li>
              <li>Departamento (Contabilidad)</li>
              <li>Posición (Contador, Asistente Contable, etc.)</li>
              <li>Email corporativo @centromaster.com</li>
              <li>Teléfono de contacto</li>
              <li>Rol asignado</li>
            </ul>
          </li>
          <li>Solo usuarios con rol 'contable' o 'administrador' acceden a este sistema</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo se calculan automáticamente los precios totales?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>El sistema calcula automáticamente el Precio Total usando la fórmula:</li>
          <li><strong>(Precio Unitario × Cantidad) - (Precio Unitario × Cantidad × Descuento / 100)</strong></li>
          <li>Ejemplo práctico:
            <ul className="list-circle pl-5 mt-1">
              <li>Si compras 100 unidades a 22.50€ con 10% descuento</li>
              <li>Cálculo: (22.50 × 100) - (2250 × 0.10) = 2250 - 225 = <strong>2025€</strong></li>
            </ul>
          </li>
          <li>Este cálculo se hace en tiempo real al introducir o modificar cualquiera de los valores (precio, cantidad o descuento)</li>
          <li>Evita errores manuales</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-semibold text-[#111827] mb-2">
          Ayuda y Soporte
        </h1>
        <p className="text-[#6b7280]">
          Encuentra respuestas a tus preguntas sobre el Sistema de Inventario de Contabilidad
        </p>
      </div>

      {/* Help Topics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#111827] mb-4">
          Temas de Ayuda
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {helpTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <Card 
                key={index} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-[#3b82f6] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-[#111827] mb-1">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-[#6b7280]">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-xl font-semibold text-[#111827] mb-4">
          Preguntas Frecuentes
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-[#3b82f6] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-[#111827] mb-2">
                    {faq.question}
                  </h3>
                  <div className="text-sm text-[#6b7280] leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}