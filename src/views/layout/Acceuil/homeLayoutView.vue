<template>
  <div class="home-layout">
    <!-- Navbar Bootstrap exactement comme l'image -->
    <nav class="navbar navbar-dark bg-dark fixed-top">
      <div class="container">
        <a class="navbar-brand" href="#">
          <i class="fas fa-cloud text-primary me-2"></i>
          Yam's_Drive
        </a>
        <div class="d-flex">
          <!-- <ul class="navbar-nav me-auto mb-2 mb-lg-0 d-flex flex-row">
            <li class="nav-item px-2">
              <a class="nav-link active" aria-current="page" href="#">Accueil</a>
            </li>
            <li class="nav-item px-2" v-if="isAuthenticated">
              <a class="nav-link" href="#">Mon espace</a>
            </li>
            <li class="nav-item px-2" v-if="isAuthenticated">
              <a class="nav-link" href="#">Mes fichiers</a>
            </li>
            <li class="nav-item px-2" v-if="isAuthenticated">
              <a class="nav-link" href="#">Partages</a>
            </li>
          </ul> -->
          <!-- Options pour utilisateur non connecté -->
          <template v-if="!isAuthenticated">
            <a href="/connexion" class="btn btn-outline-light me-2">Connexion</a>
            <a href="/inscription" class="btn btn-primary">Inscription</a>
          </template>
          <!-- Options pour utilisateur connecté -->
          <template v-else>
            <div class="dropdown">
              <button class="btn btn-outline-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-user-circle me-1"></i> {{ username }}
              </button>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="#">Profil</a></li>
                <li><a class="dropdown-item" href="#">Paramètres</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" @click.prevent="logout">Déconnexion</a></li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main class="main-content">
      <router-view></router-view>
    </main>

    <!-- Footer -->
    <footer class="footer bg-dark text-light">
      <div class="container">
        <div class="row">
          <!-- Colonne 1 - Logo et description -->
          <div class="col-md-4 mb-4 mb-md-0">
            <h5 class="footer-heading">Yam's Drive</h5>
            <p class="footer-text">Votre solution de stockage cloud sécurisée et fiable pour tous vos documents importants.</p>
          </div>
          
          <!-- Colonne 2 - Liens rapides -->
          <div class="col-md-4 mb-4 mb-md-0">
            <h5 class="footer-heading">Liens rapides</h5>
            <ul class="footer-links">
              <li><a href="#" class="text-light">mon espace</a></li>
            </ul>
          </div>
          
          <!-- Colonne 3 - Contact -->
          <div class="col-md-4">
            <h5 class="footer-heading">Contact</h5>
            <address class="footer-contact">
              <p><i class="fas fa-map-marker-alt me-2"></i> plein niger, Libreville</p>
              <p><i class="fas fa-envelope me-2"></i> contact@yamsdrive.com</p>
            </address>
          </div>
        </div>
        
        <!-- Copyright -->
        <div class="row mt-4">
          <div class="col-12 text-center">
            <p class="copyright"> 2025 YamsDrive. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'HomeLayout',
  setup() {
    const store = useStore();
    const router = useRouter();
    
    // Vérifier l'état d'authentification au chargement
    store.dispatch('checkAuth');
    
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const user = computed(() => store.getters.user);
    const username = computed(() => user.value?.name || 'Utilisateur');
    

    const logout = () => {
      // Utilise l'action logout du store
      store.dispatch('logout');
      router.push('/connexion')
    }

    return {
      logout
    }
  }
})
</script>

<style scoped>
main {
  flex: 1;
}

/* Styles personnalisés pour la navbar */
.custom-navbar {
  background-color: #0a142b;
  padding: 0.5rem 1rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
  color: white;
}

.navbar-brand i {
  color: #4285F4;
}

/* Styles des liens de navigation */
.navbar-nav .nav-item {
  margin: 0 0.5rem;
}

.navbar-nav .nav-link {
  color: #a8b8d8;
  font-weight: 500;
  position: relative;
}

.navbar-nav .nav-link.active {
  color: white;
}

.navbar-nav .nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #4285F4;
}

.navbar-nav .nav-link:hover {
  color: white;
}

/* Styles des boutons */
.auth-buttons {
  display: flex;
  align-items: center;
}

.btn-connexion {
  background-color: transparent;
  color: #a8b8d8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 0.5rem 1.5rem;
  text-decoration: none;
}

.btn-connexion:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-inscription {
  background-color: #4285F4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.5rem;
  text-decoration: none;
}

.btn-inscription:hover {
  background-color: #3b77db;
  color: white;
}

/* Ajustement pour le contenu principal */
.main-content {
  padding-top: 70px; /* Hauteur standard de la navbar Bootstrap + marge de sécurité */
  min-height: calc(100vh - 56px - 200px);
  margin-top: 0;
}

/* Styles pour le footer */
.footer {
  background-color: #06173c;
  color: white;
  padding: 2rem 0;
}

.footer-heading {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
}

.footer-heading::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(to right, #4285F4, #8ab4f8);
  transition: width 0.3s ease;
}

.footer-heading:hover::after {
  width: 100%;
}

.footer-links, .footer-contact {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li, .footer-contact li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #a8b8d8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #ffffff;
}

.footer-contact li {
  display: flex;
  align-items: center;
}

.footer-contact li i {
  margin-right: 10px;
  color: #4285F4;
}

.footer-bottom {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 20px 0;
  margin-top: 2rem;
}

.copyright {
  text-align: center;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 992px) {
  .navbar-nav {
    margin: 1rem 0;
  }
  
  .auth-buttons {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
}
</style>