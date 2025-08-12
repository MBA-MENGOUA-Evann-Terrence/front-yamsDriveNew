import { reactive } from 'vue';

// Création d'un système d'événements simple pour Vue 3
export const eventBus = reactive({
  // Stockage des écouteurs d'événements
  listeners: {},

  // Méthode pour émettre un événement
  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback(...args);
      });
    }
  },

  // Méthode pour s'abonner à un événement
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Retourne une fonction pour se désabonner
    return () => {
      this.listeners[event] = this.listeners[event].filter(
        listener => listener !== callback
      );
    };
  },

  // Méthode pour se désabonner de tous les événements d'un certain type
  off(event) {
    if (this.listeners[event]) {
      delete this.listeners[event];
    }
  }
});

// Constantes pour les noms d'événements
export const EVENTS = {
  DOCUMENT_DELETED: 'document:deleted',
  DOCUMENT_CREATED: 'document:created',
  DOCUMENT_UPDATED: 'document:updated'
};
