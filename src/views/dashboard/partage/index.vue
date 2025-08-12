<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <SharedDocumentsView />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import SharedDocumentsView from './SharedDocumentsView.vue';

export default defineComponent({
  name: 'PartageIndex',
  components: {
    SharedDocumentsView
  }
});
</script>

<style scoped>
.container-fluid {
  padding: 1rem;
}
</style>
