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
          <button class="btn btn-sm btn-icon" @click.stop="toggleFavorite(slotProps.data)" :disabled="favoriteInProgress === slotProps.data.id">
            <i :class="[slotProps.data.favorite ? 'fas' : 'far', 'fa-star', slotProps.data.favorite ? 'text-warning' : '']"></i>
          </button>
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
      <div class="context-menu-item" @click="toggleFavorite(contextMenu.file)">
        <i :class="[contextMenu.file && contextMenu.file.favorite ? 'fas' : 'far', 'fa-star']"></i>
        {{ contextMenu.file && contextMenu.file.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
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
  }
});
</script>
