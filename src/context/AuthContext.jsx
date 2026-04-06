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

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    // 1. Extraemos el token (Asegúrate de que tu backend lo envía así)
    const { token } = response.data;
    
    // 2. Guardamos en el almacén del navegador
    localStorage.setItem('token', token);
    
    // 3. ¡ESTA ES LA CLAVE! Actualizamos Axios para que las 
    // próximas peticiones (como el carrito) ya lleven el token
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser({ logged: true, ...response.data.user }); // Guardamos datos del user si vienen
    return response.data;
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