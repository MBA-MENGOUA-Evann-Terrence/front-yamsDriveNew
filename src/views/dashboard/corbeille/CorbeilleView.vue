<template>
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h1 class="card-title mb-0">Corbeille</h1>
            <button class="btn btn-outline-secondary btn-sm" @click="showDebug = !showDebug">
                Afficher/Cacher Débogage
            </button>
        </div>
        <div v-if="showDebug" class="card-body bg-light border-bottom">
            <h5 class="text-dark">Informations de débogage</h5>
            <pre class="text-dark">URL passée au composant AsdecodeTable: <strong>{{ tableUrl }}</strong>

Configuration du proxy (dans vue.config.js) pour cette URL:
<strong>'/api': { target: 'http://127.0.0.1:8000' }</strong>

Le navigateur doit donc appeler <strong>/api/documents/trash</strong>, et le proxy doit le rediriger vers <strong>http://127.0.0.1:8000/api/documents/trash</strong>.</pre>
        </div>
        <div class="card-body">
            <AsdecodeTable
                ref="trashTable"
                :key="tableKey"
                :columns="columns"
                :url="tableUrl"
                table="documents"
                :show-top-stats="false"
                :show-bottom-stats="false"
                :searchable="false"
                @row-click="showLine"
            >
                <template #nom="{ data }">
                    <div class="file-cell">
                        <FileIcon :fileName="data.nom" />
                        <span class="ms-2">{{ data.nom }}</span>
                    </div>
                </template>
                <template #type_lisible="{ data }">
                    <span class="badge bg-secondary">{{ getFileType(data.nom) }}</span>
                </template>
                <template #service="{ data }">
                    <span v-if="data.service">{{ data.service.nom }}</span>
                    <span v-else-if="data.service_id" class="text-muted">Service #{{ data.service_id }}</span>
                    <span v-else class="text-muted">Aucun service</span>
                </template>

                <template #deleted_at="{ data }">
                    <td class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap space-x-2">
                        <span class="badge bg-warning text-dark">{{ formatDate(data.deleted_at) }}</span>
                        <button @click.stop="restoreDocument(data)" :disabled="isRowLoading(data)" class="btn btn-sm btn-outline-primary">
                            <i class="pi pi-replay me-1"></i> Restaurer
                        </button>
                    </td>
                </template>
            </AsdecodeTable>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import ShowDocument from '../Document/ShowDocument.vue';
import FileIcon from '@/components/FileIcon.vue';
import { eventBus, EVENTS } from '@/services/eventBus';

export default defineComponent({
    name: 'CorbeilleView',
    components: {
        FileIcon
    },
    data() {
        return {
            showDebug: false,
            tableUrl: '/api/documents/trash',
            tableKey: 0,
            loadingMap: {}, // Pour suivre l'état de chargement par ligne
            columns: [
                {
                    key: 'nom',
                    label: 'Fichier',
                    headerClass: 'text-start',
                    cellClass: 'text-start align-middle'
                },
                {
                    key: 'type_lisible',
                    label: 'Type',
                    headerClass: 'text-center',
                    cellClass: 'text-center align-middle'
                },
                {
                    key: 'service',
                    label: 'Service',
                    headerClass: 'text-center',
                    cellClass: 'text-center align-middle'
                },
                {
                    key: 'deleted_at',
                    label: 'Supprimé le',
                    headerClass: 'text-center',
                    cellClass: 'text-center align-middle'
                }
            ],
        };
    },
    methods: {
        async restoreDocument(document) {
            if (this.isRowLoading(document)) return;

            this.setRowLoading(document.uuid, true);
            try {
                await this.axios.post(`/api/documents/${document.uuid}/restore`);
                this.$toast.add({ severity: 'success', summary: 'Succès', detail: 'Document restauré avec succès.', life: 3000 });
                eventBus.emit(EVENTS.DOCUMENT_RESTORED, document.uuid);
            } catch (error) {
                console.error('Erreur détaillée lors de la restauration du document:', error.response || error);
                this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la restauration du document.', life: 3000 });
            } finally {
                this.setRowLoading(document.uuid, false);
            }
        },

        async forceDeleteDocument(document) {
            if (this.isRowLoading(document)) return;

            this.setRowLoading(document.uuid, true);
            try {
                await this.axios.delete(`/api/documents/${document.uuid}/force-delete`);
                this.$toast.add({ severity: 'success', summary: 'Succès', detail: 'Document supprimé définitivement.', life: 3000 });
                eventBus.emit(EVENTS.DOCUMENT_FORCE_DELETED, document.uuid);
            } catch (error) {
                console.error('Erreur lors de la suppression définitive:', error);
                this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression définitive.', life: 3000 });
            } finally {
                this.setRowLoading(document.uuid, false);
            }
        },

        isRowLoading(document) {
            return this.loadingMap[document.uuid] || false;
        },

        setRowLoading(uuid, isLoading) {
            this.loadingMap[uuid] = isLoading;
        },

        refreshTable() {
            this.tableKey++;
        },
        showLine(line) {
            // Ouvrir le popup de détails avec les actions spécifiques à la corbeille
            const extension = line.nom.split('.').pop().toLowerCase();
            const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension);
            const dialogWidth = isImage ? '70vw' : '50vw';

            this.$dialog.open(ShowDocument, {
                props: {
                    header: 'Document dans la corbeille',
                    style: { width: dialogWidth },
                    modal: true,
                    maximizable: true,
                    closeOnEscape: true
                },
                data: {
                    document: line,
                    source: 'trash', // Identifier que c'est depuis la corbeille
                    table: 'trash'
                }
            });
        },
        formatDate(dateString) {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
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
        },
    },
    mounted() {
        // Écouter les événements de restauration et suppression définitive
        this.unsubscribeRestore = eventBus.on(EVENTS.DOCUMENT_RESTORED, (uuid) => {
            console.log('CorbeilleView: Document restauré avec UUID:', uuid);
            this.refreshTable();
        });
        
        this.unsubscribeForceDelete = eventBus.on(EVENTS.DOCUMENT_FORCE_DELETED, (uuid) => {
            console.log('CorbeilleView: Document supprimé définitivement avec UUID:', uuid);
            this.refreshTable();
        });
    },
    unmounted() {
        // Se désabonner des événements pour éviter les fuites de mémoire
        if (this.unsubscribeRestore) {
            this.unsubscribeRestore();
        }
        if (this.unsubscribeForceDelete) {
            this.unsubscribeForceDelete();
        }
    }
});
</script>

<style scoped>
.file-cell {
    display: flex;
    align-items: center;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.card-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
}
</style>