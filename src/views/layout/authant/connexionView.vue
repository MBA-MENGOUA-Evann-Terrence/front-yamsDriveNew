<template>
  <div class="auth-form-container">
    <h2>Connectez-vous à votre compte</h2>
    <p class="auth-subtitle">Entrez vos identifiants pour accéder à votre espace</p>
    <login-form @login-submitted="handleLogin" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { gsap } from 'gsap'
import LoginForm from '@/components/auth/LoginForm.vue'

export default defineComponent({
  name: 'ConnexionView',
  components: {
    LoginForm
  },
  setup() {
    onMounted(() => {
      gsap.from('.auth-form-container', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power2.out'
      })
    })
    const handleLogin = (formData: { email: string; password: string }) => {
      console.log('Tentative de connexion avec:', formData)
    }

    return {
      handleLogin
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
 