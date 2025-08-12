<template>
  <div class="partage-view">
    <!-- En-tête de la page -->
    <div class="page-header">
      <h1 class="page-title">Partagés avec moi</h1>
      <div class="header-actions">
        <div class="view-options">
          <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
            <i class="fas fa-list"></i>
          </button>
          <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
            <i class="fas fa-th"></i>
          </button>
        </div>
        <div class="sort-options">
          <button @click="showSortMenu = !showSortMenu" class="sort-button">
            <i class="fas fa-sort"></i>
            <span>Trier</span>
            <i class="fas fa-caret-down"></i>
          </button>
          <div class="sort-menu" v-if="showSortMenu">
            <div class="sort-item" :class="{ active: sortBy === 'name' }" @click="setSortBy('name')">
              <i class="fas fa-check" v-if="sortBy === 'name'"></i>
              <span>Nom</span>
            </div>
            <div class="sort-item" :class="{ active: sortBy === 'date' }" @click="setSortBy('date')">
              <i class="fas fa-check" v-if="sortBy === 'date'"></i>
              <span>Dernière modification</span>
            </div>
            <div class="sort-item" :class="{ active: sortBy === 'size' }" @click="setSortBy('size')">
              <i class="fas fa-check" v-if="sortBy === 'size'"></i>
              <span>Taille du fichier</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barre d'information -->
    <div class="info-bar">
      <div class="file-count">{{ sharedFiles.length }} éléments</div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Chargement des documents partagés...</span>
      </div>
    </div>
    
    <!-- Message d'erreur -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ error }}</span>
      </div>
    </div>
    
    <!-- Aucun document partagé -->
    <div v-else-if="sharedFiles.length === 0" class="empty-container">
      <div class="empty-message">
        <i class="fas fa-share-alt"></i>
        <span>Aucun document n'a été partagé avec vous pour le moment.</span>
      </div>
    </div>

    <!-- Contenu principal -->
    <div v-else class="partage-container">
      <!-- Vue en liste -->
      <div v-if="viewMode === 'list'" class="files-list">
        <table class="files-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Propriétaire</th>
              <th>Modifié le</th>
              <th>Taille</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in sortedFiles" :key="file.id" class="file-row">
              <td class="file-name">
                <div class="file-icon">
                  <i :class="getFileIcon(file.type)"></i>
                </div>
                <div class="file-info">
                  <div class="name">{{ file.nom }}</div>
                </div>
              </td>
              <td class="file-owner">{{ file.owner }}</td>
              <td class="file-date">{{ formatDate(file.date_modification) }}</td>
              <td class="file-size">{{ formatSize(file.taille) }}</td>
              <td class="file-actions">
                <button class="action-btn" title="Télécharger">
                  <i class="fas fa-download"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vue en grille -->
      <div v-else-if="viewMode === 'grid'" class="files-grid">
        <div v-for="file in sortedFiles" :key="file.id" class="file-card">
          <div class="file-card-header">
            <div class="file-icon">
              <i :class="getFileIcon(file.type)"></i>
            </div>
            <div class="file-actions">
              <button class="action-btn" title="Télécharger">
                <i class="fas fa-download"></i>
              </button>
            </div>
          </div>
          <div class="file-card-body">
            <div class="file-name">{{ file.nom }}</div>
            <div class="file-owner">{{ file.owner }}</div>
            <div class="file-date">{{ formatDate(file.date_modification) }}</div>
            <div class="file-size">{{ formatSize(file.taille) }}</div>
          </div>
        </div>
      </div>

      <!-- Message si aucun fichier partagé -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-share-alt"></i>
        </div>
        <h3 class="empty-title">Aucun fichier partagé avec vous</h3>
        <p class="empty-description">Les fichiers et dossiers partagés avec vous apparaîtront ici</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'

// Interface pour les documents partagés
interface SharedDocument {
  id: number;
  uuid: string;
  nom: string;
  type: string;
  type_lisible: string;
  taille: number;
  owner: string;
  owner_email: string;
  date_creation: string;
  date_modification: string;
  permission: string;
  expiration?: string;
  is_folder?: boolean;
}

