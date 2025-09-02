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
        <div class="d-flex justify-content-end mt-4">
            <Button label="Annuler" icon="pi pi-times" @click="dialogRef.close()" class="p-button-text" />
            <Button type="submit" :label="isEditMode ? 'Mettre à jour' : 'Enregistrer'" icon="pi pi-check" :loading="isLoading" />
        </div>
    </form>
</template>

<script>
import { defineComponent } from 'vue';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

export default defineComponent({
    name: 'FormuseurView',
    components: { InputText, Button },
    inject: ['dialogRef'],
    setup() {
        const toast = useToast();
        return { toast };
    },
    data() {
        return {
            isLoading: false,
            form: {
                id: null,
                nom: '',
                prenom: '',
                email: '',
            },
        };
    },
    computed: {
        isEditMode() {
            return !!(this.dialogRef && this.dialogRef.data && this.dialogRef.data.id);
        },
    },
    mounted() {
        if (this.isEditMode) {
            this.form = { ...this.dialogRef.data };
        }
    },
    methods: {
        async submitForm() {
            this.isLoading = true;
            try {
                const payload = {
                    nom: this.form.nom.trim(),
                    prenom: this.form.prenom.trim(),
                    email: this.form.email.trim().toLowerCase(),
                };

                let response;
                if (this.isEditMode) {
                    response = await this.axios.put(`/api/users/${this.form.id}`, payload);
                } else {
                    response = await this.axios.post('/api/utilisateurs/new', payload);
                }

                if (response.data.success || [200, 201].includes(response.status)) {
                    this.handleSuccess(response.data.message || 'Opération réussie');
                } else {
                    this.handleError(response.data.errors);
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || `Erreur lors de la ${this.isEditMode ? 'modification' : 'création'}.`;
                this.toast.add({ severity: 'error', summary: 'Erreur', detail: errorMessage, life: 5000 });
            } finally {
                this.isLoading = false;
            }
        },
        handleSuccess(message) {
            this.toast.add({ severity: 'success', summary: 'Succès', detail: message, life: 3000 });
            this.dialogRef.close({ success: true });
        },
        handleError(errors) {
            const errorMessages = errors || ['Une erreur est survenue'];
            errorMessages.forEach(msg => {
                this.toast.add({ severity: 'error', summary: 'Erreur de validation', detail: msg, life: 5000 });
            });
        },
    },
});
</script>

<style scoped>
.container {
    max-width: 600px;
}
</style>
