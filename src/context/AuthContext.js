import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// Proveedor de contexto de autenticación. Maneja login, logout y persistencia del usuario.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored && stored !== 'undefined') {
        setUser(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error al parsear usuario desde localStorage:', err);
      localStorage.removeItem('user'); 
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acceder al contexto de autenticación
export const useAuth = () => useContext(AuthContext);
