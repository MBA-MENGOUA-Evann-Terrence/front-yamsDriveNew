<template>
    <div class="share-document-container" v-bind:class="{ 'visible': isVisible }">
        <div class="p-tabview">
            <TabView>
                <TabPanel header="Partager par email">
                    <div class="p-fluid share-content">
                        <div class="field">
                            <label for="email">Adresse e-mail du destinataire</label>
                            <InputText id="email" v-model="email" placeholder="Entrez l'adresse e-mail" />
                            <small v-if="emailError" class="p-error">{{ emailError }}</small>
                        </div>
                        
                        <div class="field">
                            <label for="expiration">Date d'expiration (optionnel)</label>
                            <Calendar id="expiration" v-model="expiration" dateFormat="dd/mm/yy" placeholder="Sélectionnez une date d'expiration" :minDate="minDate" :showIcon="true" />
                        </div>
                        
                        <div class="field">
                            <label for="message">Message (optionnel)</label>
                            <Textarea id="message" v-model="message" rows="3" placeholder="Ajouter un message personnalisé" />
                        </div>
                        
                        <div class="field-checkbox">
                            <Checkbox id="notification" v-model="notification" :binary="true" />
                            <label for="notification">M'envoyer une notification quand le document est consulté</label>
                        </div>
                        
                        <div class="document-info" v-if="documentData">
                            <h5>Document à partager</h5>
                            <div class="document-details">
                                <div class="document-icon">
                                    <i :class="getIconForDocument(documentData)" style="font-size: 2rem"></i>
                                </div>
                                <div class="document-meta">
                                    <div class="document-name">{{ documentData.nom }}</div>
                                    <div class="document-type">{{ documentData.type_lisible }}</div>
                                    <div class="document-size">{{ formatSize(documentData.taille) }}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="p-d-flex p-jc-end p-mt-3">
                            <Button label="Partager" icon="pi pi-share-alt" class="p-button-primary" @click="shareDocument" :loading="loading" />
                        </div>
                    </div>
                </TabPanel>

                <!-- L'onglet 'Générer un lien' et 'Partages existants' sont désactivés pour le moment -->

            </TabView>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';

import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { useToast } from 'primevue/usetoast';
type ToastService = ReturnType<typeof useToast>;

import apiClient from '@/services/api';

interface Document {
    uuid: string;
    id?: string;  // Ajout de l'ID optionnel pour les documents provenant d'autres vues
    nom: string;
    type_lisible: string;
    taille: number;
    proprietaire: {
        nom: string;
    };
    created_at: string;
    chemin: string;
}

interface DialogRef {
    data: {
        document: Document;
    };
    close: (params: { refresh?: boolean }) => void;
}

interface Share {
    id: number;
    permission: 'read' | 'write';
    user?: { name: string; email: string };
    email?: string; // Can be present for email shares
    expiration_date: string | null;
    permission_label?: string;
}

