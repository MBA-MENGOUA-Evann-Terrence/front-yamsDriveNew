import axios from 'axios';

const apiClient = axios.create({
  // baseURL: 'https://api-yamsdrive.srv557357.hstgr.cloud', // Ancienne URL de production
  baseURL: '/api', // Toutes les requêtes seront préfixées par /api et gérées par le proxy
  withCredentials: true, // Crucial pour l'authentification SPA avec Sanctum
  headers: {
    'Accept': 'application/json',
  }
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default apiClient;
