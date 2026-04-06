import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validación de contraseñas en el cliente
    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    try {
      // 2. Llamada a la API enviando "nom" para que el Backend lo reconozca
      await api.post('/auth/registro', {
        nom: formData.nombre, // Cambiado de 'nombre' a 'nom' según tu backend
        email: formData.email,
        password: formData.password
      });
      
      alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      navigate('/login'); 
    } catch (err) {
      // Si el backend devuelve un error (ej: el email ya existe), lo mostramos
      setError(err.response?.data?.message || 'Error al registrar el usuario');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-96 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-red-800 mb-6 italic">Crear Cuenta</h2>
        
        {error && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm text-center font-medium">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-1 italic">Nombre Completo</label>
          <input 
            name="nombre"
            type="text" 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            placeholder="Ej: Joel Vegas"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-1 italic">Email</label>
          <input 
            name="email"
            type="email" 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            placeholder="correo@ejemplo.com"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-1 italic">Contraseña</label>
          <input 
            name="password"
            type="password" 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            placeholder="********"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-1 italic">Confirmar Contraseña</label>
          <input 
            name="confirmPassword"
            type="password" 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            placeholder="********"
            onChange={handleChange}
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-red-700 text-white p-3 rounded-lg font-bold hover:bg-red-800 shadow-lg hover:shadow-red-900/20 transition-all active:scale-95"
        >
          Registrarse
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <Link to="/login" className="text-red-700 font-bold hover:underline">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;