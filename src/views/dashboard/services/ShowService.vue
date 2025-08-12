<template>
    <!-- Boutons d'action -->
    <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-sm btn-primary me-2" @click="onEditModal">
            <i class="fas fa-edit"></i> Modifier
        </button>
        <button class="btn btn-sm btn-danger" @click="onDeleteLine" :disabled="isLoading">
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
import $ from 'jquery'
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
        onDeleteLine() {
            //demander une confirmation avant de supprimer
            if (!window.confirm("Etes vous sur de vouloir supprimer ?")) {
                return
            }
            this.isLoading = true
            this.axios.post('/api/services/' + this.service.id + '/destroy').then((response) => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    this.dialogRef.close()
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                }
                else {
                    response.data.errors.forEach(element => {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Oups !',
                            detail: element,
                            life: 20000
                        });
                    });
                }
            }).catch(() => {
                this.isLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
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