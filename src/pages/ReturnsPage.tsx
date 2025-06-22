import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ReturnRequest {
  trackingNumber: string;
  reason: string;
  description: string;
}

const ReturnsPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ReturnRequest>({
    trackingNumber: '',
    reason: '',
    description: ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá la lógica para enviar la solicitud de devolución
    console.log('Solicitud de devolución:', formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105">
          <div className="text-center mb-8">
            <img 
              src="/images/logo_boa.png" 
              alt="BOA Tracking" 
              className="h-20 mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900">Solicitud de Devolución</h2>
            <p className="mt-2 text-gray-600">
              Envía tu solicitud de devolución de manera sencilla
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700">
                Número de Seguimiento
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="trackingNumber"
                  id="trackingNumber"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ej: BOA123456789"
                  value={formData.trackingNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Motivo de la Devolución
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v14m-9 0h18" />
                  </svg>
                </div>
                <select
                  name="reason"
                  id="reason"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.reason}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un motivo</option>
                  <option value="damaged">Paquete dañado</option>
                  <option value="wrong_item">Producto incorrecto</option>
                  <option value="missing_items">Faltan artículos</option>
                  <option value="quality">Problemas de calidad</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción Detallada
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Proporciona una descripción detallada del problema..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105"
              >
                Enviar Solicitud
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage; 