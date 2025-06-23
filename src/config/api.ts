// Configuración centralizada para las URLs de la API
export const API_CONFIG = {
  // URL base del backend - usa variable de entorno o fallback a localhost
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  
  // URLs específicas
  USERS: '/users',
  PACKAGES: '/packages',
  CLAIMS: '/claims',
  ALERTS: '/alerts',
  RETURNS: '/returns',
  PREREGISTRATIONS: '/preregistrations',
  
  // Métodos para construir URLs completas
  getUrl: (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`,
  getUsersUrl: () => API_CONFIG.getUrl(API_CONFIG.USERS),
  getPackagesUrl: () => API_CONFIG.getUrl(API_CONFIG.PACKAGES),
  getClaimsUrl: () => API_CONFIG.getUrl(API_CONFIG.CLAIMS),
  getAlertsUrl: () => API_CONFIG.getUrl(API_CONFIG.ALERTS),
  getReturnsUrl: () => API_CONFIG.getUrl(API_CONFIG.RETURNS),
  getPreregistrationsUrl: () => API_CONFIG.getUrl(API_CONFIG.PREREGISTRATIONS),
}; 