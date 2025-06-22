import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SuccessModal from '../components/SuccessModal';
import { useSuccessModal } from '../hooks/useSuccessModal';

interface Claim {
  id: number;
  name: string;
  email: string;
  tracking_number?: string;
  description: string;
  status?: string;
  response?: string;
  created_at: string;
}

const AdminClaims: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [responseText, setResponseText] = useState('');
  const { isVisible, message, showSuccess, hideSuccess } = useSuccessModal();

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/claims');
      if (response.ok) {
        const data = await response.json();
        setClaims(data);
      } else {
        console.error('Error fetching claims');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleOpenModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setResponseText(claim.response || '');
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedClaim(null);
    setIsModalVisible(false);
    setResponseText('');
  };

  const handleRespond = async () => {
    if (!selectedClaim) return;

    try {
      const response = await fetch(`http://localhost:3000/api/claims/${selectedClaim.id}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: responseText, admin_name: user?.firstName }),
      });

      if (response.ok) {
        showSuccess('Respuesta enviada exitosamente.');
        handleCloseModal();
        fetchClaims(); // Recargar los reclamos
      } else {
        console.error('Error responding to claim');
      }
    } catch (error) {
      console.error("Error responding to claim:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Número de seguimiento copiado al portapapeles.');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesId = claim.id.toString().includes(searchId);
    
    let matchesStatus = true; // 'Todos'
    if (statusFilter === 'Pendiente') {
      matchesStatus = (claim.status || '').toLowerCase() !== 'respondido';
    } else if (statusFilter === 'Respondido') {
      matchesStatus = (claim.status || '').toLowerCase() === 'respondido';
    }

    return matchesId && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center" 
           style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
        <div className="text-white text-xl">Cargando reclamos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <img src="/images/logo_boa.png" alt="BOA Tracking" className="h-16 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-white">Gestión de Reclamos</h1>
              <p className="text-white/80">Administrar reclamos de usuarios</p>
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
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por ID de reclamo..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg transition duration-300 ${
                statusFilter === 'Todos' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setStatusFilter('Todos')}
            >
              Todos
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition duration-300 ${
                statusFilter === 'Pendiente' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setStatusFilter('Pendiente')}
            >
              Pendientes
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition duration-300 ${
                statusFilter === 'Respondido' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setStatusFilter('Respondido')}
            >
              Respondidos
            </button>
          </div>
        </div>

        {/* Lista de reclamos */}
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <div key={claim.id} className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Reclamo #{claim.id}</h3>
                  <p className="text-gray-600">De: {claim.name}</p>
                  <p className="text-gray-600">{claim.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  (claim.status || '').toLowerCase() === 'respondido' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {claim.status || 'Pendiente'}
                </span>
              </div>
              
              {claim.tracking_number && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium">Tracking:</span>
                  <span className="text-blue-600">{claim.tracking_number}</span>
                  <button
                    onClick={() => copyToClipboard(claim.tracking_number!)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="mb-4">
                <p className="font-medium mb-2">Reclamo:</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{claim.description}</p>
              </div>
              
              {claim.response && (
                <div className="mb-4">
                  <p className="font-medium mb-2">Respuesta:</p>
                  <p className="text-gray-700 bg-green-50 p-3 rounded-lg">{claim.response}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Fecha: {new Date(claim.created_at).toLocaleString()}
                </span>
                <button
                  onClick={() => handleOpenModal(claim)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  {claim.response ? 'Ver/Editar Respuesta' : 'Responder'}
                </button>
              </div>
            </div>
          ))}
          
          {filteredClaims.length === 0 && (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
              <p className="text-gray-600 text-lg">No hay reclamos con los filtros seleccionados.</p>
            </div>
          )}
        </div>

        {/* Modal de respuesta */}
        {isModalVisible && selectedClaim && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4">
              <h3 className="text-xl font-bold mb-4">
                {selectedClaim.response ? 'Editar Respuesta' : 'Responder al Reclamo'}
              </h3>
              
              <div className="mb-4">
                <p className="font-medium mb-2">Reclamo de {selectedClaim.name}:</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedClaim.description}</p>
              </div>
              
              <div className="mb-4">
                <label className="block font-medium mb-2">Respuesta:</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none"
                  placeholder="Escribe tu respuesta aquí..."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRespond}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  {selectedClaim.response ? 'Actualizar Respuesta' : 'Enviar Respuesta'}
                </button>
              </div>
            </div>
          </div>
        )}
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

export default AdminClaims;
