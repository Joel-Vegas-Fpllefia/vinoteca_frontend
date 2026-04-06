import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Dentro de AuthContext.jsx
const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  
  // 1. Guardamos el usuario en el estado
  setUser(res.data.user); 
  
  // 2. ¡MUY IMPORTANTE! Guardamos el token en localStorage
  // Si tu API devuelve el token en res.data.token, asegúrate de que se llame 'token'
  localStorage.setItem('token', res.data.token); 
  
  return res.data;
};
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/'); // Nos lleva al inicio tras loguearnos
    } catch (error) {
      alert("Error al iniciar sesión: " + error.response?.data?.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-96 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-red-800 mb-6">Iniciar Sesión</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input 
            type="email" 
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
          <input 
            type="password" 
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="w-full bg-red-700 text-white p-3 rounded-lg font-bold hover:bg-red-800 transition">
          Entrar
        </button>
        <p className="mt-4 text-center text-sm">
          ¿No tienes cuenta? <Link to="/register" className="text-red-700 font-bold hover:underline">Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;