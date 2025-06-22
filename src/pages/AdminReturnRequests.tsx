import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReturnRequest {
  id: number;
  user_email: string;
  package_tracking_number: string;
  first_name: string;
  last_name: string;
  reason: string;
  status: string;
  rejection_comment?: string;
  created_at: string;
}

const AdminReturnRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchRequests = useCallback(async (status: string) => {
    setIsLoading(true);
    try {
      let url = `http://localhost:3000/api/returns/requests`;
      if (status !== 'all') {
        url += `?status=${status}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setRequests(data);
      } else {
        alert('No se pudieron cargar las solicitudes.');
      }
    } catch (error) {
      alert('Error de Conexión: No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(filter);
  }, [fetchRequests, filter]);

  const openRejectionModal = (request: ReturnRequest) => {
    setSelectedRequest(request);
    setRejectionModalVisible(true);
  };

  const openDetailModal = (request: ReturnRequest) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  const handleApprove = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas aprobar esta devolución? El paquete original será eliminado.")) {
      try {
        const res = await fetch(`http://localhost:3000/api/returns/requests/${id}/approve`, { 
          method: 'PUT' 
        });
        if (res.ok) {
          alert('Éxito: La devolución ha sido aprobada.');
          fetchRequests(filter);
        } else {
          alert('Error al aprobar la devolución.');
        }
      } catch (error) {
        alert('Error de Conexión: No se pudo conectar con el servidor.');
      }
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionComment.trim()) {
      alert("Error: Debes seleccionar una solicitud y escribir un motivo de rechazo.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/returns/requests/${selectedRequest.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: rejectionComment }),
      });
      if (res.ok) {
        alert('Éxito: La solicitud ha sido rechazada.');
        setRejectionModalVisible(false);
        setRejectionComment('');
        fetchRequests(filter);
      } else {
        alert('Error al rechazar la solicitud.');
      }
    } catch (error) {
      alert('Error de Conexión: No se pudo conectar con el servidor.');
    }
  };

  const handleApproveFromModal = (id: number) => {
    setDetailModalVisible(false);
    handleApprove(id);
  };

  const handleRejectFromModal = (id: number) => {
    setDetailModalVisible(false);
    const request = requests.find(r => r.id === id);
    if (request) {
      openRejectionModal(request);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Número de tracking copiado al portapapeles.');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const renderItem = (item: ReturnRequest) => (
    <div key={item.id} className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Solicitud de Devolución #{item.id}</h3>
          <p className="text-gray-600 mb-1">Usuario: {item.user_email}</p>
          <p className="text-gray-600 mb-1">Nombre: {item.first_name} {item.last_name}</p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-600">Tracking Original:</span>
            <span className="text-blue-600">{item.package_tracking_number}</span>
            <button
              onClick={() => copyToClipboard(item.package_tracking_number)}
              className="text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mb-1">Razón: {item.reason}</p>
          <p className="text-gray-600 mb-1">Fecha: {new Date(item.created_at).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            item.status === 'pending' 
              ? 'bg-yellow-100 text-yellow-800' 
              : item.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {item.status === 'pending' ? 'Pendiente' : 
             item.status === 'approved' ? 'Aprobada' : 'Rechazada'}
          </span>
        </div>
      </div>

      {item.status === 'pending' && (
        <div className="flex gap-2">
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
            onClick={() => handleApprove(item.id)}
          >
            Aprobar Devolución
          </button>
          <button 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300"
            onClick={() => openRejectionModal(item)}
          >
            Rechazar Devolución
          </button>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
            onClick={() => openDetailModal(item)}
          >
            Ver Detalles
          </button>
        </div>
      )}
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
              <h1 className="text-3xl font-bold text-white">Gestión de Devoluciones</h1>
              <p className="text-white/80">Administrar solicitudes de devolución</p>
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
                filter === 'pending' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setFilter('pending')}
            >
              Pendientes
            </button>
            <button
              className={`px-6 py-3 rounded-lg transition duration-300 font-medium ${
                filter === 'approved' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setFilter('approved')}
            >
              Aprobadas
            </button>
            <button
              className={`px-6 py-3 rounded-lg transition duration-300 font-medium ${
                filter === 'rejected' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setFilter('rejected')}
            >
              Rechazadas
            </button>
            <button
              className={`px-6 py-3 rounded-lg transition duration-300 font-medium ${
                filter === 'all' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
          </div>
          </div>

        {/* Lista de solicitudes */}
        <div>
          {isLoading ? (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-gray-600 text-lg">Cargando solicitudes...</div>
            </div>
          ) : requests.length > 0 ? (
            requests.map(renderItem)
          ) : (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
              <p className="text-gray-600 text-lg">No hay solicitudes con este filtro.</p>
            </div>
          )}
        </div>

        {/* Modal de rechazo */}
        {rejectionModalVisible && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4">
              <h3 className="text-xl font-bold mb-4">Motivo del Rechazo</h3>
              <p className="text-gray-600 mb-4">
                Por favor, escribe un motivo claro. El usuario podrá ver este comentario.
              </p>
              
              <textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none mb-4"
                placeholder="Escribe el motivo del rechazo..."
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setRejectionModalVisible(false);
                    setRejectionComment('');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {detailModalVisible && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4">
              <h3 className="text-xl font-bold mb-4">Detalles de la Solicitud</h3>
              
              <div className="space-y-3 mb-6">
                <p><strong>ID:</strong> {selectedRequest.id}</p>
                <p><strong>Usuario:</strong> {selectedRequest.user_email}</p>
                <p><strong>Nombre:</strong> {selectedRequest.first_name} {selectedRequest.last_name}</p>
                <p><strong>Tracking:</strong> {selectedRequest.package_tracking_number}</p>
                <p><strong>Razón:</strong> {selectedRequest.reason}</p>
                <p><strong>Fecha:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
                <p><strong>Estado:</strong> {selectedRequest.status}</p>
                {selectedRequest.rejection_comment && (
                  <p><strong>Comentario de Rechazo:</strong> {selectedRequest.rejection_comment}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDetailModalVisible(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  Cerrar
                </button>
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApproveFromModal(selectedRequest.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleRejectFromModal(selectedRequest.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300"
                    >
                      Rechazar
                    </button>
                  </>
                )}
                </div>
            </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default AdminReturnRequests; 