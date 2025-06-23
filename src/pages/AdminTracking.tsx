import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Package } from '../types';
import TrackingTimeline from '../components/tracking/TrackingTimeline';
import { useSuccessModal } from '../hooks/useSuccessModal';
import { API_CONFIG } from '../config/api';

const AdminTracking: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('tracking') || '');
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isVisible, message, showSuccess, hideSuccess } = useSuccessModal();

  // Cargar tracking number desde URL si existe
  useEffect(() => {
    const trackingFromUrl = searchParams.get('tracking');
    if (trackingFromUrl) {
      setTrackingNumber(trackingFromUrl);
      // Buscar automáticamente el paquete
      searchPackage(trackingFromUrl);
    }
  }, [searchParams]);

  const searchPackage = async (tracking: string) => {
    if (!tracking.trim()) {
      setError('Por favor ingresa un número de tracking');
      return;
    }

    setIsLoading(true);
    setError('');
    setPackageData(null);

    try {
      const response = await fetch(`${API_CONFIG.getPackagesUrl()}/tracking/${tracking.trim()}`);
      const data = await response.json();

      if (response.ok) {
        console.log('Datos recibidos del backend:', data);
        console.log('Origin:', data.origin);
        console.log('Destination:', data.destination);
        console.log('Todos los campos disponibles:', Object.keys(data));
        setPackageData(data);
      } else {
        setError(data.error || 'Paquete no encontrado');
      }
    } catch (error) {
      setError('Error de conexión: No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchPackage(trackingNumber);
  };

  const handleTrackingNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackingNumber(e.target.value);
    // Actualizar URL sin recargar la página
    if (e.target.value) {
      setSearchParams({ tracking: e.target.value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">🔍 Seguimiento de Paquetes - Admin</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row>
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Número de Tracking</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ej: BOA-2024-001"
                        value={trackingNumber}
                        onChange={handleTrackingNumberChange}
                        disabled={isLoading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="w-100"
                      disabled={isLoading || !trackingNumber.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Buscando...
                        </>
                      ) : (
                        '🔍 Buscar'
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-3">
                  ❌ {error}
                </Alert>
              )}

              {packageData && (
                <div className="mt-4">
                  <Card className="border-success">
                    <Card.Header className="bg-success text-white">
                      <h5 className="mb-0">📦 Información del Paquete</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <p><strong>Número de Tracking:</strong> {packageData.tracking_number}</p>
                          <p><strong>Estado:</strong> 
                            <span className={`badge ms-2 ${
                              packageData.status === 'delivered' ? 'bg-success' :
                              packageData.status === 'in_transit' ? 'bg-warning' :
                              packageData.status === 'pending' ? 'bg-secondary' :
                              'bg-info'
                            }`}>
                              {packageData.status === 'delivered' ? 'Entregado' :
                               packageData.status === 'in_transit' ? 'En Tránsito' :
                               packageData.status === 'pending' ? 'Pendiente' :
                               packageData.status}
                            </span>
                          </p>
                          <p><strong>Descripción:</strong> {packageData.description}</p>
                          <p><strong>Peso:</strong> {packageData.weight} kg</p>
                        </Col>
                        <Col md={6}>
                          <p><strong>Remitente:</strong> {packageData.sender_name}</p>
                          <p><strong>Destinatario:</strong> {packageData.recipient_name}</p>
                          <p><strong>Origen:</strong> {packageData.origin}</p>
                          <p><strong>Destino:</strong> {packageData.destination}</p>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {packageData.events && packageData.events.length > 0 && (
                    <div className="mt-4">
                      <h5>📋 Historial de Eventos</h5>
                      <TrackingTimeline events={packageData.events} />
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminTracking;
