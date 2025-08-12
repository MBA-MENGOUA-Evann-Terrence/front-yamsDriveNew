<template>
  <div class="settings-view p-4">
    <Panel header="Paramètres du Compte">
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-4">
          <router-link to="/dashboard/gestionutilisateur/domaine" class="settings-option-card">
            <div class="card-content">
              <i class="fas fa-globe settings-icon"></i>
              <div class="text-content">
                <span class="font-semibold">Gestion des Domaines</span>
                <p class="text-sm text-gray-500">Gérer les domaines autorisés</p>
              </div>
            </div>
          </router-link>
        </div>
        <!-- D'autres options de paramètres peuvent être ajoutées ici -->
      </div>
    </Panel>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Panel from 'primevue/panel';

export default defineComponent({
  name: 'ParametresView',
  components: {
    Panel,
  },
});
</script>

<style scoped>
.settings-view {
  background-color: #f4f7f9;
}

.settings-option-card {
  display: block;
  padding: 1.5rem;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
}

.settings-option-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 25px rgba(0,0,0,0.1);
}

.card-content {
  display: flex;
  align-items: center;
}

.settings-icon {
  font-size: 2rem;
  color: #4285F4;
  margin-right: 1.5rem;
}
</style>
