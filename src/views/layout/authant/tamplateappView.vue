<template>
  <div class="auth-container">
    <div class="auth-left">
      <div class="auth-logo">
        <i class="fas fa-cloud"></i>
        <h1>Yam'sDrive</h1>
      </div>
      <div class="features">
        <!-- <div class="feature-item">
          <div class="feature-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div class="feature-text">
            <h3>Sécurité de niveau militaire</h3>
            <p>Chiffrement AES-256 bits pour protéger vos données</p>
          </div>
        </div> -->
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fas fa-sync"></i>
          </div>
          <div class="feature-text">
            <h3>Synchronisation instantanée</h3>
            <p>Accédez à vos fichiers sur tous vos appareils</p>
          </div>
        </div>
      </div>
    </div>
    <div class="auth-right">
      <div class="auth-tabs">
        <router-link to="/connexion" :class="['tab', { active: currentRoute === 'connexion' }]">
          Connexion
        </router-link>
        <router-link to="/inscription" :class="['tab', { active: currentRoute === 'inscription' }]">
          Inscription
        </router-link>
      </div>
      <div class="auth-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRoute } from 'vue-router'
import '@/assets/styles/auth.css'

export default defineComponent({
  name: 'TemplateAppView',
  setup() {
    const route = useRoute()
    const currentRoute = computed(() => route.path.split('/')[1])

    return {
      currentRoute
    }
  }
})
</script>

<style scoped>
.auth-container {
  display: flex;
  min-height: 100vh;
  background: radial-gradient(ellipse at top, var(--darker), #1e293b);
}

.auth-left {
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.auth-right {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  padding: 3rem;
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.auth-logo i {
  font-size: 2.5rem;
  color: #3B82F6;
}

.auth-logo h1 {
  font-size: 2rem;
  font-weight: 600;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: #3B82F6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon i {
  font-size: 1.5rem;
  color: white;
}

.feature-text h3 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.feature-text p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.auth-tabs {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
}

.tab {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 1.1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab.active,
.tab:hover {
  color: white;
  border-bottom-color: #3B82F6;
}

.auth-content {
  max-width: 400px;
}

/* Styles globaux pour les champs de formulaire */
.auth-content {
  max-width: 400px;
  margin: 0 auto;
}

/* Styles pour les champs de saisie */
.auth-content .input-field {
  width: 100%;
  padding: 1rem 1rem 1rem 3.5rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.auth-content .input-field:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
}

.auth-content .input-field::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.auth-content .input-icon {
  position: absolute;
  left: 1.25rem !important;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
}

/* Style pour les labels */
.auth-content .input-group label {
  display: block;
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  text-align: left;
  padding-left: 0.5rem;
  font-weight: 400;
}

/* Style pour le wrapper des champs */
.auth-content .input-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}
</style>