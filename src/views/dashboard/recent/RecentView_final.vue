<template>
  <div class="recent-view">
    <div class="page-header">
      <h1 class="page-title" ref="pageTitle">Récents</h1>
      <div class="header-actions" ref="headerActions">
        <div class="view-mode-toggle">
          <button :class="['view-mode-btn', viewMode === 'list' ? 'active' : '']" @click="viewMode = 'list'">
            <i class="fas fa-list"></i>
          </button>
          <button :class="['view-mode-btn', viewMode === 'grid' ? 'active' : '']" @click="viewMode = 'grid'">
            <i class="fas fa-th"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Utilisation du composant AsdecodeTable pour les documents récents -->
    <AsdecodeTable 
      class="mb-4" 
      :columns="columns" 
      :url="apiUrl" 
      table="documents" 
      @set-total-records="updateTotalRecords"
      @row-click="openFile">
      
      <!-- Modifier l'affichage de la colonne Type -->
      <template #type="slotProps">
        <span class="d-flex align-items-center">
          <i :class="[getFileIcon(slotProps.data.type), 'me-2']"></i>
          {{ getFileTypeName(slotProps.data.type) }}
        </span>
      </template>
      
      <!-- Modifier l'affichage de la colonne Date -->
      <template #lastOpened="slotProps">
        {{ formatDate(slotProps.data.lastOpened) }}
      </template>
      
      <!-- Modifier l'affichage de la colonne Taille -->
      <template #size="slotProps">
        {{ formatSize(slotProps.data.size) }}
      </template>
      
      <!-- Modifier l'affichage de la colonne Propriétaire -->
      <template #owner="slotProps">
        {{ getOwnerName(slotProps.data) }}
      </template>
      
      <!-- Modifier l'affichage de la colonne Actions -->
      <template #actions="slotProps">
        <div class="action-buttons">
          <button class="btn btn-sm btn-icon" @click.stop="showContextMenu(slotProps.data, $event)">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </template>
    </AsdecodeTable>
    
    <div class="info-bar" ref="infoBar">
      <div class="file-count">{{ totalRecords }} fichier(s)</div>
      <div class="filter-section">
        <button class="filter-btn" @click="toggleFilterMenu">
          <i class="fas fa-filter"></i>
          Filtres
        </button>
        <div v-if="showFilterMenu" class="filter-menu">
          <div class="filter-section">
            <h4>Types de fichiers</h4>
            <div class="filter-item" v-for="type in fileTypes" :key="type.id">
              <input type="checkbox" :id="type.id" v-model="type.selected" @change="applyFilters">
              <label :for="type.id">{{ type.name }}</label>
            </div>
          </div>
          <div class="filter-section">
            <h4>Période</h4>
            <div class="filter-item" v-for="period in timePeriods" :key="period.id">
              <input type="radio" name="period" :id="'period-' + period.id" :value="period.id" v-model="selectedPeriod" @change="applyFilters">
              <label :for="'period-' + period.id">{{ period.name }}</label>
            </div>
          </div>
        </div>
      </div>
      <div class="sort-section">
        <button class="sort-btn" @click="toggleSortMenu">
          <i class="fas fa-sort"></i>
          Trier
        </button>
        <div v-if="showSortMenu" class="sort-menu">
          <div class="sort-item" @click="setSortOption('name')">
            <i class="fas fa-font"></i>
            Nom
          </div>
          <div class="sort-item" @click="setSortOption('lastOpened')">
            <i class="fas fa-calendar-alt"></i>
            Date
          </div>
          <div class="sort-item" @click="setSortOption('type')">
            <i class="fas fa-file"></i>
            Type
          </div>
          <div class="sort-item" @click="setSortOption('size')">
            <i class="fas fa-weight"></i>
            Taille
          </div>
        </div>
      </div>
      <div class="quick-period-selector" ref="timePeriodSelector">
        <div v-for="period in quickPeriods" 
             :key="period.id" 
             :class="['period-option', selectedQuickPeriod === period.id ? 'active' : '']"
             @click="selectQuickPeriod(period.id)">
          {{ period.name }}
        </div>
      </div>
    </div>

    <!-- Menu contextuel -->
    <div v-if="contextMenu.show" class="context-menu" :style="contextMenuStyle">
      <div class="context-menu-item" @click="openFile(contextMenu.file)">
        <i class="fas fa-external-link-alt"></i> Ouvrir
      </div>
      <div class="context-menu-item" @click="downloadFile(contextMenu.file)">
        <i class="fas fa-download"></i> Télécharger
      </div>
      <div class="context-menu-item" @click="shareFile(contextMenu.file)">
        <i class="fas fa-share-alt"></i> Partager
      </div>
      <div class="context-menu-item" @click="renameFile(contextMenu.file)">
        <i class="fas fa-edit"></i> Renommer
      </div>
      <div class="context-menu-item" @click="removeFromRecent(contextMenu.file)">
        <i class="fas fa-times"></i> Retirer des récents
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { gsap } from 'gsap'
import axios from 'axios'
import AsdecodeTable from '@/components/Table/AsdecodeTable.vue'

