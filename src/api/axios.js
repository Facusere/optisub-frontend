import axios from 'axios';

// Crea una instancia de Axios con la configuración base para la API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

// Interceptor de peticiones: agrega el token JWT a las cabeceras si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