export default defineComponent({

    name: 'ShareDocument',
    components: {
        InputText,
        Textarea,
        Checkbox,
        Calendar,
        Button,

        TabView,
        TabPanel,
    },
    data() {
        return {
            dialogRef: null as DialogRef | null,
            toast: null as ToastService | null,
            // Partage par email
            email: '',
            message: '',
            notification: false,
            loading: false,
            emailError: '',
            isVisible: false,
            permission: 'read' as 'read' | 'write',
            expiration: null as Date | null,
            // Génération de lien
            linkPermission: 'read' as 'read' | 'write',
            linkExpiration: null as Date | null,
            linkLoading: false,
            shareLink: '',
            // Partages existants
            existingShares: [] as Share[],
            sharesLoading: false,
            // Options

            minDate: new Date(),
            document: null as Document | null,
        };
    },

    computed: {
        documentData(): Document | null {
            // On lit les données depuis la propriété 'document' passée par le parent
            return this.document;
        }
    },
    mounted() {
        if (this.dialogRef && this.dialogRef.data && this.dialogRef.data.document) {
            this.document = this.dialogRef.data.document;
            console.log('Document reçu dans ShareDocument:', this.document);
            this.isVisible = true;
            
            // Normaliser le format du document si nécessaire
            // Les documents peuvent venir de différentes sources (vue détaillée, vue récente)
            // et peuvent avoir des structures légèrement différentes
            if (!this.document.uuid && this.document.id) {
                this.document.uuid = this.document.id;
            }
        }
    },
    methods: {
        closeDialog(refresh = false) {
            if (this.dialogRef) {
                this.dialogRef.close({ refresh });
            }
        },
        validateEmail(emailStr: string): boolean {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = re.test(emailStr);
            if (!isValid) {
                this.emailError = 'Veuillez entrer une adresse e-mail valide';
            } else {
                this.emailError = '';
            }
            return isValid;
        },
        formatDateForApi(date: Date): string {
            return date.toISOString().split('T')[0];
        },
        async shareDocument() {
            // Validation de l'email
            if (!this.validateEmail(this.email)) {
                this.toast?.add({ severity: 'error', summary: 'Erreur de validation', detail: 'Veuillez entrer une adresse e-mail valide.', life: 3000 });
                return;
            }
            
            // Vérification des données du document
            if (!this.documentData) {
                this.toast?.add({ severity: 'error', summary: 'Erreur critique', detail: 'Les données du document sont manquantes.', life: 3000 });
                return;
            }
            
            // Préparation des données à envoyer
            const payload = {
                email: this.email,
                message: this.message,
                permission_level: this.permission,
                notification: this.notification,
                expiration: this.expiration ? this.formatDateForApi(this.expiration) : null
            };
            
            // Log des données envoyées pour le debug
            console.log('Tentative de partage du document:', {
                documentUuid: this.documentData.uuid,
                payload
            });
            
            this.loading = true;
            try {
                const response = await apiClient.post(`/documents/${this.documentData.uuid}/share`, payload);
                console.log('Réponse du serveur après partage:', response.data);
                
                this.toast?.add({ severity: 'success', summary: 'Succès', detail: 'Document partagé avec succès', life: 3000 });
                // this.fetchExistingShares();
            } catch (error: any) {
                console.error('Erreur lors du partage du document:', error);
                
                // Log détaillé de l'erreur pour le debug
                if (error.response) {
                    console.log('Statut de la réponse:', error.response.status);
                    console.log('Données de la réponse d\'erreur:', error.response.data);
                }
                
                let detail = 'Le partage du document a échoué';
                
                // Gestion des erreurs de validation (422)
                if (error.response && error.response.status === 422 && error.response.data.errors) {
                    const errors = error.response.data.errors;
                    console.log('Erreurs de validation:', errors);
                    detail = Object.values(errors).flat().join(' ');
                }
                
                // Gestion des erreurs d'autorisation (403)
                else if (error.response && error.response.status === 403) {
                    detail = 'Vous n\'avez pas l\'autorisation de partager ce document.';
                }
                
                // Gestion des erreurs de ressource non trouvée (404)
                else if (error.response && error.response.status === 404) {
                    detail = 'Le document que vous essayez de partager n\'existe pas ou a été supprimé.';
                }
                
                this.toast?.add({ severity: 'error', summary: 'Erreur de validation', detail, life: 5000 });
            } finally {
                this.loading = false;
            }
        },
        async generateShareLink() {
            if (!this.documentData) return;
            this.linkLoading = true;
            try {
                const response = await apiClient.post(`/api/documents/${this.documentData.uuid}/share-link`, {
                    permission_level: this.linkPermission,
                    expiration: this.linkExpiration ? this.formatDateForApi(this.linkExpiration) : null
                });
                this.shareLink = `${window.location.origin}/shared-documents/${response.data.token}`;
                this.toast?.add({ severity: 'success', summary: 'Succès', detail: 'Lien de partage généré avec succès', life: 3000 });
            } catch (error: any) {
                console.error('Erreur lors de la génération du lien de partage:', error);
                let detail = 'La génération du lien a échoué';
                if (error.response && error.response.status === 422 && error.response.data.errors) {
                    const errors = error.response.data.errors;
                    detail = Object.values(errors).flat().join(' ');
                }
                this.toast?.add({ severity: 'error', summary: 'Erreur', detail, life: 5000 });
            } finally {
                this.linkLoading = false;
            }
        },
        copyToClipboard() {
            navigator.clipboard.writeText(this.shareLink)
                .then(() => {
                    this.toast?.add({ severity: 'info', summary: 'Copié', detail: 'Lien copié dans le presse-papiers', life: 2000 });
                })
                .catch(err => {
                    console.error('Erreur lors de la copie du lien:', err);
                    this.toast?.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de copier le lien', life: 3000 });
                });
        },
        async fetchExistingShares() {
            if (!this.documentData) return;
            this.sharesLoading = true;
            try {
                const response = await apiClient.get(`/api/documents/${this.documentData.uuid}/shares`);
                console.log('Réponse des partages existants:', response.data);
                const shares = Array.isArray(response.data) ? response.data : response.data.data;
                this.existingShares = shares.map((share: any) => ({
                    ...share,
                    permission_label: share.permission === 'read' ? 'Lecture seule' : 'Lecture et modification'
                }));
            } catch (error) {
                console.error('Erreur lors de la récupération des partages:', error);
                this.toast?.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de récupérer les partages existants', life: 3000 });
            } finally {
                this.sharesLoading = false;
            }
        },
        async removeShare(shareId: number) {
            if (!this.documentData) return;
            try {
                await apiClient.delete(`/api/documents/${this.documentData.uuid}/shares/${shareId}`);
                this.toast?.add({ severity: 'success', summary: 'Succès', detail: 'Partage supprimé avec succès', life: 3000 });
                this.fetchExistingShares();
            } catch (error) {
                console.error('Erreur lors de la suppression du partage:', error);
                this.toast?.add({ severity: 'error', summary: 'Erreur', detail: 'La suppression du partage a échoué', life: 3000 });
            }
        },
        formatDate(dateString: string): string {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR');
        },
        getIconForDocument(doc: Document) {
            const baseClass = 'pi';
            let icon = 'pi-file';
            let colorClass = 'text-gray-500';
            const type = doc.type_lisible || '';
            const name = doc.nom || '';
            if (type.startsWith('image')) {
                icon = 'pi-image';
                colorClass = 'text-red-500';
            } else if (type.includes('pdf')) {
                icon = 'pi-file-pdf';
                colorClass = 'text-red-700';
            } else if (type.includes('word') || /\.docx?$/.test(name)) {
                icon = 'pi-file-word';
                colorClass = 'text-blue-500';
            } else if (type.includes('excel') || /\.xlsx?$/.test(name)) {
                icon = 'pi-file-excel';
                colorClass = 'text-green-500';
            } else if (type.includes('zip') || /\.zip$/.test(name)) {
                icon = 'pi-file-zip';
                colorClass = 'text-yellow-600';
            }
            return `${baseClass} ${icon} ${colorClass}`;
        },
        formatSize(bytes: number) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    },
    created() {
        // Injections are not automatically typed in Options API, so we handle them here.
        // dialogRef is passed via injection by PrimeVue's DialogService
        this.dialogRef = inject('dialogRef') as DialogRef;
        this.toast = useToast();
    },
});
</script>

