<template>
  <div class="dashboard-layout">
    <!-- Modale pour créer un nouveau fichier/dossier -->
    <Dialog 
      v-model:visible="displayNewModal" 
      header="Créer un nouveau" 
      :modal="true" 
      :dismissableMask="true"
      :closeOnEscape="true"
      :style="{width: '400px'}"
      :showHeader="true"
      :breakpoints="{'960px': '75vw', '640px': '90vw'}"
      :draggable="false"
      class="new-item-modal"
    >
      <div class="options-card">
        <div class="new-item-options">
        <div class="new-item-option" @click="createNewFolder">
          <div class="icon-container folder-icon"><i class="fas fa-folder"></i></div>
          <span>Nouveau Dossier</span>
        </div>
        <div class="new-item-option" @click="uploadFile">
          <div class="icon-container upload-icon"><i class="fas fa-upload"></i></div>
          <span>Importer un Fichier</span>
        </div>
        <div class="new-item-option" @click="createNewDocument">
          <div class="icon-container doc-icon"><i class="fas fa-file-word"></i></div>
          <span>Document Google</span>
        </div>
        <div class="new-item-option" @click="createNewSpreadsheet">
          <div class="icon-container sheet-icon"><i class="fas fa-file-excel"></i></div>
          <span>Feuille de calcul</span>
        </div>
        <div class="new-item-option" @click="createNewPresentation">
          <div class="icon-container slide-icon"><i class="fas fa-file-powerpoint"></i></div>
          <span>Présentation</span>
        </div>
        </div>
      </div>
    </Dialog>
    
    <!-- En-tête -->
    <header class="dashboard-header">
      <div class="header-left">
        <i class="fas fa-cloud text-primary me-2"></i>
        <span class="fw-bold">Yam'sDrive</span>
      </div>
      <div class="header-center">
        <div class="search-bar">
          <i class="fas fa-search search-icon"></i>
          <input type="text" placeholder="Rechercher..." class="search-input">
        </div>
      </div>
      <div class="header-right">
        <!-- Section utilisateur connecté -->
        <router-link to="/dashboard/profil" class="user-profile">
          <span class="user-name">{{ userName }}</span>
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
        </router-link>
      </div>
    </header>

    <div class="dashboard-container">
      <!-- Barre latérale -->
      <aside class="dashboard-sidebar">
        <div class="sidebar-header">
          <router-link to="/home" class="new-btn">
            <i class="fas fa-home"></i> Accueil
          </router-link>
        </div>
        <nav class="sidebar-nav">
          <ul>
            <li>
              <router-link to="/dashboard/statistiques" class="nav-item">
                <i class="fas fa-chart-bar"></i>
                <span>Statistiques</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/gestionutilisateur" class="nav-item">
                <i class="fas fa-users-cog"></i>
                <span>Gestion Utilisateur</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/services" class="nav-item">
                <i class="fas fa-cogs"></i>
                <span>Gestion des Services</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/documents" class="nav-item">
                <i class="fas fa-folder"></i>
                <span>Mes documents</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/partage" class="nav-item">
                <i class="fas fa-share-alt"></i>
                <span>Partagés avec moi</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/recent" class="nav-item">
                <i class="fas fa-clock"></i>
                <span>Récents</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/favoris" class="nav-item">
                <i class="fas fa-star"></i>
                <span>Favoris</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/corbeille" class="nav-item">
                <i class="fas fa-trash"></i>
                <span>Corbeille</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/gestionutilisateur/domaine" class="nav-item">
                <i class="fas fa-globe"></i>
                <span>Parametres</span>
              </router-link>
            </li>
          </ul>
          
          <!-- Bouton de déconnexion -->
          <div class="sidebar-footer">
            <button @click="logout" class="logout-button">
              <i class="fas fa-sign-out-alt"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- Contenu principal -->
      <main class="dashboard-content">
        <router-view v-slot="{ Component }">
          <transition name="dashboard-view" mode="out-in" appear>
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Dialog from 'primevue/dialog';

