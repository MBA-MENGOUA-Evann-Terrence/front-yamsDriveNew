<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <RecentDocumentsView />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import RecentDocumentsView from './RecentDocumentsView.vue';

export default defineComponent({
  name: 'RecentIndex',
  components: {
    RecentDocumentsView
  }
});
</script>

<style scoped>
.container-fluid {
  padding: 1rem;
}
</style>
