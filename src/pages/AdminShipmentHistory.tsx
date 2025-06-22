// @ts-nocheck
import React, { useEffect, useState } from 'react';
import MockDataService from '../services/MockDataService';
import { Shipment } from '../types/auth';
import { Link } from 'react-router-dom';

const AdminShipmentHistory: React.FC = () => {
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShipments = () => {
      try {
        setLoading(true);
        setError('');
        const shipments = MockDataService.getInstance().getShipments();
        setAllShipments(shipments);
        setFilteredShipments(shipments);
      } catch (err) {
        setError('Error al cargar el historial de envíos.');
        console.error('Error fetching shipment history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = allShipments.filter(shipment => 
      shipment.trackingNumber.toLowerCase().includes(lowercasedSearchTerm) ||
      shipment.origin.toLowerCase().includes(lowercasedSearchTerm) ||
      shipment.destination.toLowerCase().includes(lowercasedSearchTerm) ||
      shipment.status.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredShipments(filtered);
  }, [searchTerm, allShipments]);

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
            <h2 className="text-3xl font-bold text-gray-900">Historial de Envíos (Administrador)</h2>
            <p className="mt-2 text-gray-600">
              Revise y busque todos los envíos registrados en el sistema.
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="search" className="sr-only">Buscar envíos</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Buscar por Tracking, Origen, Destino o Estado"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredShipments.length === 0 ? (
            <div className="text-center text-gray-700 text-lg">
              No hay envíos que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredShipments.map(shipment => (
                <div key={shipment.id} className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Envío: {shipment.trackingNumber}</h3>
                  <p><strong>Origen:</strong> {shipment.origin}</p>
                  <p><strong>Destino:</strong> {shipment.destination}</p>
                  <p><strong>Estado:</strong> <span className="font-bold text-green-600">{shipment.status}</span></p>
                  <p><strong>Última Ubicación:</strong> {shipment.history[shipment.history.length - 1]?.location || 'N/A'}</p>
                  <p><strong>Última Actualización:</strong> {new Date(shipment.history[shipment.history.length - 1]?.timestamp).toLocaleString() || 'N/A'}</p>
                  <div className="mt-4 text-right">
                    <Link 
                      to={`/tracking?number=${shipment.trackingNumber}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      Ver Detalles de Tracking
                    </Link>
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

export default AdminShipmentHistory; 