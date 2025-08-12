<template>
  <div class="auth-form-container">
    <h2>Créez votre compte</h2>
    <p class="auth-subtitle">Rejoignez Yam's_Drive pour sécuriser vos données</p>
    <register-form @register-submitted="handleRegister" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { gsap } from 'gsap'
import RegisterForm from '@/components/auth/RegisterForm.vue'

export default defineComponent({
  name: 'InscriptionView',
  components: {
    RegisterForm
  },
  setup() {
    onMounted(() => {
      gsap.from('.auth-form-container', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out'
      })
    })

    const handleRegister = (result: { success: boolean; message: string }) => {
      if (result.success) {
        console.log('Inscription réussie:', result.message)
        // Redirection ou affichage d'un message de succès
      } else {
        console.error('Échec de l\'inscription:', result.message)
        // Affichage d'un message d'erreur à l'utilisateur
      }
    }

    return {
      handleRegister
    }
  }
})
</script>

<style scoped>
.auth-form-container {
  width: 100%;
}

h2 {
  color: white;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  text-align: left;
}

.auth-subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  text-align: left;
}
</style>