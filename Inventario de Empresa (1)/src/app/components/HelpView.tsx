import { Mail, Phone, FileText, HelpCircle, ExternalLink } from "lucide-react";
import { Card } from "./ui/card";

export function HelpView() {
  const contactEmail = "soporte@centromaster.com";
  const contactPhone = "+34 928 123 456";

  const helpTopics = [
    {
      title: "Gestión de Productos",
      description: "Aprende a crear, editar y eliminar productos del inventario",
      icon: FileText,
    },
    {
      title: "Sistema de Categorías",
      description: "Organiza tus productos con categorías personalizadas",
      icon: FileText,
    },
    {
      title: "Gestión de Proveedores",
      description: "Administra la información de tus proveedores",
      icon: FileText,
    },
    {
      title: "Reportes y Análisis",
      description: "Genera reportes visuales de tu inventario",
      icon: FileText,
    },
    {
      title: "Configuración del Sistema",
      description: "Personaliza la aplicación según tus necesidades",
      icon: FileText,
    },
    {
      title: "Gestión de Almacenes",
      description: "Controla el stock en diferentes ubicaciones",
      icon: FileText,
    },
  ];

  const faqs = [
    {
      question: "¿Cómo añado un nuevo producto al inventario?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Ve a la sección de <strong>Inventario → Todos los Productos</strong></li>
          <li>Haz clic en <strong>'Nuevo Producto'</strong></li>
          <li>Completa los campos obligatorios:
            <ul className="list-circle pl-5 mt-1">
              <li>Nombre del producto</li>
              <li>Categoría</li>
              <li>Empresa (AMS, CEM, RUGH o SADAF)</li>
              <li>Proveedor</li>
              <li>Almacén (Vecindario, San Fernando, Tenerife o Maestro Falla)</li>
              <li>Precio y descripción</li>
            </ul>
          </li>
          <li>Campos opcionales: SKU, stock mínimo, número de serie, URL de imagen y manual en PDF</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo funciona el sistema de unidades individuales con SKU y números de serie?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Cada producto puede tener múltiples unidades individuales</li>
          <li>Cada unidad tiene: SKU único, número de serie, localización específica y estado</li>
          <li>Estados disponibles: disponible, en uso, mantenimiento, fuera de uso</li>
          <li>Accede a las unidades haciendo clic en el icono de paquete junto a cada producto</li>
          <li>Permite un seguimiento granular de cada artículo individual</li>
        </ul>
      ),
    },
    {
      question: "¿C��mo registro movimientos de stock de las unidades?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Ve a <strong>Inventario → Todos los Productos</strong> → selecciona el producto → clic en icono de paquete</li>
          <li>Desde ahí puedes:
            <ul className="list-circle pl-5 mt-1">
              <li>Añadir nuevas unidades (localización, número de serie, SKU y estado)</li>
              <li>Mover unidades entre localizaciones (se registra automáticamente)</li>
              <li>Cambiar estado de unidades</li>
              <li>Eliminar unidades (se mueven a papelera)</li>
            </ul>
          </li>
          <li>Todos los movimientos se registran en 'Historial de Movimientos de Stock'</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo funciona la asignación de empleados a las unidades?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Al mover una unidad a una nueva localización, puedes asignar un empleado responsable</li>
          <li>Ve a la sección de empleados y selecciona uno de la lista</li>
          <li>El sistema registrará: quién realizó el movimiento, nombre y departamento</li>
          <li>Permite trazabilidad completa de todas las transferencias</li>
        </ul>
      ),
    },
    {
      question: "¿Qué información puedo ver en el Historial de Stock?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Ve a <strong>Inventario → Historial de Stock</strong></li>
          <li>Verás todos los movimientos: añadidos, retiradas, ajustes manuales y recepciones de pedidos</li>
          <li>Cada entrada muestra:
            <ul className="list-circle pl-5 mt-1">
              <li>Producto, SKU, acción realizada</li>
              <li>Stock anterior y nuevo, cantidad modificada</li>
              <li>Usuario responsable, fecha y hora</li>
              <li>Empresa, almacén, categoría y referencia</li>
            </ul>
          </li>
          <li>Puedes filtrar por fechas, tipo de acción, empresa y almacén</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo utilizo la sección de Variación de Stock?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Ve a <strong>Inventario → Variación de Stock</strong></li>
          <li>Selecciona el producto</li>
          <li>Elige si quieres añadir o retirar stock</li>
          <li>Indica la cantidad</li>
          <li>Proporciona un motivo</li>
          <li>Especifica detalles adicionales (ubicación, números de serie)</li>
          <li>El sistema registrará automáticamente el cambio en el historial con trazabilidad completa</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo gestiono los empleados y sus roles?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>En la sección <strong>Empleados</strong> puedes añadir, editar o eliminar personal</li>
          <li>Cada empleado tiene: nombre, departamento, posición, email (@centromaster.com), teléfono y rol</li>
          <li>Roles disponibles y sus permisos:
            <ul className="list-circle pl-5 mt-1">
              <li><strong>Usuario:</strong> acceso básico</li>
              <li><strong>Coordinador:</strong> gestiona inventario y operaciones</li>
              <li><strong>Administrador:</strong> acceso completo</li>
              <li><strong>Contable:</strong> accede al sistema de contabilidad</li>
            </ul>
          </li>
          <li>También puedes crear roles personalizados desde Gestión de Roles</li>
        </ul>
      ),
    },
    {
      question: "¿Qué son los departamentos y cómo funcionan?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Unidades organizativas: Secretaría, Contabilidad, Mantenimiento, Calidad, Informática y Marketing</li>
          <li>Cada departamento tiene una descripción de sus responsabilidades</li>
          <li>Los productos pueden asignarse a departamentos específicos</li>
          <li>Los empleados pertenecen a un departamento</li>
          <li>Facilita la gestión por áreas</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo funciona el sistema de pedidos completo?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Ve a <strong>Pedidos → Generador de Pedidos</strong></li>
          <li>Selecciona: proveedor, empresa y almacén</li>
          <li>Añade productos con cantidades y precios</li>
          <li>El sistema calcula el total automáticamente</li>
          <li>Genera un PDF descargable</li>
          <li>Los pedidos aparecen en 'Historial de Pedidos' donde puedes:
            <ul className="list-circle pl-5 mt-1">
              <li>Marcarlos como recibidos (añade stock automáticamente)</li>
              <li>Cancelarlos</li>
              <li>Ver detalles completos</li>
              <li>Consultar productos pendientes en 'Historial Stock Pendiente'</li>
            </ul>
          </li>
        </ul>
      ),
    },
    {
      question: "¿Qué pasa cuando marco un pedido como recibido?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>El sistema automáticamente:
            <ul className="list-circle pl-5 mt-1">
              <li>Incrementa el stock de los productos en el almacén especificado</li>
              <li>Registra la entrada en el Historial de Stock con acción 'pedido recibido'</li>
              <li>Actualiza el estado del pedido</li>
              <li>Crea automáticamente productos nuevos si no existen en inventario</li>
            </ul>
          </li>
          <li>Todo queda registrado para auditoría completa</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo funciona la Papelera?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Ve a <strong>Inventario → Papelera</strong></li>
          <li>Encuentras productos y unidades eliminadas</li>
          <li>Los elementos NO se borran permanentemente de inmediato</li>
          <li>Cada elemento muestra fecha y hora de eliminación</li>
          <li>Desde ahí puedes:
            <ul className="list-circle pl-5 mt-1">
              <li>Restaurar productos (vuelven al inventario con todos sus datos)</li>
              <li>Restaurar unidades individuales (recuperan su stock)</li>
              <li>Eliminar permanentemente</li>
              <li>Vaciar toda la papelera de una vez</li>
            </ul>
          </li>
        </ul>
      ),
    },
    {
      question: "¿Cómo gestiono categorías y sus notificaciones?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>En la sección <strong>Categorías</strong> puedes crear, editar o eliminar categorías personalizadas</li>
          <li>Cada categoría puede tener un email de notificación configurado</li>
          <li>Sistema de alertas automáticas:
            <ul className="list-circle pl-5 mt-1">
              <li>Cuando el stock de un producto baja del mínimo establecido</li>
              <li>El sistema envía automáticamente un correo al email configurado</li>
              <li>Alerta del stock bajo</li>
            </ul>
          </li>
          <li>Si eliminas una categoría, sus productos se reasignan a 'Sin Categoría'</li>
        </ul>
      ),
    },
    {
      question: "¿Qué reportes y análisis visuales puedo generar?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>En la sección <strong>Reportes</strong> encuentras gráficos interactivos en tiempo real:</li>
          <li>Tipos de gráficos disponibles:
            <ul className="list-circle pl-5 mt-1">
              <li>Distribución de productos por categoría (gráfico de pastel)</li>
              <li>Distribución por empresa (gráfico de barras)</li>
              <li>Distribución por almacén (gráfico de barras)</li>
              <li>Productos con stock bajo (tabla de alertas)</li>
              <li>Valor total del inventario por categoría</li>
            </ul>
          </li>
          <li>Todos los gráficos se actualizan automáticamente al modificar el inventario</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo exporto datos a Excel con filtros avanzados?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Ve a <strong>Configuración → Exportar a Excel</strong></li>
          <li>Selecciona qué exportar: productos (con todas sus unidades), pedidos, o ambos</li>
          <li>Aplica filtros avanzados:
            <ul className="list-circle pl-5 mt-1">
              <li>Por empresa</li>
              <li>Por almacén</li>
              <li>Por categoría</li>
              <li>Estado del pedido</li>
              <li>Rango de fechas</li>
            </ul>
          </li>
          <li>El archivo Excel incluye hojas separadas para cada tipo de dato con formato profesional</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo uso el lector QR en dispositivos móviles?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>El <strong>Lector QR</strong> aparece en el menú móvil</li>
          <li>Al acceder, activa la cámara de tu dispositivo</li>
          <li>Escanea el código QR del producto</li>
          <li>Ver instantáneamente:
            <ul className="list-circle pl-5 mt-1">
              <li>Nombre, SKU, categoría</li>
              <li>Empresa, proveedor, almacén</li>
              <li>Precio, stock actual</li>
              <li>Descripción completa</li>
              <li>Todas las unidades individuales</li>
            </ul>
          </li>
          <li>Desde la vista del escáner puedes editar directamente el producto</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo cambio la posición del menú lateral?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Al final del menú lateral encontrarás el botón <strong>'Cambiar Posición del Sidebar'</strong></li>
          <li>Al hacer clic, el menú se moverá de izquierda a derecha o viceversa</li>
          <li>La configuración se guarda automáticamente en tu navegador</li>
          <li>Se mantiene en futuras sesiones</li>
          <li>Funciona tanto en el sistema empresarial como en el de contabilidad</li>
        </ul>
      ),
    },
    {
      question: "¿Qué diferencia hay entre el sistema empresarial y el de contabilidad?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Sistema Empresarial:</strong>
            <ul className="list-circle pl-5 mt-1">
              <li>Gestiona inventarios físicos con productos</li>
              <li>Control de unidades, almacenes, pedidos</li>
              <li>Reportes y seguimiento granular</li>
            </ul>
          </li>
          <li><strong>Sistema de Contabilidad:</strong>
            <ul className="list-circle pl-5 mt-1">
              <li>Acceso exclusivo para usuarios contables (Maite, Berta)</li>
              <li>Gestiona inventarios de compras y ventas con facturas</li>
              <li>Categorías contables específicas (Manuales, Material Didáctico, Material Finca Agrícola, Uniformes Personal, Menaje, Otro Material)</li>
              <li>Gestión de clientes y proveedores para facturación</li>
            </ul>
          </li>
        </ul>
      ),
    },
    {
      question: "¿Cómo accedo al sistema de contabilidad?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Solo usuarios con rol 'contable' (Maite, Berta) o administradores (Jorge) pueden acceder</li>
          <li>Al iniciar sesión, selecciona <strong>'Sistema de Contabilidad'</strong></li>
          <li>Los administradores pueden alternar entre sistemas usando el botón en el menú lateral</li>
          <li>Cada sistema mantiene sus propias categorías, vistas y funcionalidades específicas</li>
        </ul>
      ),
    },
    {
      question: "¿Qué es el Historial de Movimientos de Stock?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Ve a <strong>Inventario → Historial de Movimientos de Stock</strong></li>
          <li>Ves todos los traslados de unidades individuales entre localizaciones</li>
          <li>Cada movimiento registra:
            <ul className="list-circle pl-5 mt-1">
              <li>Producto, SKU, número de serie</li>
              <li>Ubicación origen y destino</li>
              <li>Fecha y hora exacta</li>
              <li>Usuario responsable</li>
              <li>Empleado asignado (si aplica)</li>
            </ul>
          </li>
          <li>Permite trazabilidad completa de cada unidad durante toda su vida útil</li>
        </ul>
      ),
    },
    {
      question: "¿Cómo gestiono proveedores y su información?",
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>En la sección <strong>Proveedores</strong> puedes añadir, editar o eliminar proveedores</li>
          <li>Cada proveedor incluye:
            <ul className="list-circle pl-5 mt-1">
              <li>Nombre de la empresa</li>
              <li>Email de contacto</li>
              <li>Teléfono</li>
              <li>Dirección completa</li>
            </ul>
          </li>
          <li>Los proveedores se vinculan a productos y pedidos</li>
          <li>Mantiene trazabilidad completa de la cadena de suministro</li>
          <li>Puedes ver cuántos productos tiene asociados cada proveedor antes de eliminarlo</li>
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
          Encuentra respuestas a tus preguntas o contacta con nuestro equipo de soporte
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
                className="p-5 hover:shadow-md transition-all cursor-pointer hover:border-[#3b82f6]"
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-1" />
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
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#111827] mb-4">
          Preguntas Frecuentes
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-5">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-[#111827] mb-2">
                    {faq.question}
                  </h3>
                  <div className="text-sm text-[#6b7280]">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-[#6b7280]">
          Sistema de Gestión de Inventario - Versión 1.0.0
        </p>
        <p className="text-sm text-[#6b7280] mt-1">
          © 2026 Centro Master. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}