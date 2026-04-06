import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, miramos si hay un token guardado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Opcional: Aquí podrías hacer una petición al backend 
      // para validar el token y traer los datos del usuario
      setUser({ logged: true }); 
    }
    setLoading(false);
  }, []);

  // Frontend - AuthContext.js
// AuthContext.js
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Desestructuramos lo que viene del backend (token y usuari)
    const { token, usuari } = response.data;

    // 1. Guardamos el token para que las peticiones tengan permiso
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 2. Guardamos el objeto usuario (que ya trae el 'rol') en el almacenamiento local
    localStorage.setItem('user', JSON.stringify(usuari));
    
    // 3. Actualizamos el estado global para que React reaccione
    setUser(usuari);

    return response.data;
  } catch (error) {
    // Si el backend lanza el 401 "Credencials incorrectes", aquí lo capturas
    throw error;
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization']; // Limpiamos Axios
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);