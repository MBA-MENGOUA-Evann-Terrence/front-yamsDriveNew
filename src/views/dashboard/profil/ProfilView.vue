<template>
  <div class="profile-view p-4">
    <Toast />
    <div class="grid">
      <div class="col-12 md:col-6">
        <Card class="mb-4">
          <template #title>
            <i class="fas fa-user-edit me-2"></i> Informations Personnelles
          </template>
          <template #content>
            <div class="p-fluid">
              <div class="field mb-4">
                <label for="name">Nom d'utilisateur</label>
                <InputText id="name" v-model="user.name" type="text" />
              </div>
              <div class="field mb-4">
                <label for="email">Adresse e-mail (non modifiable)</label>
                <InputText id="email" v-model="user.email" type="email" :disabled="true" />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6">
        <Card>
          <template #title>
            <i class="fas fa-key me-2"></i> Changer le mot de passe
          </template>
          <template #content>
            <div class="p-fluid">
              <div class="field mb-4">
                <label for="newPassword">Nouveau mot de passe</label>
                <Password id="newPassword" v-model="passwords.new" :feedback="true" toggleMask />
              </div>
              <div class="field mb-4">
                <label for="confirmPassword">Confirmer le nouveau mot de passe</label>
                <Password id="confirmPassword" v-model="passwords.confirm" :feedback="false" toggleMask />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <div class="col-12 text-center mt-4">
        <Button @click="updateProfile" label="Enregistrer les modifications" icon="pi pi-check" class="p-button-primary p-button-lg" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Password from 'primevue/password';
import Toast from 'primevue/toast';

export default defineComponent({
  name: 'ProfilView',
  components: {
    InputText,
    Button,
    Card,
    Password,
    Toast,
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      user: {
        id: null,
        name: '',
        email: '',
      },
      passwords: {
        new: '',
        confirm: '',
      },
    };
  },
  mounted() {
    this.fetchUser();
  },
  methods: {
    fetchUser() {
      const userData = this.$store.getters.user;
      if (userData) {
        this.user.id = userData.id;
        this.user.name = userData.name;
        this.user.email = userData.email;
      }
    },
    async updateProfile() {
      console.log('Début de updateProfile');
      if (this.passwords.new && this.passwords.new !== this.passwords.confirm) {
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Les nouveaux mots de passe ne correspondent pas.', life: 3000 });
        return;
      }

      try {
        const payload: { name: string; password?: string } = {
          name: this.user.name,
        };

        if (this.passwords.new) {
          payload.password = this.passwords.new;
        }

        const response = await axios.put(`/api/users/${this.user.id}`, payload);
        
        // Solution directe : créer un objet utilisateur complet avec le nom mis à jour
        const currentUser = this.$store.state.user;
        const updatedUser = {
          ...currentUser,
          name: this.user.name // Utiliser le nom du formulaire
        };
        
        console.log('Mise à jour du store avec:', updatedUser);
        
        // Mettre à jour directement le store avec l'utilisateur complet
        this.$store.commit('SET_USER', updatedUser);
        
        // Mettre à jour également la session dans localStorage
        const sessionStr = localStorage.getItem('yamsdigital_session');
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            if (session && session.data) {
              session.data.user = updatedUser;
              localStorage.setItem('yamsdigital_session', JSON.stringify(session));
            }
          } catch (e) {
            console.error('Erreur lors de la mise à jour de la session:', e);
          }
        }

        this.toast.add({ severity: 'success', summary: 'Succès', detail: 'Votre profil a été mis à jour.', life: 3000 });
        this.passwords.new = '';
        this.passwords.confirm = '';
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour le profil.', life: 3000 });
      }
    },
  },
});
</script>

<style scoped>
.profile-view {
  background-color: #f4f7f9;
}

.field label {
  font-weight: 500;
  color: #495057;
}

.p-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
</style>
