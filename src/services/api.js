import axios from 'axios';
import apiMock from './apiMock';

if (window.location.search.includes('demo=true')) {
  localStorage.setItem('sf_demo_mode', 'true');
} else if (window.location.search.includes('demo=false')) {
  localStorage.removeItem('sf_demo_mode');
}

const isDemoMode = 
  import.meta.env.VITE_DEMO_MODE === 'true' || 
  window.location.hostname.includes('github.io') ||
  window.location.hostname.includes('githubpreview.dev') ||
  localStorage.getItem('sf_demo_mode') === 'true';

let api;

if (isDemoMode) {
  console.log('[SocialFlow] Running in Client-Side Demo Mode (LocalStorage Database)');
  api = apiMock;
} else {
  api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptador para injetar token JWT em todas as requisições
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('socialflow_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptador de resposta para tratar expiração de token ou erro 401
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Remover dados do localStorage e redirecionar para login
        localStorage.removeItem('socialflow_token');
        localStorage.removeItem('socialflow_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
}

export default api;

