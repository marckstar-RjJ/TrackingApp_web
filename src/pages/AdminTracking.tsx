import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SuccessModal from '../components/SuccessModal';
import { useSuccessModal } from '../hooks/useSuccessModal';

interface TrackingEvent {
  id: number;
  event_type: string;
  description: string;
  location: string;
  timestamp: string;
  user_name?: string;
}

interface Package {
  id: number;
  tracking_number: string;
  description: string;
  status: string;
  sender_name: string;
  recipient_name: string;
  weight: number;
  cost: number;
  origin: string;
  destination: string;
  estimated_delivery_date: string;
  created_at: string;
  events: TrackingEvent[];
}

const AdminTracking: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('tracking') || '');
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isVisible, message, showSuccess, hideSuccess } = useSuccessModal();

  // Cargar tracking number desde URL si existe
  useEffect(() => {
    const trackingFromUrl = searchParams.get('tracking');
    if (trackingFromUrl) {
      setTrackingNumber(trackingFromUrl);
      // Buscar automáticamente el paquete
      searchPackage(trackingFromUrl);
    }
  }, [searchParams]);

  const searchPackage = async (tracking: string) => {
    if (!tracking.trim()) {
      setError('Por favor ingresa un número de tracking');
      return;
    }

    setIsLoading(true);
    setError('');
    setPackageData(null);

    try {
      const response = await fetch(`http://localhost:3000/api/packages/tracking/${tracking.trim()}`);
      const data = await response.json();

      if (response.ok) {
        console.log('Datos recibidos del backend:', data);
        console.log('Origin:', data.origin);
        console.log('Destination:', data.destination);
        console.log('Todos los campos disponibles:', Object.keys(data));
        setPackageData(data);
      } else {
        setError(data.error || 'Paquete no encontrado');
      }
    } catch (error) {
      setError('Error de conexión: No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchPackage(trackingNumber);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Número de tracking copiado al portapapeles.');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const printDocument = () => {
    if (!packageData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>BOA Tracking - Documento de Seguimiento</title>
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
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 10px;
            margin: 2px 0;
          }
          .status-pendiente { background: #fef3c7; color: #92400e; }
          .status-en_transito { background: #dbeafe; color: #1e40af; }
          .status-entregado { background: #d1fae5; color: #065f46; }
          .status-retrasado { background: #fee2e2; color: #991b1b; }
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
          .timeline {
            margin-top: 10px;
          }
          .timeline-item {
            border-left: 2px solid #f97316;
            padding-left: 12px;
            margin-bottom: 8px;
            position: relative;
            font-size: 10px;
          }
          .timeline-item::before {
            content: '';
            position: absolute;
            left: -5px;
            top: 0;
            width: 8px;
            height: 8px;
            background: #f97316;
            border-radius: 50%;
          }
          .timeline-date {
            font-size: 9px;
            color: #666;
            margin-bottom: 2px;
          }
          .timeline-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 2px;
            font-size: 10px;
          }
          .timeline-description {
            color: #666;
            font-size: 9px;
          }
          .timeline-location {
            color: #999;
            font-size: 8px;
            margin-top: 2px;
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
          <p class="subtitle">Documento de Seguimiento</p>
        </div>

        <div class="tracking-number">
          Número de Tracking: ${packageData.tracking_number}
        </div>

        <div class="route-info">
          🚚 RUTA: ${packageData.origin} → ${packageData.destination}
        </div>

        <div class="main-grid">
          <div class="section">
            <div class="section-title">Información del Envío</div>
            <div class="field">
              <div class="label">Descripción</div>
              <div class="value">${packageData.description}</div>
            </div>
            <div class="field">
              <div class="label">Peso</div>
              <div class="value">${packageData.weight} kg</div>
            </div>
            <div class="field">
              <div class="label">Costo</div>
              <div class="value">Bs. ${packageData.cost.toFixed(2)}</div>
            </div>
            <div class="field">
              <div class="label">Estado</div>
              <div class="value">
                <span class="status-badge status-${packageData.status.toLowerCase()}">
                  ${getStatusText(packageData.status)}
                </span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Personas</div>
            <div class="field">
              <div class="label">Remitente</div>
              <div class="value">${packageData.sender_name}</div>
            </div>
            <div class="field">
              <div class="label">Destinatario</div>
              <div class="value">${packageData.recipient_name}</div>
            </div>
            <div class="field">
              <div class="label">Fecha Creación</div>
              <div class="value">${new Date(packageData.created_at).toLocaleDateString()}</div>
            </div>
            <div class="field">
              <div class="label">Entrega Estimada</div>
              <div class="value">${new Date(packageData.estimated_delivery_date).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        ${packageData.events && packageData.events.length > 0 ? `
        <div class="section">
          <div class="section-title">Historial de Eventos</div>
          <div class="timeline">
            ${packageData.events.slice(0, 5).map(event => `
              <div class="timeline-item">
                <div class="timeline-date">${new Date(event.timestamp).toLocaleDateString()} ${new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div class="timeline-title">${event.event_type.replace('_', ' ').toUpperCase()}</div>
                <div class="timeline-description">${event.description}</div>
                ${event.location ? `<div class="timeline-location">📍 ${event.location}</div>` : ''}
                ${event.user_name ? `<div class="timeline-location">👤 ${event.user_name}</div>` : ''}
              </div>
            `).join('')}
            ${packageData.events.length > 5 ? `<div class="timeline-item"><div class="timeline-description">... y ${packageData.events.length - 5} eventos más</div></div>` : ''}
          </div>
        </div>
        ` : ''}

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en_transito':
        return 'bg-blue-100 text-blue-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'retrasado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en_transito':
        return 'En Tránsito';
      case 'entregado':
        return 'Entregado';
      case 'pendiente':
        return 'Pendiente';
      case 'retrasado':
        return 'Retrasado';
      default:
        return status;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'registrado':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'en_transito':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'entregado':
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'retrasado':
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
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
              <h1 className="text-3xl font-bold text-white">Seguimiento de Paquetes</h1>
              <p className="text-white/80">Consultar estado de paquetes</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            Volver al Dashboard
          </button>
        </div>

        {/* Formulario de búsqueda */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-2xl">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                placeholder="Ingresa el número de tracking..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
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
                  Buscando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8">
            <p>{error}</p>
          </div>
        )}

        {/* Resultado del paquete */}
        {packageData && (
          <div className="space-y-6">
            {/* Información del paquete */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Paquete: {packageData.tracking_number}
                  </h2>
                  <p className="text-gray-600">{packageData.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(packageData.status)}`}>
                    {getStatusText(packageData.status)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(packageData.tracking_number)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition duration-200"
                    title="Copiar número de tracking"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={printDocument}
                    className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition duration-200"
                    title="Imprimir documento"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Remitente</h3>
                  <p className="text-gray-600">{packageData.sender_name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Destinatario</h3>
                  <p className="text-gray-600">{packageData.recipient_name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ruta</h3>
                  <p className="text-gray-600">{packageData.origin} → {packageData.destination}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Detalles</h3>
                  <p className="text-gray-600">Peso: {packageData.weight} kg</p>
                  <p className="text-gray-600">Costo: Bs. {packageData.cost}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Fecha de Creación</h3>
                    <p className="text-gray-600">{new Date(packageData.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Fecha Estimada de Entrega</h3>
                    <p className="text-gray-600">{new Date(packageData.estimated_delivery_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline de eventos */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Historial de Eventos</h3>
              
              {packageData.events && packageData.events.length > 0 ? (
                <div className="space-y-4">
                  {packageData.events.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          {getEventIcon(event.event_type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 capitalize">
                              {event.event_type.replace('_', ' ')}
                            </h4>
                            <p className="text-gray-600 mt-1">{event.description}</p>
                            {event.location && (
                              <p className="text-gray-500 text-sm mt-1">
                                📍 {event.location}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                            {event.user_name && (
                              <p className="text-xs text-gray-400">
                                Por: {event.user_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500">No hay eventos registrados para este paquete.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de éxito */}
      <SuccessModal 
        isVisible={isVisible}
        message={message}
        onClose={hideSuccess}
      />
    </div>
  );
};

export default AdminTracking;
