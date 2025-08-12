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
        showLine(line) {
            this.$dialog.open(ShowService, {
                props: {
                    header: 'Service '+line.id,
                    style: { width: '50vw' },
                    modal: true,
                },
                data: line
            });
        },
        updateLines(nb) {
            this.lines = nb
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