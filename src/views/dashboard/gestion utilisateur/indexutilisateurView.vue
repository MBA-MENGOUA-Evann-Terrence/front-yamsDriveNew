<template>
  <div class="gestion-utilisateur-container">
    <h1 class="page-title">Gestion des utilisateurs</h1>
    
    <div class="actions-bar mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div class="search-wrapper">
          <div class="input-group">
            <span class="input-group-text bg-primary text-white">
              <i class="fas fa-search"></i>
            </span>
            <input 
              type="text" 
              class="form-control" 
              v-model="searchQuery" 
              placeholder="Rechercher un utilisateur..."
            />
          </div>
        </div>
        <div class="buttons-wrapper">
          <button class="btn btn-primary me-2" @click="showCreateModal">
            <i class="fas fa-plus me-1"></i> Ajouter un utilisateur
          </button>
        </div>
      </div>
    </div>
    
    <AsdecodeTable 
      :columns="columns" 
      url="/api/users" 
      table="users" 
      @set-total-records="updateLines"
      @row-click="showLine" 
      @set-selected-rows="getSelection"
      :show-top-stats="false"
      :show-bottom-stats="false"
      class="user-table"
    >
      <template #created_at="slotProps">
        <span class="p-2 rounded badge badge-secondary">{{ slotProps.data.created_at }}</span>
      </template>
    </AsdecodeTable>
  </div>
  </template>
  
  <style scoped>
.gestion-utilisateur-container {
  padding: 20px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
}

.actions-bar {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-wrapper {
  width: 300px;
}

.user-table {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #4285F4;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions-cell {
  white-space: nowrap;
}

/* Masquer les informations de pagination (haut et bas) */
:deep(.dataTables_length), 
:deep(.dataTables_info) {
  display: none !important;
}

@media (max-width: 992px) {
  .actions-bar .d-flex {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-wrapper {
    width: 100%;
  }
  
  .buttons-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
  
  <script>
  import { defineComponent, ref, computed, onMounted } from 'vue';
  import FormuseurView from './FormuseurView.vue';
  import ShowuseurView from './ShowuseurView.vue';
  import { useConfirm } from 'primevue/useconfirm';
  import { useToast } from 'primevue/usetoast';
  
  export default defineComponent({
      name: 'IndexUtilisateur',
  
      data() {
          return {
              lines: 0,
              selection: [],
              searchQuery: '',
              columns: [
                  {
                      key: 'id',
                      label: 'ID',
                  },
                  {
                      key: 'name',
                      label: 'Nom',
                      template: (data) => {
                          return `
                            <div class="d-flex align-items-center">
                              <div class="user-avatar me-2">
                                <i class="fas fa-user"></i>
                              </div>
                              <div>
                                <div class="fw-bold">${data.name}</div>
                                <small class="text-muted">${data.email}</small>
                              </div>
                            </div>
                          `;
                      }
                  },
                  {
                      key: 'role',
                      label: 'Rôle',
                      template: (data) => {
                          const severity = this.getRoleSeverity(data.role);
                          return `<span class="p-tag p-tag-${severity}">${data.role || 'Utilisateur'}</span>`;
                      }
                  },
                  {
                      key: 'statut',
                      label: 'Statut',
                      template: (data) => {
                          const severity = this.getStatusSeverity(data.statut);
                          return `<span class="p-tag p-tag-${severity}">${data.statut || 'Actif'}</span>`;
                      }
                  },
                  {
                      key: 'created_at',
                      label: 'Date d\'inscription',
                      template: (data) => {
                          return this.formatDate(data.created_at);
                      }
                  }
              ]
          }
      },
      methods: {
          showLine(line) {
              this.$dialog.open(ShowuseurView, {
                  props: {
                      header: 'Utilisateur '+line.id,
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
              this.$dialog.open(FormuseurView, {
                  props: {
                      header: 'Ajouter un utilisateur',
                      style: { width: '50vw' },
                      modal: true,
                  },
              });
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
          confirmDeleteUser(user) {
              this.$confirm.require({
                  message: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ? Cette action est irréversible.`,
                  header: 'Confirmation de suppression',
                  icon: 'pi pi-exclamation-triangle',
                  acceptClass: 'p-button-danger',
                  acceptLabel: 'Oui, supprimer',
                  rejectLabel: 'Annuler',
                  accept: () => {
                      this.deleteUser(user);
                  },
              });
          },
          async deleteUser(user) {
              try {
                  await this.axios.delete(`/api/users/${user.id}`);
                  this.$toast.add({ severity: 'success', summary: 'Succès', detail: `L'utilisateur ${user.name} a été supprimé.`, life: 3000 });
                  // Rafraîchir la table
                  this.fetchData();
              } catch (error) {
                  this.$toast.add({ severity: 'error', summary: 'Erreur', detail: "La suppression de l'utilisateur a échoué.", life: 3000 });
                  console.error("Erreur lors de la suppression de l'utilisateur:", error);
              }
          },
      },
  });
  </script>