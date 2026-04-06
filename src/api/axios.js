import axios from 'axios';

const api = axios.create({
  // SUSTITUYE por la URL real de tu backend en Vercel
  baseURL: 'https://vinacoteca-joel-vegas-romero-backen-nine.vercel.app',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;