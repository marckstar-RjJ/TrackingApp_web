import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TrackingModal from '../components/tracking/TrackingModal';
import CostCalculatorModal from '../components/tracking/CostCalculatorModal';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showCostCalculatorModal, setShowCostCalculatorModal] = useState(false);

  const dashboardCards = [
    {
      title: 'Rastrear Paquete',
      description: 'Consulta el estado de tu envío',
      icon: (
        <svg className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      onClick: () => setShowTrackingModal(true),
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Calcular Costos',
      description: 'Calcula el precio de tu envío',
      icon: (
        <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => setShowCostCalculatorModal(true),
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-cover bg-center bg-no-repeat" 
           style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
        <div className="container mx-auto px-4 py-8">
          {/* Header del Dashboard */}
          <div className="text-center mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 max-w-2xl mx-auto">
              <img 
                src="/images/logo_central.png" 
                alt="BOA Tracking" 
                className="h-40 mx-auto mb-6"
              />
              <h1 className="text-4xl font-bold text-white mb-3">
                Bienvenido, {user?.firstName}!
              </h1>
              <p className="text-xl text-white/90">
                Panel de Usuario - BOA Tracking System
              </p>
            </div>
          </div>

          {/* Tarjetas de Funciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {dashboardCards.map((card, index) => (
              <div
                key={index}
                className={`${card.bgColor} ${card.borderColor} border-2 rounded-2xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer`}
                onClick={card.onClick}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Información Adicional */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Información Rápida
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Seguimiento en Tiempo Real</h3>
                  <p className="text-sm text-gray-600">Monitorea tus envíos en tiempo real</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Precios Competitivos</h3>
                  <p className="text-sm text-gray-600">Tarifas accesibles y transparentes</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Soporte 24/7</h3>
                  <p className="text-sm text-gray-600">Atención al cliente disponible</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrackingModal 
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
      />
      
      <CostCalculatorModal 
        isOpen={showCostCalculatorModal}
        onClose={() => setShowCostCalculatorModal(false)}
      />
    </>
  );
};

export default UserDashboard; 