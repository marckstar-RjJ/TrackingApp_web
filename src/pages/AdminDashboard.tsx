import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [searchTracking, setSearchTracking] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/packages');
        const data = await res.json();
        if (Array.isArray(data)) {
          setPackages(data);
        } else {
          setPackages([]);
        }
      } catch (e) {
        setPackages([]);
      }
    };

    fetchPackages();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOpenHistoryList = () => setShowHistoryModal(true);
  const handleCloseHistoryList = () => setShowHistoryModal(false);
  const handleSelectPackage = (pkg: any) => {
    setShowHistoryModal(false);
    navigate('/admin/package-history', {
      state: { trackingNumber: pkg.tracking_number || pkg.trackingNumber }
    });
  };

  const filteredPackages = packages.filter(pkg =>
    !searchTracking.trim() ||
    (pkg.tracking_number || '').toLowerCase().includes(searchTracking.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        {/* (Eliminado) <div className="flex justify-between items-center mb-8"> ... </div> */}

        {/* Información del usuario */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.firstName}</h2>
              <p className="text-gray-600">Administrador del Sistema</p>
              <p className="text-purple-600 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* ÁREA LOGÍSTICA */}
        <div className="mb-8">
          <div className="bg-purple-100/80 backdrop-blur-md rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-purple-600">Área Logística</h3>
                <p className="text-gray-600 text-sm">Gestión de envíos y seguimiento de paquetes</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link 
              to="/admin/register-shipping"
              className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
            >
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Registrar Envío</h4>
              <p className="text-gray-600 text-sm">Crear nuevo paquete en el sistema</p>
            </Link>

            <Link 
              to="/admin/tracking"
              className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
            >
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Seguimiento</h4>
              <p className="text-gray-600 text-sm">Consultar estado de paquetes</p>
            </Link>

            <Link 
              to="/admin/package-history"
              className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
            >
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Historial</h4>
              <p className="text-gray-600 text-sm">Ver historial completo</p>
            </Link>
          </div>
        </div>

        {/* ÁREA DE ATENCIÓN AL CLIENTE */}
        <div className="mb-8">
          <div className="bg-green-100/80 backdrop-blur-md rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-green-600">Atención al Cliente</h3>
                <p className="text-gray-600 text-sm">Gestión de reclamos y soporte</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              to="/admin/claims"
              className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
            >
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A2 2 0 004 6v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-1.41.59z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Reclamos</h4>
              <p className="text-gray-600 text-sm">Gestionar reclamos de usuarios</p>
            </Link>

            <Link 
              to="/admin/return-requests"
              className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
            >
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10m-2-5v10m-2-5v10" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Devoluciones</h4>
              <p className="text-gray-600 text-sm">Gestionar solicitudes de devolución</p>
            </Link>
          </div>
        </div>

        {/* ÁREA DE GESTIÓN OPERATIVA */}
        <div className="mb-8">
          <div className="bg-orange-100/80 backdrop-blur-md rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-orange-600">Gestión Operativa</h3>
                <p className="text-gray-600 text-sm">Control y monitoreo del sistema</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              to="/admin/internal-alerts"
              className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
            >
              <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A2 2 0 004 6v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-1.41.59z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Alertas Internas</h4>
              <p className="text-gray-600 text-sm">Monitorear paquetes retrasados</p>
            </Link>

            <Link 
              to="/admin/preregistrations"
              className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
            >
              <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Pre-Registros</h4>
              <p className="text-gray-600 text-sm">Revisar y aprobar solicitudes</p>
            </Link>
          </div>
        </div>

        {/* Modal de historial */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4">
              <h3 className="text-xl font-bold mb-4">Selecciona un paquete</h3>
              <input
                type="text"
                placeholder="Buscar por número de tracking..."
                value={searchTracking}
                onChange={(e) => setSearchTracking(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              />
              <div className="max-h-96 overflow-y-auto">
                {packages.length === 0 ? (
                  <p className="text-gray-500 text-center">No hay paquetes registrados.</p>
                ) : (
                  filteredPackages.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg)}
                      className="w-full text-left p-3 border-b border-gray-200 hover:bg-gray-50"
                    >
                      <p className="font-medium">{pkg.tracking_number} - {pkg.description}</p>
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={handleCloseHistoryList}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 
