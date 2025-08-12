<template>
  <form @submit.prevent="handleSubmit" class="auth-form" novalidate>
    <div class="input-group">
      <label for="lastName">
        <i class="fas fa-user input-icon"></i>
        Nom
      </label>
      <input
        class="input-field"
        id="lastName"
        v-model="registerForm.lastName"
        type="text"
        placeholder="Entrez votre nom"
        :class="{ 'error': validationErrors.nom }"
        required
      />
      <span v-if="validationErrors.nom" class="error-message">{{ validationErrors.nom[0] }}</span>
    </div>

    <div class="input-group">
      <label for="firstName">
        <i class="fas fa-user input-icon"></i>
        Prénom
      </label>
      <input
        class="input-field"
        id="firstName"
        v-model="registerForm.firstName"
        type="text"
        placeholder="Entrez votre prénom"
        :class="{ 'error': validationErrors.prenom }"
        required
      />
      <span v-if="validationErrors.prenom" class="error-message">{{ validationErrors.prenom[0] }}</span>
    </div>

    <div class="input-group">
      <label for="email">
        <i class="fas fa-envelope input-icon"></i>
        Email
      </label>
      <input
        class="input-field"
        id="email"
        v-model="registerForm.email"
        type="email"
        placeholder="Entrez votre email"
        :class="{ 'error': validationErrors.email }"
        required
      />
      <span v-if="validationErrors.email" class="error-message">{{ validationErrors.email[0] }}</span>
    </div>

    <div class="terms-group">
      <label class="checkbox-container">
        <input
          type="checkbox"
          v-model="acceptTerms"
          required
          class="checkbox-input"
        >
        <span class="checkmark"></span>
        J'accepte les <a href="#" class="terms-link">conditions d'utilisation</a>
      </label>
    </div>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

    <button type="submit" class="submit-button" :disabled="isSubmitting">
      <span v-if="!isSubmitting">S'inscrire</span>
      <span v-else>Inscription en cours...</span>
    </button>



    <div class="auth-switch">
      Déjà inscrit ? 
      <router-link to="/connexion">Se connecter</router-link>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

// Interface pour typer les erreurs de validation
interface ValidationErrors {
  [key: string]: string[];
}

export default defineComponent({
  name: 'RegisterForm',
  
  // Déclare les événements que ce composant peut émettre
  emits: ['register-submitted'],

  // 'data' contient l'état réactif du composant
  data() {
    return {
      isSubmitting: false,
      errorMessage: '',
      successMessage: '',
      validationErrors: {} as ValidationErrors,
      acceptTerms: false,
      registerForm: {
        firstName: '',
        lastName: '',
        email: ''
      }
    };
  },

  // 'methods' contient les fonctions
  methods: {
    // Valide les champs du formulaire
    validateForm(): boolean {
      this.errorMessage = '';
      this.validationErrors = {};

      if (!this.registerForm.firstName.trim()) {
        this.errorMessage = 'Veuillez entrer votre prénom';
        return false;
      }
      if (!this.registerForm.lastName.trim()) {
        this.errorMessage = 'Veuillez entrer votre nom';
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerForm.email)) {
        this.errorMessage = 'Veuillez entrer un email valide';
        return false;
      }
      if (!this.acceptTerms) {
        this.errorMessage = "Veuillez accepter les conditions d'utilisation";
        return false;
      }
      return true;
    },

    // Gère la soumission du formulaire
    async handleSubmit() {
      if (this.isSubmitting) return;
      
      if (!this.validateForm()) {
        return;
      }

      this.isSubmitting = true;
      
      try {
        const formData = {
          nom: this.registerForm.lastName.trim(),
          prenom: this.registerForm.firstName.trim(),
          email: this.registerForm.email.trim().toLowerCase()
        };
        
        const response = await axios.post('/api/utilisateurs/new', formData);

        this.successMessage = response.data.message || 'Inscription réussie ! Un email avec votre mot de passe a été envoyé.';
  
        // Réinitialiser le formulaire
        this.registerForm = { firstName: '', lastName: '', email: '' };
        this.acceptTerms = false;
        
        // Émettre l'événement de succès
        this.$emit('register-submitted', {
          success: true,
          message: this.successMessage
        });
        
      } catch (error: any) {
        console.error("Erreur lors de l'inscription:", error);
        
        if (error.response && error.response.status === 422 && error.response.data?.errors) {
          this.validationErrors = error.response.data.errors;
          const errorMessages = Object.values(this.validationErrors).flat();
          this.errorMessage = errorMessages.join(' ');
        } else if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = "Une erreur est survenue lors de l'inscription.";
        }
        
        // Émettre l'événement d'erreur
        this.$emit('register-submitted', {
          success: false,
          message: this.errorMessage
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
});

</script>

<style scoped>
.auth-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.input-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  text-align: left;
  font-weight: 400;
}

.input-icon {
  color: rgba(255, 255, 255, 0.6);
}

.input-field {
  width: 100%;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
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

.terms-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
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

.terms-link {
  color: var(--primary);
  text-decoration: none;
  transition: var(--transition);
}

.terms-link:hover {
  color: #8ab4f8;
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  background: var(--primary);
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #1a73e8;
  transform: translateY(-2px);
}

.submit-button:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.5);
}

.divider span {
  position: relative;
  background: #1e1e2d; /* Assurez-vous que cela correspond à votre fond */
  padding: 0 1rem;
}

.divider::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  left: 0;
  top: 50%;
  z-index: -1;
}

.social-login {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.social-btn {
  flex-grow: 1;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: transparent;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.social-btn .fab {
  font-size: 1.1rem;
}

.error {
  border-color: #ff6b6b !important;
  background-color: rgba(255, 107, 107, 0.1) !important;
}

.error-message {
  color: #ff6b6b;
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

.success-message {
  color: #38a169;
  background-color: rgba(56, 161, 105, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.9rem;
  border: 1px solid rgba(56, 161, 105, 0.2);
}

/* Animation pour le chargement */
@keyframes spin {
  to { transform: rotate(360deg); }
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
}
</style>
