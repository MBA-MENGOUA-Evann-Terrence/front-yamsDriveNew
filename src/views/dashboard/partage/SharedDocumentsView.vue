<template>
  <div class="card document-management-card">
    <div class="card-header">
      <h1 class="card-title">Partagés avec moi</h1>
      <button id="refreshshared" @click="refreshData" class="d-none">Rafraîchir</button>
      <button @click="testApiRoute" class="btn btn-sm btn-primary mb-2">Tester la route API</button>
    </div>
    <div class="card-body">
      <div v-if="debugResponse" class="mt-2">
        <pre>{{ JSON.stringify(debugResponse, null, 2) }}</pre>
      </div>
      <div v-if="debugError" class="mt-2 text-danger">
        <strong>Erreur:</strong> {{ debugError }}
      </div>
      <AsdecodeTable 
        ref="datatable"
        :columns="columns" 
        url="/api/documents/shared-with-me" 
        :api-client="apiClient"
        table="shared" 
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
        <template #proprietaire="slotProps">
          <span v-if="slotProps.data.user && slotProps.data.user.prenom && slotProps.data.user.nom">
            {{ slotProps.data.user.prenom }} {{ slotProps.data.user.nom }}
          </span>
          <span v-else-if="slotProps.data.shared_by">
            {{ slotProps.data.shared_by.name }}
          </span>
          <span v-else>Inconnu</span>
        </template>
        <template #taille="slotProps">
          <span>{{ formatSize(slotProps.data.taille) }}</span>
        </template>
        <template #date_partage="slotProps">
          <span class="p-2 rounded badge badge-secondary">{{ formatDate(slotProps.data.date_partage || slotProps.data.created_at) }}</span>
        </template>
        <template #service="slotProps">
          <span v-if="slotProps.data.service">{{ slotProps.data.service.nom }}</span>
          <span v-else-if="slotProps.data.service_id" class="text-muted">Service #{{ slotProps.data.service_id }}</span>
          <span v-else class="text-muted">Aucun service</span>
        </template>
        <template #favoris="slotProps">
          <button class="btn btn-sm btn-link p-0" @click.stop="addToFavorites(slotProps.data)">
            <i class="fas fa-star" :class="{ 'text-warning': slotProps.data.is_favorite, 'text-muted': !slotProps.data.is_favorite }"></i>
          </button>
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
import ShowDocument from '../Document/ShowDocument.vue';
import FileIcon from '@/components/FileIcon.vue';
import apiClient from '@/services/api';

export default defineComponent({
    name: 'SharedDocumentsView',
    components: {
        FileIcon
    },
    data() {
        return {
            apiClient: apiClient,
            lines: 0,
            selection: [],
            debugResponse: null,
            debugError: null,
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
                    key: 'proprietaire',
                    label: 'Propriétaire',
                },
                {
                    key: 'date_partage',
                    label: 'Partagé le',
                },
                {
                    key: 'favoris',
                    label: 'Favoris',
                    sortable: false,
                    className: 'text-center',
                    filterable: false
                }
            ]
        }
    },
    methods: {
        async testApiRoute() {
            // Réinitialisation des variables de debug
            this.debugResponse = null;
            this.debugError = null;
            
            try {
                this.debugError = "Test de l'URL: /api/documents/shared-with-me...";
                console.log("Testing URL: /api/documents/shared-with-me");
                
                // Utiliser apiClient pour récupérer les données
                const response = await this.apiClient.get('/documents/shared-with-me');
                
                if (response.status === 200) {
                    this.debugResponse = response.data;
                    console.log("Documents partagés:", response.data);
                    
                    // Vérifier spécifiquement les services
                    if (response.data && response.data.data) {
                        const docs = response.data.data;
                        console.log(`Nombre de documents: ${docs.length}`);
                        
                        // Analyser la structure des services dans chaque document
                        docs.forEach((doc, index) => {
                            console.log(`Document ${index + 1} - ${doc.nom}:`);
                            console.log("  Service:", doc.service);
                            console.log("  Service ID:", doc.service_id);
                        });
                    }
                } else {
                    this.debugError = `Erreur: Status ${response.status}`;
                }
            } catch (error) {
                this.debugError = `Erreur: ${error.message}`;
                console.error("Error testing API:", error);
            }
        },
        
        refreshData() {
            if (this.$refs.datatable) {
                this.$refs.datatable.fetchData();
            }
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
                    document: line,
                    table: 'shared',
                    source: 'shared', // Indiquer que le document provient de la vue "Partagé avec moi"
                    showAddButton: false  // Ne pas montrer le bouton d'ajout pour les documents partagés
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
        
        formatDate(dateString) {
            if (!dateString) return 'Date inconnue';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        },
        
        getSelection(selection) {
            this.selection = selection;
        },
        
        addToFavorites(document) {
            console.log('Ajout aux favoris:', document);
            
            // Créer un objet avec uniquement les données nécessaires pour éviter les références circulaires
            const documentData = {
                document_id: document.id
            };
            
            // Appel à l'API pour ajouter/retirer des favoris
            this.apiClient.post('/favoris', documentData)
            .then(response => {
                console.log('Document ajouté aux favoris:', response.data);
                
                // Mettre à jour l'état visuel de l'étoile
                document.is_favorite = true;
                
                // Afficher une notification de succès
                this.$toast.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Document ajouté aux favoris',
                    life: 3000
                });
            })
            .catch(error => {
                console.error('Erreur lors de l\'ajout aux favoris:', error);
                console.error('Détails de l\'erreur:', error.response ? error.response.data : 'Pas de réponse');
                console.error('Status code:', error.response ? error.response.status : 'Inconnu');
                
                // Message d'erreur plus détaillé
                const errorMessage = error.response && error.response.data && error.response.data.message
                    ? error.response.data.message
                    : 'Impossible d\'ajouter ce document aux favoris';
                
                // Afficher une notification d'erreur
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: errorMessage,
                    life: 5000
                });
            });
        }
    }
});
</script>
