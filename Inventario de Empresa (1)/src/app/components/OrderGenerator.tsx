import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingCart, X, FileDown, FileSpreadsheet, Mail } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Supplier {
  id: string;
  name: string;
  cif: string;
  email: string;
  phone: string;
  address: string;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  supplier: string;
  company: string;
  warehouse: string;
  date: string;
  total: number;
  items: number;
  status: "efectuado" | "recibido" | "fungible";
  products: OrderItem[];
  pdfUrl?: string; // URL del PDF generado
}

interface OrderGeneratorProps {
  suppliers: Supplier[];
  onAddOrder: (order: Order) => void;
}

// Contador persistente para el número de pedido
let orderCounter = 2601;

// Datos de facturación por empresa
const companyBillingData: { [key: string]: { 
  fullName: string;
  cif: string;
  street: string;
  postalCode: string;
  municipality: string;
  phone: string;
}} = {
  "AMS": {
    fullName: "ANUSCHEH MISSAGHIAN SCHIRAZI S.L.",
    cif: "B76050731",
    street: "AVENIDA DE CANARIAS, 380 - 1ª PLANTA",
    postalCode: "35110",
    municipality: "VECINDARIO - SANTA LUCIA DE TIRAJANA",
    phone: "928755105"
  },
  "CEM": {
    fullName: "CENTRO DE ESTUDIOS MASTER ANUSCHEH DE CANARIAS, S.L.U.",
    cif: "B76004712",
    street: "AVENIDA DE GALDAR, 112 - EDIFICIO BUENAVISTA",
    postalCode: "35100",
    municipality: "MASPALOMAS - SAN BARTOLOME DE TIRAJANA",
    phone: "928755105"
  },
  "SADAF": {
    fullName: "SADAF CANARIAS S.L.",
    cif: "B35851989",
    street: "CALLE DORAMAS, 39",
    postalCode: "35110",
    municipality: "VECINDARIO - SANTA LUCIA DE TIRAJANA",
    phone: "928755105"
  },
  "RUGH": {
    fullName: "RUGH GESTIONES, S.L.U.",
    cif: "B76078906",
    street: "CALLE DORAMAS, 39, ATICO DERECHA",
    postalCode: "35110",
    municipality: "VECINDARIO - SANTA LUCIA DE TIRAJANA",
    phone: "928755105"
  }
};