export default defineComponent({
  name: 'LayoutDashView',
  components: {
    Dialog
  },
  data() {
    return {
      displayNewModal: false,
    };
  },
  computed: {
    userName(): string {
      // Accès direct au store avec vérification
      if (this.$store.state.user && this.$store.state.user.name) {
        return this.$store.state.user.name;
      }
      return 'Utilisateur'; // Valeur par défaut
    }
  },
  methods: {
    async logout() {
      try {
        await this.$store.dispatch('logout');
        this.$router.push('/connexion');
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    },
    openNewModal() {
      this.displayNewModal = true;
    },
    createNewFolder() {
      console.log('Créer un nouveau dossier');
      this.displayNewModal = false;
    },
    createNewDocument() {
      console.log('Créer un nouveau document');
      this.displayNewModal = false;
    },
    createNewSpreadsheet() {
      console.log('Créer une nouvelle feuille de calcul');
      this.displayNewModal = false;
    },
    createNewPresentation() {
      console.log('Créer une nouvelle présentation');
      this.displayNewModal = false;
    },
    uploadFile() {
      console.log('Importer un fichier');
      this.displayNewModal = false;
    }
  }
});
</script>

<style scoped>
/* Styles pour la modale "Nouveau" */
:deep(.new-item-modal .p-dialog-header) {
  background-color: #ffffff;
  color: #202124;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
}

:deep(.new-item-modal .p-dialog-content) {
  padding: 24px;
  background-color: #f8f9fa;
}

.options-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #e0e0e0;
}

.new-item-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.new-item-option {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  background-color: #ffffff;
  border: 1px solid #dadce0;
}

.new-item-option:hover {
  background-color: #f1f3f4;
  border-color: #cdd1d5;
}

.new-item-option .icon-container {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 16px;
  color: white;
}

.new-item-option .icon-container i {
  font-size: 18px;
}

.new-item-option span {
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
}

/* Couleurs spécifiques pour les icônes */
.folder-icon { background-color: #5F95E5; }
.upload-icon { background-color: #68B36B; }
.doc-icon { background-color: #4285F4; }
.sheet-icon { background-color: #0F9D58; }
.slide-icon { background-color: #F4B400; }

.dashboard-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

/* Styles de l'en-tête */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 64px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #ffffff;
}

/* Styles pour le bouton Nouveau dans la sidebar */

/* Styles pour le bouton de déconnexion */
.sidebar-footer {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

/* Animations de transition pour les vues du dashboard */
.dashboard-view-enter-active,
.dashboard-view-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.dashboard-view-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(30px);
}

.dashboard-view-leave-to {
  opacity: 0;
  transform: scale(1.05) translateY(-30px);
}

.logout-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background-color: #d32f2f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.logout-button i {
  margin-right: 8px;
  font-size: 16px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left i {
  font-size: 1.4rem;
  color: #4285F4;
}

.header-left span {
  font-size: 1.2rem;
  margin-left: 8px;
  color: #06173c;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 600px;
}

.search-bar {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8a94a6;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border-radius: 24px;
  border: 1px solid #e1e5eb;
  background-color: #f5f7fa;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #4285F4;
  background-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
}

.user-name {
  margin-right: 12px;
  font-weight: 500;
  color: #06173c;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4285F4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logout-btn {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: none;
  background-color: transparent;
  width: 100%;
  text-align: left;
  border-radius: 4px;
  cursor: pointer;
  color: #06173c;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #f5f7fa;
}

.logout-btn i {
  margin-right: 8px;
  color: #8a94a6;
}

/* Styles du conteneur principal */
.dashboard-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Styles de la barre latérale */
.dashboard-sidebar {
  width: 250px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 20px;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-top {
  flex-shrink: 0;
}

.sidebar-header {
  padding: 24px 16px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h3 {
  margin: 0;
  color: #4285F4;
  font-size: 18px;
  font-weight: 500;
}

.sidebar-nav {
  padding: 24px 0;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sidebar-nav ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar-bottom {
  margin-top: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.new-btn-container {
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.new-btn {
  width: 100%;
  padding: 12px 0;
  background-color: #4285F4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.new-btn:hover {
  background-color: #3367d6;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.new-btn i {
  margin-right: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #06173c;
  text-decoration: none;
  transition: background-color 0.2s;
}

.nav-item:hover, .nav-item.router-link-active {
  background-color: #f5f7fa;
  color: #4285F4;
}

.nav-item i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
  color: #8a94a6;
}

.nav-item.router-link-active i {
  color: #4285F4;
}

.nav-item span {
  font-weight: 500;
}

/* Styles du contenu principal */
.dashboard-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-sidebar {
    width: 60px;
  }
  
  .sidebar-header {
    padding: 8px;
  }
  
  .new-btn span {
    display: none;
  }
  
  .nav-item span {
    display: none;
  }
  
  .nav-item {
    justify-content: center;
    padding: 12px;
  }
  
  .nav-item i {
    margin-right: 0;
  }
  
  .header-center {
    max-width: 400px;
  }
  
  .user-name {
    display: none;
  }
}
</style>