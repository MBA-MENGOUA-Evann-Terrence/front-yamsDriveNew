<template>
  <form @submit.prevent="handleLogin" class="auth-form">
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    <div class="input-group">
      <label for="loginEmail">
        <i class="fas fa-envelope input-icon"></i>
        Adresse Email
      </label>
      <input
        type="email"
        class="input-field"
        id="loginEmail"
        v-model="loginForm.email"
        required
        placeholder="votre@email.com"
      >
    </div>

    <div class="input-group">
      <label for="loginPassword">
        <i class="fas fa-lock input-icon"></i>
        Mot de passe
      </label>
      <div class="input-wrapper">
        <input
          :type="showPassword ? 'text' : 'password'"
          class="input-field"
          id="loginPassword"
          v-model="loginForm.password"
          required
          placeholder="••••••••"
        >
        <i 
          :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye', 'password-toggle']"
          @click="togglePassword"
        ></i>
      </div>
    </div>

    <div class="form-options">
      <label class="remember">
        <input type="checkbox" v-model="rememberMe">
        <span>Se souvenir de moi</span>
      </label>
      <a href="#" class="forgot-password">Mot de passe oublié ?</a>
    </div>

    <button type="submit" class="btn-auth btn-login" :disabled="isLoading">
      <span v-if="isLoading" class="loading-spinner"></span>
      {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
    </button>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'LoginForm',
  data() {
    return {
      loginForm: {
        email: '',
        password: ''
      },
      errorMessage: '',
      isLoading: false,
      showPassword: false,
      rememberMe: false
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async handleLogin() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        // Ancienne route d'authentification
        // const response = await axios.post('http://localhost:8000/api/auth/login', this.loginForm);
        
        // Nouvelle route d'authentification
        const response = await axios.post('http://localhost:8000/api/token', this.loginForm);
        
        // La structure de la réponse est : {success: true, data: {...}, message: 'Authentification réussie'}
        console.log('Réponse API:', response.data);
        
        // Vérifier si l'authentification a réussi selon la nouvelle structure de l'API
        if (response.data && response.data.success === true) {
          // Stocker les informations de l'utilisateur et le token
          localStorage.setItem('yamsdigital_session', JSON.stringify(response.data));
          
          // Mettre à jour le store Vuex avec les informations de l'utilisateur
          this.$store.commit('SET_AUTH_STATUS', true);
          this.$store.commit('SET_USER', response.data.data.user);

          // Rediriger vers le tableau de bord
          this.$router.push('/dashboard');
        } else {
          // Afficher le message d'erreur de l'API
          this.errorMessage = response.data?.message || 'Erreur lors de l\'authentification.';
        }
      } catch (error: any) {
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = 'Une erreur est survenue lors de la connexion.';
        }
      }
      this.isLoading = false;
    }
  }
});
</script>

<style scoped>
.auth-form {
  width: 100%;
  max-width: 450px; /* Largeur maximale augmentée */
  margin: 0 auto; /* Centrer le formulaire */
}

.input-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Espace entre l'icône et le texte */
  color: white;
  margin-bottom: 0.75rem; /* Espace augmenté sous le label */
  font-size: 1rem;
  text-align: left;
  font-weight: 400;
}

.input-icon {
  color: rgba(255, 255, 255, 0.6);
}

.input-wrapper {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px; /* Coins plus arrondis */
  color: white;
  font-size: 1rem;
  transition: var(--transition);
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-field:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.remember {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.remember input {
  accent-color: var(--primary);
}

.forgot-password {
  color: var(--primary);
  text-decoration: none;
  transition: var(--transition);
}

.forgot-password:hover {
  color: #8ab4f8;
}

.btn-auth {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.btn-login {
  background: var(--primary);
  color: white;
}

.btn-login:hover {
  background: #1a73e8;
  transform: translateY(-2px);
}

.btn-login:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff6b6b;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 0, 0, 0.2);
  text-align: left;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: var(--transition);
}

.password-toggle:hover {
  color: white;
}


</style>
