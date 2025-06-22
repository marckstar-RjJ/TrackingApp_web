import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const WalletPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
      <div className="max-w-xl w-full mx-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105">
          <div className="text-center mb-8">
            <img 
              src="/images/logo_boa.png" 
              alt="BOA Tracking" 
              className="h-20 mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900">Mi Billetera</h2>
            <p className="mt-2 text-gray-600">
              Gestiona tus fondos y métodos de pago
            </p>
          </div>

          <div className="space-y-6">
            {/* Saldo actual */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Saldo actual disponible</p>
              <p className="text-4xl font-extrabold text-blue-800 mt-2">$0.00</p>
              <p className="text-sm text-gray-500 mt-1">Cargado a la cuenta de {user?.firstName || 'Usuario'}</p>
            </div>

            {/* Historial de transacciones */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Historial de Transacciones</h3>
              <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
                <p className="text-gray-500 text-center py-4">
                  No hay transacciones recientes para mostrar.
                </p>
              </div>
            </div>

            {/* Métodos de pago */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Métodos de Pago</h3>
              <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
                <p className="text-gray-500 text-center py-4">
                  No hay métodos de pago registrados.
                </p>
                <button
                  className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105"
                >
                  Agregar Método de Pago
                </button>
              </div>
            </div>

            {/* Botón de recarga (opcional) */}
            <button
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition-all duration-200 hover:scale-105"
            >
              Recargar Saldo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage; 