export function OrderGenerator({ suppliers, onAddOrder }: OrderGeneratorProps) {
  const companies = ["AMS", "CEM", "RUGH", "SADAF"];
  const warehouses = ["Vecindario", "San Fernando", "Tenerife", "Maestro Falla"];

  // Generar fecha actual en formato dd/mm/yyyy
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [formData, setFormData] = useState({
    supplierId: "",
    supplierSearchText: "", // Nuevo campo para el texto de búsqueda
    company: "",
    warehouse: "",
    observations: "",
    cif: "",
    street: "",
    postalCode: "",
    municipality: "",
    phone: "",
  });

  const [orderDate] = useState(getCurrentDate());
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false); // Para mostrar/ocultar el desplegable
  const [isFungible, setIsFungible] = useState(false); // Estado para el checkbox "Pedido Fungible"

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: "1", productName: "", quantity: 0, price: 0 }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      productName: "",
      quantity: 0,
      price: 0,
    };
    setOrderItems([...orderItems, newItem]);
  };

  const removeOrderItem = (id: string) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter(item => item.id !== id));
    }
  };

  const updateOrderItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = (subtotal: number) => {
    return 0; // 0% de impuestos como en la imagen
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + calculateTax(subtotal);
  };

  const getWarehouseAddress = (warehouse: string) => {
    const addresses: { [key: string]: string } = {
      "Vecindario": "Almacén Vecindario\nAvda. de Canarias Nº 830\nVecindario CP. 35110",
      "San Fernando": "Almacén San Fernando\nCalle Principal\nSan Fernando CP. 35200",
      "Tenerife": "Almacén Tenerife\nAvda. Principal\nTenerife CP. 38001",
      "Maestro Falla": "Almacén Maestro Falla\nCalle Maestro Falla\nCP. 35100"
    };
    return addresses[warehouse] || warehouse;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const supplierName = suppliers.find(s => s.id === formData.supplierId)?.name || '';
    const companyFullName = companyBillingData[formData.company]?.fullName || formData.company;
    
    // Header - Empresa
    // Ajustar tamaño de letra si es CEM (nombre muy largo)
    if (formData.company === "CEM") {
      doc.setFontSize(9);
    } else {
      doc.setFontSize(12);
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246); // Azul
    doc.text(companyFullName, 20, 20);
    
    // Título PEDIDO
    doc.setFontSize(14);
    doc.text("PEDIDO", 150, 20);
    
    // Facturar a
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Facturar a:", 20, 35);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`CIF: ${formData.cif}`, 20, 42);
    doc.text(`${formData.street}`, 20, 48);
    doc.text(`Puerta DRC ${formData.municipality}`, 20, 54);
    doc.text(`CP. ${formData.postalCode} Santa Lucía de Tirajana`, 20, 60);
    doc.text(`Teléfono: ${formData.phone}`, 20, 66);
    
    // Entregar en
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Entregar en:", 120, 35);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const warehouseLines = getWarehouseAddress(formData.warehouse).split('\n');
    warehouseLines.forEach((line, index) => {
      doc.text(line, 120, 42 + (index * 6));
    });
    
    // Tabla de info: Proveedor, N° Pedido, Fecha
    doc.setFillColor(59, 130, 246);
    doc.rect(20, 70, 60, 8, 'F');
    doc.rect(80, 70, 60, 8, 'F');
    doc.rect(140, 70, 50, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("PROVEEDOR", 50, 75, { align: "center" });
    doc.text("N.º DE PEDIDO", 110, 75, { align: "center" });
    doc.text("FECHA", 165, 75, { align: "center" });
    
    doc.setFillColor(255, 255, 255);
    doc.rect(20, 78, 60, 8, 'F');
    doc.rect(80, 78, 60, 8, 'F');
    doc.rect(140, 78, 50, 8, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(supplierName, 50, 83, { align: "center" });
    doc.text(String(orderCounter), 110, 83, { align: "center" });
    doc.text(orderDate, 165, 83, { align: "center" });
    
    // Tabla de productos
    const tableData = orderItems.map(item => [
      item.productName,
      item.quantity.toString(),
      `${item.price.toFixed(2)}`,
      `${(item.quantity * item.price).toFixed(2)}`
    ]);
    
    // Agregar filas vacías para completar el diseño
    while (tableData.length < 12) {
      tableData.push(['-', '', '', '-']);
    }
    
    autoTable(doc, {
      startY: 90,
      head: [['DESCRIPCIÓN', 'CANT.', 'PRECIO UNITARIO', 'IMPORTE']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 30 }
      },
      didDrawPage: (data) => {
        // Nada especial aquí
      }
    });
    
    // Totales
    const finalY = (doc as any).lastAutoTable.finalY + 5;
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const total = calculateTotal();
    
    doc.setFillColor(173, 216, 230);
    doc.rect(140, finalY, 50, 25, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("SUBTOTAL", 145, finalY + 5);
    doc.text("TIPO IMPOSITIVO", 145, finalY + 10);
    doc.text("IMPUESTOS", 145, finalY + 15);
    doc.text("TOTAL", 145, finalY + 20);
    
    doc.setFont("helvetica", "normal");
    doc.text(`${subtotal.toFixed(2)} €`, 185, finalY + 5, { align: 'right' });
    doc.text("0%", 185, finalY + 10, { align: 'right' });
    doc.text(`${tax.toFixed(2)} €`, 185, finalY + 15, { align: 'right' });
    doc.setFont("helvetica", "bold");
    doc.text(`${total.toFixed(2)} €`, 185, finalY + 20, { align: 'right' });
    
    // Pie de página
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(59, 130, 246);
    doc.text("Gracias por su confianza", 105, finalY + 35, { align: "center" });
    
    // Observaciones
    if (formData.observations) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text("OBSERVACIONES:", 20, finalY + 45);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const splitObs = doc.splitTextToSize(formData.observations, 170);
      doc.text(splitObs, 20, finalY + 50);
    }
    
    return doc;
  };

  const downloadPDF = () => {
    const doc = generatePDF();
    doc.save(`Pedido_${orderCounter}.pdf`);
  };

  const downloadCSV = () => {
    const supplierName = suppliers.find(s => s.id === formData.supplierId)?.name || '';
    let csv = "PEDIDO\n";
    csv += `Número de Pedido,${orderCounter}\n`;
    csv += `Fecha,${orderDate}\n`;
    csv += `Proveedor,${supplierName}\n`;
    csv += `Empresa,${formData.company}\n`;
    csv += `Almacén,${formData.warehouse}\n\n`;
    csv += "FACTURAR A\n";
    csv += `CIF,${formData.cif}\n`;
    csv += `Dirección,${formData.street}\n`;
    csv += `Código Postal,${formData.postalCode}\n`;
    csv += `Municipio,${formData.municipality}\n`;
    csv += `Teléfono,${formData.phone}\n\n`;
    csv += "PRODUCTOS\n";
    csv += "Descripción,Cantidad,Precio Unitario,Importe\n";
    
    orderItems.forEach(item => {
      csv += `${item.productName},${item.quantity},${item.price.toFixed(2)},${(item.quantity * item.price).toFixed(2)}\n`;
    });
    
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const total = calculateTotal();
    
    csv += `\nSubtotal,,, ${subtotal.toFixed(2)}\n`;
    csv += `Tipo Impositivo,,,0%\n`;
    csv += `Impuestos,,,${tax.toFixed(2)}\n`;
    csv += `TOTAL,,,${total.toFixed(2)}\n`;
    
    if (formData.observations) {
      csv += `\nObservaciones,${formData.observations}\n`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Pedido_${orderCounter}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    const supplierName = suppliers.find(s => s.id === formData.supplierId)?.name || '';
    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      ["PEDIDO"],
      ["Número de Pedido", orderCounter],
      ["Fecha", orderDate],
      ["Proveedor", supplierName],
      ["Empresa", formData.company],
      ["Almacén", formData.warehouse],
      [],
      ["FACTURAR A"],
      ["CIF", formData.cif],
      ["Dirección", formData.street],
      ["Código Postal", formData.postalCode],
      ["Municipio", formData.municipality],
      ["Teléfono", formData.phone],
      [],
      ["PRODUCTOS"],
      ["Descripción", "Cantidad", "Precio Unitario", "Importe"]
    ];

    orderItems.forEach(item => {
      worksheetData.push([item.productName, item.quantity, item.price.toFixed(2), (item.quantity * item.price).toFixed(2)]);
    });

    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const total = calculateTotal();

    worksheetData.push([]);
    worksheetData.push(["Subtotal", "", "", subtotal.toFixed(2)]);
    worksheetData.push(["Tipo Impositivo", "", "", "0%"]);
    worksheetData.push(["Impuestos", "", "", tax.toFixed(2)]);
    worksheetData.push(["TOTAL", "", "", total.toFixed(2)]);

    if (formData.observations) {
      worksheetData.push([]);
      worksheetData.push(["Observaciones", formData.observations]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedido");
    XLSX.writeFile(workbook, `Pedido_${orderCounter}.xlsx`);
  };

  const sendByEmail = () => {
    if (!previewData) return;
    
    // Obtener el proveedor completo con su email usando el supplierId guardado en previewData
    const supplier = suppliers.find(s => s.id === previewData.supplierId);
    const supplierEmail = supplier?.email || '';
    const supplierName = previewData.supplierName;
    const subject = `Pedido ${previewData.orderNumber} - ${previewData.company}`;
    
    // Si no hay email, mostrar alerta
    if (!supplierEmail) {
      alert('El proveedor no tiene un email configurado.');
      return;
    }
    
    // Cuerpo del correo SIMPLIFICADO
    const bodyLines = [
      'Estimado/a proveedor,',
      '',
      `Le adjuntamos el pedido número ${previewData.orderNumber}.`,
      '',
      `Empresa: ${previewData.company}`,
      `Almacén: ${previewData.warehouse}`,
      `Fecha: ${previewData.orderDate}`,
      `Total: ${previewData.total.toFixed(2)}€`,
      '',
      'Por favor, descargue el PDF adjunto con todos los detalles.',
      '',
      'Atentamente,',
      previewData.company
    ];
    
    const bodyText = bodyLines.join('\n'); // Texto plano para copiar
    const bodyEncoded = bodyLines.join('%0D%0A'); // Codificado para mailto
    
    // Intentar abrir cliente de correo con window.open (más seguro)
    const mailtoLink = `mailto:${supplierEmail}?subject=${encodeURIComponent(subject)}&body=${bodyEncoded}`;
    
    try {
      // Usar window.open en lugar de link.click()
      const mailWindow = window.open(mailtoLink, '_self');
      
      // Si window.open falla (devuelve null), ofrecer alternativa
      if (mailWindow === null) {
        throw new Error('Bloqueado por el navegador');
      }
    } catch (error) {
      // Alternativa: Copiar al portapapeles
      const emailContent = `Para: ${supplierEmail}\nAsunto: ${subject}\n\n${bodyText}`;
      
      navigator.clipboard.writeText(emailContent).then(() => {
        alert(`No se pudo abrir el cliente de correo automáticamente.\n\n✅ Se ha copiado el contenido del email al portapapeles.\n\nPor favor, pega el contenido en tu cliente de correo manualmente.`);
      }).catch(() => {
        // Si también falla el portapapeles, mostrar la información
        alert(`No se pudo abrir el cliente de correo.\n\nPara: ${supplierEmail}\nAsunto: ${subject}\n\nPor favor, copia manualmente esta información y crea el email.`);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplierName = suppliers.find(s => s.id === formData.supplierId)?.name || '';
    const total = calculateTotal();
    
    // Guardar los datos pendientes y mostrar confirmación
    setPendingOrderData({
      supplierName,
      total,
      formData,
      orderItems
    });
    
    setShowConfirmation(true);
  };

  const confirmOrderGeneration = () => {
    if (!pendingOrderData) return;
    
    const supplierName = pendingOrderData.supplierName;
    const total = pendingOrderData.total;
    
    // Generar el PDF y obtener su URL
    const doc = generatePDF();
    const pdfUrl = doc.output('bloburl') as string;
    
    // Guardar datos para la previsualización
    setPreviewData({
      orderNumber: orderCounter,
      orderDate,
      supplierName,
      supplierId: formData.supplierId, // Guardar el ID del proveedor
      company: formData.company,
      warehouse: formData.warehouse,
      items: orderItems,
      formData,
      total,
      pdfUrl
    });
    
    // Guardar el pedido en el historial con el estado correcto
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: orderCounter.toString(),
      supplier: supplierName,
      company: formData.company,
      warehouse: formData.warehouse,
      date: orderDate,
      total: total,
      items: orderItems.length,
      status: isFungible ? "fungible" : "efectuado", // Usar el estado basado en el checkbox
      products: orderItems,
      pdfUrl: pdfUrl // Guardar la URL del PDF generado
    };
    
    onAddOrder(newOrder);
    
    // Cerrar confirmación y mostrar modal de previsualización
    setShowConfirmation(false);
    setPendingOrderData(null);
    setShowPreview(true);
    
    // Incrementar contador
    orderCounter++;
  };

  const closePreviewAndReset = () => {
    setShowPreview(false);
    setPreviewData(null);
    
    // Reset form
    setFormData({
      supplierId: "",
      supplierSearchText: "", // Resetear el texto de búsqueda
      company: "",
      warehouse: "",
      observations: "",
      cif: "",
      street: "",
      postalCode: "",
      municipality: "",
      phone: "",
    });
    setOrderItems([{ id: "1", productName: "", quantity: 0, price: 0 }]);
    setIsFungible(false); // Resetear el checkbox
  };

  const cancelOrder = () => {
    setShowConfirmation(false);
    setPendingOrderData(null);
  };

  // Autocompletar datos de facturación cuando se selecciona una empresa
  useEffect(() => {
    if (formData.company && companyBillingData[formData.company]) {
      const billingData = companyBillingData[formData.company];
      setFormData(prev => ({
        ...prev,
        cif: billingData.cif,
        street: billingData.street,
        postalCode: billingData.postalCode,
        municipality: billingData.municipality,
        phone: billingData.phone
      }));
    }
  }, [formData.company]);

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-[#111827]">Generador de Pedidos</h2>
          <p className="text-sm text-[#6b7280] mt-1">Crea un nuevo pedido a un proveedor</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 md:p-6 mb-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">Información del Pedido</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Proveedor *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="supplierSearchText"
                    value={formData.supplierSearchText}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
                    placeholder="Buscar proveedor"
                    onFocus={() => setShowSupplierDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSupplierDropdown(false), 200)}
                  />
                  {showSupplierDropdown && (
                    <div className="absolute left-0 right-0 top-full bg-white border border-[#d1d5db] rounded-b-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {suppliers
                        .filter(supplier => supplier.name.toLowerCase().includes(formData.supplierSearchText.toLowerCase()))
                        .sort((a, b) => {
                          // Ordenar: primero los que empiezan con el texto buscado
                          const aStartsWith = a.name.toLowerCase().startsWith(formData.supplierSearchText.toLowerCase());
                          const bStartsWith = b.name.toLowerCase().startsWith(formData.supplierSearchText.toLowerCase());
                          
                          if (aStartsWith && !bStartsWith) return -1;
                          if (!aStartsWith && bStartsWith) return 1;
                          
                          // Si ambos empiezan o ninguno empieza, ordenar alfabéticamente
                          return a.name.localeCompare(b.name);
                        })
                        .map(supplier => (
                          <div
                            key={supplier.id}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                supplierId: supplier.id,
                                supplierSearchText: supplier.name
                              }));
                              setShowSupplierDropdown(false);
                            }}
                          >
                            {supplier.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Empresa *
                </label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
                >
                  <option value="">Seleccionar empresa</option>
                  {companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Almacén de destino *
              </label>
              <select
                name="warehouse"
                value={formData.warehouse}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
              >
                <option value="">Seleccionar almacén</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse} value={warehouse}>{warehouse}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <h4 className="text-md font-semibold text-[#111827] mb-3">Facturar a</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    CIF *
                  </label>
                  <input
                    type="text"
                    name="cif"
                    value={formData.cif}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Calle *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Municipio *
                  </label>
                  <input
                    type="text"
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm md:text-base"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Nº de pedido
                </label>
                <input
                  type="text"
                  value={orderCounter}
                  disabled
                  className="w-full px-3 py-2 border border-[#d1d5db] bg-[#f3f4f6] rounded-lg text-sm md:text-base text-[#6b7280] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Fecha
                </label>
                <input
                  type="text"
                  value={orderDate}
                  disabled
                  className="w-full px-3 py-2 border border-[#d1d5db] bg-[#f3f4f6] rounded-lg text-sm md:text-base text-[#6b7280] cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Observaciones
              </label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                rows={3}
                placeholder="Instrucciones especiales, fechas de entrega, etc."
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] resize-none text-sm md:text-base"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 md:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#111827]">Productos del Pedido</h3>
              <button
                type="button"
                onClick={addOrderItem}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar Producto
              </button>
            </div>

            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-3 p-3 bg-[#f9fafb] rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#6b7280] mb-1">
                      Producto
                    </label>
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) => updateOrderItem(item.id, 'productName', e.target.value)}
                      required
                      placeholder="Nombre del producto"
                      className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
                    />
                  </div>

                  <div className="w-full md:w-28">
                    <label className="block text-xs font-medium text-[#6b7280] mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                        updateOrderItem(item.id, 'quantity', isNaN(value) ? 0 : Math.max(0, value));
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      required
                      min="1"
                      step="1"
                      placeholder=""
                      className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
                    />
                  </div>

                  <div className="w-full md:w-36">
                    <label className="block text-xs font-medium text-[#6b7280] mb-1">
                      Precio Unitario
                    </label>
                    <input
                      type="number"
                      value={item.price === 0 ? '' : item.price}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        updateOrderItem(item.id, 'price', isNaN(value) ? 0 : Math.max(0, value));
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] text-sm"
                    />
                  </div>

                  <div className="w-full md:w-32">
                    <label className="block text-xs font-medium text-[#6b7280] mb-1">
                      Subtotal
                    </label>
                    <div className="flex items-center h-[42px] px-3 py-2 bg-[#e5e7eb] rounded-lg text-sm font-medium text-[#111827]">
                      {(item.quantity * item.price).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeOrderItem(item.id)}
                      disabled={orderItems.length === 1}
                      className={`p-2 rounded-lg transition-colors ${
                        orderItems.length === 1
                          ? 'text-[#d1d5db] cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-[#e5e7eb]">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-[#111827]">Total del Pedido:</span>
                <span className="text-2xl font-bold text-[#3b82f6]">
                  {calculateTotal().toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
              </div>
            </div>
            
            {/* Checkbox Pedido Fungible */}
            <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isFungible}
                  onChange={(e) => setIsFungible(e.target.checked)}
                  className="w-5 h-5 text-[#3b82f6] rounded focus:ring-2 focus:ring-[#3b82f6] cursor-pointer"
                />
                <span className="text-sm font-medium text-[#374151] group-hover:text-[#3b82f6] transition-colors">
                  Pedido Fungible
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setFormData({ supplierId: "", supplierSearchText: "", company: "", warehouse: "", observations: "", cif: "", street: "", postalCode: "", municipality: "", phone: "" });
                setOrderItems([{ id: "1", productName: "", quantity: 0, price: 0 }]);
              }}
              className="px-6 py-3 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors text-sm md:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors text-sm md:text-base"
            >
              <ShoppingCart className="w-5 h-5" />
              Generar Pedido
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Previsualización */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#e5e7eb] p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#111827]">Previsualización del Pedido</h3>
              <button
                onClick={closePreviewAndReset}
                className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Previsualización del contenido del PDF */}
              <div className="border border-[#e5e7eb] rounded-lg p-6 bg-white mb-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#3b82f6]">{companyBillingData[previewData.company]?.fullName || previewData.company}</h2>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#111827]">PEDIDO</h2>
                  </div>
                </div>

                {/* Facturar a / Entregar en */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="font-bold text-sm mb-2">Facturar a:</p>
                    <p className="text-sm">CIF: {previewData.formData.cif}</p>
                    <p className="text-sm">{previewData.formData.street}, Puerta DRC {previewData.formData.municipality}</p>
                    <p className="text-sm">CP. {previewData.formData.postalCode} Santa Lucía de Tirajana</p>
                    <p className="text-sm">Teléfono: {previewData.formData.phone}</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-2">Entregar en:</p>
                    {getWarehouseAddress(previewData.warehouse).split('\n').map((line, i) => (
                      <p key={i} className="text-sm">{line}</p>
                    ))}
                  </div>
                </div>

                {/* Info del pedido */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#3b82f6] text-white p-2 rounded text-center">
                    <p className="text-xs font-bold">PROVEEDOR</p>
                    <p className="text-sm">{previewData.supplierName}</p>
                  </div>
                  <div className="bg-[#3b82f6] text-white p-2 rounded text-center">
                    <p className="text-xs font-bold">N.º DE PEDIDO</p>
                    <p className="text-sm">{previewData.orderNumber}</p>
                  </div>
                  <div className="bg-[#3b82f6] text-white p-2 rounded text-center">
                    <p className="text-xs font-bold">FECHA</p>
                    <p className="text-sm">{previewData.orderDate}</p>
                  </div>
                </div>

                {/* Tabla de productos */}
                <table className="w-full border-collapse mb-6">
                  <thead>
                    <tr className="bg-[#3b82f6] text-white">
                      <th className="border border-[#3b82f6] p-2 text-left text-sm">DESCRIPCIÓN</th>
                      <th className="border border-[#3b82f6] p-2 text-center text-sm">CANT.</th>
                      <th className="border border-[#3b82f6] p-2 text-right text-sm">PRECIO UNITARIO</th>
                      <th className="border border-[#3b82f6] p-2 text-right text-sm">IMPORTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.items.map((item: OrderItem) => (
                      <tr key={item.id}>
                        <td className="border border-[#e5e7eb] p-2 text-sm">{item.productName}</td>
                        <td className="border border-[#e5e7eb] p-2 text-center text-sm">{item.quantity}</td>
                        <td className="border border-[#e5e7eb] p-2 text-right text-sm">{item.price.toFixed(2)}</td>
                        <td className="border border-[#e5e7eb] p-2 text-right text-sm">{(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totales */}
                <div className="flex justify-end mb-6">
                  <div className="bg-[#aed8e6] p-4 rounded w-64">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold">SUBTOTAL</span>
                      <span>{calculateSubtotal().toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold">TIPO IMPOSITIVO</span>
                      <span>0%</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold">IMPUESTOS</span>
                      <span>{calculateTax(calculateSubtotal()).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-[#3b82f6] pt-1">
                      <span>TOTAL</span>
                      <span>{previewData.total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-sm italic text-[#3b82f6] mb-4">Gracias por su confianza</p>

                {previewData.formData.observations && (
                  <div>
                    <p className="font-bold text-sm mb-1">OBSERVACIONES:</p>
                    <p className="text-sm">{previewData.formData.observations}</p>
                  </div>
                )}
              </div>

              {/* Botones de descarga */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={downloadPDF}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FileDown className="w-5 h-5" />
                  Descargar PDF
                </button>
                <button
                  onClick={downloadExcel}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Descargar Excel
                </button>
                <button
                  onClick={sendByEmail}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Enviar por Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmation && pendingOrderData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#e5e7eb] p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#111827]">Confirmar Pedido</h3>
              <button
                onClick={cancelOrder}
                className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-[#6b7280] mb-4">¿Estás seguro de que deseas generar este pedido?</p>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelOrder}
                  className="px-6 py-3 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f3f4f6] transition-colors text-sm md:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmOrderGeneration}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors text-sm md:text-base"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Confirmar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}