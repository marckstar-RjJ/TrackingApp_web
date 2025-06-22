import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SuccessModal from '../components/SuccessModal';
import { useSuccessModal } from '../hooks/useSuccessModal';

interface InternalAlert {
  id: number;
  title: string;
  description: string;
  package_tracking: string;
  severity: string;
  created_at: string;
  solved_at?: string;
}

const AdminInternalAlerts: React.FC = () => {
  const navigate = useNavigate();
  const [internalAlerts, setInternalAlerts] = useState<InternalAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'solved'>('active');
  const { isVisible, message, showSuccess, hideSuccess } = useSuccessModal();

  const fetchInternalAlerts = useCallback(async (filterType: 'active' | 'solved') => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/alerts?filter=${filterType}`);
      if (response.ok) {
        const data = await response.json();
        setInternalAlerts(data);
      } else {
        console.error('Error fetching alerts');
        setInternalAlerts([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setInternalAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchInternalAlerts(filter);
  }, [fetchInternalAlerts, filter]);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('El número de tracking ha sido copiado al portapapeles.');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleSolveAlert = async (alertId: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/alerts/${alertId}/solve`, {
        method: 'PUT',
      });
      if (res.ok) {
        showSuccess('La alerta ha sido marcada como solucionada.');
        fetchInternalAlerts(filter); // Recargar las alertas
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'No se pudo solucionar la alerta.');
      }
    } catch (error) {
      alert('Error de Conexión: No se pudo conectar con el servidor.');
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#fbc02d';
      default:
        return '#1976d2';
    }
  };

  const renderActiveAlert = (alert: InternalAlert & { timeSinceLastUpdate: number }) => (
    <div key={alert.id} className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{alert.title}</h3>
          <p className="text-gray-700 mb-3">{alert.description}</p>
        </div>
        <div 
          className="px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: getAlertColor(alert.severity) }}
        >
          {alert.severity.toUpperCase()}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <span className="font-medium">Tracking:</span>
        <span className="text-blue-600">{alert.package_tracking}</span>
        <button
          onClick={() => handleCopyToClipboard(alert.package_tracking)}
          className="text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <p>Última actualización: {new Date(alert.created_at).toLocaleString()}</p>
        <p>Retraso: {alert.timeSinceLastUpdate.toFixed(1)} horas</p>
      </div>

      <button 
        onClick={() => handleSolveAlert(alert.id)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Marcar como Solucionado
      </button>
    </div>
  );

  const renderSolvedAlert = (alert: InternalAlert) => (
    <div key={alert.id} className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl mb-4">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-xl font-bold text-gray-900">{alert.title}</h3>
      </div>
      
      <p className="text-gray-700 mb-3">{alert.description}</p>
      
      <div className="flex items-center gap-2 mb-3">
        <span className="font-medium">Tracking:</span>
        <span className="text-blue-600">{alert.package_tracking}</span>
        <button
          onClick={() => handleCopyToClipboard(alert.package_tracking)}
          className="text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      
      <div className="text-sm text-gray-600">
        {alert.solved_at && (
          <p>Solucionado: {new Date(alert.solved_at).toLocaleString()}</p>
        )}
        <p>Creada: {new Date(alert.created_at).toLocaleString()}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <img src="/images/logo_boa.png" alt="BOA Tracking" className="h-16 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-white">Alertas Internas</h1>
              <p className="text-white/80">Monitorear paquetes retrasados</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            Volver al Dashboard
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex gap-4">
            <button
              className={`px-6 py-3 rounded-lg transition duration-300 font-medium ${
                filter === 'active' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setFilter('active')}
            >
              Activas
            </button>
            <button
              className={`px-6 py-3 rounded-lg transition duration-300 font-medium ${
                filter === 'solved' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setFilter('solved')}
            >
              Solucionadas
            </button>
          </div>
        </div>

        {/* Lista de alertas */}
        <div>
          {isLoading ? (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-gray-600 text-lg">Cargando alertas...</div>
            </div>
          ) : internalAlerts.length > 0 ? (
            internalAlerts.map(alert => 
              filter === 'active' ? renderActiveAlert(alert as any) : renderSolvedAlert(alert)
            )
          ) : (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
              <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-600 text-lg">No hay alertas internas en este momento.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de éxito */}
      <SuccessModal 
        isVisible={isVisible}
        message={message}
        onClose={hideSuccess}
      />
    </div>
  );
};

export default AdminInternalAlerts;
