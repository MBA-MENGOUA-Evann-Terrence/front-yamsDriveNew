

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
            <Button v-if="!isFromRecentOrShared" label="Partager" icon="pi pi-share-alt" class="p-button-info" @click="shareDocument" />
            <Button v-if="!isFromRecentOrShared" label="Supprimer" icon="pi pi-trash" class="p-button-danger" @click="deleteDocument" />
            <Button label="Fermer" icon="pi pi-times" class="p-button-secondary" @click="closeDialog()" />
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
        console.log('ShowDocument - dialogRef.data:', this.dialogRef.data);
        const source = this.dialogRef.data.source || 'documents';
        const table = this.dialogRef.data.table || 'documents';
        console.log('ShowDocument - source initialisée à:', source);
        console.log('ShowDocument - table initialisée à:', table);
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
            console.log('======== DEBUG isFromRecentOrShared ========');
            console.log('this.source:', this.source, typeof this.source);
            console.log('this.table:', this.table, typeof this.table);
            console.log('this.document:', this.document);
            console.log('dialogRef.data:', this.dialogRef.data);
            
            // Vérifier la source explicite OU la table
            const sourceCheck = this.source === 'recent' || this.source === 'shared';
            const tableCheck = this.table === 'shared' || this.table === 'recent';
            const result = sourceCheck || tableCheck;
            
            console.log('sourceCheck (source === recent/shared):', sourceCheck);
            console.log('tableCheck (table === shared/recent):', tableCheck);
            console.log('isFromRecentOrShared final result:', result);
            console.log('==========================================');
            return result;
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
            const link = document.createElement('a');
            link.href = this.displayUrl;
            link.download = this.document.nom;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.$toast.add({
                severity: 'success',
                summary: 'Téléchargement',
                detail: 'Le téléchargement a démarré.',
                life: 3000
            });
        },
        shareDocument() {
            this.$dialog.open(ShareDocument, {
                props: {
                    header: 'Partager le document',
                    style: { width: '50vw' },
                    modal: true,
                },
                data: {
                    document: this.document
                }
            });
        },
        deleteDocument() {
            // Stocker les informations du document avant de fermer la vue
            const documentToDelete = { ...this.document };
            
            // Fermer immédiatement la vue détaillée pour une meilleure expérience utilisateur
            this.dialogRef.close();
            
            // Afficher la confirmation dans une popup séparée
            this.$confirm.require({
                message: 'Êtes-vous sûr de vouloir supprimer ce fichier ? Cette action est irréversible.',
                header: 'Confirmation de suppression',
                icon: 'pi pi-exclamation-triangle',
                acceptClass: 'p-button-danger',
                acceptLabel: 'Oui, supprimer',
                rejectLabel: 'Annuler',
                accept: () => {
                    this.isLoading = true;
                    // Ajouter des logs pour déboguer la réponse du serveur
                    console.log('Début de la suppression du document:', documentToDelete.uuid);
                    
                    axios.post('/api/documents/' + documentToDelete.uuid + '/destroy')
                        .then((response) => {
                            this.isLoading = false;
                            console.log('Réponse du serveur après suppression:', response.data);
                            
                            // Considérer la suppression comme réussie même si la réponse n'est pas parfaite
                            // tant que nous avons une réponse du serveur
                            if (response.data && (response.data.success === true || response.status === 200)) {
                                console.log('Suppression réussie, rafraîchissement de la liste...');
                                
                                // Essayer plusieurs méthodes de rafraîchissement pour maximiser les chances
                                setTimeout(() => {
                                    try {
                                        // Méthode 1: Utiliser directement le bouton de rafraîchissement
                                        const refreshButton = document.getElementById('refreshdocuments');
                                        if (refreshButton) {
                                            console.log('Bouton de rafraîchissement trouvé, clic...');
                                            refreshButton.click();
                                        }
                                    } catch (e) {
                                        console.error('Erreur lors du clic sur le bouton de rafraîchissement:', e);
                                    }
                                    
                                    // Méthode 2: Utiliser jQuery comme fallback
                                    try {
                                        $('#refreshdocuments').click();
                                        console.log('Tentative de rafraîchissement via jQuery');
                                    } catch (e) {
                                        console.error('Erreur lors du rafraîchissement via jQuery:', e);
                                    }
                                    
                                    // Méthode 3: Forcer un rechargement de la page si rien d'autre ne fonctionne
                                    setTimeout(() => {
                                        window.location.href = '/dashboard/documents';
                                    }, 1000);
                                }, 500);
                                
                                // Afficher le toast de succès
                                this.$toast.add({
                                    severity: 'success',
                                    summary: 'Succès',
                                    detail: 'Document supprimé avec succès',
                                    life: 3000
                                });
                            } else if (response.data.errors) {
                                // Gestion des erreurs spécifiques retournées par l'API
                                response.data.errors.forEach(element => {
                                    this.$toast.add({
                                        severity: 'warn',
                                        summary: 'Oups !',
                                        detail: element,
                                        life: 20000
                                    });
                                });
                            } else {
                                // Cas où success est false mais pas d'erreurs spécifiques
                                this.$toast.add({
                                    severity: 'error',
                                    summary: 'Erreur',
                                    detail: response.data.message || 'Une erreur est survenue',
                                    life: 3000
                                });
                            }
                        })
                        .catch((error) => {
                            this.isLoading = false;
                            console.error('Erreur lors de la suppression:', error);
                            
                            // Vérifier si l'erreur est due à une réponse du serveur
                            if (error.response) {
                                console.log('Données de réponse d\'erreur:', error.response.data);
                                console.log('Statut de réponse d\'erreur:', error.response.status);
                                
                                // Si le statut est 200 ou 201, la suppression a probablement réussi malgré l'erreur
                                if (error.response.status === 200 || error.response.status === 201) {
                                    console.log('La suppression semble avoir réussi malgré l\'erreur, rafraîchissement...');
                                    
                                    // Rafraîchir la liste
                                    setTimeout(() => {
                                        try {
                                            $('#refreshdocuments').click();
                                            console.log('Tentative de rafraîchissement via jQuery');
                                        } catch (e) {
                                            console.error('Erreur lors du rafraîchissement via jQuery:', e);
                                        }
                                        
                                        // Forcer un rechargement de la page si nécessaire
                                        setTimeout(() => {
                                            window.location.href = '/dashboard/documents';
                                        }, 1000);
                                    }, 500);
                                    
                                    // Afficher un toast de succès
                                    this.$toast.add({
                                        severity: 'success',
                                        summary: 'Succès',
                                        detail: 'Document supprimé avec succès',
                                        life: 3000
                                    });
                                    return;
                                }
                            }
                            
                            // Afficher le message d'erreur standard
                            this.$toast.add({
                                severity: 'error',
                                summary: 'Erreur de connexion',
                                detail: 'Une erreur s\'est produite lors de la suppression.',
                                life: 5000
                            });
                        });
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
