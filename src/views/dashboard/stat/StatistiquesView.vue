<template>
  <div class="statistiques-container">
    <!-- Indicateur de chargement global -->
    <div v-if="isLoading" class="loading-overlay">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Chargement des statistiques...</p>
    </div>

    <div v-else>
      <h1 class="page-title">Tableau de bord analytique</h1>
      
      <!-- Cartes de statistiques globales -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
          <div class="stat-info">
            <h3>Fichiers totaux</h3>
            <p class="stat-number">{{ totalFiles }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-share-alt"></i></div>
          <div class="stat-info">
            <h3>Fichiers partagés</h3>
            <p class="stat-number">{{ sharedFiles }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-users"></i></div>
          <div class="stat-info">
            <h3>Utilisateurs actifs</h3>
            <p class="stat-number">{{ activeUsers }}</p>
          </div>
        </div>
      </div>
      
      <!-- Graphiques -->
      <div class="charts-container">
        <div class="chart-card">
          <div class="chart-header">
            <h2>Activité des documents</h2>
            <div class="time-filters">
              <button @click="setPeriod('activity', 'week')" :class="{ active: activityPeriod === 'week' }">Semaine</button>
              <button @click="setPeriod('activity', 'month')" :class="{ active: activityPeriod === 'month' }">Mois</button>
              <button @click="setPeriod('activity', 'year')" :class="{ active: activityPeriod === 'year' }">Année</button>
            </div>
          </div>
          <div class="chart-wrapper">
            <div v-if="isActivityLoading" class="chart-loading-overlay"><i class="fas fa-spinner fa-spin"></i></div>
            <Chart type="line" :data="activityData" :options="chartOptions" class="chart-content" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <h2>Répartition du stockage</h2>
          </div>
          <div class="chart-wrapper">
            <Chart type="doughnut" :data="storageData" :options="doughnutOptions" class="chart-content" />
          </div>
        </div>
      </div>

      <div class="charts-container">
        <div class="chart-card full-width">
          <div class="chart-header">
            <h2>Activité des utilisateurs</h2>
            <div class="time-filters">
              <button @click="setPeriod('userActions', 'week')" :class="{ active: userActionsPeriod === 'week' }">Semaine</button>
              <button @click="setPeriod('userActions', 'month')" :class="{ active: userActionsPeriod === 'month' }">Mois</button>
              <button @click="setPeriod('userActions', 'year')" :class="{ active: userActionsPeriod === 'year' }">Année</button>
            </div>
          </div>
          <div class="chart-wrapper">
            <div v-if="isUserActionsLoading" class="chart-loading-overlay"><i class="fas fa-spinner fa-spin"></i></div>
            <Chart type="bar" :data="userActivityData" :options="barOptions" class="chart-content" />
          </div>
        </div>
      </div>

      <!-- Section Actions Récentes -->
      <div class="recent-actions-card" v-if="recentActions.length > 0">
        <div class="chart-header">
          <h2>Actions Récentes</h2>
        </div>
        <ul class="actions-list">
          <li v-for="action in recentActions" :key="action.id" class="action-item">
            <i :class="action.icon" class="action-icon"></i>
            <div class="action-details">
              <p v-html="action.description"></p>
              <span class="action-time">{{ action.time }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject } from 'vue';
import Chart from 'primevue/chart';

export default defineComponent({
  name: 'StatistiquesView',
  components: {
    Chart
  },
  setup() {
    const axios = inject('axios') as any;
    const isLoading = ref(true); // Chargement global initial
    const isActivityLoading = ref(false); // Chargement pour le graphique d'activité
    const isUserActionsLoading = ref(false); // Chargement pour le graphique des actions utilisateurs

    // --- Données Réactives ---
    const totalFiles = ref(0);
    const sharedFiles = ref(0);
    const activeUsers = ref(0);
    const activityData = ref({});
    const storageData = ref({});
    const userActivityData = ref({});
    const recentActions = ref<any[]>([]);

    // --- Périodes de filtre ---
    const activityPeriod = ref('month');
    const userActionsPeriod = ref('month');

    // --- Options des graphiques (statiques) ---
    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#333' } } }, scales: { x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#333' } }, y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#333' } } } };
    const barOptions = { ...chartOptions };
    const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#333', font: { weight: 'bold' } } } }, cutout: '60%' };

    // --- Fonctions de récupération granulaires ---
    const fetchActivityChartData = async () => {
        isActivityLoading.value = true;
        try {
            const response = await axios.get(`/api/statistiques/activite-documents?period=${activityPeriod.value}`);
            if (response.data && response.data.labels && response.data.datasets) {
                activityData.value = response.data;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données d'activité des documents:", error);
        } finally {
            isActivityLoading.value = false;
        }
    };

    const fetchUserActionsChartData = async () => {
        isUserActionsLoading.value = true;
        try {
            const response = await axios.get(`/api/statistiques/actions-utilisateurs?period=${userActionsPeriod.value}`);
            if (response.data && response.data.labels && response.data.datasets) {
                userActivityData.value = response.data;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données d'actions des utilisateurs:", error);
        } finally {
            isUserActionsLoading.value = false;
        }
    };

    // --- Logique de récupération des données initiales ---
    const fetchInitialStatistics = async () => {
      isLoading.value = true;
      try {
        const [globales, repartition, actions] = await Promise.all([
          axios.get('/api/statistiques/globales'),
          axios.get('/api/statistiques/repartition-stockage'),
          axios.get('/api/statistiques/actions-recentes')
        ]);

        // Mise à jour des cartes
        if (globales.data && globales.data.data) {
          const stats = globales.data.data;
          totalFiles.value = stats.total_documents || 0;
          sharedFiles.value = stats.total_shared_documents || 0;
          activeUsers.value = stats.total_users || 0;
        }

        // Mise à jour des graphiques non-filtrables et listes
        if (repartition.data && repartition.data.data) {
            const storageStats = repartition.data.data;
            const labels = Object.keys(storageStats).map(key => key.charAt(0).toUpperCase() + key.slice(1));
            const data = Object.values(storageStats);
            storageData.value = {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26A69A', '#AB47BC', '#78909C'],
                    hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#4DB6AC', '#BA68C8', '#90A4AE']
                }]
            };
        }
        recentActions.value = actions.data;

        // Lancement des chargements des graphiques filtrables
        await Promise.all([fetchActivityChartData(), fetchUserActionsChartData()]);

      } catch (error: any) {
        console.error("Erreur lors de la récupération des statistiques initiales:", error.response?.data?.message || error.message);
      } finally {
        isLoading.value = false;
      }
    };

    // --- Changement de période ---
    const setPeriod = (chart: 'activity' | 'userActions', period: 'week' | 'month' | 'year') => {
      if (chart === 'activity') {
        if (activityPeriod.value === period) return; // Ne rien faire si la période est la même
        activityPeriod.value = period;
        fetchActivityChartData();
      } else if (chart === 'userActions') {
        if (userActionsPeriod.value === period) return;
        userActionsPeriod.value = period;
        fetchUserActionsChartData();
      }
    };

    // --- Cycle de vie ---
    onMounted(fetchInitialStatistics);

    return {
      isLoading,
      isActivityLoading,
      isUserActionsLoading,
      totalFiles,
      sharedFiles,
      activeUsers,
      activityData,
      storageData,
      userActivityData,
      recentActions,
      chartOptions,
      barOptions,
      doughnutOptions,
      activityPeriod,
      userActionsPeriod,
      setPeriod,
    };
  }
});
</script>

<style scoped>
.statistiques-container {
  padding: 20px;
  color: #333;
  position: relative;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #202124;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  background-color: rgba(66, 133, 244, 0.1);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #4285F4;
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-info h3 {
  font-size: 0.9rem;
  font-weight: 500;
  color: #5f6368;
  margin: 0 0 8px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #202124;
  margin: 0;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.chart-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  height: 400px;
  display: flex;
  flex-direction: column;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h2 {
  font-size: 18px;
  font-weight: 500;
  color: #202124;
  margin: 0;
}

.time-filters button {
  background-color: #f1f3f4;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  margin-left: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: #5f6368;
  transition: background-color 0.2s ease;
}

.time-filters button:hover {
  background-color: #e8eaed;
}

.time-filters button.active {
  background-color: #4285F4;
  color: white;
}

.chart-wrapper {
  position: relative;
  flex-grow: 1;
}

.chart-content {
  height: 100%;
  width: 100%;
}

.chart-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  font-size: 2rem;
  color: #4285F4;
}

/* Styles pour les actions récentes */
.recent-actions-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  margin-top: 32px;
}

.actions-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.action-item:last-child {
  border-bottom: none;
}

.action-icon {
  font-size: 1.2rem;
  color: #4285F4;
  margin-right: 16px;
  width: 24px;
  text-align: center;
}

.action-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
}

.action-details .action-time {
  font-size: 0.75rem;
  color: #777;
  margin-top: 4px;
}

/* Styles pour le chargement */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  font-size: 1.5rem;
  color: #4285F4;
}

.loading-overlay .fa-spinner {
  font-size: 3rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .stats-cards, .charts-container {
    grid-template-columns: 1fr;
  }
}
</style>
