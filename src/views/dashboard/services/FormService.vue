<template>
    <form @submit.prevent="submitForm" class="p-fluid">
        <div class="field mb-3">
            <label for="nom">Nom du service</label>
            <InputText id="nom" v-model="form.nom" required />
        </div>

        <div class="field mb-3">
            <label for="description">Description</label>
            <Textarea id="description" v-model="form.description" rows="5" />
        </div>

        <div class="d-flex justify-content-end">
            <Button type="submit" :label="isEditMode ? 'Modifier' : 'Enregistrer'" :icon="isEditMode ? 'pi pi-pencil' : 'pi pi-save'" :loading="isLoading" />
        </div>
    </form>
</template>

<script>
import $ from 'jquery'
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

export default {
    name: 'FormService',
    components: { InputText, Textarea, Button },
    inject: ['dialogRef'],
    data() {
        return {
            isLoading: false,
            table: 'services',
            form: {
                id: null,
                nom: '',
                description: '',
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
            try {
                let response;
                if (this.isEditMode) {
                    // Mode mise à jour
                    response = await this.axios.post(`/api/services/${this.form.id}/update`, this.form);
                } else {
                    // Mode création
                    response = await this.axios.post('/api/services', this.form);
                }

                if (response.data.success) {
                    this.handleSuccess(response.data.message);
                } else {
                    this.handleError(response.data.errors);
                }
            } catch (error) {
                console.error(error);
                this.handleError(['Une erreur de communication est survenue.']);
            } finally {
                this.isLoading = false;
            }
        },

        handleSuccess(message) {
            this.dialogRef.close();
            $('#refresh' + this.table).click();
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
                description: ''
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