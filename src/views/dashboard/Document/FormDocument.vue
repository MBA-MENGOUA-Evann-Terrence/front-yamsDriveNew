<template>
    <form @submit.prevent="submitForm" enctype="multipart/form-data" class="document-form">
        <!-- Champ de téléversement (mode création uniquement) -->
        <div v-if="!isEditMode" class="field mb-3">
            <label>Fichier *</label>
            <FileUpload name="fichier" @select="onFileSelect" :showUploadButton="false" :showCancelButton="false" :multiple="false" chooseLabel="Choisir un fichier">
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
.document-form {
    padding: 1rem;
}

.field label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 500;
    color: #333; /* Texte plus foncé pour fond clair */
}

/* Style pour les composants PrimeVue */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-textarea) {
    width: 100%;
    background-color: #ffffff; /* Fond blanc */
    border: 1px solid #ced4da; /* Bordure grise standard */
    color: #495057; /* Couleur de texte standard */
    border-radius: 8px;
}

:deep(.p-inputtext:focus),
:deep(.p-dropdown:focus),
:deep(.p-textarea:focus) {
    box-shadow: 0 0 0 2px #4299e1; /* Ombre de focus */
}

/* Style pour la zone de téléversement */
:deep(.p-fileupload) {
    border: 2px dashed #ced4da; /* Bordure grise claire */
    border-radius: 8px;
    background-color: #ffffff; /* Fond blanc */
    color: #495057; /* Texte foncé */
    padding: 1rem;
    transition: border-color 0.3s, background-color 0.3s;
}

:deep(.p-fileupload:hover) {
    border-color: #4299e1;
}

:deep(.p-button.p-fileupload-choose) {
    background-color: #6366f1;
    border-color: #6366f1;
}

:deep(.p-fileupload-empty) {
    padding: 1rem;
    text-align: center;
    color: #6c757d;
}

/* Style pour la liste des fichiers sélectionnés */
:deep(.p-fileupload-file) {
    border-bottom: 1px solid #4a5568;
    padding: 1rem 0;
}

:deep(.p-fileupload-file-thumbnail) {
    display: none; /* Cache la miniature si non nécessaire */
}

:deep(.p-fileupload-file-info) {
    font-weight: 500;
}

:deep(.p-badge) {
    background-color: #4a5568;
}

/* Style pour les boutons */
.p-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #4a5568;
    margin-top: 1.5rem;
}

:deep(.p-button-text) {
    color: #6c757d;
}

:deep(.p-button) {
    font-weight: 500;
}
</style>
