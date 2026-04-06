import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vinacoteca-joel-vegas-romero-backen-nine.vercel.app',
  withCredentials: true
});

// Interceptor para peticiones salientes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;