import apiClient from './api';

// --- Interfaces pour la typisation ---

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
}

// Interface unique et correcte pour l'utilisateur
export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  statut?: string;
  created_at: string;
}

// Interface pour la réponse de l'API, notamment pour le login
export interface ApiResponse {
  message: string;
  user?: User;
  token?: string;
  errors?: Record<string, string[]>;
}

// --- Service d'Authentification ---

export const authService = {
  /**
   * Connecte l'utilisateur via un token.
   */
  async login(loginData: LoginData): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/api/token', loginData);
      const token = response.data.token;

      if (token) {
        localStorage.setItem('auth_token', token);
      }
      return response.data;
    } catch (error: any) {
      console.error('Erreur de connexion:', error.response?.data || error.message);
      throw error.response?.data || new Error('Email ou mot de passe incorrect');
    }
  },

  /**
   * Inscrit un nouvel utilisateur.
   */
  async register(userData: RegisterData): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/api/utilisateurs/new', userData);
      return response.data as ApiResponse;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error.response?.data || error.message);
      throw error.response?.data || new Error('Erreur lors de l\'inscription.');
    }
  },

  /**
   * Déconnecte l'utilisateur.
   */
  async logout(): Promise<void> {
    try {
      // Notifie le backend de la déconnexion
      await apiClient.post('/api/logout');
    } catch (error) {
      console.error('Erreur lors de la notification de déconnexion au serveur.', error);
    } finally {
      // Supprime les informations d'authentification du client quoi qu'il arrive
      // Supprime le token du localStorage. L'intercepteur ne l'ajoutera plus aux futures requêtes.
      localStorage.removeItem('auth_token');
    }
  },

  /**
   * Tente de récupérer l'utilisateur actuellement authentifié via le token.
   */
  async getUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/api/user');
      return response.data as User;
    } catch (error: any) {
      console.error('Échec de la récupération de l\'utilisateur:', error);
      // Si le token est invalide (401), on le supprime pour nettoyer la session
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('yamsdigital_session');
      }
      throw error;
    }
  }
};









