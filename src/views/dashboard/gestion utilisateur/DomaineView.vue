<template>
  <div class="domaine-view container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0">Enregistrer un Nom de Domaine</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-info" role="alert">
              <i class="fas fa-info-circle me-2"></i>
              Cette section vous permet d'enregistrer de nouveaux noms de domaine autorisés pour l'inscription.
            </div>

            <form @submit.prevent="registerDomain">
              <div class="mb-3">
                <label for="domainName" class="form-label">Nom de domaine</label>
                <div class="input-group">
                  <input
                    type="text"
                    id="domainName"
                    v-model="domainName"
                    :disabled="isLoading"
                    class="form-control"
                    placeholder="exemple.com"
                    required
                  >
                </div>
                <div class="form-text">Entrez le nom de domaine complet (ex: yamsdrive.com).</div>
              </div>

              <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <i v-else class="fas fa-plus me-2"></i>
                Enregistrer le domaine
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/services/api';

export default {
  name: 'DomaineView',
  data() {
    return {
      domainName: '',
      isLoading: false,
    };
  },
  methods: {
    async registerDomain() {
      // Guard against parallel submissions
      if (this.isLoading) return;
      if (!this.domainName) {
        this.$toast.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez entrer un nom de domaine.', life: 3000 });
        return;
      }

      this.isLoading = true;
      try {
        await apiClient.post('/domains', {
          name: this.domainName,
        });
        this.$toast.add({ severity: 'success', summary: 'Succès', detail: `Le domaine ${this.domainName} a été enregistré.`, life: 3000 });
        this.domainName = ''; // Reset form
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Une erreur est survenue.';
        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: errorMessage, life: 5000 });
        console.error("Erreur lors de l'enregistrement du domaine:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.domaine-view {
  max-width: 1200px;
  margin: auto;
}
.card-header h5 {
  font-weight: 600;
}
.form-text {
  font-size: 0.875rem;
}
</style>
