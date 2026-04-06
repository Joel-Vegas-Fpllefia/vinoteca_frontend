import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vinacoteca-joel-vegas-romero-backen-nine.vercel.app',
  withCredentials: true
});

// Este interceptor añade el Token a TODAS las peticiones automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Asegúrate de que el nombre coincide con el que usas en el Login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;