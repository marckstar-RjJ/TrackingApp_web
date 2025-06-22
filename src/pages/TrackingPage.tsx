import React, { useState } from 'react';
import MockDataService from '../services/MockDataService'; // Importa el servicio de datos simulados
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

interface PackageDetails {
  notes: string;
  issues: string;
  receivedFrom: string;
  dispatchedTo: string;
  packageCondition: 'Bueno' | 'Regular' | 'Malo';
  contentVerified: boolean;
  weightVerified: boolean;
  dimensionsVerified: boolean;
  securityCheck: boolean;
  customsCheck: boolean;
  specialHandling: boolean;
  specialHandlingNotes: string;
}

const TrackingPage: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [operationMessage, setOperationMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [operationType, setOperationType] = useState<'receive' | 'dispatch' | null>(null);
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    notes: '',
    issues: '',
    receivedFrom: '',
    dispatchedTo: '',
    packageCondition: 'Bueno',
    contentVerified: false,
    weightVerified: false,
    dimensionsVerified: false,
    securityCheck: false,
    customsCheck: false,
    specialHandling: false,
    specialHandlingNotes: ''
  });

  const { user } = useAuth();
  const isAdminOrStaff = user && (user.role === UserRole.ADMIN || user.role === UserRole.STAFF);

  const handleTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTrackingResult(null);
    setOperationMessage(null);

    try {
      const result = MockDataService.getInstance().getShipmentByTrackingNumber(trackingNumber);

      if (result) {
        setTrackingResult(result);
      } else {
        setError('Número de seguimiento no encontrado.');
      }
    } catch (err) {
      setError('Error al buscar el envío. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const openOperationModal = (type: 'receive' | 'dispatch') => {
    setOperationType(type);
    setPackageDetails({
      notes: '',
      issues: '',
      receivedFrom: '',
      dispatchedTo: '',
      packageCondition: 'Bueno',
      contentVerified: false,
      weightVerified: false,
      dimensionsVerified: false,
      securityCheck: false,
      customsCheck: false,
      specialHandling: false,
      specialHandlingNotes: ''
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setOperationType(null);
  };

  const handlePackageDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setPackageDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleOperationSubmit = () => {
    if (!trackingResult || !operationType) return;

    const newStatus = operationType === 'receive' ? 'Recibido en Almacén' : 'Despachado para Entrega';
    const newLocation = operationType === 'receive' ? 'Almacén Central Madrid' : packageDetails.dispatchedTo;

    try {
      // Actualizar el historial con los detalles adicionales
      MockDataService.getInstance().updateShipmentHistory(
        trackingResult.trackingNumber,
        newStatus,
        newLocation,
        {
          notes: packageDetails.notes,
          issues: packageDetails.issues,
          receivedFrom: operationType === 'receive' ? packageDetails.receivedFrom : undefined,
          dispatchedTo: operationType === 'dispatch' ? packageDetails.dispatchedTo : undefined,
          packageCondition: operationType === 'receive' ? packageDetails.packageCondition : undefined,
          contentVerified: operationType === 'receive' ? packageDetails.contentVerified : undefined,
          weightVerified: operationType === 'receive' ? packageDetails.weightVerified : undefined,
          dimensionsVerified: operationType === 'receive' ? packageDetails.dimensionsVerified : undefined,
          securityCheck: operationType === 'receive' ? packageDetails.securityCheck : undefined,
          customsCheck: operationType === 'dispatch' ? packageDetails.customsCheck : undefined,
          specialHandling: operationType === 'dispatch' ? packageDetails.specialHandling : undefined,
          specialHandlingNotes: operationType === 'dispatch' ? packageDetails.specialHandlingNotes : undefined
        }
      );

      // Actualizar el estado local
      setTrackingResult((prev: any) => ({
        ...prev,
        status: newStatus,
        history: [...prev.history, {
          timestamp: new Date().toISOString(),
          status: newStatus,
          location: newLocation,
          details: {
            notes: packageDetails.notes,
            issues: packageDetails.issues,
            receivedFrom: operationType === 'receive' ? packageDetails.receivedFrom : undefined,
            dispatchedTo: operationType === 'dispatch' ? packageDetails.dispatchedTo : undefined,
            packageCondition: operationType === 'receive' ? packageDetails.packageCondition : undefined,
            contentVerified: operationType === 'receive' ? packageDetails.contentVerified : undefined,
            weightVerified: operationType === 'receive' ? packageDetails.weightVerified : undefined,
            dimensionsVerified: operationType === 'receive' ? packageDetails.dimensionsVerified : undefined,
            securityCheck: operationType === 'receive' ? packageDetails.securityCheck : undefined,
            customsCheck: operationType === 'dispatch' ? packageDetails.customsCheck : undefined,
            specialHandling: operationType === 'dispatch' ? packageDetails.specialHandling : undefined,
            specialHandlingNotes: operationType === 'dispatch' ? packageDetails.specialHandlingNotes : undefined
          }
        }]
      }));

      setOperationMessage({
        type: 'success',
        message: `Paquete ${operationType === 'receive' ? 'recibido' : 'despachado'} exitosamente.`
      });
      handleModalClose();
    } catch (err: any) {
      setOperationMessage({
        type: 'error',
        message: err.message || `Error al ${operationType === 'receive' ? 'recibir' : 'despachar'} el paquete.`
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
      <div className="max-w-4xl w-full mx-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105">
          <div className="text-center mb-8">
            <img 
              src="/images/logo_boa.png" 
              alt="BOA Tracking" 
              className="h-20 mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900">Seguimiento de Envíos</h2>
            <p className="mt-2 text-gray-600">
              Ingrese su número de tracking para ver el estado de su envío
            </p>
          </div>

          <form onSubmit={handleTracking} className="mb-8 space-y-4">
            <div>
              <label htmlFor="trackingNumber" className="sr-only">Número de Tracking</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ingrese su número de tracking"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Buscando...' : 'Rastrear Envío'}
            </button>
          </form>

          {error && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {operationMessage && (
            <div className={`mb-4 ${operationMessage.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-4 rounded-lg`}>
              {operationMessage.message}
            </div>
          )}

          {trackingResult && (
            <div className="space-y-6 mt-8">
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Estado Actual del Envío: {trackingResult.trackingNumber}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <p className="text-sm font-medium">Estado:</p>
                    <p className="font-semibold text-lg">{trackingResult.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ubicación:</p>
                    <p className="font-semibold text-lg">{trackingResult.history[trackingResult.history.length - 1]?.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Última actualización:</p>
                    <p className="font-semibold text-lg">{new Date(trackingResult.history[trackingResult.history.length - 1]?.timestamp).toLocaleString() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Entrega estimada:</p>
                    <p className="font-semibold text-lg">{trackingResult.estimatedDelivery || 'N/A'}</p>
                  </div>
                </div>

                {/* Operation Buttons for Admin/Staff */}
                {isAdminOrStaff && (
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => openOperationModal('receive')}
                      className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200"
                    >
                      Recibir Paquete
                    </button>
                    <button
                      onClick={() => openOperationModal('dispatch')}
                      className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                    >
                      Despachar Paquete
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Historial Completo del Envío</h3>
                <div className="space-y-4">
                  {trackingResult.history.map((event: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                      <div className="w-28 text-gray-600 text-sm flex-shrink-0">
                        <p>{new Date(event.timestamp).toLocaleDateString()}</p>
                        <p className="text-xs">{new Date(event.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-800">{event.status}</p>
                        <p className="text-gray-600 text-sm">{event.location}</p>
                        {isAdminOrStaff && event.details && (
                          <div className="mt-2 text-sm text-gray-600">
                            {event.details.receivedFrom && (
                              <p className="mb-1"><span className="font-medium">Recibido desde:</span> {event.details.receivedFrom}</p>
                            )}
                            {event.details.dispatchedTo && (
                              <p className="mb-1"><span className="font-medium">Despachado a:</span> {event.details.dispatchedTo}</p>
                            )}
                            {event.details.packageCondition && (
                              <p className="mb-1"><span className="font-medium">Condición:</span> {event.details.packageCondition}</p>
                            )}
                            {event.details.notes && (
                              <p className="mb-1"><span className="font-medium">Notas:</span> {event.details.notes}</p>
                            )}
                            {event.details.issues && (
                              <p className="mb-1"><span className="font-medium">Problemas:</span> {event.details.issues}</p>
                            )}
                            {event.details.specialHandling && (
                              <p className="mb-1"><span className="font-medium">Manejo Especial:</span> {event.details.specialHandlingNotes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para detalles del paquete */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {operationType === 'receive' ? 'Recibir Paquete' : 'Despachar Paquete'}
            </h3>
            
            <div className="space-y-4">
              {operationType === 'receive' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recibido desde</label>
                    <input
                      type="text"
                      name="receivedFrom"
                      value={packageDetails.receivedFrom || ''}
                      onChange={handlePackageDetailsChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Condición del Paquete</label>
                    <select
                      name="packageCondition"
                      value={packageDetails.packageCondition || ''}
                      onChange={handlePackageDetailsChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="Bueno">Bueno</option>
                      <option value="Regular">Regular</option>
                      <option value="Malo">Malo</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="contentVerified"
                        checked={packageDetails.contentVerified || false}
                        onChange={handlePackageDetailsChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Contenido Verificado
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="weightVerified"
                        checked={packageDetails.weightVerified || false}
                        onChange={handlePackageDetailsChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Peso Verificado
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="dimensionsVerified"
                        checked={packageDetails.dimensionsVerified || false}
                        onChange={handlePackageDetailsChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Dimensiones Verificadas
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="securityCheck"
                        checked={packageDetails.securityCheck || false}
                        onChange={handlePackageDetailsChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Revisión de Seguridad
                      </label>
                    </div>
                  </div>
                </>
              )}

              {operationType === 'dispatch' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destino</label>
                    <input
                      type="text"
                      name="dispatchedTo"
                      value={packageDetails.dispatchedTo || ''}
                      onChange={handlePackageDetailsChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="customsCheck"
                      checked={packageDetails.customsCheck || false}
                      onChange={handlePackageDetailsChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Revisión de Aduanas
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="specialHandling"
                      checked={packageDetails.specialHandling || false}
                      onChange={handlePackageDetailsChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Manejo Especial
                    </label>
                  </div>

                  {packageDetails.specialHandling && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notas de Manejo Especial</label>
                      <textarea
                        name="specialHandlingNotes"
                        value={packageDetails.specialHandlingNotes || ''}
                        onChange={handlePackageDetailsChange}
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Notas Adicionales</label>
                <textarea
                  name="notes"
                  value={packageDetails.notes || ''}
                  onChange={handlePackageDetailsChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ingrese notas adicionales sobre el paquete..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Problemas Detectados</label>
                <textarea
                  name="issues"
                  value={packageDetails.issues || ''}
                  onChange={handlePackageDetailsChange}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Describa cualquier problema encontrado..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleOperationSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingPage; 