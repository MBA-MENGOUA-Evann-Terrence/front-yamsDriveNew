<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/services/api';

// --- Types
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Domain {
  id: number;
  name: string;
  user: User;
}

// --- Reactive State
const users = ref<User[]>([]);
const domains = ref<Domain[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// --- Form State
const searchQuery = ref('');
const selectedUser = ref<number | string>('');
const domainName = ref('');

// --- API Logic
const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [usersResponse, domainsResponse] = await Promise.all([
      apiClient.get('/users'),
      apiClient.get('/domains')
    ]);
    users.value = usersResponse.data;
    domains.value = domainsResponse.data;
  } catch (err) {
    console.error("Erreur lors de la récupération des données:", err);
    error.value = "Impossible de charger les données depuis l'API. Vérifiez que le serveur est bien lancé et que les endpoints sont corrects.";
  } finally {
    loading.value = false;
  }
};

const assignDomain = async () => {
  if (!selectedUser.value || !domainName.value) {
    alert('Veuillez sélectionner un utilisateur et entrer un nom de domaine.');
    return;
  }
  try {
    const response = await apiClient.post('/domains', {
      user_id: selectedUser.value,
      name: domainName.value
    });
    domains.value.push(response.data);
    selectedUser.value = '';
    domainName.value = '';
    searchQuery.value = '';
  } catch (err) {
    console.error("Erreur lors de l'attribution du domaine:", err);
    alert('Une erreur est survenue. Le nom de domaine est peut-être déjà pris.');
  }
};

const removeDomain = async (domainId: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce domaine ?')) {
    return;
  }
  try {
    await apiClient.delete(`/domains/${domainId}`);
    domains.value = domains.value.filter(domain => domain.id !== domainId);
  } catch (err) {
    console.error("Erreur lors de la suppression du domaine:", err);
    alert('Une erreur est survenue lors de la suppression du domaine.');
  }
};

// --- Computed Properties
const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value;
  }
  const lowerQuery = searchQuery.value.toLowerCase();
  return users.value.filter(user =>
    user.firstName.toLowerCase().includes(lowerQuery) ||
    user.lastName.toLowerCase().includes(lowerQuery) ||
    user.email.toLowerCase().includes(lowerQuery)
  );
});

// --- Lifecycle Hooks
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="domaine-view container-fluid py-4">
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0">Gestion des Domaines</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-info" role="alert">
              <i class="fas fa-info-circle me-2"></i>
              Cette section vous permet d'attribuer des noms de domaine aux utilisateurs.
            </div>

            <!-- Form & Domain List Row -->
            <div class="row mb-4">
              <!-- Assignment Form Column -->
              <div class="col-md-6">
                <div class="card border">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">Attribuer un domaine</h6>
                  </div>
                  <div class="card-body">
                    <form @submit.prevent="assignDomain">
                      <!-- User Search -->
                      <div class="mb-3">
                        <label for="userSearch" class="form-label">Rechercher un utilisateur</label>
                        <div class="input-group mb-2">
                          <span class="input-group-text"><i class="fas fa-search"></i></span>
                          <input
                            type="text"
                            id="userSearch"
                            v-model="searchQuery"
                            class="form-control"
                            placeholder="Rechercher par nom, prénom ou email..."
                          >
                        </div>
                      </div>
                      <!-- User Select -->
                      <div class="mb-3">
                        <label for="userSelect" class="form-label">Sélectionner un utilisateur</label>
                        <select id="userSelect" v-model="selectedUser" class="form-select" required>
                          <option value="" disabled>Choisir un utilisateur</option>
                          <option v-for="user in filteredUsers" :key="user.id" :value="user.id">
                            {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                          </option>
                        </select>
                        <div v-if="filteredUsers.length === 0 && searchQuery" class="form-text text-danger">
                          Aucun utilisateur ne correspond à votre recherche.
                        </div>
                      </div>
                      <!-- Domain Name -->
                      <div class="mb-3">
                        <label for="domainName" class="form-label">Nom de domaine</label>
                        <div class="input-group">
                          <input
                            type="text"
                            id="domainName"
                            v-model="domainName"
                            class="form-control"
                            placeholder="exemple"
                            required
                          >
                          <span class="input-group-text">.yamsdrive.com</span>
                        </div>
                        <div class="form-text">Le nom doit être unique (lettres, chiffres, tirets).</div>
                      </div>
                      <!-- Submit Button -->
                      <button type="submit" class="btn btn-primary">
                        <i class="fas fa-check me-2"></i>Attribuer le domaine
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <!-- Assigned Domains Column -->
              <div class="col-md-6">
                <div class="card border h-100">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">Domaines attribués</h6>
                  </div>
                  <div class="card-body">
                    <!-- Loading State -->
                    <div v-if="loading" class="text-center py-4">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                      </div>
                      <p class="mt-2">Chargement des données...</p>
                    </div>
                    <!-- Error State -->
                    <div v-else-if="error" class="alert alert-danger">
                      <i class="fas fa-exclamation-triangle me-2"></i>
                      {{ error }}
                    </div>
                    <!-- Empty State -->
                    <div v-else-if="domains.length === 0" class="text-center py-4">
                      <i class="fas fa-globe fa-3x text-muted mb-3"></i>
                      <p>Aucun domaine n'a encore été attribué.</p>
                    </div>
                    <!-- Data Table -->
                    <div v-else class="table-responsive">
                      <table class="table table-hover">
                        <thead>
                          <tr>
                            <th>Utilisateur</th>
                            <th>Domaine</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="domain in domains" :key="domain.id">
                            <td>{{ domain.user.firstName }} {{ domain.user.lastName }}</td>
                            <td>{{ domain.name }}.yamsdrive.com</td>
                            <td>
                              <button @click="removeDomain(domain.id)" class="btn btn-danger btn-sm">
                                <i class="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.domaine-view {
  max-width: 1200px;
  margin: auto;
}
.card-header h5, .card-header h6 {
  font-weight: 600;
}
.form-text {
  font-size: 0.875rem;
}
.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}
</style>
