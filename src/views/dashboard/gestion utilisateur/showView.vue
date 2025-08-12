<template>
  <div class="user-detail-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="page-title">Détails de l'utilisateur</h1>
      <div>
        <router-link to="/dashboard/gestionutilisateur" class="btn btn-outline-secondary me-2">
          <i class="fas fa-arrow-left me-1"></i> Retour à la liste
        </router-link>
        <button class="btn btn-outline-warning me-2">
          <i class="fas fa-edit me-1"></i> Modifier
        </button>
        <router-link :to="`/dashboard/gestionutilisateur/supression/${user.id}`" class="btn btn-outline-danger">
          <i class="fas fa-trash me-1"></i> Supprimer
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

    <div v-else class="user-details-wrapper">
      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="card profile-card">
            <div class="card-body text-center">
              <div class="user-avatar-lg mb-3">
                <i class="fas fa-user"></i>
              </div>
              <h2 class="user-name">{{ user.name }}</h2>
              <p class="user-username text-muted">{{ user.email }}</p>
              <div class="user-role mb-3">
                <span :class="getRoleBadgeClass(user.role || 'Utilisateur')">{{ user.role || 'Utilisateur' }}</span>
              </div>
              <div class="user-status mb-3">
                <span :class="getStatusBadgeClass(user.statut || 'Actif')">{{ user.statut || 'Actif' }}</span>
              </div>
              <div class="user-since">
                <small class="text-muted">Membre depuis {{ formatDate(user.created_at) }}</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-info-circle me-2"></i> Informations personnelles
              </h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">ID Utilisateur</div>
                <div class="col-md-8">{{ user.id }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Nom complet</div>
                <div class="col-md-8">{{ user.name }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Prénom</div>
                <div class="col-md-8">{{ user.prenom || 'Non renseigné' }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Nom</div>
                <div class="col-md-8">{{ user.nom || 'Non renseigné' }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Email</div>
                <div class="col-md-8">
                  <a :href="`mailto:${user.email}`">{{ user.email }}</a>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Téléphone</div>
                <div class="col-md-8">{{ user.telephone1 || 'Non renseigné' }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Date de naissance</div>
                <div class="col-md-8">{{ user.date_naissance ? formatDate(user.date_naissance) : 'Non renseigné' }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Adresse</div>
                <div class="col-md-8">{{ user.adresse || 'Non renseignée' }}</div>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-shield-alt me-2"></i> Sécurité et accès
              </h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Rôle</div>
                <div class="col-md-8">
                  <span :class="getRoleBadgeClass(user.role || 'Utilisateur')">{{ user.role || 'Utilisateur' }}</span>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Statut</div>
                <div class="col-md-8">
                  <span :class="getStatusBadgeClass(user.statut || 'Actif')">{{ user.statut || 'Actif' }}</span>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Dernière mise à jour</div>
                <div class="col-md-8">{{ formatDate(user.updated_at) }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Signature</div>
                <div class="col-md-8">
                  <span v-if="user.signature" class="text-success">{{ user.signature }}</span>
                  <span v-else class="text-danger">Non définie</span>
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 fw-bold">Permissions</div>
                <div class="col-md-8">
                  <div v-if="user.permissions && user.permissions.length > 0">
                    <span v-for="permission in user.permissions" :key="permission" class="badge bg-info me-1 mb-1">
                      {{ permission }}
                    </span>
                  </div>
                  <span v-else class="text-muted">Aucune permission spécifique</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-history me-2"></i> Activité récente
              </h5>
            </div>
            <div class="card-body">
              <div v-if="user.activities && user.activities.length > 0">
                <div v-for="(activity, index) in user.activities" :key="index" class="activity-item">
                  <div class="activity-icon">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-description">{{ activity.description }}</div>
                    <div class="activity-time text-muted">{{ formatDateTime(activity.timestamp) }}</div>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted">Aucune activité récente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'


export default defineComponent({
  name: 'ShowView',
  setup() {
    const route = useRoute()
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    // Récupérer l'ID depuis la route
    const userId = ref(route.params.id as string)
    console.log('ID utilisateur depuis la route:', userId.value)
    
    // Définition des types pour les données utilisateur
    interface Activity {
      type: string;
      description: string;
      timestamp: string;
    }

    interface User {
      id: number;
      name: string;
      email: string;
      nom?: string;
      prenom?: string;
      date_naissance?: string;
      adresse?: string;
      telephone1?: string;
      telephone2?: string;
      role?: string;
      statut?: string;
      permissions?: string[];
      signature?: string;
      created_at: string;
      updated_at: string;
      activities?: Activity[];
    }
    
    // Initialisation des données utilisateur
    const user = ref<User>({
      id: 0,
      name: '',
      email: '',
      telephone1: '',
      adresse: '',
      role: '',
      statut: '',
      created_at: '',
      updated_at: ''
    })

    // Type casting pour s'assurer que user a le bon type
    user.value = user.value as unknown as User

    // Fonction pour récupérer les données utilisateur
    const fetchUserData = async () => {
      loading.value = true
      error.value = null
      
      console.log('Début de fetchUserData, ID:', userId.value)
      
      try {
        console.log('Tentative de récupération des données utilisateur...')
        const response = await axios.get(`/api/users/${userId.value}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          withCredentials: true
        })
        
        console.log('Réponse reçue complète:', response)
        
        // Accès aux données utilisateur à travers l'objet imbriqué data (structure Laravel)
        const userData = response.data.data || response.data
        console.log('Données utilisateur extraites:', userData)
        
        if (userData) {
          user.value = {
            ...userData,
            activities: [
              {
                type: 'login',
                description: 'Connexion au système',
                timestamp: userData.updated_at || userData.created_at
              },
              {
                type: 'update',
                description: 'Mise à jour du profil',
                timestamp: userData.updated_at || userData.created_at
              },
              {
                type: 'file',
                description: 'Téléchargement du fichier rapport-2025.pdf',
                timestamp: response.data.created_at
              },
              {
                type: 'admin',
                description: 'Modification des paramètres système',
                timestamp: response.data.created_at
              }
            ]
          }
        }
      } catch (err: any) {
        console.error('Erreur lors de la récupération des données utilisateur:', err)
        if (err.response) {
          // La requête a été faite et le serveur a répondu avec un code d'état
          // qui n'est pas dans la plage 2xx
          console.error('Données de la réponse d\'erreur:', err.response.data)
          console.error('Statut de la réponse:', err.response.status)
          console.error('En-têtes de la réponse:', err.response.headers)
          error.value = `Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur lors de la récupération des données'}`
        } else if (err.request) {
          // La requête a été faite mais aucune réponse n'a été reçue
          console.error('Aucune réponse reçue:', err.request)
          error.value = 'Pas de réponse du serveur. Vérifiez votre connexion.'
        } else {
          // Une erreur s'est produite lors de la configuration de la requête
          console.error('Erreur de configuration de la requête:', err.message)
          error.value = `Erreur: ${err.message || 'Impossible de charger les données utilisateur'}`
        }
      } finally {
        loading.value = false
        console.log('Fin de fetchUserData, état de user:', user.value)
      }
    }
    
    onMounted(() => {
      fetchUserData()
    })
    
    // Méthodes utilitaires
    const formatDate = (dateString: string | null | undefined) => {
      if (!dateString) return 'Non renseigné'
      
      try {
        const date = new Date(dateString)
        // Vérifier si la date est valide
        if (isNaN(date.getTime())) {
          return 'Date invalide'
        }
        return new Intl.DateTimeFormat('fr-FR').format(date)
      } catch (error) {
        console.error('Erreur de formatage de date:', error)
        return 'Date invalide'
      }
    }
    
    const formatDateTime = (dateTimeString: string | null | undefined) => {
      if (!dateTimeString) return 'Non renseigné'
      
      try {
        const date = new Date(dateTimeString)
        // Vérifier si la date est valide
        if (isNaN(date.getTime())) {
          return 'Date invalide'
        }
        return new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)
      } catch (error) {
        console.error('Erreur de formatage de date et heure:', error)
        return 'Date invalide'
      }
    }
    
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
    
    const getStatusBadgeClass = (status: string) => {
      switch (status) {
        case 'Actif':
          return 'badge bg-success'
        case 'Inactif':
          return 'badge bg-secondary'
        case 'En attente':
          return 'badge bg-warning'
        default:
          return 'badge bg-light'
      }
    }
    
    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'login':
          return 'fas fa-sign-in-alt bg-info'
        case 'logout':
          return 'fas fa-sign-out-alt bg-secondary'
        case 'update':
          return 'fas fa-edit bg-warning'
        case 'file':
          return 'fas fa-file bg-primary'
        case 'admin':
          return 'fas fa-cog bg-danger'
        default:
          return 'fas fa-circle bg-light'
      }
    }
    
    return {
      user,
      loading,
      error,
      formatDate,
      formatDateTime,
      getRoleBadgeClass,
      getStatusBadgeClass,
      getActivityIcon
    }
  }
})
</script>

<style scoped>
.user-detail-container {
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

.user-details-wrapper {
  margin-top: 10px;
}

.profile-card {
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.user-avatar-lg {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #4285F4;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 2.5rem;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.user-username {
  margin-bottom: 15px;
}

.card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  padding: 12px 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.activity-icon i {
  font-size: 0.875rem;
}

.activity-content {
  flex: 1;
}

.activity-description {
  font-weight: 500;
}

.activity-time {
  font-size: 0.8rem;
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