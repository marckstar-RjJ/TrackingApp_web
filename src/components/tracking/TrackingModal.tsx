import React, { useState } from 'react';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PackageInfo {
  id: string;
  tracking_number: string;
  status: string;
  location: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_address: string;
  origin: string;
  destination: string;
  weight: number;
  priority: string;
  cost: number;
  description: string;
  estimated_delivery_date: string;
  created_at: string;
  updated_at: string;
  events?: Array<{
    id: string;
    event_type: string;
    location: string;
    operator: string;
    notes: string;
    coordinates: string;
    timestamp: string;
  }>;
}

const TrackingModal: React.FC<TrackingModalProps> = ({ isOpen, onClose }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Por favor ingrese un número de tracking');
      return;
    }

    setLoading(true);
    setError('');
    setPackageInfo(null);

    try {
      const response = await fetch(`http://localhost:3000/api/packages/tracking/${trackingNumber}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Paquete no encontrado. Verifique el número de tracking.');
        }
        throw new Error('Error al buscar el paquete');
      }

      const data = await response.json();
      setPackageInfo(data);
    } catch (err: any) {
      setError(err.message || 'Error al buscar el paquete');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'entregado':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'en tránsito':
      case 'in transit':
      case 'en camino':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const printDocument = () => {
    if (!packageInfo) return;

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
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 10px;
            margin: 2px 0;
          }
          .status-entregado { background: #d1fae5; color: #065f46; }
          .status-en_tránsito { background: #dbeafe; color: #1e40af; }
          .status-pendiente { background: #fef3c7; color: #92400e; }
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
          Número de Tracking: ${packageInfo.tracking_number}
        </div>

        <div class="route-info">
          🚚 RUTA: ${packageInfo.origin || 'No especificada'} → ${packageInfo.destination || 'No especificada'}
        </div>

        <div class="main-grid">
          <div class="section">
            <div class="section-title">Información del Envío</div>
            <div class="field">
              <div class="label">Descripción</div>
              <div class="value">${packageInfo.description || 'No especificada'}</div>
            </div>
            <div class="field">
              <div class="label">Peso</div>
              <div class="value">${packageInfo.weight} kg</div>
            </div>
            <div class="field">
              <div class="label">Costo</div>
              <div class="value">Bs. ${packageInfo.cost.toFixed(2)}</div>
            </div>
            <div class="field">
              <div class="label">Prioridad</div>
              <div class="value">${packageInfo.priority || 'Normal'}</div>
            </div>
            <div class="field">
              <div class="label">Estado</div>
              <div class="value">
                <span class="status-badge status-${packageInfo.status.toLowerCase().replace(' ', '_')}">
                  ${packageInfo.status}
                </span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Personas</div>
            <div class="field">
              <div class="label">Remitente</div>
              <div class="value">${packageInfo.sender_name}</div>
            </div>
            <div class="field">
              <div class="label">Destinatario</div>
              <div class="value">${packageInfo.recipient_name}</div>
            </div>
            <div class="field">
              <div class="label">Fecha Creación</div>
              <div class="value">${new Date(packageInfo.created_at).toLocaleDateString()}</div>
            </div>
            <div class="field">
              <div class="label">Entrega Estimada</div>
              <div class="value">${packageInfo.estimated_delivery_date ? new Date(packageInfo.estimated_delivery_date).toLocaleDateString() : 'No especificada'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Información de Contacto</div>
          <div class="main-grid">
            <div>
              <div class="field">
                <div class="label">Remitente - Email</div>
                <div class="value">${packageInfo.sender_email}</div>
              </div>
              <div class="field">
                <div class="label">Remitente - Teléfono</div>
                <div class="value">${packageInfo.sender_phone || 'No especificado'}</div>
              </div>
              <div class="field">
                <div class="label">Remitente - Dirección</div>
                <div class="value">${packageInfo.sender_address}</div>
              </div>
            </div>
            <div>
              <div class="field">
                <div class="label">Destinatario - Email</div>
                <div class="value">${packageInfo.recipient_email}</div>
              </div>
              <div class="field">
                <div class="label">Destinatario - Teléfono</div>
                <div class="value">${packageInfo.recipient_phone || 'No especificado'}</div>
              </div>
              <div class="field">
                <div class="label">Destinatario - Dirección</div>
                <div class="value">${packageInfo.recipient_address}</div>
              </div>
            </div>
          </div>
        </div>

        ${packageInfo.events && packageInfo.events.length > 0 ? `
        <div class="section">
          <div class="section-title">Historial de Eventos</div>
          <div class="timeline">
            ${packageInfo.events.slice(0, 3).map(event => `
              <div class="timeline-item">
                <div class="timeline-date">${new Date(event.timestamp).toLocaleDateString()} ${new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div class="timeline-title">${event.event_type.toUpperCase()}</div>
                <div class="timeline-description">${event.notes || 'Sin descripción'}</div>
                ${event.location ? `<div class="timeline-location">📍 ${event.location}</div>` : ''}
                ${event.operator ? `<div class="timeline-location">👤 ${event.operator}</div>` : ''}
              </div>
            `).join('')}
            ${packageInfo.events.length > 3 ? `<div class="timeline-item"><div class="timeline-description">... y ${packageInfo.events.length - 3} eventos más</div></div>` : ''}
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Rastrear Paquete</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {!packageInfo ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Tracking
                </label>
                <input
                  id="trackingNumber"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese el número de tracking"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Buscando...' : 'Rastrear'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Información del Paquete */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Información del Paquete</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Número de Tracking</p>
                    <p className="text-lg font-semibold text-gray-900">{packageInfo.tracking_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Estado</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(packageInfo.status)}`}>
                      {packageInfo.status}
                    </span>
                  </div>
                  {packageInfo.location && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ubicación Actual</p>
                      <p className="font-semibold text-gray-900">{packageInfo.location}</p>
                    </div>
                  )}
                  {packageInfo.priority && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Prioridad</p>
                      <p className="font-semibold text-gray-900 capitalize">{packageInfo.priority}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalles del Envío */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Remitente</h5>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{packageInfo.sender_name}</p>
                    <p className="text-sm text-gray-600">{packageInfo.sender_address}</p>
                    <p className="text-sm text-gray-600">{packageInfo.sender_email}</p>
                    {packageInfo.sender_phone && (
                      <p className="text-sm text-gray-600">{packageInfo.sender_phone}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Destinatario</h5>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{packageInfo.recipient_name}</p>
                    <p className="text-sm text-gray-600">{packageInfo.recipient_address}</p>
                    <p className="text-sm text-gray-600">{packageInfo.recipient_email}</p>
                    {packageInfo.recipient_phone && (
                      <p className="text-sm text-gray-600">{packageInfo.recipient_phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalles del Paquete */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Detalles del Paquete</h5>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Origen</p>
                      <p className="font-semibold">{packageInfo.origin}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Destino</p>
                      <p className="font-semibold">{packageInfo.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Peso</p>
                      <p className="font-semibold">{packageInfo.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Costo</p>
                      <p className="font-semibold">Bs {packageInfo.cost}</p>
                    </div>
                  </div>
                  {packageInfo.description && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-600">Descripción</p>
                      <p className="text-sm">{packageInfo.description}</p>
                    </div>
                  )}
                  {packageInfo.estimated_delivery_date && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-600">Fecha Estimada de Entrega</p>
                      <p className="font-semibold">{new Date(packageInfo.estimated_delivery_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Historial (si existe) */}
              {packageInfo.events && packageInfo.events.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Historial Reciente</h5>
                  <div className="space-y-2">
                    {packageInfo.events.slice(0, 3).map((event, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{event.event_type}</p>
                            <p className="text-sm text-gray-600">{event.location}</p>
                            {event.notes && (
                              <p className="text-sm text-gray-500 mt-1">{event.notes}</p>
                            )}
                            {event.operator && (
                              <p className="text-xs text-gray-500">Operador: {event.operator}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={printDocument}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir
                </button>
                <button
                  onClick={() => {
                    setPackageInfo(null);
                    setTrackingNumber('');
                    setError('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Rastrear Otro
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingModal; 