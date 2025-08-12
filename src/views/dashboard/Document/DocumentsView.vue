<template>
  <div class="card document-management-card">
    <div class="card-header">
      <h1 class="card-title">Gestion des Documents</h1>
      <button class="btn btn-primary" @click="showCreateModal">
        <i class="fas fa-plus me-1"></i> Nouveau Document
      </button>
      <button id="refreshdocuments" @click="refreshData" class="d-none">Rafraîchir</button>
    </div>
    <div class="card-body">
      <AsdecodeTable 
        ref="datatable"
        :columns="columns" 
        url="/api/documents" 
        :api-client="apiClient"
        table="documents" 
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
        <template #service="slotProps">
          <span v-if="slotProps.data.service">{{ slotProps.data.service.nom }}</span>
          <span v-else-if="slotProps.data.service_id" class="text-muted">Service #{{ slotProps.data.service_id }}</span>
          <span v-else class="text-muted">Aucun service</span>
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
  .service-management-card {
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
  import FormDocument from './FormDocument.vue';
  import ShowDocument from './ShowDocument.vue';
  import FileIcon from '@/components/FileIcon.vue';
  import apiClient from '@/services/api';
  import { eventBus, EVENTS } from '@/services/eventBus';

  export default defineComponent({
      name: 'DocumentsView',
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
                      key: 'service',
                      label: 'Service',
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
            console.log('DocumentsView: refreshData appelé');
            // Méthode 1: Utiliser la référence au composant AsdecodeTable
            if (this.$refs.datatable) {
                console.log('DocumentsView: référence datatable trouvée, appel de fetchData');
                this.$refs.datatable.fetchData();
            } else {
                console.warn('DocumentsView: référence datatable non trouvée');
            }
            
            // Méthode 2: Forcer un rafraîchissement du composant
            this.$nextTick(() => {
                // Utiliser un timeout pour s'assurer que le DOM est à jour
                setTimeout(() => {
                    if (this.$refs.datatable) {
                        console.log('DocumentsView: nouvelle tentative de fetchData après nextTick');
                        this.$refs.datatable.fetchData();
                    }
                }, 100);
            });
        },
        showLine(line) {
              const extension = line.nom.split('.').pop().toLowerCase();
              const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension);
              const dialogWidth = isImage ? '70vw' : '50vw';

              this.$dialog.open(ShowDocument, {
                  props: {
                      header: 'Détails du document',
                      style: { width: dialogWidth },
                      modal: true,
                      maximizable: true,
                      closeOnEscape: true
                  },
                  data: {
                      document: line
                  }
              });
          },

          updateLines(nb) {
              this.lines = nb;
          },
          showCreateModal() {
              this.$dialog.open(FormDocument, {
                  props: {
                      header: 'Ajouter un document',
                      style: { width: '50vw' },
                      modal: true,
                  }
              });
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
          }
      },
      // Hooks de cycle de vie
      mounted() {
          // Écouter l'événement de suppression de document
          this.unsubscribe = eventBus.on(EVENTS.DOCUMENT_DELETED, (uuid) => {
              console.log('DocumentsView: Événement DOCUMENT_DELETED reçu avec UUID:', uuid);
              // Rafraîchir les données du tableau
              this.refreshData();
          });
      },
      unmounted() {
          // Se désabonner de l'événement pour éviter les fuites de mémoire
          if (this.unsubscribe) {
              this.unsubscribe();
          }
      },
  });
  </script>














