<template>
  <div class="favoris-view">
    <h1 class="page-title">Favoris</h1>
    <div class="favoris-container">
      <p class="placeholder-text">Vos fichiers favoris s'afficheront ici</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FavorieView'
})
</script>

<style scoped>
.favoris-view {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #06173c;
}

.favoris-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  color: #8a94a6;
  font-size: 16px;
}
</style>