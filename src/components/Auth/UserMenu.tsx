import React, { useState } from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.name.charAt(0)}`.toUpperCase();
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'student': return 'bg-green-100 text-green-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'student': return 'Estudiante';
      case 'teacher': return 'Docente';
      default: return 'Usuario';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link 
          href="/login" 
          className="text-gray-700 hover:text-gray-900 font-medium"
        >
          Iniciar sesión
        </Link>
        <Link 
          href="/register" 
          className="btn-primary py-2 px-4 text-sm"
        >
          Registrarse
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <div className="text-right hidden md:block">
          <div className="font-medium text-gray-900">
            {user.name}
          </div>
          <div className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor()}`}>
            {getRoleLabel()}
          </div>
        </div>
        
        <div className="w-10 h-10 bg-gradient-to-r from-electric-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
          {getInitials()}
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slideIn">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-electric-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                  {getInitials()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                 
                </div>
              </div>
            </div>

            <div className="p-2">
              {user.role === 'student' ? (
                <>
                  <Link 
                    href="/student/dashboard" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-xl">📊</span>
                    <span>Mi Dashboard</span>
                  </Link>
                  <Link 
                    href="/student/assignments" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-xl">📝</span>
                    <span>Mis Tareas</span>
                  </Link>
                  <Link 
                    href="/student/grades" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-xl">📈</span>
                    <span>Mis Calificaciones</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/teacher/dashboard" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-xl">📊</span>
                    <span>Panel de Docente</span>
                  </Link>
                  <Link 
                    href="/teacher/assignments" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-xl">📋</span>
                    <span>Mis Rúbricas</span>
                  </Link>
                  <Link 
                    href="/teacher/analytics" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-xl">📈</span>
                    <span>Analíticas</span>
                  </Link>
                </>
              )}

              <div className="border-t border-gray-100 my-2"></div>

              <Link 
                href="/profile" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-xl">👤</span>
                <span>Mi Perfil</span>
              </Link>
              <Link 
                href="/settings" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-xl">⚙️</span>
                <span>Configuración</span>
              </Link>
              <Link 
                href="/help" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-xl">❓</span>
                <span>Ayuda y Soporte</span>
              </Link>

              <div className="border-t border-gray-100 my-2"></div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 w-full text-left"
              >
                <span className="text-xl">🚪</span>
                <span>Cerrar sesión</span>
              </button>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <div className="text-xs text-gray-500">
                Último acceso: Hoy a las {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;