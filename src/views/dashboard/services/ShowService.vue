<template>
    <!-- Boutons d'action -->
    <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-sm btn-primary me-2" @click="onEditModal">
            <i class="fas fa-edit"></i> Modifier
        </button>
        <button class="btn btn-sm btn-danger" @click="onDelete" :disabled="isLoading">
            <i class="fas fa-trash-alt"></i> Supprimer

            <div v-show="isLoading" class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Chargement...</span>
            </div>
        </button>
    </div>

    <!-- Affichage des détails du service -->
    <div class="card shadow-sm">
        <div class="card-body">
            <h5 class="card-title text-primary mb-3">{{ service.nom }}</h5>

            <p class="mb-2">
                <strong>Description :</strong><br>
                <span class="text-muted">{{ service.description }}</span>
            </p>

            <p class="mb-0">
                <strong>Créé le :</strong><br>
                <span class="text-muted">{{ formatDate(service.created_at) }}</span>
            </p>
        </div>
    </div>
</template>

<script>

import FormService from './FormService.vue';

export default {
    name: 'ShowService',
    inject: ['dialogRef'],
    data() {
        return {
            isLoading: false, //pour afficher le chargement
            table: 'services', //la table mis en props sur AsdecodeTable
            service: this.dialogRef.data
        }
    },
    methods: {
        formatDate(dateStr) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' }
            return new Date(dateStr).toLocaleDateString('fr-FR', options)
        },
        onEditModal() {
            this.dialogRef.close()
            this.$dialog.open(FormService, {
                props: {
                    header: 'Modifier un service',
                    style: { width: '50vw' },
                    modal: true,
                },
                data: this.dialogRef.data
            });
        },
                onDelete() {
            // On ferme la modale et on passe l'info de suppression au parent
            this.dialogRef.close({ delete: this.service });
        }
    }
}
</script>

<style scoped>
.card {
    border-radius: 1rem;
}

.btn i {
    margin-right: 4px;
}
</style>