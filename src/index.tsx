import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import MockDataService from './services/MockDataService';
import RealDataService from './services/RealDataService';

// Método global para resetear usuarios (solo para desarrollo)
(window as any).resetUsers = () => {
  MockDataService.getInstance().resetToDefaultUsers();
  console.log('Usuarios reseteados. Recarga la página para ver los cambios.');
};

// Método global para ver usuarios actuales (solo para desarrollo)
(window as any).showUsers = () => {
  MockDataService.getInstance().debugUsers();
};

// Método global para limpiar bloqueos (solo para desarrollo)
(window as any).clearLockouts = () => {
  localStorage.removeItem('lockoutTime');
  console.log('Bloqueos limpiados. Recarga la página.');
};

// Método global para limpiar todo el localStorage (solo para desarrollo)
(window as any).clearAllData = () => {
  localStorage.clear();
  console.log('Todo el localStorage limpiado. Recarga la página.');
};

// Método global para verificar conexión con backend (solo para desarrollo)
(window as any).checkBackend = async () => {
  try {
    const isAvailable = await RealDataService.getInstance().checkBackendHealth();
    console.log('Backend disponible:', isAvailable);
    if (isAvailable) {
      console.log('✅ Backend conectado correctamente en http://localhost:3000');
    } else {
      console.log('❌ Backend no disponible. Asegúrate de que esté corriendo.');
    }
    return isAvailable;
  } catch (error) {
    console.log('❌ Error verificando backend:', error);
    return false;
  }
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
