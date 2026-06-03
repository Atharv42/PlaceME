import axios from 'axios';

// In development (npm run client), VITE_API_URL is empty — Vite's proxy forwards /api to localhost:3000.
// In production (Vercel), VITE_API_URL is set to the Render backend URL in the Vercel dashboard.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Automatically attach the JWT token to every request so individual components
// don't have to read localStorage and set the Authorization header themselves.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
