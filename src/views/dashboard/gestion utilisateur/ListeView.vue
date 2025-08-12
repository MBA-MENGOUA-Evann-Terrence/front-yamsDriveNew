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
          <button class="btn btn-primary me-2">
            <i class="fas fa-plus me-1"></i> Ajouter un utilisateur
          </button>
          <!-- <div class="btn-group">
            <button class="btn btn-outline-primary">
              <i class="fas fa-file-export"></i> Exporter
            </button>
            <button class="btn btn-outline-primary">
              <i class="fas fa-file-import"></i> Importer
            </button>
          </div> -->
        </div>
      </div>
    </div>
    
    <DataTable :value="filteredUsers" :paginator="true" :rows="10" v-model:selection="selectedUsers" 
                 paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                 :rowsPerPageOptions="[10,25,50]"
                 currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} utilisateurs"
                 responsiveLayout="scroll" tableClass="table table-hover user-table">

        <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
        
        <Column field="id" header="ID" :sortable="true"></Column>

        <Column field="name" header="Nom" :sortable="true">
          <template #body="slotProps">
            <div class="d-flex align-items-center">
              <div class="user-avatar me-2">
                <i class="fas fa-user"></i>
              </div>
              <div>
                <div class="fw-bold">{{ slotProps.data.name }}</div>
                <small class="text-muted">{{ slotProps.data.email }}</small>
              </div>
            </div>
          </template>
        </Column>

        <Column field="role" header="Rôle" :sortable="true">
            <template #body="slotProps">
                <Tag :value="slotProps.data.role || 'Utilisateur'" :severity="getRoleSeverity(slotProps.data.role)" />
            </template>
        </Column>

        <Column field="statut" header="Statut" :sortable="true">
            <template #body="slotProps">
                 <Tag :value="slotProps.data.statut || 'Actif'" :severity="getStatusSeverity(slotProps.data.statut)" />
            </template>
        </Column>

        <Column field="created_at" header="Date d'inscription" :sortable="true">
            <template #body="slotProps">
                {{ formatDate(slotProps.data.created_at) }}
            </template>
        </Column>

        <Column header="Actions">
            <template #body="slotProps">
                <div class="actions-cell">
                    <router-link :to="`/dashboard/gestionutilisateur/show/${slotProps.data.id}`" class="btn btn-sm btn-outline-primary me-1">
                        <i class="fas fa-eye"></i>
                    </router-link>
                    <button class="btn btn-sm btn-outline-warning me-1">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDeleteUser(slotProps.data)" class="btn btn-sm btn-outline-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </template>
        </Column>
    </DataTable>
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import apiClient from '@/services/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  statut?: string;
  created_at: string;
  updated_at: string;
}

export default defineComponent({
  name: 'ListeView',
  components: {
    DataTable,
    Column,
    Tag,
    ConfirmDialog,
  },
  setup() {
    const confirm = useConfirm();
    const toast = useToast();

    const users = ref<User[]>([]);
    const selectedUsers = ref(null);
    const loading = ref(true);
    const error = ref<string | null>(null);
    const searchQuery = ref('');

    const filteredUsers = computed(() => {
      if (!searchQuery.value) {
        return users.value;
      }
      const query = searchQuery.value.toLowerCase();
      return users.value.filter(user =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    });

    const fetchUsers = async () => {
      loading.value = true;
      try {
        const response = await apiClient.get('/api/users');
        if (response.data && Array.isArray(response.data.data)) {
          users.value = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          users.value = response.data;
        } else {
          error.value = 'Format de réponse inattendu';
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        error.value = 'Impossible de charger la liste des utilisateurs';
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    };

    const getRoleSeverity = (role?: string) => {
      switch (role) {
        case 'Admin': return 'danger';
        case 'Éditeur': return 'warning';
        default: return 'info';
      }
    };

    const getStatusSeverity = (status?: string) => {
      switch (status) {
        case 'Actif': return 'success';
        case 'Inactif': return 'secondary';
        case 'En attente': return 'warning';
        default: return 'info';
      }
    };

    const confirmDeleteUser = (user: User) => {
      confirm.require({
        message: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ? Cette action est irréversible.`,
        header: 'Confirmation de suppression',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Oui, supprimer',
        rejectLabel: 'Annuler',
        accept: () => {
          deleteUser(user);
        },
      });
    };

    const deleteUser = async (user: User) => {
      try {
        await apiClient.delete(`/api/users/${user.id}`);
        toast.add({ severity: 'success', summary: 'Succès', detail: `L'utilisateur ${user.name} a été supprimé.`, life: 3000 });
        users.value = users.value.filter(u => u.id !== user.id);
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: "La suppression de l'utilisateur a échoué.", life: 3000 });
        console.error("Erreur lors de la suppression de l'utilisateur:", err);
      } finally {
        confirm.close(); // Ferme explicitement le dialogue
      }
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      selectedUsers,
      loading,
      error,
      searchQuery,
      filteredUsers,
      formatDate,
      getRoleSeverity,
      getStatusSeverity,
      confirmDeleteUser,
      deleteUser,
    };
  },
});
</script>

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

.pagination-wrapper {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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