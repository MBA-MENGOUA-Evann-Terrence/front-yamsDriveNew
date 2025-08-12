<template>
  <div class="user-deletion-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="page-title">Suppression de l'utilisateur</h1>
      <div>
        <router-link to="/dashboard/gestionutilisateur" class="btn btn-outline-secondary me-2">
          <i class="fas fa-arrow-left me-1"></i> Retour à la liste
        </router-link>
      </div>
    </div>

    <div class="loading-container" v-if="loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
      <p class="mt-2">Chargement des informations utilisateur...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <div v-else class="deletion-card">
      <div class="card">
        <div class="card-header bg-danger text-white">
          <h5 class="card-title mb-0">
            <i class="fas fa-exclamation-triangle me-2"></i> Confirmation de suppression
          </h5>
        </div>
        <div class="card-body">
          <div class="text-center mb-4">
            <div class="user-avatar-lg mb-3">
              <i class="fas fa-user"></i>
            </div>
            <h2 class="user-name">{{ user.name }}</h2>
            <p class="user-username text-muted">{{ user.email }}</p>
            <div class="user-role mb-3">
              <span :class="getRoleBadgeClass(user.role)">{{ user.role }}</span>
            </div>
          </div>

          <div class="alert alert-warning">
            <p class="mb-0">
              <i class="fas fa-exclamation-circle me-2"></i>
              Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ? Cette action est irréversible et toutes les données associées à cet utilisateur seront perdues.
            </p>
          </div>

          <div class="deletion-confirmation mt-4">
            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" v-model="confirmDelete" id="confirmDeleteCheck">
              <label class="form-check-label" for="confirmDeleteCheck">
                Je confirme la suppression de l'utilisateur {{ user.name }}
              </label>
            </div>

            <div class="d-flex justify-content-center mt-4">
              <router-link to="/dashboard/gestionutilisateur" class="btn btn-outline-secondary me-3">
                Annuler
              </router-link>
              <button 
                class="btn btn-danger" 
                @click="deleteUser"
              >
                <span v-if="deleting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <i v-else class="fas fa-trash me-2"></i>
                {{ deleting ? 'Suppression en cours...' : 'Supprimer définitivement' }}
              </button>       
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression réussie -->
    <div class="modal fade" id="deletionSuccessModal" tabindex="-1" aria-labelledby="deletionSuccessModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title" id="deletionSuccessModalLabel">Suppression réussie</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-3">
              <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
            </div>
            <p>L'utilisateur a été supprimé avec succès.</p>
          </div>
          <div class="modal-footer">
            <router-link to="/dashboard/gestionutilisateur" class="btn btn-primary">
              Retour à la liste des utilisateurs
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

export default defineComponent({
  name: 'SupressionView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userId = computed(() => route.params.id as string)
    
    const loading = ref(true)
    const error = ref<string | null>(null)
    const confirmDelete = ref(false)
    const deleting = ref(false)
    
    // Définition des types
    interface User {
      id: number;
      name: string;
      email: string;
      role: string;
      statut: string;
      created_at: string;
      updated_at: string;
    }
    
    // Initialisation des données utilisateur
    const user = ref<User>({
      id: 0,
      name: '',
      email: '',
      role: '',
      statut: '',
      created_at: '',
      updated_at: ''
    })
    
    // Charger les données utilisateur depuis l'API
    const fetchUserData = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Appel à l'API Laravel pour récupérer les données de l'utilisateur
        const response = await fetch(`/api/users/${userId.value}`)
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        
        const userData = await response.json()
        user.value = userData
      } catch (err: any) {
        error.value = 'Erreur lors du chargement des données utilisateur. Veuillez réessayer.'
        console.error('Error fetching user data:', err?.message || err)
      } finally {
        loading.value = false
      }
    }
    
    // Supprimer l'utilisateur via l'API
    const deleteUser = async () => {
      // Suppression de la vérification pour permettre la suppression immédiate
      deleting.value = true
      
      try {
        // Appel à l'API Laravel pour la suppression de l'utilisateur en utilisant axios
        await axios.delete(`/api/users/${userId.value}`)
        
        // Avec axios, pas besoin de vérifier response.ok, les erreurs sont automatiquement gérées par les intercepteurs
        
        // Rediriger vers la liste des utilisateurs après la suppression réussie
        router.push('/dashboard/gestionutilisateur')
      } catch (err: any) {
        error.value = 'Erreur lors de la suppression de l\'utilisateur. Veuillez réessayer.'
        console.error('Error deleting user:', err?.message || err)
      } finally {
        deleting.value = false
      }
    }
    
    onMounted(() => {
      fetchUserData()
    })
    
    // Méthodes utilitaires
    const getRoleBadgeClass = (role: string) => {
      switch (role) {
        case 'Admin':
          return 'badge bg-danger'
        case 'Éditeur':
          return 'badge bg-warning'
        default:
          return 'badge bg-info'
      }
    }
    
    return {
      userId,
      user,
      loading,
      error,
      confirmDelete,
      deleting,
      deleteUser,
      getRoleBadgeClass
    }
  }
})
</script>

<style scoped>
.user-deletion-container {
  padding: 20px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.deletion-card {
  max-width: 700px;
  margin: 0 auto;
}

.card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-avatar-lg {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 2rem;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.user-username {
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 16px;
  }
  
  .d-flex.justify-content-between div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
