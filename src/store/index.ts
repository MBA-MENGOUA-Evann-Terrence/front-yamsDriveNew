
import { createStore } from 'vuex';
import axios from 'axios';
import { authService, User } from '@/services/auth'; // Importation du service et du type User

// Définition du type pour notre état global
export interface RootState {
  apiUrl: string;
  isAuthenticated: boolean;
  user: User | null; // Utilisation du type User
}

export default createStore<RootState>({
  state: {
    apiUrl: 'http://127.0.0.1:8000',
    // apiUrl: 'https://api-yamsdrive.srv557357.hstgr.cloud/', // URL de production, gardée pour référence
    isAuthenticated: false,
    user: null
  },
  getters: {
    apiUrl: (state): string => state.apiUrl,
    isAuthenticated: (state): boolean => state.isAuthenticated,
    user: (state): User | null => state.user
  },
  mutations: {
    SET_AUTH_STATUS(state, isAuthenticated: boolean) {
      state.isAuthenticated = isAuthenticated;
    },
    SET_USER(state, user: User | null) {
      state.user = user;
    }
  },
  actions: {
    /**
     * Tente de connecter l'utilisateur en appelant le service d'authentification.
     */
    async login({ commit }, credentials) {
      try {
        const apiResponse = await authService.login(credentials);
        
        // Vérifier que la réponse contient bien les données attendues (utilisateur et token)
        if (apiResponse && apiResponse.user && apiResponse.token) {
          // Mettre à jour le store
          commit('SET_USER', apiResponse.user);
          commit('SET_AUTH_STATUS', true);

          // Configurer l'en-tête d'autorisation pour les requêtes futures
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + apiResponse.token;

          // Créer l'objet de session à sauvegarder
          const sessionToSave = {
            success: true,
            data: {
              user: apiResponse.user,
              token: apiResponse.token
            },
            message: 'Session sauvegardée'
          };

          // Sauvegarder la session dans le localStorage
          localStorage.setItem('yamsdigital_session', JSON.stringify(sessionToSave));

          return apiResponse.user;
        } else {
          throw new Error('La réponse de l\'API est invalide ou ne contient pas les données utilisateur/token.');
        }
      } catch (error) {
        console.error("Erreur dans l'action login du store:", error);
        // En cas d'erreur, nettoyer le state et le localStorage
        commit('SET_USER', null);
        commit('SET_AUTH_STATUS', false);
        localStorage.removeItem('yamsdigital_session');
        throw error;
      }
    },

    /**
     * Déconnecte l'utilisateur en appelant le service d'authentification.
     */
    async logout({ commit }) {
      try {
        await authService.logout();
      } finally {
        // Quoi qu'il arrive, on déconnecte l'utilisateur côté front-end
        commit('SET_USER', null);
        commit('SET_AUTH_STATUS', false);
      }
    },

    /**
     * Vérifie si une session utilisateur est active au chargement de l'application.
     */
    async checkAuth({ commit, state }) {
      // Si l'utilisateur est déjà authentifié via la restauration de session, on ne fait rien.
      // On fait confiance à la session locale. L'intercepteur axios gérera les tokens expirés.
      if (state.isAuthenticated) {
        console.log('checkAuth: Utilisateur déjà authentifié depuis la session locale.');
        return;
      }

      // Sinon, on tente de vérifier la session auprès de l'API.
      console.log('Action checkAuth déclenchée pour vérifier la session API.');
      try {
        const user = await authService.getUser();
        console.log('Utilisateur récupéré avec succès via API:', user);
        commit('SET_USER', user);
        commit('SET_AUTH_STATUS', true);
      } catch (error) {
        // Si l'API ne retourne pas d'utilisateur, on s'assure que l'état est propre.
        commit('SET_USER', null);
        commit('SET_AUTH_STATUS', false);
      }
    },

    /**
     * Met à jour les informations de l'utilisateur dans le store
     */
    updateUser({ commit, state }, user) {
      console.log('Action updateUser appelée avec:', user);
      
      // Vérifier si l'utilisateur existe et a une structure valide
      if (!user) {
        console.error('updateUser: Objet utilisateur invalide');
        return;
      }
      
      // Si l'utilisateur actuel existe, fusionner les propriétés pour préserver les données existantes
      let updatedUser = user;
      if (state.user) {
        updatedUser = { ...state.user, ...user };
        console.log('User fusionné:', updatedUser);
      }
      
      // Mettre à jour l'état
      commit('SET_USER', updatedUser);
      
      // Mettre à jour également la session dans localStorage si elle existe
      const sessionStr = localStorage.getItem('yamsdigital_session');
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          if (session && session.data) {
            session.data.user = updatedUser;
            localStorage.setItem('yamsdigital_session', JSON.stringify(session));
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la session dans localStorage:', error);
        }
      }
    }
  },
  modules: {}
});











// import { createStore } from 'vuex'

// export default createStore({
//   state: {
//     // L'URL de base de votre API. Il est recommandé de la gérer via des variables d'environnement.
//     // apiUrl: 'http://127.0.0.1:8000',
//     apiUrl: 'https://api-yamsdrive.srv557357.hstgr.cloud/',
//     // État d'authentification
//     isAuthenticated: false,
//     user: null
//   },
//   getters: {
//     apiUrl: (state): string => state.apiUrl,
//     isAuthenticated: (state): boolean => state.isAuthenticated,
//     user: (state): any => state.user
//   },
//   mutations: {
//     SET_AUTH(state, isAuthenticated) {
//       state.isAuthenticated = isAuthenticated;
//     },
//     SET_USER(state, user) {
//       state.user = user;
//     },
//     LOGOUT(state) {
//       state.isAuthenticated = false;
//       state.user = null;
//     }
//   },
//   actions: {
//     login({ commit }, user) {
//       // Après une connexion réussie
//       commit('SET_AUTH', true);
//       commit('SET_USER', user);
//       localStorage.setItem('isAuthenticated', 'true');
//       // Vous pourriez également stocker un token JWT ici
//     },
//     logout({ commit }) {
//       // Déconnexion
//       commit('LOGOUT');
//       localStorage.removeItem('isAuthenticated');
//       // Supprimer également le token JWT si vous en utilisez un
//     },
//     checkAuth({ commit }) {
//       // Vérifier si l'utilisateur est déjà connecté au chargement de l'application
//       const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
//       if (isAuthenticated) {
//         commit('SET_AUTH', true);
//         // Vous pourriez également récupérer les informations de l'utilisateur depuis une API ici
//       }
//     }
//   },
//   modules: {
//   }
// })