export default defineComponent({
  name: 'RecentView',
  
  components: {
    AsdecodeTable
  },
  
  data() {
    return {
      // État de l'interface
      totalRecords: 0,
      isLoading: true,
      error: null,
      recentFiles: [],
      fileElements: [],
      viewMode: 'list',
      showSortMenu: false,
      showFilterMenu: false,
      sortBy: 'lastOpened',
      sortDirection: 'desc',
      selectedPeriod: 'all',
      selectedQuickPeriod: 'today',
      
      // Références DOM pour animations
      pageTitle: null,
      headerActions: null,
      infoBar: null,
      emptyState: null,
      timePeriodSelector: null,
      recentViewContainer: null,
      
      // Définition de l'URL API pour AsdecodeTable
      apiUrl: '/api/documents/recent',
      
      // Définition des colonnes pour AsdecodeTable
      columns: [
        {
          key: 'name',
          label: 'Nom'
        },
        {
          key: 'lastOpened',
          label: 'Date'
        },
        {
          key: 'type',
          label: 'Type'
        },
        {
          key: 'owner',
          label: 'Propriétaire'
        },
        {
          key: 'size',
          label: 'Taille'
        },
        {
          key: 'actions',
          label: 'Actions'
        }
      ],
      
      // Type de fichiers pour filtrage
      fileTypes: [
        { id: 'document', name: 'Document', selected: true },
        { id: 'spreadsheet', name: 'Feuille de calcul', selected: true },
        { id: 'presentation', name: 'Présentation', selected: true },
        { id: 'pdf', name: 'PDF', selected: true },
        { id: 'image', name: 'Image', selected: true }
      ],
      
      // Périodes pour filtrage
      timePeriods: [
        { id: 'all', name: 'Tout' },
        { id: 'today', name: "Aujourd'hui" },
        { id: 'yesterday', name: 'Hier' },
        { id: 'week', name: 'Cette semaine' },
        { id: 'month', name: 'Ce mois' },
        { id: 'year', name: 'Cette année' }
      ],
      
      // Périodes rapides
      quickPeriods: [
        { id: 'all', name: 'Tous' },
        { id: 'today', name: "Aujourd'hui" },
        { id: 'week', name: 'Cette semaine' },
        { id: 'month', name: 'Ce mois' }
      ],
      
      // Menu contextuel
      contextMenu: {
        show: false,
        x: 0,
        y: 0,
        file: null
      }
    };
  },
  
  computed: {
    // Style du menu contextuel
    contextMenuStyle() {
      return {
        top: `${this.contextMenu.y}px`,
        left: `${this.contextMenu.x}px`
      };
    },
    
    // Fichiers filtrés selon les critères de l'utilisateur
    filteredFiles() {
      // Vérifier si recentFiles est bien un tableau
      if (!Array.isArray(this.recentFiles)) {
        return [];
      }

      // Obtenir les types sélectionnés
      const selectedTypes = this.fileTypes
        .filter(type => type.selected)
        .map(type => type.id);

      // Appliquer les filtres par type et période
      return this.recentFiles.filter(file => {
        // Filtre par type
        if (selectedTypes.length > 0) {
          const category = this.getFileCategory(file.type);
          if (!selectedTypes.includes(category)) {
            return false;
          }
        }

        // Filtre par période
        if (this.selectedPeriod !== 'all') {
          if (!file.lastOpened) return false;

          const fileDate = new Date(file.lastOpened);
          const now = new Date();
          
          // Début de la journée courante
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          // Début de la journée d'hier
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Début de la semaine
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay()); // Début de semaine = dimanche
          
          // Début du mois
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
          // Début de l'année
          const startOfYear = new Date(now.getFullYear(), 0, 1);

          switch (this.selectedPeriod) {
            case 'today':
              return fileDate >= today;
            case 'yesterday':
              return fileDate >= yesterday && fileDate < today;
            case 'week':
              return fileDate >= startOfWeek;
            case 'month':
              return fileDate >= startOfMonth;
            case 'year':
              return fileDate >= startOfYear;
            default:
              return true;
          }
        }

        return true;
      });
    }
  },
  
  methods: {
    // Méthode pour la mise à jour du nombre de lignes
    updateTotalRecords(nb) {
      this.totalRecords = nb;
    },
    
    // Méthode pour ouvrir un fichier
    openFile(file) {
      console.log('Ouvrir le fichier:', file);
      // Logique d'ouverture
    },
    
    // Gestion des filtres
    toggleFilterMenu() {
      this.showFilterMenu = !this.showFilterMenu;
      if (this.showFilterMenu) {
        this.showSortMenu = false; // Fermer le menu de tri si ouvert
      }
    },
    
    toggleSortMenu() {
      this.showSortMenu = !this.showSortMenu;
      if (this.showSortMenu) {
        this.showFilterMenu = false; // Fermer le menu de filtres si ouvert
      }
    },
    
    applyFilters() {
      // AsdecodeTable n'implémente pas le filtrage directement
      // Logique de filtrage personnalisée à implémenter
      console.log('Filtrage appliqué');
      // TODO: Implémenter une logique d'API pour les filtres ou utiliser l'API d'AsdecodeTable
    },
    
    setSortOption(option) {
      // AsdecodeTable n'implémente pas le tri directement
      this.sortBy = option;
      console.log('Tri selon:', option);
      // TODO: Implémenter une logique d'API pour le tri ou utiliser l'API d'AsdecodeTable
      this.showSortMenu = false;
    },
    
    setPeriod(period) {
      this.selectedPeriod = period;
      this.applyFilters();
    },
    
    selectQuickPeriod(period) {
      this.selectedQuickPeriod = period;
      this.setPeriod(period);
    },
    
    getPeriodLabel() {
      const period = this.timePeriods.find(p => p.id === this.selectedPeriod);
      return period ? period.name : '';
    },
    
    
    // Méthode pour récupérer les documents récents
    async fetchRecentDocuments() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const [publishedRes, receivedRes] = await Promise.all([
          axios.get('/api/documents/recent/published'),
          axios.get('/api/documents/recent/received')
        ]);
        
        let publishedDocs = [];
        let receivedDocs = [];
        
        // Traitement des documents publiés
        if (publishedRes.data) {
          if (Array.isArray(publishedRes.data)) {
            publishedDocs = publishedRes.data.map(doc => ({
              id: doc.id,
              uuid: doc.uuid, // Ajout de l'UUID
              name: doc.name || doc.filename || 'Sans titre',
              type: this.getFileTypeFromExtension(doc.extension || ''),
              size: doc.size || 0,
              lastOpened: doc.updated_at || new Date().toISOString(),
              path: doc.path || '',
              favorite: false,
              owner: undefined // Document publié par l'utilisateur
            }));
          } else if (publishedRes.data.data && Array.isArray(publishedRes.data.data)) {
            publishedDocs = publishedRes.data.data.map(doc => ({
              id: doc.id,
              uuid: doc.uuid, // Ajout de l'UUID
              name: doc.name || doc.filename || 'Sans titre',
              type: this.getFileTypeFromExtension(doc.extension || ''),
              size: doc.size || 0,
              lastOpened: doc.updated_at || new Date().toISOString(),
              path: doc.path || '',
              favorite: false,
              owner: undefined // Document publié par l'utilisateur
            }));
          }
        }
        
        // Traitement des documents reçus
        if (receivedRes.data) {
          if (Array.isArray(receivedRes.data)) {
            receivedDocs = receivedRes.data.map(doc => ({
              id: doc.document?.id || doc.id || 0,
              uuid: doc.document?.uuid || doc.uuid, // Ajout de l'UUID
              name: doc.document?.name || doc.name || 'Document reçu',
              type: this.getFileTypeFromExtension(doc.document?.extension || doc.extension || ''),
              size: doc.document?.size || doc.size || 0,
              lastOpened: doc.updated_at || new Date().toISOString(),
              path: doc.document?.path || doc.path || '',
              favorite: false,
              owner: doc.shared_by?.name || doc.sender || 'Expéditeur' // Nom de l'expéditeur
            }));
          } else if (receivedRes.data.data && Array.isArray(receivedRes.data.data)) {
            receivedDocs = receivedRes.data.data.map(doc => ({
              id: doc.document?.id || doc.id || 0,
              uuid: doc.document?.uuid || doc.uuid, // Ajout de l'UUID
              name: doc.document?.name || doc.name || 'Document reçu',
              type: this.getFileTypeFromExtension(doc.document?.extension || doc.extension || ''),
              size: doc.document?.size || doc.size || 0,
              lastOpened: doc.updated_at || new Date().toISOString(),
              path: doc.document?.path || doc.path || '',
              favorite: false,
              owner: doc.shared_by?.name || doc.sender || 'Expéditeur' // Nom de l'expéditeur
            }));
          }
        }
        
        // Fusionner les deux types de documents
        this.recentFiles = [...publishedDocs, ...receivedDocs];
        
        
      } catch (err) {
        console.error('Erreur lors de la récupération des documents récents:', err);
        this.error = `Erreur: ${err.message || 'Impossible de charger les documents'}`;
      } finally {
        this.isLoading = false;
      }
    },
    
    // Fonction pour charger des données de test
    loadTestData() {
      console.log('Chargement des données de test...');
      this.recentFiles = [
        {
          id: 1,
          name: 'Rapport annuel 2023.docx',
          type: 'doc',
          size: 2500000,
          lastOpened: new Date().toISOString(),
          path: '/documents/rapport-annuel.docx',
          favorite: true,
          owner: undefined // Propriétaire = l'utilisateur actuel
        },
        {
          id: 2,
          name: 'Budget prévisionnel.xlsx',
          type: 'xls',
          size: 1500000,
          lastOpened: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
          path: '/documents/budget.xlsx',
          favorite: false,
          owner: undefined
        },
        {
          id: 3,
          name: 'Présentation projet.pptx',
          type: 'ppt',
          size: 3500000,
          lastOpened: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
          path: '/documents/presentation.pptx',
          favorite: false,
          owner: undefined
        },
        {
          id: 4,
          name: 'Contrat client.pdf',
          type: 'pdf',
          size: 980000,
          lastOpened: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
          path: '/documents/contrat.pdf',
          favorite: false,
          owner: 'Sophie Martin'
        },
        {
          id: 5,
          name: 'Logo entreprise.png',
          type: 'img',
          size: 450000,
          lastOpened: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
          path: '/documents/logo.png',
          favorite: true,
          owner: 'Thomas Dubois'
        }
      ];
      this.isLoading = false;
    },
    
    // Méthodes utilitaires pour le formatage et l'affichage
    getFileIcon(type) {
      switch (type) {
        case 'doc': return 'fas fa-file-word text-primary';
        case 'xls': return 'fas fa-file-excel text-success';
        case 'ppt': return 'fas fa-file-powerpoint text-danger';
        case 'img': return 'fas fa-file-image text-info';
        case 'pdf': return 'fas fa-file-pdf text-danger';
        default: return 'fas fa-file text-secondary';
      }
    },
    
    getFileTypeName(type) {
      switch (type) {
        case 'doc': return 'Document';
        case 'xls': return 'Feuille de calcul';
        case 'ppt': return 'Présentation';
        case 'img': return 'Image';
        case 'pdf': return 'PDF';
        default: return type || 'Fichier';
      }
    },
    
    getFileTypeFromExtension(extension) {
      extension = extension.toLowerCase().replace('.', '');
      if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(extension)) {
        return 'doc';
      } else if (['xls', 'xlsx', 'ods', 'csv'].includes(extension)) {
        return 'xls';
      } else if (['ppt', 'pptx', 'odp'].includes(extension)) {
        return 'ppt';
      } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
        return 'img';
      } else if (extension === 'pdf') {
        return 'pdf';
      }
      return 'doc'; // Type par défaut
    },
    
    getFileCategory(type) {
      switch (type) {
        case 'doc': return 'document';
        case 'xls': return 'spreadsheet';
        case 'ppt': return 'presentation';
        case 'img': return 'image';
        case 'pdf': return 'pdf';
        default: return 'document';
      }
    },
    
    formatDate(date) {
      if (!date) return '';
      const dateObj = new Date(date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const fileDate = new Date(date);
      const fileDateDay = new Date(fileDate.getFullYear(), fileDate.getMonth(), fileDate.getDate());
      
      const hours = String(fileDate.getHours()).padStart(2, '0');
      const minutes = String(fileDate.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      if (fileDateDay.getTime() === today.getTime()) {
        return `Aujourd'hui à ${formattedTime}`;
      } else if (fileDateDay.getTime() === yesterday.getTime()) {
        return `Hier à ${formattedTime}`;
      } else {
        const options = { 
          day: 'numeric', 
          month: 'short',
          year: fileDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        };
        return fileDate.toLocaleDateString('fr-FR', options);
      }
    },
    
    formatSize(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    getOwnerName(file) {
      // Si owner est undefined, c'est l'utilisateur actuel qui a publié le document
      if (file.owner === undefined) {
        return 'Moi';
      }
      // Sinon, c'est quelqu'un d'autre
      return file.owner;
    },
    
    // Menu contextuel
    showContextMenu(file, event) {
      event.preventDefault();
      this.contextMenu = {
        show: true,
        x: event.clientX,
        y: event.clientY,
        file: file
      };
      document.addEventListener('click', this.hideContextMenu, { once: true });
    },
    
    hideContextMenu() {
      this.contextMenu.show = false;
    },
    
    downloadFile(file) {
      console.log('Télécharger le fichier:', file);
      this.contextMenu.show = false;
    },
    
    shareFile(file) {
      console.log('Partager le fichier:', file);
      this.contextMenu.show = false;
    },
    
    renameFile(file) {
      console.log('Renommer le fichier:', file);
      this.contextMenu.show = false;
    },
    
    removeFromRecent(file) {
      console.log('Retirer le fichier des récents:', file);
      this.contextMenu.show = false;
    },
    
    // Animations GSAP
    animatePageHeader() {
      if (this.$refs.pageTitle) {
        gsap.from(this.$refs.pageTitle, {
          y: -20,
          opacity: 0,
          duration: 0.5
        });
      }
      
      if (this.$refs.headerActions) {
        gsap.from(this.$refs.headerActions, {
          y: -20,
          opacity: 0,
          duration: 0.5,
          delay: 0.2
        });
      }
    },
    
    animateInfoBar() {
      if (this.$refs.infoBar) {
        gsap.from(this.$refs.infoBar, {
          y: -10,
          opacity: 0,
          duration: 0.4,
          delay: 0.4
        });
      }
    },
    
    animateTimePeriods() {
      if (this.$refs.timePeriodSelector) {
        gsap.from(this.$refs.timePeriodSelector.children, {
          opacity: 0,
          y: 10,
          stagger: 0.1,
          duration: 0.3,
          delay: 0.6
        });
      }
    }
  },
  
  mounted() {
    // Chargement initial des documents
    this.fetchRecentDocuments();
    
    // Animer les éléments de la page
    this.$nextTick(() => {
      this.animatePageHeader();
      this.animateInfoBar();
      this.animateTimePeriods();
    });
  },
  
  beforeUnmount() {
    // Supprimer les écouteurs d'événements pour éviter les fuites mémoire
    document.removeEventListener('click', this.hideContextMenu);
  }
});
</script>

