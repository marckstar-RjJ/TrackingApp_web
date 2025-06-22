import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface PreRegistration {
  id: number;
  trackingNumber: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_email: string;
  weight: number;
  cargo_type: string;
  origin_city: string;
  destination_city: string;
  description: string;
  priority: string;
  shipping_type: string;
  cost: number;
  estimated_delivery_date: string;
  user_email: string;
  created_at: string;
  status?: string;
  approved_at?: string;
  approved_tracking_number?: string;
}

interface EditForm {
  sender_name: string;
  sender_email: string;
  recipient_name: string;
  recipient_email: string;
  weight: number;
}

const AdminPreRegistrations: React.FC = () => {
  const navigate = useNavigate();
  const [preregistrations, setPreregistrations] = useState<PreRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [selectedPreregistration, setSelectedPreregistration] = useState<PreRegistration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPreregistration, setEditingPreregistration] = useState<PreRegistration | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    sender_name: '',
    sender_email: '',
    recipient_name: '',
    recipient_email: '',
    weight: 0
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'update' | 'delete' | 'approve' | null>(null);
  const [actionPreregistration, setActionPreregistration] = useState<PreRegistration | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchPreRegistrations = async (query = '', status = 'Todos') => {
    setIsLoading(true);
    try {
      let url = `http://localhost:3000/api/preregistrations/all?search=${query}`;
      if (status !== 'Todos') {
        url += `&status=${status}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener los pre-registros');
      }
      const data = await response.json();
      setPreregistrations(data);
    } catch (error) {
      console.error(error);
      alert('No se pudieron cargar los pre-registros.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreRegistrations(searchQuery, filterStatus);
  }, [searchQuery, filterStatus]);

  const handleSearch = () => {
    fetchPreRegistrations(searchQuery, filterStatus);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  const handleShowDetails = (preregistration: PreRegistration) => {
    setSelectedPreregistration(preregistration);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPreregistration(null);
  };

  const handleEdit = (preregistration: PreRegistration) => {
    setEditingPreregistration(preregistration);
    setEditForm({
      sender_name: preregistration.sender_name,
      sender_email: preregistration.sender_email,
      recipient_name: preregistration.recipient_name,
      recipient_email: preregistration.recipient_email,
      weight: preregistration.weight
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPreregistration(null);
    setEditForm({
      sender_name: '',
      sender_email: '',
      recipient_name: '',
      recipient_email: '',
      weight: 0
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'weight' ? parseFloat(value) || 0 : value
    }));
  };

  const handleUpdatePreregistration = async () => {
    if (!editingPreregistration) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`http://localhost:3000/api/preregistrations/${editingPreregistration.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        alert('Pre-registro actualizado exitosamente');
        handleCloseEditModal();
        fetchPreRegistrations(searchQuery, filterStatus);
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      alert('Error de conexión: No se pudo conectar con el servidor.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmUpdate = () => {
    setConfirmAction('update');
    setActionPreregistration(editingPreregistration);
    setShowConfirmModal(true);
  };

  const handleConfirmApprove = (preregistration: PreRegistration) => {
    setConfirmAction('approve');
    setActionPreregistration(preregistration);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = (preregistration: PreRegistration) => {
    setConfirmAction('delete');
    setActionPreregistration(preregistration);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setActionPreregistration(null);
  };

  const handleExecuteAction = async () => {
    if (!actionPreregistration || !confirmAction) return;

    switch (confirmAction) {
      case 'update':
        setIsUpdating(true);
        try {
          const response = await fetch(`http://localhost:3000/api/preregistrations/${actionPreregistration.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(editForm),
          });

          if (response.ok) {
            handleShowSuccess('Pre-registro actualizado exitosamente');
            handleCloseEditModal();
            handleCloseConfirmModal();
            fetchPreRegistrations(searchQuery, filterStatus);
          } else {
            const errorData = await response.json();
            alert(`Error al actualizar: ${errorData.error || 'Error desconocido'}`);
          }
        } catch (error) {
          alert('Error de conexión: No se pudo conectar con el servidor.');
        } finally {
          setIsUpdating(false);
        }
        break;

      case 'approve':
        setIsApproving(true);
        try {
          const response = await fetch(`http://localhost:3000/api/preregistrations/${actionPreregistration.id}/approve`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            handleShowSuccess(`Pre-registro aprobado exitosamente. Nuevo número de tracking: ${result.trackingNumber}`);
            handleCloseConfirmModal();
            fetchPreRegistrations(searchQuery, filterStatus);
          } else {
            const errorData = await response.json();
            alert(`Error al aprobar: ${errorData.error || 'Error desconocido'}`);
          }
        } catch (error) {
          alert('Error de conexión: No se pudo conectar con el servidor.');
        } finally {
          setIsApproving(false);
        }
        break;

      case 'delete':
        setIsDeleting(true);
        try {
          const response = await fetch(`http://localhost:3000/api/preregistrations/${actionPreregistration.id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            handleShowSuccess('Pre-registro eliminado exitosamente');
            handleCloseConfirmModal();
            fetchPreRegistrations(searchQuery, filterStatus);
          } else {
            const errorData = await response.json();
            alert(`Error al eliminar: ${errorData.error || 'Error desconocido'}`);
          }
        } catch (error) {
          alert('Error de conexión: No se pudo conectar con el servidor.');
        } finally {
          setIsDeleting(false);
        }
        break;
    }
  };

  const handleUpdate = () => {
    fetchPreRegistrations(searchQuery, filterStatus);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${datePart} ${timePart} hs`;
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      handleShowSuccess('Número de tracking copiado al portapapeles.');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleShowSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage(null);
  };

  const renderItem = (item: PreRegistration) => (
    <div key={item.id} className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{item.trackingNumber}</h3>
          <p className="text-gray-600 mb-1">Descripción: {item.description}</p>
          <p className="text-gray-600 mb-1">Remitente: {item.sender_name}</p>
          <p className="text-gray-600 mb-1">Destinatario: {item.recipient_name}</p>
          <p className="text-gray-600 mb-1">Peso: {item.weight} kg</p>
          <p className="text-gray-600 mb-1">Costo: Bs. {item.cost}</p>
          <p className="text-gray-600 mb-1">Usuario: {item.user_email}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-2">{formatDate(item.created_at)}</p>
          {item.status && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              item.status === 'Aprobado' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {item.status}
            </span>
          )}
        </div>
      </div>
      
      {item.status === 'Aprobado' && item.approved_tracking_number && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium text-blue-800">Tracking Aprobado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">{item.approved_tracking_number}</span>
            <button
              onClick={() => handleCopyToClipboard(item.approved_tracking_number!)}
              className="text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          {item.approved_at && (
            <p className="text-sm text-blue-600 mt-1">{formatDateTime(item.approved_at)}</p>
          )}
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        <button
          onClick={() => handleShowDetails(item)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
        >
          Ver Detalles
        </button>
        
        {item.status !== 'Aprobado' && (
          <>
            <button
              onClick={() => handleEdit(item)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition duration-300"
              disabled={isUpdating}
            >
              {isUpdating ? 'Editando...' : 'Editar'}
            </button>
            
            <button
              onClick={() => handleConfirmApprove(item)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
              disabled={isApproving}
            >
              {isApproving ? 'Aprobando...' : 'Aprobar'}
            </button>
          </>
        )}
        
        <button
          onClick={() => handleConfirmDelete(item)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300"
          disabled={isDeleting}
        >
          {isDeleting ? 'Eliminando...' : 'Borrar'}
        </button>
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
              <h1 className="text-3xl font-bold text-white">Pre-Registros</h1>
              <p className="text-white/80">Revisar y aprobar solicitudes</p>
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
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Buscar pre-registros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300"
              >
                Buscar
              </button>
            </div>
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg transition duration-300 ${
                  filterStatus === 'Todos' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleFilterChange('Todos')}
              >
                Todos
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition duration-300 ${
                  filterStatus === 'Pendiente' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleFilterChange('Pendiente')}
              >
                Pendientes
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition duration-300 ${
                  filterStatus === 'Aprobado' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleFilterChange('Aprobado')}
              >
                Aprobados
              </button>
            </div>
          </div>
        </div>

        {/* Lista de pre-registros */}
        <div>
          {isLoading ? (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-gray-600 text-lg">Cargando pre-registros...</div>
            </div>
          ) : preregistrations.length > 0 ? (
            preregistrations.map(renderItem)
          ) : (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
              <p className="text-gray-600 text-lg">No hay pre-registros con los filtros seleccionados.</p>
            </div>
          )}
        </div>

        {/* Modal de detalles */}
        {showDetailModal && selectedPreregistration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Detalles del Pre-Registro</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Información del Remitente</h4>
                  <p><strong>Nombre:</strong> {selectedPreregistration.sender_name}</p>
                  <p><strong>Email:</strong> {selectedPreregistration.sender_email}</p>
                  <p><strong>Teléfono:</strong> {selectedPreregistration.sender_phone}</p>
                  <p><strong>Dirección:</strong> {selectedPreregistration.sender_address}</p>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Información del Destinatario</h4>
                  <p><strong>Nombre:</strong> {selectedPreregistration.recipient_name}</p>
                  <p><strong>Email:</strong> {selectedPreregistration.recipient_email}</p>
                  <p><strong>Teléfono:</strong> {selectedPreregistration.recipient_phone}</p>
                  <p><strong>Dirección:</strong> {selectedPreregistration.recipient_address}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-bold text-gray-900 mb-3">Detalles del Envío</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><strong>Descripción:</strong> {selectedPreregistration.description}</p>
                  <p><strong>Peso:</strong> {selectedPreregistration.weight} kg</p>
                  <p><strong>Tipo de Carga:</strong> {selectedPreregistration.cargo_type}</p>
                  <p><strong>Prioridad:</strong> {selectedPreregistration.priority}</p>
                  <p><strong>Tipo de Envío:</strong> {selectedPreregistration.shipping_type}</p>
                  <p><strong>Costo:</strong> Bs. {selectedPreregistration.cost}</p>
                  <p><strong>Ciudad Origen:</strong> {selectedPreregistration.origin_city}</p>
                  <p><strong>Ciudad Destino:</strong> {selectedPreregistration.destination_city}</p>
                  <p><strong>Fecha Estimada:</strong> {formatDate(selectedPreregistration.estimated_delivery_date)}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-bold text-gray-900 mb-3">Información del Sistema</h4>
                <p><strong>Usuario:</strong> {selectedPreregistration.user_email}</p>
                <p><strong>Fecha de Creación:</strong> {formatDateTime(selectedPreregistration.created_at)}</p>
                <p><strong>Estado:</strong> {selectedPreregistration.status || 'Pendiente'}</p>
                {selectedPreregistration.approved_tracking_number && (
                  <p><strong>Tracking Aprobado:</strong> {selectedPreregistration.approved_tracking_number}</p>
                )}
                {selectedPreregistration.approved_at && (
                  <p><strong>Fecha de Aprobación:</strong> {formatDateTime(selectedPreregistration.approved_at)}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {showEditModal && editingPreregistration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Editar Pre-Registro</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Remitente *
                  </label>
                  <input
                    type="text"
                    name="sender_name"
                    value={editForm.sender_name}
                    onChange={handleEditInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email del Remitente
                  </label>
                  <input
                    type="email"
                    name="sender_email"
                    value={editForm.sender_email}
                    onChange={handleEditInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Destinatario *
                  </label>
                  <input
                    type="text"
                    name="recipient_name"
                    value={editForm.recipient_name}
                    onChange={handleEditInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email del Destinatario
                  </label>
                  <input
                    type="email"
                    name="recipient_email"
                    value={editForm.recipient_email}
                    onChange={handleEditInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso (kg) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={editForm.weight}
                    onChange={handleEditInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Información del Sistema</h4>
                  <p className="text-sm text-gray-600"><strong>Usuario:</strong> {editingPreregistration.user_email}</p>
                  <p className="text-sm text-gray-600"><strong>Fecha de Creación:</strong> {formatDateTime(editingPreregistration.created_at)}</p>
                  <p className="text-sm text-gray-600"><strong>Estado:</strong> {editingPreregistration.status || 'Pendiente'}</p>
                  <p className="text-sm text-gray-600"><strong>Número de Tracking:</strong> {editingPreregistration.trackingNumber}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={handleCloseEditModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
                  disabled={isUpdating}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación */}
        {showConfirmModal && actionPreregistration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Confirmar Acción</h3>
              
              <p className="text-gray-600 mb-4">¿Estás seguro de que quieres {confirmAction === 'update' ? 'actualizar' : confirmAction === 'approve' ? 'aprobar' : 'eliminar'} este pre-registro?</p>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={handleCloseConfirmModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExecuteAction}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  {confirmAction === 'update' ? 'Actualizar' : confirmAction === 'approve' ? 'Aprobar' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de éxito */}
        {showSuccessModal && successMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-green-700">¡Éxito!</h3>
              <p className="text-gray-700 mb-6">{successMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={handleCloseSuccessModal}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPreRegistrations;
