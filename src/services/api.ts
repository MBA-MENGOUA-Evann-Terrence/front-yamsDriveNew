import axios from 'axios';

const apiClient = axios.create({
  // baseURL: 'https://api-yamsdrive.srv557357.hstgr.cloud', // Ancienne URL de production
  baseURL: '/api', // Toutes les requêtes seront préfixées par /api et gérées par le proxy
  withCredentials: true, // Crucial pour l'authentification SPA avec Sanctum
  headers: {
    'Accept': 'application/json',
  }
});

// Récupère le token du localStorage au chargement du service
console.log('Initialisation du client API...');
const token = localStorage.getItem('auth_token');
if (token) {
  console.log('Token trouvé dans le localStorage, application à l\'en-tête Authorization.');
  // Applique le token aux en-têtes pour les futures requêtes
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
} else {
  console.log('Aucun token trouvé dans le localStorage.');
}

export default apiClient;