export default defineComponent({
  name: 'partageView',
  
  data() {
    return {
      viewMode: 'list' as 'list' | 'grid',
      showSortMenu: false,
      sortBy: 'name',
      sortDirection: 'asc' as 'asc' | 'desc',
      loading: false,
      error: '' as string,
      sharedFiles: [] as SharedDocument[],
    }
  },

  computed: {
    sortedFiles(): SharedDocument[] {
      return [...this.sharedFiles].sort((a, b) => {
        let valA: any, valB: any;
        
        switch (this.sortBy) {
          case 'name':
            valA = a.nom.toLowerCase();
            valB = b.nom.toLowerCase();
            break;
          case 'owner':
            valA = a.owner.toLowerCase();
            valB = b.owner.toLowerCase();
            break;
          case 'date':
            valA = new Date(a.date_modification).getTime();
            valB = new Date(b.date_modification).getTime();
            break;
          default:
            return 0;
        }
        
        if (valA < valB) {
          return this.sortDirection === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return this.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
  },

  methods: {
    async fetchSharedDocuments() {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await axios.get('/api/documents/shared-with-me');
        console.log('Réponse API brute:', response);
        
        let documentsData = response.data;
        
        if (documentsData && typeof documentsData === 'object' && !Array.isArray(documentsData) && documentsData.data) {
          documentsData = documentsData.data;
        }
        
        if (Array.isArray(documentsData)) {
          this.sharedFiles = documentsData;
          console.log('Documents partagés traités:', this.sharedFiles);
        } else {
          console.error('Format de réponse inattendu:', documentsData);
          this.error = 'Le format des données reçues est incorrect.';
        }
      } catch (err: any) {
        console.error('Erreur lors de la récupération des documents partagés:', err);
        this.error = err.response?.data?.message || 'Une erreur est survenue.';
      } finally {
        this.loading = false;
      }
    },

    setSortBy(criteria: string) {
      this.sortBy = criteria;
      this.showSortMenu = false;
    },

    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    },

    getFileIcon(type: string) {
      if (type.startsWith('image/')) return 'fa-file-image';
      if (type === 'application/pdf') return 'fa-file-pdf';
      if (type.includes('spreadsheet') || type.includes('excel')) return 'fa-file-excel';
      if (type.includes('presentation') || type.includes('powerpoint')) return 'fa-file-powerpoint';
      if (type.includes('document') || type.includes('word')) return 'fa-file-word';
      if (type === 'application/zip' || type.includes('compressed')) return 'fa-file-archive';
      return 'fa-file';
    },

    formatSize(bytes: number) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    formatDate(dateString: string) {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  },

  mounted() {
    this.fetchSharedDocuments();
  }
})
</script>

<style scoped>
.partage-view {
  padding: 20px;
}

/* En-tête de la page */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #06173c;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Options d'affichage */
.view-options {
  display: flex;
  border: 1px solid #e1e5eb;
  border-radius: 4px;
  overflow: hidden;
}

.view-btn {
  background: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  color: #8a94a6;
  transition: all 0.2s;
}

.view-btn.active {
  background-color: #f5f7fa;
  color: #4285F4;
}

/* Options de tri */
.sort-options {
  position: relative;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e1e5eb;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  color: #06173c;
  font-weight: 500;
}

.sort-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 10;
}

.sort-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sort-item:hover {
  background-color: #f5f7fa;
}

.sort-item.active {
  color: #4285F4;
}

.sort-item i {
  margin-right: 12px;
  width: 16px;
}

/* Barre d'information */
.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e1e5eb;
  margin-bottom: 16px;
}

.file-count {
  color: #8a94a6;
  font-size: 14px;
}

/* Conteneur principal */
.partage-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

/* Vue en liste */
.files-list {
  width: 100%;
  overflow-x: auto;
}

.files-table {
  width: 100%;
  border-collapse: collapse;
}

.files-table th {
  text-align: left;
  padding: 12px 16px;
  color: #8a94a6;
  font-weight: 500;
  font-size: 14px;
  border-bottom: 1px solid #e1e5eb;
}

.files-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e1e5eb;
  color: #06173c;
}

.name-col {
  width: 40%;
}

.file-row:hover {
  background-color: #f5f7fa;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-right: 12px;
  color: #8a94a6;
  font-size: 18px;
}

.file-icon i.fa-folder {
  color: #ffd04c;
}

.file-icon i.fa-file-pdf {
  color: #e94235;
}

.file-icon i.fa-file-word {
  color: #4285F4;
}

.file-icon i.fa-file-excel {
  color: #34a853;
}

.file-icon i.fa-file-powerpoint {
  color: #fb8c00;
}

.file-name {
  font-weight: 500;
}

.name-col {
  display: flex;
  align-items: center;
}

.file-actions {
  display: flex;
  gap: 8px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.file-row:hover .file-actions {
  opacity: 1;
}

.action-btn {
  background: transparent;
  border: none;
  color: #8a94a6;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #e1e5eb;
  color: #06173c;
}

/* Vue en grille */
.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  padding: 16px;
}

.grid-item {
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.grid-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.grid-item-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.grid-item .file-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  font-size: 24px;
}

.grid-item .file-details {
  flex: 1;
}

.grid-item .file-name {
  font-weight: 500;
  margin-bottom: 8px;
  word-break: break-word;
}

.grid-item .file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #8a94a6;
  font-size: 12px;
}

.grid-item .file-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

/* État vide */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #e1e5eb;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #06173c;
  margin-bottom: 8px;
}

.empty-description {
  color: #8a94a6;
  max-width: 400px;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>