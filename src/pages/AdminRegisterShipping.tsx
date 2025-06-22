import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShippingForm {
  tracking_number: string;
  description: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_address: string;
  weight: number;
  cargo_type: string;
  origin: string;
  destination: string;
  priority: string;
  shipping_type: string;
  cost: number;
  estimated_delivery_date: string;
  shipping_zone: string; // 'national' o 'international'
  destination_country: string;
}

const AdminRegisterShipping: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredPackage, setRegisteredPackage] = useState<ShippingForm | null>(null);

  const [formData, setFormData] = useState<ShippingForm>({
    tracking_number: '',
    description: '',
    sender_name: '',
    sender_email: '',
    sender_phone: '',
    sender_address: '',
    recipient_name: '',
    recipient_email: '',
    recipient_phone: '',
    recipient_address: '',
    weight: 0,
    cargo_type: '',
    origin: '',
    destination: '',
    priority: 'normal',
    shipping_type: 'standard',
    cost: 0,
    estimated_delivery_date: '',
    shipping_zone: 'national',
    destination_country: ''
  });

  // Precios nacionales (Bolivia)
  const nationalPricing = {
    1: { min: 3.50, max: 4.00 },
    10: { min: 35, max: 40 },
    25: { min: 80, max: 100 },
    100: { min: 300, max: 350 },
    300: { pricePerKg: 3.00 }
  };

  // Precios internacionales (USD)
  const internationalPricing = {
    miami: { 1: 25, 5: 80, 10: 140 },
    madrid: { 1: 40, 5: 120, 10: 200 },
    buenosAires: { 1: 20, 5: 60, 10: 100 },
    saoPaulo: { 1: 22, 5: 65, 10: 110 },
    lima: { 1: 18, 5: 55, 10: 90 },
    laHabana: { 1: 35, 5: 100, 10: 160 },
    caracas: { 1: 30, 5: 90, 10: 150 }
  };

  // Tiempos de entrega nacionales (días hábiles)
  const nationalDeliveryTimes = {
    'La Paz ↔ Santa Cruz': 1,
    'La Paz ↔ Cochabamba': 1,
    'La Paz ↔ Sucre': 2,
    'La Paz ↔ Tarija': 2,
    'Santa Cruz ↔ Cobija': 2,
    'Cochabamba ↔ Trinidad': 2,
    'Santa Cruz ↔ Oruro': 1
  };

  // Tiempos de entrega internacionales (días hábiles)
  const internationalDeliveryTimes = {
    miami: 5,
    madrid: 7,
    buenosAires: 4,
    saoPaulo: 4,
    lima: 3,
    laHabana: 6,
    caracas: 6
  };

  // Ciudades nacionales (Bolivia)
  const nationalCities = [
    'La Paz',
    'Santa Cruz',
    'Cochabamba',
    'Sucre',
    'Tarija',
    'Oruro',
    'Potosí',
    'Trinidad',
    'Cobija',
    'Riberalta',
    'Guayaramerín',
    'Montero',
    'Warnes',
    'Camiri',
    'Villamontes',
    'Yacuiba',
    'Tupiza',
    'Uyuni',
    'Llallagua',
    'Huanuni'
  ];

  // Ciudades internacionales
  const internationalCities = {
    miami: ['Miami', 'Orlando', 'Tampa', 'Fort Lauderdale', 'West Palm Beach'],
    madrid: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'],
    buenosAires: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'],
    saoPaulo: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'],
    lima: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura'],
    laHabana: ['La Habana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Santa Clara'],
    caracas: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay']
  };

  const generateTrackingNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `BOA-${year}${month}${day}-${hours}${minutes}`;
  };

  // Generar número de tracking automáticamente al cargar la página
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      tracking_number: generateTrackingNumber()
    }));
  }, []);

  const calculateNationalPrice = (weight: number): number => {
    if (weight <= 1) return 3.75; // Promedio entre 3.50 y 4.00
    if (weight <= 10) return weight * 3.75;
    if (weight <= 25) return weight * 3.6;
    if (weight <= 100) return weight * 3.25;
    return weight * 3.00; // Para 300+ kg
  };

  const calculateInternationalPrice = (weight: number, country: string): number => {
    const pricing = internationalPricing[country as keyof typeof internationalPricing];
    if (!pricing) return 0;

    if (weight <= 1) return pricing[1];
    if (weight <= 5) return pricing[5];
    if (weight <= 10) return pricing[10];
    
    // Para pesos mayores, estimar basado en el precio por kg
    const basePrice = pricing[10];
    const baseWeight = 10;
    return Math.round((weight / baseWeight) * basePrice);
  };

  const calculateDeliveryDate = (origin: string, destination: string, isInternational: boolean, country?: string): string => {
    const today = new Date();
    let deliveryDays = 2; // Default nacional

    if (isInternational && country) {
      deliveryDays = internationalDeliveryTimes[country as keyof typeof internationalDeliveryTimes] || 5;
    } else {
      // Buscar en rutas nacionales
      const route = `${origin} ↔ ${destination}`;
      const reverseRoute = `${destination} ↔ ${origin}`;
      deliveryDays = nationalDeliveryTimes[route as keyof typeof nationalDeliveryTimes] || 
                    nationalDeliveryTimes[reverseRoute as keyof typeof nationalDeliveryTimes] || 2;
    }

    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + deliveryDays);
    
    return deliveryDate.toISOString().split('T')[0];
  };

  const calculateCosts = useCallback(() => {
    if (!formData.weight || !formData.origin || !formData.destination) {
      return;
    }

    let cost = 0;
    let deliveryDate = '';

    if (formData.shipping_zone === 'national') {
      cost = calculateNationalPrice(formData.weight);
      deliveryDate = calculateDeliveryDate(formData.origin, formData.destination, false);
    } else if (formData.shipping_zone === 'international' && formData.destination_country) {
      cost = calculateInternationalPrice(formData.weight, formData.destination_country);
      deliveryDate = calculateDeliveryDate(formData.origin, formData.destination, true, formData.destination_country);
    }

    setFormData(prev => ({
      ...prev,
      cost: cost,
      estimated_delivery_date: deliveryDate
    }));
  }, [formData.weight, formData.origin, formData.destination, formData.shipping_zone, formData.destination_country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Limpiar campos de ciudad cuando cambie la zona de envío
      if (name === 'shipping_zone') {
        newData.origin = '';
        newData.destination = '';
        newData.destination_country = '';
      }
      
      // Limpiar ciudad destino cuando cambie el país de destino
      if (name === 'destination_country') {
        newData.destination = '';
      }
      
      return newData;
    });
  };

  // Efecto para recalcular costos cuando cambien los datos relevantes
  useEffect(() => {
    calculateCosts();
  }, [calculateCosts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Datos a enviar al backend:', formData);
    console.log('Origin:', formData.origin);
    console.log('Destination:', formData.destination);

    try {
      const response = await fetch('http://localhost:3000/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setRegisteredPackage(formData);
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json();
        alert(`Error al registrar el paquete: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      alert('Error de conexión: No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const printDocument = () => {
    if (!registeredPackage) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currency = registeredPackage.shipping_zone === 'national' ? 'Bs' : 'USD';
    const shippingZoneText = registeredPackage.shipping_zone === 'national' ? 'Nacional' : 'Internacional';
    const countryText = registeredPackage.destination_country ? ` - ${registeredPackage.destination_country}` : '';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>BOA Tracking - Documento de Envío</title>
        <style>
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 15px;
            background: white;
            font-size: 12px;
            line-height: 1.3;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #f97316;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .logo {
            max-width: 120px;
            margin-bottom: 5px;
          }
          .title {
            color: #f97316;
            font-size: 18px;
            font-weight: bold;
            margin: 0;
          }
          .subtitle {
            color: #666;
            font-size: 12px;
            margin: 2px 0;
          }
          .tracking-number {
            background: #f97316;
            color: white;
            padding: 10px;
            border-radius: 6px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .route-info {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 8px;
            text-align: center;
            margin: 10px 0;
            font-weight: bold;
            color: #0ea5e9;
          }
          .main-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .section {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 10px;
            margin-bottom: 10px;
          }
          .section-title {
            background: #f97316;
            color: white;
            padding: 5px 10px;
            margin: -10px -10px 8px -10px;
            border-radius: 6px 6px 0 0;
            font-weight: bold;
            font-size: 11px;
          }
          .field {
            margin-bottom: 6px;
          }
          .label {
            font-weight: bold;
            color: #333;
            font-size: 10px;
            text-transform: uppercase;
          }
          .value {
            color: #666;
            font-size: 11px;
            margin-top: 1px;
          }
          .cost-info {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 8px;
            text-align: center;
            margin: 10px 0;
          }
          .cost-amount {
            font-size: 16px;
            font-weight: bold;
            color: #0ea5e9;
          }
          .footer {
            margin-top: 15px;
            text-align: center;
            color: #666;
            font-size: 9px;
            border-top: 1px solid #ddd;
            padding-top: 8px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/images/logo_boa.png" alt="BOA Tracking" class="logo">
          <h1 class="title">BOA Tracking</h1>
          <p class="subtitle">Documento de Envío</p>
        </div>

        <div class="tracking-number">
          Número de Tracking: ${registeredPackage.tracking_number}
        </div>

        <div class="route-info">
          🚚 RUTA: ${registeredPackage.origin || 'No especificada'} → ${registeredPackage.destination || 'No especificada'}
        </div>

        <div class="main-grid">
          <div class="section">
            <div class="section-title">Información del Envío</div>
            <div class="field">
              <div class="label">Descripción</div>
              <div class="value">${registeredPackage.description}</div>
            </div>
            <div class="field">
              <div class="label">Peso</div>
              <div class="value">${registeredPackage.weight} kg</div>
            </div>
            <div class="field">
              <div class="label">Tipo de Carga</div>
              <div class="value">${registeredPackage.cargo_type}</div>
            </div>
            <div class="field">
              <div class="label">Prioridad</div>
              <div class="value">${registeredPackage.priority}</div>
            </div>
            <div class="field">
              <div class="label">Tipo de Envío</div>
              <div class="value">${registeredPackage.shipping_type}</div>
            </div>
            <div class="field">
              <div class="label">Zona de Envío</div>
              <div class="value">${shippingZoneText}${countryText}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Personas</div>
            <div class="field">
              <div class="label">Remitente</div>
              <div class="value">${registeredPackage.sender_name}</div>
            </div>
            <div class="field">
              <div class="label">Destinatario</div>
              <div class="value">${registeredPackage.recipient_name}</div>
            </div>
            <div class="field">
              <div class="label">Fecha Estimada</div>
              <div class="value">${registeredPackage.estimated_delivery_date}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Información de Contacto</div>
          <div class="main-grid">
            <div>
              <div class="field">
                <div class="label">Remitente - Email</div>
                <div class="value">${registeredPackage.sender_email}</div>
              </div>
              <div class="field">
                <div class="label">Remitente - Teléfono</div>
                <div class="value">${registeredPackage.sender_phone}</div>
              </div>
              <div class="field">
                <div class="label">Remitente - Dirección</div>
                <div class="value">${registeredPackage.sender_address}</div>
              </div>
            </div>
            <div>
              <div class="field">
                <div class="label">Destinatario - Email</div>
                <div class="value">${registeredPackage.recipient_email}</div>
              </div>
              <div class="field">
                <div class="label">Destinatario - Teléfono</div>
                <div class="value">${registeredPackage.recipient_phone}</div>
              </div>
              <div class="field">
                <div class="label">Destinatario - Dirección</div>
                <div class="value">${registeredPackage.recipient_address}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="cost-info">
          <div class="label">Costo del Envío</div>
          <div class="cost-amount">${currency} ${registeredPackage.cost.toFixed(2)}</div>
          <div class="value">Fecha estimada de entrega: ${registeredPackage.estimated_delivery_date}</div>
        </div>

        <div class="footer">
          <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</p>
          <p>BOA Tracking - Sistema de Seguimiento de Paquetes</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setRegisteredPackage(null);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <img src="/images/logo_boa.png" alt="BOA Tracking" className="h-16 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-white">Registrar Envío</h1>
              <p className="text-white/80">Crear nuevo paquete en el sistema</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            Volver al Dashboard
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Número de Tracking */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Tracking *
                </label>
                <input
                  type="text"
                  name="tracking_number"
                  value={formData.tracking_number}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="BOA-YYYYMMDD-HHMM"
                readOnly
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Paquete *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Descripción detallada del contenido del paquete..."
              />
            </div>

            {/* Información del Remitente */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">Información del Remitente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    name="sender_name"
                    value={formData.sender_name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="sender_email"
                    value={formData.sender_email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    name="sender_phone"
                    value={formData.sender_phone}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                  <input
                    type="text"
                    name="sender_address"
                    value={formData.sender_address}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Información del Destinatario */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Información del Destinatario</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    name="recipient_name"
                    value={formData.recipient_name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="recipient_email"
                    value={formData.recipient_email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    name="recipient_phone"
                    value={formData.recipient_phone}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                  <input
                    type="text"
                    name="recipient_address"
                    value={formData.recipient_address}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Detalles del Envío */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Detalles del Envío</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg) *</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    min="0.1"
                    step="0.1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zona de Envío *</label>
                  <select
                    name="shipping_zone"
                    value={formData.shipping_zone}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="national">🇧🇴 Nacional (Bolivia)</option>
                    <option value="international">🌍 Internacional</option>
                  </select>
                </div>
                {formData.shipping_zone === 'international' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Destino Internacional *</label>
                    <select
                      name="destination_country"
                      value={formData.destination_country}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar destino</option>
                      <option value="miami">🇺🇸 Miami (EEUU)</option>
                      <option value="madrid">🇪🇸 Madrid (España)</option>
                      <option value="buenosAires">🇦🇷 Buenos Aires (Argentina)</option>
                      <option value="saoPaulo">🇧🇷 São Paulo (Brasil)</option>
                      <option value="lima">🇵🇪 Lima (Perú)</option>
                      <option value="laHabana">🇨🇺 La Habana (Cuba)</option>
                      <option value="caracas">🇻🇪 Caracas (Venezuela)</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Carga *</label>
                  <select
                    name="cargo_type"
                    value={formData.cargo_type}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="documentos">Documentos</option>
                    <option value="ropa">Ropa</option>
                    <option value="electronica">Electrónica</option>
                    <option value="alimentos">Alimentos</option>
                    <option value="fragil">Frágil</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Envío *</label>
                  <select
                    name="shipping_type"
                    value={formData.shipping_type}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="standard">Estándar</option>
                    <option value="express">Express</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo {formData.shipping_zone === 'national' ? '(Bs.)' : '(USD)'} *
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Estimada *</label>
                  <input
                    type="date"
                    name="estimated_delivery_date"
                    value={formData.estimated_delivery_date}
                    onChange={handleInputChange}
                    required
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Calculada automáticamente</p>
                </div>
              </div>
            </div>

            {/* Ubicaciones */}
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">Ubicaciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad Origen *</label>
                  {formData.shipping_zone === 'national' ? (
                    <select
                      name="origin"
                      value={formData.origin}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar ciudad origen</option>
                      {nationalCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      name="origin"
                      value={formData.origin}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar ciudad origen</option>
                      {nationalCities.map(city => (
                        <option key={city} value={city}>{city} (Bolivia)</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad Destino *</label>
                  {formData.shipping_zone === 'national' ? (
                    <select
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar ciudad destino</option>
                      {nationalCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      name="destination"
                      value={formData.destination}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar ciudad destino</option>
                      {formData.destination_country && internationalCities[formData.destination_country as keyof typeof internationalCities] ? (
                        internationalCities[formData.destination_country as keyof typeof internationalCities].map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))
                      ) : (
                        <option value="">Primero seleccione un destino internacional</option>
                      )}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg transition duration-300 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Registrar Envío
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Éxito */}
      {showSuccessModal && registeredPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              {/* Icono de éxito */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Envío Registrado!</h3>
              <p className="text-gray-600 mb-6">
                El paquete ha sido registrado exitosamente en el sistema.
              </p>
              
              {/* Información del tracking */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-800 font-medium mb-1">Número de Tracking:</p>
                <p className="text-lg font-bold text-orange-900">{registeredPackage.tracking_number}</p>
              </div>
              
              {/* Botones */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={printDocument}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir Documento
                </button>
                
                <button
                  onClick={closeSuccessModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition duration-300"
                >
                  Volver al Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegisterShipping;
