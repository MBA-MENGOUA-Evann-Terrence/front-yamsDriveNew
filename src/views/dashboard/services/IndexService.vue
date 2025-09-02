<template>
  <div class="card service-management-card">
    <div class="card-header">
      <h1 class="card-title">Gestion des services</h1>
      <button class="btn btn-primary" @click="showCreateModal">
        <i class="fas fa-plus me-1"></i> Nouveau service
      </button>
    </div>
    <div class="card-body">
      <AsdecodeTable 
        ref="serviceTable"
        :key="tableKey"
        :columns="columns" 
        url="/api/services" 
        table="services" 
        @set-total-records="updateLines"
        @row-click="showLine" 
        @set-selected-rows="getSelection"
        :show-top-stats="false"
        :show-bottom-stats="false"
      >
        <template #created_at="slotProps">
          <span class="p-2 rounded badge badge-secondary">{{ slotProps.data.created_at }}</span>
        </template>
      </AsdecodeTable>
    </div>
  </div>
</template>

<style scoped>
.service-management-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.card-body {
  padding: 0;
}

/* Masquer les informations de pagination (haut et bas) */
:deep(.dataTables_length), 
:deep(.dataTables_info) {
  display: none !important;
}
</style>

<script>
import { defineComponent } from 'vue';
import FormService from './FormService.vue';
import ShowService from './ShowService.vue';

export default defineComponent({
    name: 'IndexService',

    data() {
        return {
            tableKey: 0,
            lines: 0,
            selection: [],
            columns: [
                {
                    key: 'nom',
                    label: 'Nom',
                },
                {
                    key: 'description',
                    label: 'Description',
                },
                {
                    key: 'created_at',
                    label: 'Ajouté le',
                }
            ]
        }
    },
    methods: {
        refreshTable() {
            this.tableKey++;
        },
        showLine(line) {
            this.$dialog.open(ShowService, {
                props: {
                    header: 'Détails du service',
                    style: { width: '50vw' },
                    modal: true,
                },
                data: line,
                onClose: (options) => {
                    if (options && options.data) {
                        if (options.data.refresh) {
                            this.refreshTable();
                        }
                        if (options.data.delete) {
                            this.confirmDeleteService(options.data.delete);
                        }
                    }
                }
            });
        },
        updateLines(nb) {
            this.lines = nb
        },
        confirmDeleteService(service) {
            this.$confirm.require({
                message: `Êtes-vous sûr de vouloir supprimer le service ${service.nom} ?`,
                header: 'Confirmation de suppression',
                icon: 'pi pi-exclamation-triangle',
                acceptClass: 'p-button-danger',
                acceptLabel: 'Oui, supprimer',
                rejectLabel: 'Annuler',
                accept: async () => {
                    try {
                        await this.axios.post(`/api/services/${service.id}/destroy`);
                        this.$toast.add({ severity: 'success', summary: 'Succès', detail: 'Service supprimé.', life: 3000 });
                        this.refreshTable();
                    } catch (error) {
                        const msg = error.response?.data?.message || 'La suppression a échoué.';
                        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: msg, life: 5000 });
                    }
                }
            });
        },
        showCreateModal() {
            this.$dialog.open(FormService, {
                props: {
                    header: 'Ajouter un service',
                    style: { width: '50vw' },
                    modal: true,
                },

            });
        },
        
    },
});
</script>