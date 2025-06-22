import React, { useEffect, useState } from 'react';
import MockDataService from '../services/MockDataService';
import { ShipmentRequest } from '../types/auth'; // Asume que tienes este tipo definido o lo definiremos

const AdminShipmentRequests: React.FC = () => {
  const [requests, setRequests] = useState<ShipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError('');
        const allRequests = MockDataService.getInstance().getAllShipmentRequests();
        setRequests(allRequests.filter(req => req.status === 'Pendiente')); // Filtra solo las pendientes
      } catch (err) {
        setError('Error al cargar las solicitudes de envío.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAcceptRequest = (requestId: string) => {
    try {
      MockDataService.getInstance().acceptShipmentRequest(requestId);
      setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId)); // Elimina la solicitud aceptada de la lista
    } catch (err: any) {
      setError(`Error al aceptar la solicitud: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
           style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
        <div className="text-white text-xl">Cargando solicitudes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
           style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
      <div className="max-w-6xl w-full mx-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105">
          <div className="text-center mb-8">
            <img 
              src="/images/logo_boa.png" 
              alt="BOA Tracking Admin" 
              className="h-20 mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900">Gestión de Solicitudes de Envío</h2>
            <p className="mt-2 text-gray-600">
              Revise y gestione las solicitudes de envío pendientes.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="text-center text-gray-700 text-lg">
              No hay solicitudes de envío pendientes en este momento.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Solicitud #{request.id}</h3>
                  <p><strong>Remitente:</strong> {request.senderName} ({request.senderAddress})</p>
                  <p><strong>Destinatario:</strong> {request.recipientName} ({request.recipientAddress})</p>
                  <p><strong>Tipo de Paquete:</strong> {request.packageType}</p>
                  <p><strong>Descripción:</strong> {request.description}</p>
                  <p><strong>Estado:</strong> <span className="font-bold text-yellow-600">{request.status}</span></p>
                  <p><strong>Fecha de Solicitud:</strong> {new Date(request.requestDate).toLocaleString()}</p>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      Aceptar Solicitud y Generar Tracking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminShipmentRequests; 