import { Store } from 'vuex';
import { Router } from 'vue-router';

declare module '@vue/runtime-core' {
  // Déclarez vos propres propriétés d'instance globales ici
  interface ComponentCustomProperties {
    $store: Store<any>;
    $router: Router;
  }
}
