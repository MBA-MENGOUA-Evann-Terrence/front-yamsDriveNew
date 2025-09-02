<template>
  <div class="card service-management-card">
    <div class="card-header">
      <h1 class="card-title">Gestion des utilisateurs</h1>
      <button class="btn btn-primary" @click="showCreateModal">
        <i class="fas fa-plus me-1"></i> Ajouter un utilisateur
      </button>
    </div>
    <div class="card-body">
      <AsdecodeTable 
        ref="userTable"
        :key="tableKey"
        :columns="columns" 
        url="/api/users" 
        table="users" 
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
import $ from 'jquery';
import { defineComponent } from 'vue';
import FormuseurView from './FormuseurView.vue';
import ShowuseurView from './ShowuseurView.vue';
import DeleteUserView from './DeleteUserView.vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

export default defineComponent({

    name: 'ListeView',

    data() {
        return {
            tableKey: 0,
            lines: 0,
            selection: [],
            columns: [
                {
                    key: 'id',
                    label: 'ID',
                },
                {
                    key: 'name',
                    label: 'Nom',
                },
                {
                    key: 'email',
                    label: 'Email',
                },
                {
                    key: 'role',
                    label: 'Rôle',
                },
                {
                    key: 'created_at',
                    label: 'Date d\'inscription',
                }
            ]
        }
    },
    methods: {

        showLine(line) {
            this.$dialog.open(ShowuseurView, {
                props: {
                    header: 'Détails de l\'utilisateur',
                    style: { width: '50vw' },
                    modal: true,
                },
                data: line,
                onClose: (options) => {
                    if (options && options.data && options.data.success) {
                        this.refreshTable();
                    }
                }
            });
        },
        updateLines(nb) {
            this.lines = nb
        },
        showEditModal(user) {
            this.$dialog.open(FormuseurView, {
                props: {
                    header: 'Modifier l\'utilisateur',
                    style: { width: '50vw' },
                    modal: true,
                },
                data: user,
                onClose: (options) => {
                    if (options && options.data && options.data.success) {
                        this.refreshTable();
                    }
                }
            });
        },

        showCreateModal() {
            this.$dialog.open(FormuseurView, {
                props: {
                    header: 'Ajouter un utilisateur',
                    style: { width: '50vw' },
                    modal: true,
                },
                onClose: (options) => {
                    if (options && options.data && options.data.success) {
                        this.refreshTable();
                    }
                }
            });
        },
        refreshTable() {
            this.tableKey += 1;
        },
        getSelection(selection) {
            this.selection = selection;
        },
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(date);
        },
        getRoleSeverity(role) {
            switch (role) {
                case 'admin': return 'danger';
                case 'editor': return 'warning';
                default: return 'info';
            }
        },
        getStatusSeverity(status) {
            switch (status) {
                case 'Actif': return 'success';
                case 'Inactif': return 'secondary';
                case 'En attente': return 'warning';
                default: return 'info';
            }
        },
        showDeleteModal(user) {
            this.$dialog.open(DeleteUserView, {
                props: {
                    header: 'Confirmation de suppression',
                    style: { width: '30vw' },
                    modal: true,
                },
                data: {
                    user: user
                },
                onClose: (options) => {
                    if (options && options.data && options.data.success) {
                        this.refreshTable();
                    }
                }
            });
        },
    },
});
</script>
