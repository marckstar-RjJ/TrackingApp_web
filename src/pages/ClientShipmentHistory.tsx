import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MockDataService from '../services/MockDataService';
import { ShipmentRequest, Shipment } from '../types/auth';
import { Link } from 'react-router-dom';

const ClientShipmentHistory: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [shipmentRequests, setShipmentRequests] = useState<ShipmentRequest[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const fetchHistory = () => {
      try {
        setLoading(true);
        setError('');
        
        const allRequests = MockDataService.getInstance().getAllShipmentRequests();
        const userRequests = allRequests.filter(req => req.customerId === user.id);
        setShipmentRequests(userRequests);

        const allShipments = MockDataService.getInstance().getShipments();
        // Asumimos que los envíos están relacionados con las solicitudes aceptadas o directamente creados por el usuario
        // Para la simulación, filtraremos los envíos que tengan un trackingNumber asociado a una solicitud aceptada por el usuario
        const userShipments = allShipments.filter(ship => 
          userRequests.some(req => req.status === 'Aceptado' && req.trackingNumber === ship.trackingNumber)
        );
        setShipments(userShipments);

      } catch (err) {
        setError('Error al cargar el historial de envíos.');
        console.error('Error fetching client history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
           style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
        <div className="text-white text-xl">Cargando historial de envíos...</div>
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

  if (shipmentRequests.length === 0 && shipments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
           style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Historial de Mis Envíos</h2>
          <p className="text-gray-700">No tienes solicitudes de envío o envíos registrados aún.</p>
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
              alt="BOA Tracking" 
              className="h-20 mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900">Historial de Mis Envíos</h2>
            <p className="mt-2 text-gray-600">
              Aquí puedes ver el estado de tus solicitudes y envíos.
            </p>
          </div>

          <div className="space-y-6">
            {shipmentRequests.map(request => (
              <div key={request.id} className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Solicitud #{request.id}</h3>
                <p><strong>De:</strong> {request.senderName}</p>
                <p><strong>Para:</strong> {request.recipientName}</p>
                <p><strong>Descripción:</strong> {request.description}</p>
                <p><strong>Estado:</strong> <span className={`font-bold ${request.status === 'Pendiente' ? 'text-yellow-600' : 'text-green-600'}`}>{request.status}</span></p>
                {request.status === 'Aceptado' && request.trackingNumber && (
                  <p className="mt-2"><strong>Número de Tracking:</strong> <span className="text-blue-600 font-semibold">{request.trackingNumber}</span></p>
                )}
                <p><strong>Fecha de Solicitud:</strong> {new Date(request.requestDate).toLocaleString()}</p>
                {request.status === 'Aceptado' && request.trackingNumber && (
                  <div className="mt-4 text-right">
                    <Link 
                      to={`/tracking?number=${request.trackingNumber}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      Ver Seguimiento
                    </Link>
                  </div>
                )}
              </div>
            ))}

            {/* Opcional: Mostrar shipments directamente si no todos vienen de requests */}
            {/* {shipments.map(ship => (
              <div key={ship.id} className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Envío #{ship.id}</h3>
                <p><strong>Tracking:</strong> {ship.trackingNumber}</p>
                <p><strong>Estado:</strong> {ship.status}</p>
                <p><strong>Última Ubicación:</strong> {ship.history[ship.history.length - 1]?.location}</p>
              </div>
            ))} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientShipmentHistory; 