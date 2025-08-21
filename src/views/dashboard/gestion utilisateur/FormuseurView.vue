<template>
    <form @submit.prevent="submitForm" class="p-fluid">
        <div class="field mb-3">
            <label for="nom">Nom</label>
            <InputText id="nom" v-model="form.nom" required />
        </div>

        <div class="field mb-3">
            <label for="prenom">Prénom</label>
            <InputText id="prenom" v-model="form.prenom" required />
        </div>

        <div class="field mb-3">
            <label for="email">Email</label>
            <InputText id="email" v-model="form.email" type="email" required />
        </div>

        <div class="d-flex justify-content-end">
            <Button type="submit" :label="isEditMode ? 'Modifier' : 'Enregistrer'" :icon="isEditMode ? 'pi pi-pencil' : 'pi pi-save'" :loading="isLoading" />
        </div>
    </form>
</template>

<script>
// Plus besoin de jQuery
import InputText from 'primevue/inputtext';

import Button from 'primevue/button';

export default {
    name: 'FormuseurView',
    components: { InputText, Button },
    inject: ['dialogRef'],
    data() {
        return {
            isLoading: false,
            table: 'users',
            roleOptions: [
                { label: 'Administrateur', value: 'admin' },
                { label: 'Utilisateur', value: 'user' }
            ],
            form: {
                id: null,
                nom: '',
                prenom: '',
                email: '',
            }
        }
    },
    computed: {
        isEditMode() {
            return !!(this.dialogRef && this.dialogRef.data && this.dialogRef.data.id);
        }
    },
    mounted() {
        if (this.isEditMode) {
            this.form = { ...this.dialogRef.data };
        }
    },
    methods: {
        async submitForm() {
            this.isLoading = true;
            console.log('Début de submitForm - Données du formulaire:', this.form);
            console.log('Mode édition:', this.isEditMode);

            try {
                let response;
                if (this.isEditMode) {
                    // Mode mise à jour - utilisation de PUT avec préfixe /api (via proxy)
                    console.log(`Envoi PUT à /api/users/${this.form.id}`);
                    response = await this.axios.put(`/api/users/${this.form.id}`, this.form);
                    console.log('Réponse PUT reçue:', response);
                } else {
                    // Mode création - utilisation de POST avec préfixe /api (via proxy)
                    // Mode création - utilisation de POST avec préfixe /api (via proxy)
                    console.log('Envoi POST à /api/utilisateurs/new');
                    const payload = {
                        nom: this.form.nom.trim(),
                        prenom: this.form.prenom.trim(),
                        email: this.form.email.trim().toLowerCase()
                    };
                    response = await this.axios.post('/api/utilisateurs/new', payload);
                    console.log('Réponse POST reçue:', response);
                }

                console.log('Réponse complète:', response);
                // Vérification améliorée de la réponse
                if (response.data.success || response.status === 200 || response.status === 201) {
                    // Succès si success=true OU status 200/201
                    const message = response.data.message || 'Opération réussie';
                    this.handleSuccess(message);
                } else {
                    // Erreur seulement si explicitement indiqué
                    this.handleError(response.data.errors || ['Une erreur est survenue']);
                }
            } catch (error) {
                console.error('Erreur lors de la création/modification de l\'utilisateur:', error);
                console.log('Détails de l\'erreur:', error.response ? {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                } : 'Pas de réponse du serveur');

                let errorMessage = `Erreur lors de la ${this.isEditMode ? 'modification' : 'création'} de l'utilisateur`;
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage += `: ${error.response.data.message}`;
                } else if (error.response && error.response.data && error.response.data.error) {
                    errorMessage += `: ${error.response.data.error}`;
                } else if (error.message) {
                    errorMessage += `: ${error.message}`;
                }

                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: errorMessage,
                    life: 5000
                });
            } finally {
                this.isLoading = false;
            }
        },

        handleSuccess(message) {
            this.dialogRef.close();
            // Émettre un événement pour rafraîchir la liste
            this.$emit('refresh-users');
            // Rafraîchir la page si nécessaire
            setTimeout(() => {
                window.location.reload();
            }, 500);
            this.$toast.add({
                severity: 'success',
                summary: 'Succès',
                detail: message || 'Opération réussie',
                life: 3000
            });
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
        resetForm() {
            this.form = {
                id: null,
                nom: '',
                prenom: '',
                email: ''
            };
        }
    }
}
</script>

<style scoped>
.container {
    max-width: 600px;
}
</style>
