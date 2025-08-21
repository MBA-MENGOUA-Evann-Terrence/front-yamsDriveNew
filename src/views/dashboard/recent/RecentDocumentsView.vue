<template>
  <div class="card document-management-card">
    <div class="card-header">
      <h1 class="card-title">Documents Récents</h1>
      <button id="refreshrecent" @click="refreshData" class="d-none">Rafraîchir</button>
    </div>
    <div class="card-body">
      <!-- Debug panel -->
      <div class="alert alert-info mb-3">
        <h5>Debug Mode</h5>
        <button @click="testApiRoute" class="btn btn-sm btn-primary mb-2">Tester la route API</button>
        <div v-if="debugResponse" class="mt-2">
          <pre>{{ JSON.stringify(debugResponse, null, 2) }}</pre>
        </div>
        <div v-if="debugError" class="mt-2 text-danger">
          <strong>Erreur:</strong> {{ debugError }}
        </div>
      </div>
      
      <AsdecodeTable 
        ref="datatable"
        :columns="columns"
        url="/api/documents/recent" 
        :api-client="apiClient"
        table="recent"
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
        <template #updated_at="slotProps">
          <span class="p-2 rounded badge badge-secondary">{{ formatDate(slotProps.data.updated_at) }}</span>
        </template>
        <template #service="slotProps">
          <span v-if="slotProps.data.service">{{ slotProps.data.service.nom }}</span>
          <span v-else-if="slotProps.data.service_id" class="text-muted">Service #{{ slotProps.data.service_id }}</span>
          <span v-else class="text-muted">Aucun service</span>
        </template>
        <template #proprietaire="slotProps">
          <span v-if="slotProps.data.source === 'received' && slotProps.data.user">
            {{ slotProps.data.user.prenom }} {{ slotProps.data.user.nom }}
          </span>
          <span v-else>Vous</span>
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
import axios from 'axios';

export default defineComponent({
    name: 'RecentDocumentsView',
    components: {
        FileIcon
    },
    data() {
        return {
            apiClient: apiClient,
            isLoading: false,
            recentDocuments: [],
            lines: 0,
            selection: [],
            debugResponse: null,
            debugError: null,
            columns: [
                {
                    key: 'nom',
                    label: 'Nom',
                    sortable: true,
                    className: '',
                    filterable: true
                },
                {
                    key: 'type_lisible', // On utilise un template personnalisé
                    label: 'Type',
                    sortable: true,
                    className: '',
                    filterable: true
                },
                {
                    key: 'taille',
                    label: 'Taille',
                    sortable: true,
                    className: '',
                    filterable: true
                },
                {
                    key: 'service',
                    label: 'Service',
                    sortable: true,
                    className: '',
                    filterable: true
                },
                {
                    key: 'proprietaire',
                    label: 'Propriétaire',
                    sortable: true,
                    className: '',
                    filterable: true
                },
                {
                    key: 'updated_at',
                    label: 'Date',
                    sortable: true,
                    className: '',
                    filterable: true
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
    mounted() {
        this.fetchRecentDocuments();
    },
    methods: {
        async fetchRecentDocuments() {
            this.isLoading = true;
            try {
                const [publishedRes, receivedRes] = await Promise.all([
                    this.apiClient.get('/documents/recent/published'),
                    this.apiClient.get('/documents/recent/received')
                ]);

                const publishedDocs = (publishedRes.data.data || publishedRes.data).map(doc => {
                    return {...doc, source: 'published'};
                });
                
                const receivedDocs = (receivedRes.data.data || receivedRes.data).map(doc => {
                    return {...doc, source: 'received'};
                });

                const allDocs = [...publishedDocs, ...receivedDocs];

                // Tri par date de modification (plus récent en premier)
                allDocs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

                this.recentDocuments = allDocs;
            } catch (error) {
                console.error("Erreur lors de la récupération des documents récents:", error.message);
                this.recentDocuments = [];
            } finally {
                this.isLoading = false;
            }
        },
        async testApiRoute() {
            // Réinitialisation des variables de debug
            this.debugResponse = null;
            this.debugError = null;
            
            // Test uniquement des URL "recent"
            const urls = [
                '/documents/recent',       // Sans /api (apiClient ajoute /api automatiquement)
                'documents/recent',        // Sans slash au début
                '/api/documents/recent'    // URL complète avec /api
            ];
            
            for (const url of urls) {
                try {
                    this.debugError = `Test de l'URL: ${url}...`;
                    console.log(`Testing URL: ${url}`);
                    
                    // On doit utiliser axios directement pour certains tests
                    let response;
                    if (url.startsWith('/api/')) {
                        // URL complète, on utilise axios directement
                        response = await axios.get(url);
                    } else {
                        // URL relative, on utilise apiClient
                        response = await this.apiClient.get(url);
                    }
                    
                    console.log(`Response from ${url}:`, response);
                    this.debugResponse = {
                        url: url,
                        status: response.status,
                        data: response.data
                    };
                    
                    // Si on arrive ici, l'URL fonctionne, on arrête
                    break;
                } catch (error) {
                    console.error(`Error testing ${url}:`, error);
                    this.debugError = `Erreur avec ${url}: ${error.message}`;
                    
                    if (error.response) {
                        console.log('Error response:', error.response.status, error.response.data);
                        this.debugError += ` (Status: ${error.response.status})`;
                    }
                }
            }
        },
        refreshData() {
            // Permet de rafraichir les données depuis le bouton caché
            this.fetchRecentDocuments();
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
                    table: 'recent'
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
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
