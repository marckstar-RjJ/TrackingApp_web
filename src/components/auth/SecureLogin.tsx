import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ErrorModal from './ErrorModal';
import { UserRole } from '../../types/auth';

const SecureLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, error: authError, clearError, user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    // Mostrar modal de error cuando hay un error de autenticación
    console.log('🔍 SecureLogin - authError cambiado:', authError);
    if (authError) {
      console.log('🔍 Mostrando modal de error');
      setShowErrorModal(true);
    }
  }, [authError]);

  // Redirección automática tras login exitoso
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === UserRole.ADMIN || user.role === UserRole.STAFF) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores específicos cuando el usuario empieza a escribir
    setFormErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
    if (authError) clearError();
  };

  const validateForm = () => {
    const errors: { email?: string; password?: string; general?: string } = {};
    
    if (!formData.email) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email)) {
      errors.email = 'Formato de correo electrónico inválido.';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});
    clearError();

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await login(formData);
    } catch (err: any) {
      setFormErrors({ general: err.message || 'Credenciales inválidas. Por favor, intente de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    clearError();
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
           style={{ backgroundImage: 'url(/images/fondo_boa.png)' }}>
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105">
            <div className="text-center mb-8">
              <img 
                src="/images/logo_boa.png" 
                alt="BOA Tracking" 
                className="h-20 mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-gray-900">Bienvenido</h2>
              <p className="mt-2 text-gray-600">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {formErrors.general && (
              <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{formErrors.general}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="ejemplo@correo.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                {formErrors.email && <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                {formErrors.password && <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </div>

              <p className="mt-4 text-center text-gray-600">
                ¿No tienes una cuenta? <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">Regístrate aquí</a>
              </p>
            </form>
          </div>
        </div>
      </div>

      <ErrorModal 
        isOpen={showErrorModal}
        onClose={handleCloseErrorModal}
        error={authError || ''}
      />
    </>
  );
};

export default SecureLogin;