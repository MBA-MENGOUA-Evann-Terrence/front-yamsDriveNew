<template>
  <div>
    <IndexFavori />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import IndexFavori from './indexFavoriView.vue'

export default defineComponent({
  name: 'FavorieView',
  components: {
    IndexFavori
  }
})
</script>

<style scoped>
/* Pas de styles spécifiques nécessaires ici, tout est géré dans indexFavoriView.vue */
</style>