import 'primevue/resources/themes/saga-blue/theme.css'       //theme
import 'primevue/resources/primevue.min.css'                 //core css
import 'primeicons/primeicons.css'                           //icons
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles/app.scss'

import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

import axios from 'axios'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'

// Composants UI
import 'asdecode-datatable/theme/css/asdecode-datatable-bs4.css'
import AsdecodeTable from 'asdecode-datatable/src/components/AsdecodeTable.vue'
import FullPageLoader from '@/components/FullPageLoader.vue'
import PrimeVue from 'primevue/config'
library.add(fas)

import Chart from 'primevue/chart'
import DynamicDialog from 'primevue/dynamicdialog'
import DialogService from 'primevue/dialogservice'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

// Configuration Axios
axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true
// axios.defaults.baseURL = store.getters.apiUrl; // Commenté pour utiliser le proxy de dev

// Intercepteur de requête pour injecter le token dynamiquement
axios.interceptors.request.use(config => {
  const mysession = window.localStorage.getItem("yamsdigital_session");
  if (mysession) {
    try {
      const sessionData = JSON.parse(mysession);
      if (sessionData && sessionData.data && sessionData.data.token) {
        config.headers.Authorization = `Bearer ${sessionData.data.token}`;
      }
    } catch (e) {
      console.error('Erreur lors de la lecture de la session pour l\'intercepteur:', e);
    }
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.error('Erreur d\'authentification détectée', error);
      // Rafraîchir le token CSRF
      axios.get('/sanctum/csrf-cookie').then(() => {
        console.log('Token CSRF rafraîchí');
      });
      // Rediriger vers la page de connexion si nécessaire
      // router.push('/login');
    }
    return Promise.reject(error);
  }
);

// Restauration de la session AVANT la création de l'app
const mysession = window.localStorage.getItem("yamsdigital_session");
if (mysession) {
  try {
    const sessionData = JSON.parse(mysession);
    if (sessionData && sessionData.data && sessionData.data.token && sessionData.data.user) {
      // On met à jour le store directement
      store.commit('SET_AUTH_STATUS', true);
      store.commit('SET_USER', sessionData.data.user);
      // On configure l'en-tête pour toutes les futures requêtes axios
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + sessionData.data.token;
    }
  } catch (e) {
    console.error('Erreur lors de la restauration de la session:', e);
    localStorage.removeItem('yamsdigital_session');
  }
}

// Création de l'app
const app = createApp(App);

// Configuration de l'app
app.config.globalProperties.axios = axios
app.provide('axios', axios)
app.use(PrimeVue, { ripple: true })
app.use(router)
app.use(store)
app.use(DialogService)
app.use(ToastService)
app.use(ConfirmationService)

// Composants globaux
app.component('ChartJS', Chart)
app.component('DynamicDialog', DynamicDialog)
app.component('ShowToast', Toast)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.component('AsdecodeTable', AsdecodeTable)
app.component('FullPageLoader', FullPageLoader)

// Vérifie l'authentification au démarrage
store.dispatch('checkAuth').then(() => {
  // Montage final
  app.mount('#app');
});