<style scoped>
.share-document-container {
    padding: 1rem 0;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.share-document-container.visible {
    opacity: 1;
    transform: translateY(0);
}

.share-content {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.field {
    margin-bottom: 1.5rem;
    position: relative;
}

.field label {
    font-weight: 500;
    margin-bottom: 0.5rem;
    display: block;
    color: #495057;
}

.field input, .field textarea {
    transition: box-shadow 0.2s, border-color 0.2s;
}

.field input:focus, .field textarea:focus {
    box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
    border-color: #3f51b5;
}

.field-checkbox {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background-color 0.2s;
}

.field-checkbox:hover {
    background-color: rgba(0, 0, 0, 0.02);
}

.field-checkbox label {
    margin-left: 0.5rem;
    cursor: pointer;
}

.document-info {
    background-color: #f8f9fa;
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
}

.document-info:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.document-info h5 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #495057;
    font-size: 1.1rem;
}

.document-details {
    display: flex;
    align-items: center;
}

.document-icon {
    margin-right: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background-color: #ffffff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.document-meta {
    flex: 1;
}

.document-name {
    font-weight: bold;
    margin-bottom: 0.25rem;
    color: #212529;
    font-size: 1.05rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 250px;
}

.document-type, .document-size {
    color: #6c757d;
    font-size: 0.875rem;
}

.p-dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 1.5rem;
    gap: 0.75rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    margin-top: 1rem;
}

.p-dialog-footer button {
    transition: transform 0.2s, box-shadow 0.2s;
}

.p-dialog-footer button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
