import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-blue-600 shadow-lg w-full z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo y Título */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/images/logo_boa.png" 
              alt="BOA Tracking" 
              className="h-12 w-auto hover:scale-105 transition-transform duration-300"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">BOA Tracking System</h1>
            </div>
          </Link>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-medium">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-white font-medium">
                    {user?.role === UserRole.ADMIN ? 'Admin: ' : user?.role === UserRole.STAFF ? 'Staff: ' : ''}{user?.firstName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-5 py-1.5 rounded-full hover:bg-red-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="bg-white text-blue-600 px-6 py-2 rounded-full hover:bg-blue-50 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Iniciar Sesión
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:text-blue-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              {isAuthenticated && (
                <>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-blue-200 font-medium px-4 py-2 hover:bg-blue-700 rounded-lg transition-colors duration-200 text-left"
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 