<template>
  <div class="corbeille-view">
    <h1 class="page-title">Corbeille</h1>
    <div class="corbeille-container">
      <p class="placeholder-text">Votre corbeille est vide</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CorbeilleView'
})
</script>

<style scoped>
.corbeille-view {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #06173c;
}

.corbeille-container {
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