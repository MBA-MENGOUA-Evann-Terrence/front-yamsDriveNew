<template>
    <form @submit.prevent="submitForm" class="p-fluid">
        <div class="field mb-3">
            <label for="document_id">Sélectionner un document à ajouter aux favoris</label>
            <Dropdown id="document_id" v-model="form.document_id" :options="documents" optionLabel="nom" optionValue="id" placeholder="Sélectionner un document" :filter="true" :showClear="true" required />
        </div>

        <div class="field mb-3" v-if="selectedDocument">
            <div class="document-preview">
                <i :class="getFileIcon(selectedDocument.nom)" class="document-icon"></i>
                <div class="document-info">
                    <h5>{{ selectedDocument.nom }}</h5>
                    <p>{{ formatSize(selectedDocument.taille) }} - {{ getFileType(selectedDocument.nom) }}</p>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-end">
            <Button type="submit" label="Ajouter aux favoris" icon="pi pi-star" :loading="isLoading" />
        </div>
    </form>
</template>

<script>
import $ from 'jquery'
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import { eventBus, EVENTS } from '@/services/eventBus';

export default {
    name: 'FormFavori',
    components: { Button, Dropdown },
    inject: ['dialogRef'],
    data() {
        return {
            isLoading: false,
            table: 'favoris',
            documents: [],
            form: {
                document_id: null
            }
        }
    },
    computed: {
        selectedDocument() {
            if (!this.form.document_id) return null;
            return this.documents.find(doc => doc.id === this.form.document_id);
        }
    },
    mounted() {
        this.fetchDocuments();
    },
    methods: {
        async fetchDocuments() {
            try {
                const response = await this.axios.get('/api/documents/list');
                if (response.data.success) {
                    this.documents = response.data.data.filter(doc => {
                        // Filtrer les documents qui ne sont pas déjà dans les favoris
                        return !doc.is_favorite;
                    });
                } else {
                    this.handleError(['Erreur lors du chargement des documents']);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des documents:', error);
                this.handleError(['Une erreur est survenue lors du chargement des documents']);
            }
        },
        
        async submitForm() {
            if (!this.form.document_id) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Attention',
                    detail: 'Veuillez sélectionner un document',
                    life: 3000
                });
                return;
            }
            
            this.isLoading = true;
            try {
                const response = await this.axios.post('/api/favoris/add', {
                    document_id: this.form.document_id
                });

                if (response.data.success) {
                    this.handleSuccess(response.data.message || 'Document ajouté aux favoris');
                } else {
                    this.handleError(response.data.errors || ['Erreur lors de l\'ajout aux favoris']);
                }
            } catch (error) {
                console.error(error);
                this.handleError(['Une erreur de communication est survenue.']);
            } finally {
                this.isLoading = false;
            }
        },

        handleSuccess(message) {
            this.dialogRef.close();
            $('#refresh' + this.table).click();
            this.$toast.add({
                severity: 'success',
                summary: 'Succès',
                detail: message,
                life: 3000
            });
            
            // Émettre un événement pour informer d'autres composants
            eventBus.emit(EVENTS.DOCUMENT_UPDATED, this.form.document_id);
        },

        handleError(errors) {
            const errorMessages = errors || ['Une erreur est survenue'];
            errorMessages.forEach(element => {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: element,
                    life: 7000
                });
            });
        },
        
        getFileIcon(fileName) {
            if (!fileName) return 'fas fa-file';
            const extension = fileName.split('.').pop().toLowerCase();
            const iconMap = {
                'pdf': 'fas fa-file-pdf', 
                'doc': 'fas fa-file-word', 
                'docx': 'fas fa-file-word',
                'xls': 'fas fa-file-excel', 
                'xlsx': 'fas fa-file-excel', 
                'txt': 'fas fa-file-alt',
                'jpg': 'fas fa-file-image',
                'jpeg': 'fas fa-file-image',
                'png': 'fas fa-file-image',
                'gif': 'fas fa-file-image'
            };
            return iconMap[extension] || 'fas fa-file';
        },
        
        getFileType(fileName) {
            if (!fileName) return 'Inconnu';
            const extension = fileName.split('.').pop().toLowerCase();
            const types = {
                'png': 'Image PNG', 'jpg': 'Image JPG', 'jpeg': 'Image JPEG', 'gif': 'Image GIF',
                'pdf': 'Document PDF', 'doc': 'Document Word', 'docx': 'Document Word',
                'xls': 'Fichier Excel', 'xlsx': 'Fichier Excel', 'txt': 'Fichier Texte',
            };
            return types[extension] || `Fichier ${extension.toUpperCase()}`;
        },
        
        formatSize(bytes) {
            if (!bytes) return '0 Bytes';
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    }
}
</script>

<style scoped>
.container {
    max-width: 600px;
}

.document-preview {
    display: flex;
    align-items: center;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.document-icon {
    font-size: 2rem;
    color: var(--primary-color);
    margin-right: 1rem;
}

.document-info {
    display: flex;
    flex-direction: column;
}

.document-info h5 {
    margin: 0 0 0.5rem 0;
    font-weight: 500;
}

.document-info p {
    margin: 0;
    color: #6c757d;
    font-size: 0.9rem;
}
</style>