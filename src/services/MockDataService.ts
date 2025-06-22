import db from '../data/db.json';
import { User, Shipment, RegisterCredentials, UserRole, ShipmentRequest, ReturnRequest } from '../types/auth'; // Asegúrate de que User y RegisterCredentials estén definidos en auth.ts

class MockDataService {
  private static instance: MockDataService;
  private data: {
    users: User[];
    shipments: Shipment[];
    requests: ShipmentRequest[]; 
    returns: ReturnRequest[];
  };

  private constructor() {
    const savedData = localStorage.getItem('mockDbData');
    if (savedData) {
      this.data = JSON.parse(savedData);
      // Asegúrate de parsear las fechas de string a Date al cargar desde localStorage
      this.data.users = this.data.users.map(user => ({
        ...user,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
      }));
      // Asegúrate de que los envíos también se inicialicen correctamente con la nueva estructura
      this.data.shipments = this.data.shipments.map((s: any) => ({
        id: s.id,
        trackingNumber: s.trackingNumber,
        origin: s.senderAddress || s.origin,
        destination: s.recipientAddress || s.destination,
        customerId: s.customerId || "unknown_customer",
        status: s.status,
        history: s.history || [],
        createdAt: s.createdAt || new Date().toISOString(),
        updatedAt: s.updatedAt || new Date().toISOString(),
      })) as Shipment[];
      // Asegúrate de que las solicitudes y devoluciones también se inicialicen correctamente
      this.data.requests = (this.data.requests || []).map((r: any) => ({
        ...r,
        customerId: r.userId || r.customerId,
      })) as ShipmentRequest[];
      this.data.returns = this.data.returns || [];
      console.log('🔍 MockDataService cargado desde localStorage con usuarios:', this.data.users.map(u => ({ email: u.email, password: u.password })));
    } else {
      // Inicializar con solo los dos usuarios especificados
      this.data = {
        users: [
          {
            id: 'admin1',
            email: 'huancarodrigo1@gmail.com',
            password: 'Rodri123@',
            firstName: 'Huancar',
            lastName: 'Rodrigo',
            role: UserRole.ADMIN,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: undefined,
          },
          {
            id: 'user1',
            email: 'marckstar1@gmail.com',
            password: 'User123@',
            firstName: 'Marck',
            lastName: 'Star',
            role: UserRole.CUSTOMER,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: undefined,
          }
        ] as User[],
        shipments: db.shipments.map((s: any) => ({
          id: s.id,
          trackingNumber: s.trackingNumber,
          origin: s.senderAddress,
          destination: s.recipientAddress,
          customerId: "unknown_customer",
          status: s.status,
          history: s.history,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })) as Shipment[],
        requests: db.requests.map((r: any) => ({
          ...r,
          customerId: r.userId,
        })) as ShipmentRequest[],
        returns: db.returns as ReturnRequest[],
      };
      this.saveData();
      console.log('🔍 MockDataService inicializado con usuarios por defecto:', this.data.users.map(u => ({ email: u.email, password: u.password })));
    }
  }

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  private saveData(): void {
    localStorage.setItem('mockDbData', JSON.stringify(this.data));
  }

  // Método para resetear los datos y cargar solo los usuarios especificados
  public resetToDefaultUsers(): void {
    localStorage.removeItem('mockDbData');
    // Recargar la instancia para que se inicialice con los usuarios por defecto
    MockDataService.instance = new MockDataService();
  }

  // Método para verificar que los usuarios estén cargados correctamente
  public getUsers(): User[] {
    return this.data.users;
  }

  // Método para debug - mostrar usuarios actuales
  public debugUsers(): void {
    console.log('Usuarios actuales en MockDataService:', this.data.users);
  }

