import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white py-8 px-4 relative z-10">
      
      {/* Superposición sutil para mejorar legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

      <div className="max-w-6xl mx-auto z-20 relative">
        {/* Card de Presentación de la Aplicación */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 mb-12 animate-fade-in-up">
          <div className="text-center">
            <img 
              src="/images/logo_central.png" 
              alt="TrackingApp" 
              className="h-40 mx-auto mb-6 transform transition-all duration-500 hover:scale-110 filter drop-shadow-lg"
            />
            <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white leading-tight animate-fade-in-up-slow">
              TrackingApp
            </h1>
            <p className="text-xl text-blue-100 font-light tracking-wide mb-6 animate-fade-in-up-slower">
              Tu plataforma integral para el seguimiento y gestión de envíos aéreos. 
              Monitorea el estado de tus envíos con actualizaciones en tiempo real, 
              solicita nuevos envíos de forma fácil e intuitiva, y mantén tus datos 
              protegidos con los más altos estándares de seguridad.
            </p>
          </div>
        </div>

        {/* Card de Descarga de App Móvil */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-3xl shadow-2xl border border-purple-400/30 p-8 mb-12 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex-1 text-center lg:text-left mb-8 lg:mb-0">
              <h2 className="text-4xl font-bold text-white mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
                ¡Descarga Nuestra App Móvil!
              </h2>
              <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                Lleva el seguimiento de tus envíos en tu bolsillo. Nuestra aplicación móvil 
                te permite rastrear paquetes, solicitar envíos y recibir notificaciones 
                en tiempo real desde cualquier lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-black/80 hover:bg-black text-white px-8 py-4 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Descargar en</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </button>
                <button className="bg-black/80 hover:bg-black text-white px-8 py-4 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Disponible en</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
                <img 
                  src="/images/logo_app.png" 
                  alt="TrackingApp Mobile" 
                  className="relative h-64 w-64 object-contain transform transition-all duration-500 hover:scale-110 filter drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Servicios */}
        <div className="mt-12 text-center animate-fade-in-up">
          <h2 className="text-4xl font-bold text-white mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
            Nuestros Servicios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 shadow-md border border-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <h3 className="text-2xl font-semibold text-white mb-3">Envíos Nacionales</h3>
              <p className="text-blue-100">
                Servicio de envío aéreo a nivel nacional con seguimiento en tiempo real y cobertura en todo el país.
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 shadow-md border border-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <h3 className="text-2xl font-semibold text-white mb-3">Envíos Internacionales</h3>
              <p className="text-blue-100">
                Cobertura global con alianzas estratégicas para entregas seguras y eficientes en destinos internacionales.
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 shadow-md border border-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <h3 className="text-2xl font-semibold text-white mb-3">Servicio Express</h3>
              <p className="text-blue-100">
                Entrega urgente para documentos y paquetes de alta prioridad, con tiempos de entrega garantizados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;