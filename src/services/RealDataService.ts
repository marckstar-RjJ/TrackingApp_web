import { User, RegisterCredentials, LoginCredentials, UserRole } from '../types/auth';

const API_BASE_URL = 'http://localhost:3000/api';

class RealDataService {
  private static instance: RealDataService;

  private constructor() {}

  public static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService();
    }
    return RealDataService.instance;
  }

  // Login de usuario
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al iniciar sesión');
      }

      const data = await response.json();
      
      // Convertir la respuesta del backend al formato de nuestro frontend
      const user: User = {
        id: data.id.toString(),
        email: data.email,
        firstName: data.name.split(' ')[0] || data.name,
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        role: data.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Generar un token simple (en producción usarías JWT del backend)
      const token = `real-token-${Date.now()}`;

      return { user, token };
    } catch (error: any) {
      console.error('Error en login real:', error);
      throw error;
    }
  }

  // Registro de usuario
  async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: credentials.fullName,
          email: credentials.email,
          password: credentials.password,
          role: 'public', // Por defecto todos los registros son usuarios públicos
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar usuario');
      }

      const data = await response.json();
      
      // Convertir la respuesta del backend al formato de nuestro frontend
      const user: User = {
        id: data.id.toString(),
        email: data.email,
        firstName: data.name.split(' ')[0] || data.name,
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        role: data.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Generar un token simple
      const token = `real-token-${Date.now()}`;

      return { user, token };
    } catch (error: any) {
      console.error('Error en registro real:', error);
      throw error;
    }
  }

  // Verificar si el backend está disponible
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Backend no disponible:', error);
      return false;
    }
  }

  // Obtener todos los usuarios (solo para admin)
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron obtener los usuarios');
      }

      const data = await response.json();
      
      return data.map((user: any) => ({
        id: user.id.toString(),
        email: user.email,
        firstName: user.name.split(' ')[0] || user.name,
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        role: user.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER,
        isActive: true,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(),
      }));
    } catch (error: any) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }
}

export default RealDataService; 