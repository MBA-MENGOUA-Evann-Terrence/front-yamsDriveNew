<template>
    <div class="user-details">
        <div class="user-info mb-4">
            <div class="row mb-3">
                <div class="col-md-4 fw-bold">Nom:</div>
                <div class="col-md-8">{{ user.name }}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4 fw-bold">Email:</div>
                <div class="col-md-8">{{ user.email }}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4 fw-bold">Rôle:</div>
                <div class="col-md-8">
                    <span class="badge" :class="roleClass">{{ roleLabel }}</span>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4 fw-bold">Inscrit le:</div>
                <div class="col-md-8">{{ formatDate(user.created_at) }}</div>
            </div>
        </div>

        <div class="action-buttons d-flex justify-content-end">
            <Button label="Supprimer" icon="pi pi-trash" class="p-button-danger" @click="confirmDelete" />
        </div>
    </div>
</template>

<script>
// Plus besoin de jQuery
import Button from 'primevue/button';
import FormuseurView from './FormuseurView.vue';
// Formatage de date natif sans dépendance externe

export default {
    name: 'ShowuseurView',
    components: { Button },
    inject: ['dialogRef'],
    data() {
        return {
            user: {},
            table: 'users'
        }
    },
    computed: {
        roleClass() {
            return this.user.role === 'admin' ? 'bg-danger' : 'bg-primary';
        },
        roleLabel() {
            return this.user.role === 'admin' ? 'Administrateur' : 'Utilisateur';
        }
    },
    mounted() {
        if (this.dialogRef && this.dialogRef.data) {
            this.user = { ...this.dialogRef.data };
        }
    },
    methods: {
        formatDate(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                // Format: JJ/MM/AAAA à HH:MM
                return date.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }).replace(',', ' à');
            } catch (error) {
                console.error('Erreur de formatage de date:', error);
                return dateString;
            }
        },
        editUser() {
            this.dialogRef.close();
            this.$dialog.open(FormuseurView, {
                props: {
                    header: 'Modifier l\'utilisateur',
                    style: { width: '50vw' },
                    modal: true,
                },
                data: this.user
            });
        },
        confirmDelete(event) {
            this.dialogRef.close(); // Ferme la modale de détails
            this.$confirm.require({
                target: event.currentTarget,
                message: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${this.user.name} ?`,
                header: 'Confirmation de suppression',
                icon: 'pi pi-exclamation-triangle',
                acceptClass: 'p-button-danger',
                acceptLabel: 'Oui, supprimer',
                rejectLabel: 'Annuler',
                accept: () => {
                    this.deleteUser();
                },
            });
        },
        async deleteUser() {
            try {
                await this.axios.delete(`/api/users/${this.user.id}`);
                this.$toast.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Utilisateur ${this.user.name} supprimé avec succès`,
                    life: 3000
                });
                this.dialogRef.close({ success: true });
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'La suppression a échoué',
                    life: 3000
                });
            }
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
        }
    }
}
</script>

<style scoped>
.user-details {
    padding: 1rem;
}

.user-info {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
}

.badge {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    border-radius: 4px;
}
</style>
