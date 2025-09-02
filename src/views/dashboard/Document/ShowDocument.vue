
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
            
            <!-- Actions pour documents normaux -->
            <template v-if="!isFromRecentOrShared && !isFromTrash">
                <Button label="Partager" icon="pi pi-share-alt" class="p-button-info" @click="shareDocument" />
                <Button label="Supprimer" icon="pi pi-trash" class="p-button-danger" @click="deleteDocument" />
            </template>
            
            <!-- Actions pour documents dans la corbeille -->
            <template v-if="isFromTrash">

                <Button label="Supprimer définitivement" icon="pi pi-trash" class="p-button-danger" @click="forceDeleteDocument" />
            </template>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import ShareDocument from './ShareDocument.vue';
import Button from 'primevue/button';
import axios from 'axios';
import $ from 'jquery';
import { eventBus, EVENTS } from '@/services/eventBus';


export default defineComponent({
    name: 'ShowDocument',
    components: {
        Button,
    },
    inject: ['dialogRef'],
    data() {
        const source = this.dialogRef.data.source || 'documents';
        const table = this.dialogRef.data.table || 'documents';
        return {
            document: this.dialogRef.data.document,
            imageError: false,
            table: table, // Utiliser la table depuis dialogRef.data si fournie
            isLoading: false,
            source: source // Source par défaut est 'documents'
        };
    },
    computed: {
        isFromRecentOrShared() {
            // Vérifie si le document provient des vues "Recent" ou "Partagé avec moi"
            // Vérifier la source explicite OU la table
            const sourceCheck = this.source === 'recent' || this.source === 'shared';
            const tableCheck = this.table === 'shared' || this.table === 'recent';
            const result = sourceCheck || tableCheck;
            return result;
        },
        isFromTrash() {
            // Vérifie si le document provient de la corbeille
            return this.source === 'trash' || this.table === 'trash';
        },
        extension() {
            if (!this.document.nom) return '';
            return this.document.nom.split('.').pop().toLowerCase();
        },
        isImage() {
            return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(this.extension);
        },
        isPdf() {
            return this.extension === 'pdf';
        },
        displayUrl() {
            const backendUrl = 'http://localhost:8000';
            return `${backendUrl}/storage/${this.document.chemin}`;
        },
    },
    methods: {
        closeDialog(data = null) {
            this.dialogRef.close(data);
        },
        formatSize(bytes) {
            if (!bytes || bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        getFileType(fileName) {
            if (!fileName) return 'Inconnu';
            const ext = fileName.split('.').pop().toLowerCase();
            const types = {
                'png': 'Image PNG', 'jpg': 'Image JPG', 'jpeg': 'Image JPEG', 'gif': 'Image GIF', 'webp': 'Image WebP',
                'pdf': 'Document PDF', 'docx': 'Document Word', 'xlsx': 'Feuille de calcul Excel', 'zip': 'Archive ZIP',
            };
            return types[ext] || `Fichier ${ext.toUpperCase()}`;
        },
        getFileIcon(fileName) {
            const ext = fileName.split('.').pop().toLowerCase();
            const icons = {
                'png': 'fas fa-file-image', 'jpg': 'fas fa-file-image', 'jpeg': 'fas fa-file-image', 'gif': 'fas fa-file-image',
                'pdf': 'fas fa-file-pdf', 'docx': 'fas fa-file-word', 'xlsx': 'fas fa-file-excel', 'zip': 'fas fa-file-archive',
            };
            return icons[ext] || 'fas fa-file';
        },
        downloadDocument() {
            try {
                // Utiliser la route spécifique pour le téléchargement
                const downloadUrl = `/api/documents/${this.document.uuid}/download`;
                
                // Créer un lien et simuler un clic pour déclencher le téléchargement
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = downloadUrl;
                a.setAttribute('download', this.document.nom || 'document');
                
                // Ajouter au DOM et simuler un clic
                document.body.appendChild(a);
                a.click();
                
                // Nettoyer
                setTimeout(() => {
                    document.body.removeChild(a);
                }, 100);
                
                this.$toast.add({
                    severity: 'success',
                    summary: 'Téléchargement',
                    detail: 'Le téléchargement a démarré.',
                    life: 3000
                });
            } catch (error) {
                console.error('Erreur lors du téléchargement:', error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du téléchargement du fichier.',
                    life: 3000
                });
            }
        },
        shareDocument() {
            // Stocker les informations du document avant de fermer la vue
            const documentToShare = { ...this.document };
            
            // Fermer immédiatement la vue détaillée pour une meilleure expérience utilisateur
            this.dialogRef.close();
            
            // Ouvrir le formulaire de partage après un court délai pour assurer la fermeture de la vue
            setTimeout(() => {
                this.$dialog.open(ShareDocument, {
                    props: {
                        header: 'Partager le document',
                        style: { width: '50vw' },
                        modal: true,
                    },
                    data: {
                        document: documentToShare
                    }
                });
            }, 100);
        },
        deleteDocument() {
            this.closeDialog(); // Ferme la modale de détails
            this.$confirm.require({
                message: 'Voulez-vous vraiment envoyer ce document à la corbeille ?',
                header: 'Confirmation de suppression',
                icon: 'pi pi-info-circle',
                acceptClass: 'p-button-danger',
                acceptLabel: 'Oui, supprimer',
                rejectLabel: 'Annuler',
                accept: async () => {
                    this.isLoading = true;
                    try {
                        // Utilisation de this.axios qui est l'instance configurée
                        await this.axios.delete(`/api/documents/${this.document.uuid}`);
                        this.$toast.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Le document a été déplacé vers la corbeille.',
                            life: 3000
                        });
                        // Émettre l'événement pour que la liste principale se rafraîchisse
                        eventBus.emit(EVENTS.DOCUMENT_DELETED, this.document.uuid);
                        this.closeDialog();
                    } catch (error) {
                        const msg = error.response?.data?.message || 'La suppression a échoué.';
                        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: msg, life: 5000 });
                    } finally {
                        this.isLoading = false;
                    }
                }
            });
        },

        async forceDeleteDocument() {
            this.closeDialog(); // Ferme la modale de détails
            this.$confirm.require({
                message: `Êtes-vous sûr de vouloir supprimer définitivement le document "${this.document.nom}" ? Cette action est irréversible.`,
                header: 'Confirmation de suppression définitive',
                icon: 'pi pi-exclamation-triangle',
                acceptClass: 'p-button-danger',
                acceptLabel: 'Oui, supprimer définitivement',
                rejectLabel: 'Annuler',
                accept: async () => {
                    this.isLoading = true;
                    try {
                        await this.axios.delete(`/api/documents/${this.document.uuid}/force`);
                        this.$toast.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Le document a été supprimé définitivement.',
                            life: 3000
                        });
                        // Émettre un événement pour rafraîchir la corbeille
                        eventBus.emit(EVENTS.DOCUMENT_FORCE_DELETED, this.document.uuid);
                        this.closeDialog();
                    } catch (error) {
                        const msg = error.response?.data?.message || 'La suppression a échoué.';
                        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: msg, life: 5000 });
                    } finally {
                        this.isLoading = false;
                    }
                }
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
