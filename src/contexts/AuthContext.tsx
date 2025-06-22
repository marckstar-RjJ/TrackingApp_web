import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, LoginCredentials, RegisterCredentials, UserRole } from '../types/auth';
import RealDataService from '../services/RealDataService';
import MockDataService from '../services/MockDataService';

// Estado inicial
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Acciones
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        user: action.payload.user, 
        token: action.payload.token, 
        loading: false, 
        error: null 
      };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Contexto
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Verificar token al cargar
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verificar si el backend está disponible
          const isBackendAvailable = await RealDataService.getInstance().checkBackendHealth();
          if (!isBackendAvailable) {
            console.log('Backend no disponible, usando datos locales');
            localStorage.removeItem('token');
            localStorage.removeItem('lastLoggedInUserEmail');
            dispatch({ type: 'LOGOUT' });
            return;
          }

          // Por ahora, simplemente verificamos que el token existe
          // En una implementación real, verificarías el token con el backend
          const storedEmail = localStorage.getItem('lastLoggedInUserEmail');
          if (storedEmail) {
            // Intentar obtener información del usuario desde el backend
            try {
              const users = await RealDataService.getInstance().getAllUsers();
              const user = users.find(u => u.email === storedEmail);
              if (user) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
              } else {
                localStorage.removeItem('token');
                localStorage.removeItem('lastLoggedInUserEmail');
                dispatch({ type: 'LOGOUT' });
              }
            } catch (error) {
              localStorage.removeItem('token');
              localStorage.removeItem('lastLoggedInUserEmail');
              dispatch({ type: 'LOGOUT' });
            }
          } else {
            localStorage.removeItem('token');
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('lastLoggedInUserEmail');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    };

    verifyToken();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    console.log('🔍 Login iniciado con:', credentials.email);
    dispatch({ type: 'LOGIN_START' });

    try {
      // Validar credenciales
      if (!credentials.email || !credentials.password) {
        throw new Error('Por favor complete todos los campos');
      }

      console.log('🔍 Intentando login con backend real...');
      const result = await RealDataService.getInstance().login(credentials);
      
      console.log('🔍 Login exitoso con backend real');
      localStorage.setItem('token', result.token);
      localStorage.setItem('lastLoggedInUserEmail', result.user.email);

      dispatch({ type: 'LOGIN_SUCCESS', payload: result });
    } catch (error: any) {
      console.log('❌ Error en login real:', error.message);
      
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error.message || 'Error al iniciar sesión'
      });
      
      // Lanzar la excepción para que el componente pueda manejarla
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    console.log('🔍 Registro iniciado con:', credentials.email);
    dispatch({ type: 'LOGIN_START' });

    try {
      // Validar credenciales
      if (!credentials.email || !credentials.password || !credentials.fullName) {
        throw new Error('Por favor complete todos los campos');
      }

      console.log('🔍 Intentando registro con backend real...');
      const result = await RealDataService.getInstance().register(credentials);
      
      console.log('🔍 Registro exitoso con backend real');
      localStorage.setItem('token', result.token);
      localStorage.setItem('lastLoggedInUserEmail', result.user.email);

      dispatch({ type: 'LOGIN_SUCCESS', payload: result });
    } catch (error: any) {
      console.log('❌ Error en registro real:', error.message);
      
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error.message || 'Error al registrar usuario'
      });
      
      // Lanzar la excepción para que el componente pueda manejarla
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lastLoggedInUserEmail');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        isAuthenticated: !!state.user && !!state.token,
        isLoading: state.loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 