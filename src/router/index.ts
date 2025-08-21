import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/connexion'
  },
  // Route pour la redirection vers le dashboard admin ou utilisateur en fonction du rôle
  {
    path: '/redirect',
    name: 'redirect',
    component: () => import('../views/RedirectView.vue')
  },
  {
    path: '/',
    component: () => import('../views/layout/authant/tamplateappView.vue'),
    children: [
      {
        path: 'connexion',
        name: 'Login',
        component: () => import('../views/layout/authant/connexionView.vue')
      },
      {
        path: 'inscription',
        name: 'inscription',
        component: () => import('../views/layout/authant/inscriptionView.vue')
      }
    ]
  },
  {
    path: '/home',
    component: () => import('../views/layout/Acceuil/homeLayoutView.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/layout/Acceuil/homeContentView.vue')
      }
    ]
  },
  {
    path: '/dashboard',
    component: () => import('../views/dashboard/layout/LayoutDashView.vue'),
    children: [
      {
        path: '',
        redirect: '/dashboard/documents'
      },
      {
        path: 'statistiques',
        name: 'statistiques',
        component: () => import('../views/dashboard/stat/StatistiquesView.vue')
      },
      {
        path: 'documents',
        name: 'documents',
        component: () => import('../views/dashboard/Document/DocumentsView.vue')
      },
      {
        path: 'partage',
        name: 'partage',
        component: () => import('../views/dashboard/partage/index.vue')
      },
      {
        path: 'recent',
        name: 'recent',
        component: () => import('../views/dashboard/recent/index.vue')
      },
      {
        path: 'favoris',
        name: 'favoris',
        component: () => import('../views/dashboard/favorie/FavorieView.vue')
      },
      {
        path: 'corbeille',
        name: 'corbeille',
        component: () => import('../views/dashboard/corbeille/CorbeilleView.vue')
      },
      {
        path: 'gestionutilisateur',
        name: 'gestionutilisateur',
        component: () => import('../views/dashboard/gestion utilisateur/indexutilisateurView.vue')
      },
      {
        path: 'gestionutilisateur/show/:id',
        name: 'gestionutilisateur-show',
        component: () => import('../views/dashboard/gestion utilisateur/showView.vue')
      },
      // {
      //   path: 'gestionutilisateur/supression/:id',
      //   name: 'gestionutilisateur-supression',
      //   component: () => import('../views/dashboard/gestion utilisateur/supressionView.vue')
      // },
      {
        path: 'gestionutilisateur/domaine',
        name: 'gestionutilisateur-domaine',
        component: () => import(/* webpackChunkName: "domaine" */ '../views/dashboard/gestion utilisateur/DomaineView.vue')
      },
      {
        path: 'services',
        name: 'services',
        component: () => import('../views/dashboard/services/IndexService.vue')
      },
      {
        path: 'profil',
        name: 'profil',
        component: () => import('../views/dashboard/profil/ProfilView.vue')
      }
    ]
  },
  {
    path: '/dashboard/admin',
    component: () => import('../views/dashboard/layout/LayoutDashView.vue'),
    children: [
      {
        path: '',
        redirect: '/dashboard/admin/documents'
      },
      {
        path: 'statistiques',
        name: 'admin-statistiques',
        component: () => import('../views/dashboard/stat/StatistiquesView.vue')
      },
      {
        path: 'documents',
        name: 'admin-documents',
        component: () => import('../views/dashboard/Document/DocumentsView.vue')
      },
      {
        path: 'partage',
        name: 'admin-partage',
        component: () => import('../views/dashboard/partage/index.vue')
      },
      {
        path: 'recent',
        name: 'admin-recent',
        component: () => import('../views/dashboard/recent/index.vue')
      },
      {
        path: 'favoris',
        name: 'admin-favoris',
        component: () => import('../views/dashboard/favorie/FavorieView.vue')
      },
      {
        path: 'corbeille',
        name: 'admin-corbeille',
        component: () => import('../views/dashboard/corbeille/CorbeilleView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