  // Métodos para usuarios
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(user => user.email === email);
  }

  public addUser(userData: RegisterCredentials): User {
    // Dividir el nombre completo en nombre y apellido
    const nameParts = userData.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUser: User = {
      id: `user${this.data.users.length + 1}`,
      email: userData.email,
      password: userData.password,
      firstName: firstName,
      lastName: lastName,
      role: UserRole.CUSTOMER, // Por defecto, los registros son clientes
      isActive: true, // Nuevo: Campo requerido por la interfaz User
      createdAt: new Date(), // Nuevo: Campo requerido por la interfaz User
      updatedAt: new Date(), // Nuevo: Campo requerido por la interfaz User
    };
    this.data.users.push(newUser);
    this.saveData();
    console.log("User added (mock, persisted):", newUser);
    return newUser;
  }

  // Métodos para envíos (shipments)
  public getShipments(): Shipment[] {
    return this.data.shipments;
  }

  public getShipmentByTrackingNumber(trackingNumber: string): Shipment | undefined {
    return this.data.shipments.find(s => s.trackingNumber === trackingNumber);
  }

  public addShipment(shipmentData: Shipment): Shipment {
    const newShipment = { 
      ...shipmentData, 
      id: `SHIP${this.data.shipments.length + 1}`,
      status: shipmentData.status || "Pendiente", // Asegura un estado inicial
      history: shipmentData.history || [{ timestamp: new Date().toISOString(), location: "Origen", status: "Creado" }]
    };
    this.data.shipments.push(newShipment);
    this.saveData();
    console.log("Shipment added (mock, persisted):", newShipment);
    return newShipment;
  }

  // Métodos para solicitudes de envío (Shipment Requests)
  public getAllShipmentRequests(): ShipmentRequest[] {
    return this.data.requests;
  }

  public getShipmentRequestById(requestId: string): ShipmentRequest | undefined {
    return this.data.requests.find(req => req.id === requestId);
  }

  public addRequest(requestData: ShipmentRequest): ShipmentRequest {
    const newRequest: ShipmentRequest = {
      ...requestData,
      id: `REQ${this.data.requests.length + 1}`,
      status: requestData.status || "Pendiente",
      requestDate: requestData.requestDate || new Date().toISOString()
    };
    this.data.requests.push(newRequest);
    this.saveData();
    console.log("Shipment request added (mock, persisted):", newRequest);
    return newRequest;
  }

  public acceptShipmentRequest(requestId: string): Shipment | undefined {
    const requestIndex = this.data.requests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      throw new Error('Solicitud de envío no encontrada.');
    }

    const request = this.data.requests[requestIndex];
    if (request.status !== 'Pendiente') {
      throw new Error('La solicitud ya ha sido procesada.');
    }

    const newTrackingNumber = this.generateTrackingNumber();
    const newShipment: Shipment = {
      id: `SHIP${this.data.shipments.length + 1}`,
      trackingNumber: newTrackingNumber,
      origin: request.senderAddress,
      destination: request.recipientAddress,
      customerId: request.customerId,
      status: 'En tránsito',
      history: [
        { timestamp: new Date().toISOString(), location: 'Origen', status: 'Recogido' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.shipments.push(newShipment);
    this.data.requests[requestIndex].status = 'Aceptado'; // Actualiza el estado de la solicitud
    this.data.requests[requestIndex].trackingNumber = newTrackingNumber; // Asigna el tracking a la solicitud
    this.saveData();
    console.log("Shipment request accepted and shipment created:", newShipment);
    return newShipment;
  }

  private generateTrackingNumber(): string {
    const prefix = "BOA";
    const randomNumber = Math.floor(10000000000 + Math.random() * 90000000000);
    return `${prefix}${randomNumber}`;
  }

  // Métodos para solicitudes de devolución (Return Requests)
  public getAllReturnRequests(): ReturnRequest[] {
    return this.data.returns;
  }

  public getReturnRequestById(requestId: string): ReturnRequest | undefined {
    return this.data.returns.find(req => req.id === requestId);
  }

  public updateReturnRequestStatus(requestId: string, status: 'Aceptado' | 'Rechazado'): ReturnRequest | undefined {
    const requestIndex = this.data.returns.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      throw new Error('Solicitud de devolución no encontrada.');
    }
    this.data.returns[requestIndex].status = status;
    this.saveData();
    console.log(`Return request ${requestId} updated to ${status}`);
    return this.data.returns[requestIndex];
  }

  // Nuevo método para actualizar el historial de envíos
  public updateShipmentHistory(
    trackingNumber: string,
    status: string,
    location: string,
    details?: {
      notes?: string;
      issues?: string;
      receivedFrom?: string;
      dispatchedTo?: string;
      packageCondition?: 'Bueno' | 'Regular' | 'Malo';
      contentVerified?: boolean;
      weightVerified?: boolean;
      dimensionsVerified?: boolean;
      securityCheck?: boolean;
      customsCheck?: boolean;
      specialHandling?: boolean;
      specialHandlingNotes?: string;
    }
  ): Shipment | undefined {
    const shipmentIndex = this.data.shipments.findIndex(s => s.trackingNumber === trackingNumber);
    if (shipmentIndex === -1) {
      throw new Error('Envío no encontrado con ese número de tracking.');
    }

    const shipment = this.data.shipments[shipmentIndex];
    const newHistoryEntry = {
      timestamp: new Date().toISOString(),
      location: location,
      status: status,
      ...(details && { details })
    };

    shipment.history.push(newHistoryEntry);
    shipment.status = status;
    this.saveData();
    console.log(`Shipment ${trackingNumber} history updated. New status: ${status}`);
    return shipment;
  }
}

export default MockDataService;

// Exponer método global para resetear usuarios (solo para desarrollo)
if (typeof window !== 'undefined') {
  (window as any).resetMockUsers = () => {
    MockDataService.getInstance().resetToDefaultUsers();
    console.log('Usuarios reseteados a los valores por defecto');
  };
} 