<template>
  <div class="delete-user-container p-4">
    <p class="confirmation-text">
      Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ user.name }}</strong> ?
      <br>
      Cette action est irréversible.
    </p>
    <div class="d-flex justify-content-end mt-4">
      <button class="btn btn-secondary me-2" @click="closeDialog(false)">Annuler</button>
      <button class="btn btn-danger" @click="deleteUser" :disabled="isDeleting">
        <span v-if="isDeleting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span v-else>Supprimer</span>
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DeleteUserView',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  inject: ['dialogRef'],
  data() {
    return {
      isDeleting: false,
    };
  },
  methods: {
    closeDialog(success = false) {
      this.dialogRef.close({ success });
    },
    async deleteUser() {
      this.isDeleting = true;
      try {
        await this.axios.delete(`/api/users/${this.user.id}`);
        this.$toast.add({ severity: 'success', summary: 'Succès', detail: `L'utilisateur ${this.user.name} a été supprimé.`, life: 3000 });
        this.closeDialog(true);
      } catch (error) {
        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: "La suppression de l'utilisateur a échoué.", life: 3000 });
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        this.isDeleting = false;
      }
    },
  },
});
</script>

<style scoped>
.confirmation-text {
  font-size: 1.1rem;
  line-height: 1.6;
}
</style>
