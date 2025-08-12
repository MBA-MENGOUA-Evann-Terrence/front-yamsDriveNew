import Pusher from 'pusher-js';

// Configuration de Pusher
// Les communications sont chiffrées par défaut dans les versions récentes de Pusher
const pusher = new Pusher('6427a96d134c41c67879', {
  cluster: 'mt1'
});

export default pusher;
