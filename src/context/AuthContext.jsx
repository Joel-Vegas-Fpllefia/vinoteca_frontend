import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. PERSISTENCIA AL RECARGAR (F5) ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      // Re-inyectamos el token en Axios para que las peticiones no den 401
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Restauramos el objeto usuario (que ya contiene el 'rol')
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // --- 2. LOGIN MODIFICADO ---
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Tu backend devuelve: { token, usuari: { id, email, rol } }
      const { token, usuari } = response.data;

      // Guardamos el token en LocalStorage y Axios
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Guardamos el objeto usuario COMPLETO (con el rol) en LocalStorage
      localStorage.setItem('user', JSON.stringify(usuari));
      
      // Actualizamos el estado global
      setUser(usuari);

      return response.data;
    } catch (error) {
      console.error("Error en el proceso de Login:", error);
      throw error;
    }
  };

  // --- 3. LOGOUT ---
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Limpiamos también el objeto usuario
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