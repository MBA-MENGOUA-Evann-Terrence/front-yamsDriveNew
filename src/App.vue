<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import DynamicDialog from 'primevue/dynamicdialog'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import FullPageLoader from '@/components/FullPageLoader.vue'

const isAppReady = ref(false)
const csrfError = ref<string | null>(null)

onMounted(async () => {
  try {
    // Effectue une requête initiale pour obtenir le cookie CSRF de Sanctum.
    // Cela est nécessaire pour que les requêtes POST (comme la connexion) soient acceptées.
    await axios.get('/sanctum/csrf-cookie')
    console.log('Cookie CSRF récupéré avec succès.')
    isAppReady.value = true
  } catch (error) {
    console.error('Erreur critique lors de la récupération du cookie CSRF:', error)
    csrfError.value = 'Impossible d\'initialiser l\'application. Veuillez vérifier votre connexion au serveur backend.'
  }
})
</script>

<template>
  <div v-if="csrfError" class="error-container">
    <p>{{ csrfError }}</p>
  </div>
  <FullPageLoader v-else-if="!isAppReady" />
  <template v-else>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Toast />
    <DynamicDialog />
    <ConfirmDialog />
  </template>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
/* Animations de transition */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  color: red;
  font-size: 1.2rem;
  padding: 20px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