<style>
.recent-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.view-mode-toggle {
  display: flex;
  background-color: #f1f5f9; /* gray-100 */
  border-radius: 8px;
}

.view-mode-btn {
  border: none;
  background: transparent;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
}

.view-mode-btn.active {
  background-color: #4285F4;
  color: white;
}

.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn, .sort-btn {
  border: none;
  background-color: #f1f5f9; /* gray-100 */
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-btn:hover, .sort-btn:hover {
  background-color: #e2e8f0; /* gray-200 */
}

.filter-menu, .sort-menu {
  position: absolute;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 5px;
  width: 220px;
}

.filter-section {
  margin-bottom: 15px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-section h4 {
  font-size: 0.8rem;
  font-weight: 600;
  color: #a0aec0; /* cool-gray-400 */
  text-transform: uppercase;
  margin-bottom: 10px;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.filter-item input[type="checkbox"],
.filter-item input[type="radio"] {
  margin-right: 8px;
}

.sort-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;
}

.sort-item:hover {
  background-color: #f1f5f9;
}

.quick-period-selector {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.period-option {
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.period-option:hover {
  background-color: #f1f5f9;
}

.period-option.active {
  background-color: #4285F4;
  color: white;
  border-color: #4285F4;
}

.context-menu {
  position: fixed;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 200px;
}

.context-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.context-menu-item:hover {
  background-color: #f1f5f9;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.btn-icon {
  padding: 0.25rem 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
}

.btn-icon:hover {
  background-color: #f1f5f9;
  border-radius: 4px;
}
</style>
