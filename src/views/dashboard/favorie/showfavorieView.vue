<template>
    <div>
        <!-- Contenu de la modale -->
        <div class="modal-content">
            <!-- Aperçu pour une image -->
            <div v-if="isImage" class="preview-container">
                <img v-if="!imageError" :src="displayUrl" alt="Aperçu du document" class="preview-image" @error="onImageError" />
                <div v-else class="no-preview-text">L'aperçu de l'image n'a pas pu être chargé.</div>
            </div>

            <!-- Aperçu pour un PDF -->
            <div v-else-if="isPdf" class="preview-container">
                <object :data="displayUrl" type="application/pdf" width="100%" height="600px">
                    <p>Votre navigateur ne supporte pas l'affichage des PDF. Vous pouvez le <a :href="displayUrl" target="_blank">télécharger</a>.</p>
                </object>
            </div>

            <!-- Détails pour les autres types de fichiers -->
            <div v-else class="document-details">
                <div class="detail-item">
                    <i :class="getFileIcon(document.nom)" style="font-size: 2.5rem; color: var(--primary-color); margin-right: 1rem;"></i>
                    <div class="detail-text">
                        <strong>{{ document.nom }}</strong>
                        <span>{{ formatSize(document.taille) }} - {{ getFileType(document.nom) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Actions en pied de page -->
        <div class="p-dialog-footer">
            <Button label="Télécharger" icon="pi pi-download" class="p-button-success" @click="downloadDocument" />
            <Button label="Retirer des favoris" icon="pi pi-star" class="p-button-warning" @click="removeFromFavorites" />
            <Button label="Fermer" icon="pi pi-times" class="p-button-secondary" @click="closeDialog()" />
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import Button from 'primevue/button';
import axios from 'axios';
import $ from 'jquery';
import { eventBus, EVENTS } from '@/services/eventBus';

export default defineComponent({
    name: 'ShowFavorie',
    components: {
        Button,
    },
    inject: ['dialogRef'],
    data() {
        console.log('ShowFavorie - dialogRef.data:', this.dialogRef.data);
        const source = this.dialogRef.data.source || 'favoris';
        const table = this.dialogRef.data.table || 'favoris';
        console.log('ShowFavorie - source initialisée à:', source);
        console.log('ShowFavorie - table initialisée à:', table);
        return {
            document: this.dialogRef.data.document,
            imageError: false,
            table: table,
            isLoading: false,
            source: source
        };
    },
    computed: {
        extension() {
            return this.document.nom ? this.document.nom.split('.').pop().toLowerCase() : '';
        },
        isImage() {
            return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(this.extension);
        },
        isPdf() {
            return this.extension === 'pdf';
        },
        displayUrl() {
            return `/api/documents/${this.document.id}/download`;
        }
    },
    methods: {
        closeDialog(data = null) {
            this.dialogRef.close(data);
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
                'png': 'Image PNG', 'jpg': 'Image JPG', 'jpeg': 'Image JPEG', 'gif': 'Image GIF',
                'pdf': 'Document PDF', 'doc': 'Document Word', 'docx': 'Document Word',
                'xls': 'Fichier Excel', 'xlsx': 'Fichier Excel', 'txt': 'Fichier Texte',
            };
            return types[extension] || `Fichier ${extension.toUpperCase()}`;
        },
        getFileIcon(fileName) {
            const extension = fileName.split('.').pop().toLowerCase();
            const iconMap = {
                'pdf': 'fas fa-file-pdf', 'doc': 'fas fa-file-word', 'docx': 'fas fa-file-word',
                'xls': 'fas fa-file-excel', 'xlsx': 'fas fa-file-excel', 'txt': 'fas fa-file-alt',
            };
            return iconMap[extension] || 'fas fa-file';
        },
        downloadDocument() {
            const url = `/api/documents/${this.document.id}/download`;
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', this.document.nom);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        removeFromFavorites() {
            this.isLoading = true;
            axios.post(`/api/favoris/${this.document.id}/remove`)
                .then(response => {
                    this.isLoading = false;
                    if (response.data.success) {
                        this.$toast.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Document retiré des favoris',
                            life: 3000
                        });
                        
                        // Fermer la boîte de dialogue
                        this.closeDialog();
                        
                        // Rafraîchir la liste des favoris
                        $('#refreshfavoris').click();
                        
                        // Émettre un événement pour informer d'autres composants
                        eventBus.emit(EVENTS.DOCUMENT_UPDATED, this.document.id);
                    } else {
                        this.$toast.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: response.data.message || 'Erreur lors du retrait des favoris',
                            life: 5000
                        });
                    }
                })
                .catch(error => {
                    this.isLoading = false;
                    console.error('Erreur lors du retrait des favoris:', error);
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Erreur de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur',
                        life: 5000
                    });
                });
        },
        onImageError() {
            this.imageError = true;
        }
    }
});
</script>

<style scoped>
.modal-content {
    margin-bottom: 1rem;
}
.preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 1rem;
    min-height: 300px;
}
.preview-image {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
}
.no-preview-text {
    color: #6c757d;
}
.document-details {
    padding: 2rem;
    text-align: center;
}
.detail-item {
    display: flex;
    align-items: center;
    justify-content: center;
}
.detail-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.detail-text strong {
    font-size: 1.2rem;
}
.detail-text span {
    color: #6c757d;
}
.p-dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
}
.p-dialog-footer .p-button {
    margin-left: 0.5rem;
}
</style>