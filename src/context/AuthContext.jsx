import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios'; // <-- IMPORTANTE: Debe estar aquí

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Usamos 'api' que hemos importado arriba
      const response = await api.post('/auth/login', { email, password });
      
      const { token, usuari } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuari));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(usuari);
      return response.data;
    } catch (error) {
      console.error("Error en el login:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);