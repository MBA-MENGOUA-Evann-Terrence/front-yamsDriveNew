<template>
  <div class="redirect-container">
    <div class="loader"></div>
    <p>Redirection en cours...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'RedirectView',
  setup() {
    const router = useRouter()
    
    // Simuler une vérification du rôle de l'utilisateur
    // Dans un cas réel, cela viendrait d'une API ou du stockage local
    const checkUserRole = (): Promise<string> => {
      return new Promise((resolve) => {
        // Simulation d'un délai de chargement
        setTimeout(() => {
          // Pour tester, on peut changer 'admin' en 'user'
          const userRole = 'admin'
          resolve(userRole)
        }, 1000)
      })
    }
    
    // Rediriger l'utilisateur en fonction de son rôle
    const redirectUser = async () => {
      try {
        const role = await checkUserRole()
        if (role === 'admin') {
          router.push('/dashboard/admin')
        } else {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Erreur lors de la redirection:', error)
        // En cas d'erreur, rediriger vers la page de connexion
        router.push('/connexion')
      }
    }
    
    // Déclencher la redirection dès le chargement du composant
    redirectUser()
    
    return {}
  }
})
</script>

<style scoped>
.redirect-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4285F4;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

p {
  font-size: 18px;
  color: #333;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
