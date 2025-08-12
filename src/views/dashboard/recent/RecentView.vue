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

    <!-- Barre d'information et boutons de filtre -->
    <div class="info-bar" ref="infoBar">
      <div class="file-count">{{ totalRecords }} fichier(s)</div>
      <div class="filter-section">
        <button class="filter-btn" @click="toggleFilterMenu">
          <i class="fas fa-filter"></i>
          <span>Filtres</span>
        </button>
        <button class="sort-btn" @click="toggleSortMenu">
          <i class="fas fa-sort"></i>
          <span>Trier par</span>
        </button>
      </div>
    </div>

    <!-- Panneau de filtres (premier, au-dessus du tableau) -->
    <div v-if="showFilterMenu" class="filter-panel" ref="filterPanel">
      <h4>Filtres</h4>
      <div class="filter-group">
        <h5>Type de fichier</h5>
        <div class="filter-options">
          <label v-for="type in fileTypes" :key="type.id">
            <input type="checkbox" v-model="type.selected">
            {{ type.name }}
          </label>
        </div>
      </div>
      <div class="filter-group">
        <h5>Période</h5>
        <div class="filter-options-period">
          <button 
            v-for="period in timePeriods" 
            :key="period.id" 
            @click="selectQuickPeriod(period.id)"
            :class="{ 'active': selectedQuickPeriod === period.id }"
          >
            {{ period.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu principal (liste ou grille) -->
    <div class="content-area">
      <div v-if="isLoading" class="text-center p-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-2">Chargement des documents récents...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div v-else-if="filteredFiles.length === 0" class="text-center p-5">
        <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
        <p class="lead">Aucun document récent à afficher</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th style="width: 30%">Nom</th>
              <th style="width: 15%">Date</th>
              <th style="width: 15%">Type</th>
              <th style="width: 15%">Propriétaire</th>
              <th style="width: 15%">Taille</th>
              <th style="width: 10%">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in filteredFiles" :key="file.id" @click="openFile(file)" style="cursor: pointer;">
              <td class="file-name">
                <div class="d-flex align-items-center">
                  <i :class="[getFileIcon(file.type), 'me-2']"></i>
                  <span class="file-name-text">{{ file.name }}</span>
                </div>
              </td>
              <td>{{ formatDate(file.lastOpened) }}</td>
              <td>{{ getFriendlyTypeName(file.type) }}</td>
              <td>{{ getOwnerName(file) }}</td>
              <td>{{ formatSize(file.size) }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="btn-icon" 
                    @click.stop="toggleFavorite(file)" 
                    :disabled="favoriteInProgress === file.id"
                    :title="file.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  >
                    <i :class="[file.favorite ? 'fas' : 'far', 'fa-star', file.favorite ? 'text-warning' : '']"></i>
                  </button>
                  <button class="btn-icon" @click.stop="shareFile(file)" title="Partager">
                    <i class="fas fa-share-alt"></i>
                  </button>
                  <button class="btn-icon" @click.stop="showContextMenu(file, $event)" title="Plus d'options">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Menu de tri -->
    <div v-if="showSortMenu" class="sort-menu" ref="sortMenu">
      <button @click="setSortOption('name')">Nom</button>
      <button @click="setSortOption('date')">Date</button>
    </div>

    <!-- Menu contextuel -->
    <div v-if="contextMenu.show" :style="contextMenuStyle" class="context-menu">
      <ul>
        <li @click="downloadFile(contextMenu.file)"><i class="fas fa-download"></i> Télécharger</li>
        <li @click="shareFile(contextMenu.file)"><i class="fas fa-share-alt"></i> Partager</li>
        <li @click="renameFile(contextMenu.file)"><i class="fas fa-pencil-alt"></i> Renommer</li>
        <li @click="removeFromRecent(contextMenu.file)"><i class="fas fa-times"></i> Retirer des récents</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { gsap } from 'gsap'
import axios from 'axios'
import ShowDocument from '@/views/dashboard/Document/ShowDocument.vue';

export default defineComponent({
  name: 'RecentView',
  
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
      favoriteInProgress: null,
      
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
      // Ouvrir le composant ShowDocument avec la source "recent"
      this.$dialog.open(ShowDocument, {
        props: {
          header: file.nom || file.name,
          modal: true,
          style: {
            width: '700px'
          },
          breakpoints: {
            '960px': '75vw',
            '640px': '90vw'
          },
          maximizable: true,
          closeOnEscape: true
        },
        data: {
          document: file,
          table: 'recent', // Ajouter la table comme dans SharedDocumentsView
          source: 'recent', // Indiquer que le document provient de la vue Recent
          showAddButton: false // Ne pas montrer le bouton d'ajout pour les documents récents
        }
      });
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
    
    // Gestion des favoris
    async toggleFavorite(file) {
      // Éviter les actions multiples sur le même fichier
      if (this.favoriteInProgress === file.id) {
        return;
      }
      
      this.favoriteInProgress = file.id;
      
      try {
        // Déterminer si on ajoute ou supprime des favoris
        if (!file.favorite) {
          // Ajout aux favoris
          await axios.post('/api/favoris', {
            document_id: file.id
          });
          file.favorite = true;
        } else {
          // Suppression des favoris
          await axios.delete(`/api/favoris/${file.id}`);
          file.favorite = false;
        }
      } catch (error) {
        console.error('Erreur lors de la modification des favoris:', error);
        // Afficher un message d'erreur à l'utilisateur
        alert('Impossible de modifier les favoris. Veuillez réessayer.');
      } finally {
        this.favoriteInProgress = null;
      }
    },
    
    // Méthode pour récupérer les favoris
    async fetchFavorites() {
      try {
        const response = await axios.get('/api/favoris');
        // Créer un ensemble des IDs de favoris pour une recherche plus rapide
        const favoriteIds = new Set(response.data.map(fav => fav.document_id));
        
        // Marquer les documents favoris
        if (Array.isArray(this.recentFiles)) {
          this.recentFiles.forEach(file => {
            file.favorite = favoriteIds.has(file.id);
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
      }
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

        const processPublishedDoc = (doc) => {
          const extension = doc.extension || (doc.name ? doc.name.split('.').pop() : '') || '';
          return {
            id: doc.id,
            name: doc.name || doc.filename || 'Sans titre',
            type: extension.toLowerCase(),
            size: doc.size || 0,
            lastOpened: doc.updated_at || new Date().toISOString(),
            path: doc.path || '',
            favorite: false,
            owner: undefined
          };
        };

        if (publishedRes.data) {
          const docsToMap = Array.isArray(publishedRes.data) ? publishedRes.data : (publishedRes.data.data || []);
          publishedDocs = docsToMap.map(processPublishedDoc);
        }

        const processReceivedDoc = (doc) => {
          const docName = doc.document?.name || doc.name;
          const extension = doc.document?.extension || doc.extension || (docName ? docName.split('.').pop() : '') || '';
          const size = doc.document?.size || doc.size || 0;
          return {
            id: doc.document?.id || doc.id || 0,
            name: docName || 'Document reçu',
            type: extension.toLowerCase(),
            size: size,
            lastOpened: doc.updated_at || new Date().toISOString(),
            path: doc.document?.path || doc.path || '',
            favorite: false,
            owner: doc.shared_by?.name || doc.sender || 'Expéditeur'
          };
        };

        if (receivedRes.data) {
          const docsToMap = Array.isArray(receivedRes.data) ? receivedRes.data : (receivedRes.data.data || []);
          receivedDocs = docsToMap.map(processReceivedDoc);
        }
        
        this.recentFiles = [...publishedDocs, ...receivedDocs];
        this.totalRecords = this.recentFiles.length;
        await this.fetchFavorites();

      } catch (error) {
        console.error('Erreur lors de la récupération des documents récents:', error);
        this.error = 'Impossible de charger les documents. Veuillez réessayer plus tard.';
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
    getFileIcon(extension) {
      extension = extension.toLowerCase();
      if (['doc', 'docx'].includes(extension)) return 'fas fa-file-word text-primary';
      if (['xls', 'xlsx'].includes(extension)) return 'fas fa-file-excel text-success';
      if (['ppt', 'pptx'].includes(extension)) return 'fas fa-file-powerpoint text-danger';
      if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) return 'fas fa-file-image text-info';
      if (extension === 'pdf') return 'fas fa-file-pdf text-danger';
      return 'fas fa-file text-secondary';
    },
    

    
    getFileCategory(extension) {
      extension = extension.toLowerCase();
      if (['doc', 'docx'].includes(extension)) return 'document';
      if (['xls', 'xlsx'].includes(extension)) return 'spreadsheet';
      if (['ppt', 'pptx'].includes(extension)) return 'presentation';
      if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) return 'image';
      if (extension === 'pdf') return 'pdf';
      return 'document'; // Catégorie par défaut
    },

    getFriendlyTypeName(extension) {
      if (!extension) return '';
      extension = extension.toLowerCase();
      if (['doc', 'docx'].includes(extension)) return 'Document Word';
      if (['xls', 'xlsx'].includes(extension)) return 'Fichier Excel';
      if (['ppt', 'pptx'].includes(extension)) return 'PowerPoint';
      if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(extension)) return 'Image';
      if (extension === 'pdf') return 'PDF';
      return extension.toUpperCase();
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
      
      // Utiliser le service de dialogue pour afficher le composant ShareDocument
      this.$dialog.open(import('@/views/dashboard/Document/ShareDocument.vue'), {
        props: {
          header: 'Partager le document',
          modal: true,
          style: {
            width: '500px'
          },
          breakpoints: {
            '960px': '75vw',
            '640px': '90vw'
          }
        },
        data: {
          document: file // Passer le fichier au composant ShareDocument
        },
        onClose: (options) => {
          // Rafraîchir la liste si nécessaire
          if (options && options.refresh) {
            this.fetchRecentFiles();
          }
        }
      });
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
