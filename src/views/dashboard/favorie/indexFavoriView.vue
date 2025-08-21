<template>
    <div class="card document-management-card">
      <div class="card-header">
        <h1 class="card-title">Documents Favoris</h1>
        <div class="card-actions">
          <button class="btn btn-primary" @click="openAddFavoriForm">
            <i class="fas fa-plus"></i> Ajouter aux favoris
          </button>
          <button id="refreshfavoris" @click="refreshData" class="d-none">Rafraîchir</button>
        </div>
      </div>
      <div class="card-body">
        <AsdecodeTable 
          ref="datatable"
          :columns="columns" 
          url="/api/favoris" 
          :api-client="apiClient"
          table="favoris" 
          @set-total-records="updateLines"
          @row-click="showLine" 
          @set-selected-rows="getSelection"
          :show-top-stats="false"
          :show-bottom-stats="false"
        >
          <template #nom="slotProps">
            <div class="file-cell">
              <FileIcon :fileName="slotProps.data.nom" />
              <span class="ms-2">{{ slotProps.data.nom }}</span>
            </div>
          </template>
          <template #type_lisible="slotProps">
            <span class="badge bg-secondary">{{ getFileType(slotProps.data.nom) }}</span>
          </template>
          <template #taille="slotProps">
            <span>{{ formatSize(slotProps.data.taille) }}</span>
          </template>
          <template #created_at="slotProps">
            <span class="p-2 rounded badge badge-secondary">{{ new Date(slotProps.data.created_at).toLocaleDateString() }}</span>
          </template>
        </AsdecodeTable>
      </div>
    </div>
  </template>
  
  <style scoped>
  .document-management-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: none;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    border-bottom: 1px solid #dee2e6;
    padding: 1rem 1.5rem;
  }
  
  .card-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .card-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }
  
  .card-body {
    padding: 0;
  }
  
  /* Masquer les informations de pagination (haut et bas) */
  :deep(.dataTables_length), 
  :deep(.dataTables_info) {
    display: none !important;
  }

  .file-cell {
    display: flex;
    align-items: center;
  }
  </style>
  
  <script>
  import { defineComponent } from 'vue';
  import ShowFavorie from './showfavorieView.vue';
  import FormFavori from './FormFavoriView.vue';
  import FileIcon from '@/components/FileIcon.vue';
  import apiClient from '@/services/api';
  import { eventBus, EVENTS } from '@/services/eventBus';
  
  export default defineComponent({
      name: 'IndexFavorie',
      components: {
          FileIcon
      },
      data() {
          return {
              apiClient: apiClient,
              lines: 0,
              selection: [],
              columns: [
                  {
                      key: 'nom',
                      label: 'Fichier',
                  },
                  {
                      key: 'type_lisible',
                      label: 'Type',
                  },
                  {
                      key: 'taille',
                      label: 'Taille',
                  },
                  {
                      key: 'created_at',
                      label: 'Ajouté le',
                  }
              ]
          }
      },
      methods: {
          refreshData() {
              console.log('IndexFavorie: refreshData appelé');
              // Méthode 1: Utiliser la référence au composant AsdecodeTable
              if (this.$refs.datatable) {
                  console.log('IndexFavorie: référence datatable trouvée, appel de fetchData');
                  this.$refs.datatable.fetchData();
              } else {
                  console.warn('IndexFavorie: référence datatable non trouvée');
              }
              
              // Méthode 2: Forcer un rafraîchissement du composant
              this.$nextTick(() => {
                  // Utiliser un timeout pour s'assurer que le DOM est à jour
                  setTimeout(() => {
                      if (this.$refs.datatable) {
                          console.log('IndexFavorie: nouvelle tentative de fetchData après nextTick');
                          this.$refs.datatable.fetchData();
                      }
                  }, 100);
              });
          },
          showLine(line) {
              const extension = line.nom.split('.').pop().toLowerCase();
              const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension);
              const dialogWidth = isImage ? '70vw' : '50vw';

              this.$dialog.open(ShowFavorie, {
                  props: {
                      header: 'Détails du document favori',
                      style: { width: dialogWidth },
                      modal: true,
                      maximizable: true,
                      closeOnEscape: true
                  },
                  data: {
                      document: line,
                      source: 'favoris'
                  }
              });
          },
          updateLines(nb) {
              this.lines = nb;
          },
          formatSize(bytes) {
              if (!bytes) return '0 Bytes';
              if (bytes === 0) return '0 Bytes';
              const k = 1024;
              const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
              const i = Math.floor(Math.log(bytes) / Math.log(k));
              return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
          },
          getFileType(fileName) {
              if (!fileName) return 'Inconnu';
              const extension = fileName.split('.').pop().toLowerCase();
              const types = {
                  'png': 'Image PNG',
                  'jpg': 'Image JPG',
                  'jpeg': 'Image JPEG',
                  'gif': 'Image GIF',
                  'pdf': 'Document PDF',
                  'doc': 'Document Word',
                  'docx': 'Document Word',
                  'xls': 'Fichier Excel',
                  'xlsx': 'Fichier Excel',
                  'ppt': 'Présentation PowerPoint',
                  'pptx': 'Présentation PowerPoint',
                  'zip': 'Archive ZIP',
                  'rar': 'Archive RAR',
                  'txt': 'Fichier Texte',
              };
              return types[extension] || `Fichier ${extension.toUpperCase()}`;
          },
          getSelection(selection) {
              this.selection = selection;
          },
          openAddFavoriForm() {
              this.$dialog.open(FormFavori, {
                  props: {
                      header: 'Ajouter un document aux favoris',
                      style: { width: '50vw' },
                      modal: true,
                      closeOnEscape: true
                  }
              });
          }
      },
      // Hooks de cycle de vie
      mounted() {
          // Écouter l'événement de suppression de document
          this.unsubscribeDelete = eventBus.on(EVENTS.DOCUMENT_DELETED, (uuid) => {
              console.log('IndexFavorie: Événement DOCUMENT_DELETED reçu avec UUID:', uuid);
              // Rafraîchir les données du tableau
              this.refreshData();
          });
          
          // Écouter l'événement de mise à jour de document
          this.unsubscribeUpdate = eventBus.on(EVENTS.DOCUMENT_UPDATED, (uuid) => {
              console.log('IndexFavorie: Événement DOCUMENT_UPDATED reçu avec UUID:', uuid);
              // Rafraîchir les données du tableau
              this.refreshData();
          });
      },
      unmounted() {
          // Se désabonner des événements pour éviter les fuites de mémoire
          if (this.unsubscribeDelete) {
              this.unsubscribeDelete();
          }
          if (this.unsubscribeUpdate) {
              this.unsubscribeUpdate();
          }
      },
  });
  </script>