<template>
    <form @submit.prevent="submitForm" enctype="multipart/form-data">
        <!-- Champ de téléversement (mode création uniquement) -->
        <div v-if="!isEditMode" class="field mb-3">
            <label>Fichier *</label>
            <FileUpload name="fichier" @select="onFileSelect" :showUploadButton="false" :showCancelButton="false" :multiple="false">
                <template #empty>
                    <p>Glissez et déposez un fichier ici.</p>
                </template>
            </FileUpload>
        </div>

        <!-- Champ nom (mode édition uniquement) -->
        <div v-if="isEditMode" class="field mb-3">
            <label for="nom">Nom du document *</label>
            <InputText id="nom" v-model="form.nom" required />
        </div>

        <div class="field mb-3">
            <label for="service">Service (Optionnel)</label>
            <Dropdown id="service" v-model="form.service_id" :options="services" optionLabel="nom" optionValue="id" placeholder="Sélectionner un service" />
        </div>

        <div class="field mb-3">
            <label for="description">Description (Optionnel)</label>
            <Textarea id="description" v-model="form.description" rows="4" />
        </div>

        <div class="p-dialog-footer">
             <Button label="Annuler" icon="pi pi-times" @click="closeDialog(false)" class="p-button-text"/>
            <Button type="submit" :label="isEditMode ? 'Modifier' : 'Enregistrer'" icon="pi pi-check" :loading="isLoading" />
        </div>
    </form>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import FileUpload from 'primevue/fileupload';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import $ from 'jquery';

interface Service {
    id: string;
    nom: string;
}

export default defineComponent({
    name: 'FormDocument',
    components: { FileUpload, Dropdown, Textarea, Button, InputText },
    setup() {
        const axios: any = inject('axios'); // Injecter l'instance globale d'Axios
        const dialogRef = inject('dialogRef') as any;
        const isEditMode = computed(() => dialogRef.value.data?.isEditMode || false);
        const documentData = computed(() => dialogRef.value.data?.documentData || null);
        const toast = useToast();
        const isLoading = ref(false);
        const services = ref<Service[]>([]);

        const form = ref({
            fichier: null as File | null,
            nom: '',
            service_id: null as string | null,
            description: '',
        });

        // Pré-remplir le formulaire en mode édition
        if (isEditMode.value && documentData.value) {
            form.value.nom = documentData.value.nom;
            form.value.description = documentData.value.description;
            form.value.service_id = documentData.value.service?.id || null;
        }

        const fetchServices = async () => {
            try {
                const response = await axios.get('/api/services'); 
                services.value = response.data.data;
            } catch (error) {
                console.error("Erreur lors de la récupération des services:", error);
                toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger la liste des services.', life: 3000 });
            }
        };

        onMounted(fetchServices);

        const onFileSelect = (event: any) => {
            form.value.fichier = event.files[0];
        };

        const closeDialog = (success = false) => {
            dialogRef.value.close({ success });
        };

        const submitForm = async () => {
            if (!isEditMode.value && !form.value.fichier) {
                toast.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner un fichier.', life: 3000 });
                return;
            }

            isLoading.value = true;

            try {
                if (isEditMode.value) {
                    // Logique de mise à jour
                    const payload = {
                        nom: form.value.nom,
                        description: form.value.description,
                        service_id: form.value.service_id,
                    };
                    const response = await axios.post(`/api/documents/${documentData.value.uuid}/update`, payload);
                    toast.add({ severity: 'success', summary: 'Succès', detail: response.data.message, life: 3000 });
                    closeDialog(true);
                } else {
                    // Logique de création
                    const formData = new FormData();
                    formData.append('fichier', form.value.fichier!);
                    if (form.value.service_id) {
                        formData.append('service_id', form.value.service_id);
                    }
                    if (form.value.description) {
                        formData.append('description', form.value.description);
                    }
                    const response = await axios.post('/api/documents', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    toast.add({ severity: 'success', summary: 'Succès', detail: response.data.message, life: 3000 });
                    $('#refreshdocuments').click(); // Déclenche le rafraîchissement
                }
                closeDialog(true);

            } catch (error: any) {
                const message = error.response?.data?.message || 'Une erreur est survenue.';
                toast.add({ severity: 'error', summary: 'Erreur', detail: message, life: 3000 });
            } finally {
                isLoading.value = false;
            }
        };

        return {
            form,
            services,
            isLoading,
            onFileSelect,
            submitForm,
            closeDialog,
            isEditMode
        };
    },
});
</script>

<style scoped>
.p-dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 1rem;
}
</style>
