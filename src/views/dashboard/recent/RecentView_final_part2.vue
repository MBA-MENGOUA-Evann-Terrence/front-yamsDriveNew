  
  computed: {
    // Style du menu contextuel
    contextMenuStyle() {
      return {
        top: `${this.contextMenu.y}px`,
        left: `${this.contextMenu.x}px`
      };
    },
    
    // Fichiers filtrés selon les critères de l'utilisateur
    filteredFiles() {
      // Vérifier si recentFiles est bien un tableau
      if (!Array.isArray(this.recentFiles)) {
        return [];
      }

      // Obtenir les types sélectionnés
      const selectedTypes = this.fileTypes
        .filter(type => type.selected)
        .map(type => type.id);

      // Appliquer les filtres par type et période
      return this.recentFiles.filter(file => {
        // Filtre par type
        if (selectedTypes.length > 0) {
          const category = this.getFileCategory(file.type);
          if (!selectedTypes.includes(category)) {
            return false;
          }
        }

        // Filtre par période
        if (this.selectedPeriod !== 'all') {
          if (!file.lastOpened) return false;

          const fileDate = new Date(file.lastOpened);
          const now = new Date();
          
          // Début de la journée courante
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          // Début de la journée d'hier
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Début de la semaine
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay()); // Début de semaine = dimanche
          
          // Début du mois
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
          // Début de l'année
          const startOfYear = new Date(now.getFullYear(), 0, 1);

          switch (this.selectedPeriod) {
            case 'today':
              return fileDate >= today;
            case 'yesterday':
              return fileDate >= yesterday && fileDate < today;
            case 'week':
              return fileDate >= startOfWeek;
            case 'month':
              return fileDate >= startOfMonth;
            case 'year':
              return fileDate >= startOfYear;
            default:
              return true;
          }
        }

        return true;
      });
    }
  },
  
  methods: {
    // Méthode pour la mise à jour du nombre de lignes
    updateTotalRecords(nb) {
      this.totalRecords = nb;
    },
    
    // Méthode pour ouvrir un fichier
    openFile(file) {
      console.log('Ouvrir le fichier:', file);
      // Logique d'ouverture
    },
    
    // Gestion des filtres
    toggleFilterMenu() {
      this.showFilterMenu = !this.showFilterMenu;
      if (this.showFilterMenu) {
        this.showSortMenu = false; // Fermer le menu de tri si ouvert
      }
    },
    
    toggleSortMenu() {
      this.showSortMenu = !this.showSortMenu;
      if (this.showSortMenu) {
        this.showFilterMenu = false; // Fermer le menu de filtres si ouvert
      }
    },
    
    applyFilters() {
      // AsdecodeTable n'implémente pas le filtrage directement
      // Logique de filtrage personnalisée à implémenter
      console.log('Filtrage appliqué');
      // TODO: Implémenter une logique d'API pour les filtres ou utiliser l'API d'AsdecodeTable
    },
    
    setSortOption(option) {
      // AsdecodeTable n'implémente pas le tri directement
      this.sortBy = option;
      console.log('Tri selon:', option);
      // TODO: Implémenter une logique d'API pour le tri ou utiliser l'API d'AsdecodeTable
      this.showSortMenu = false;
    },
    
    setPeriod(period) {
      this.selectedPeriod = period;
      this.applyFilters();
    },
    
    selectQuickPeriod(period) {
      this.selectedQuickPeriod = period;
      this.setPeriod(period);
    },
    
    getPeriodLabel() {
      const period = this.timePeriods.find(p => p.id === this.selectedPeriod);
      return period ? period.name : '';
    },
    
    // Gestion des favoris
    async toggleFavorite(file) {
      // Éviter les actions multiples sur le même fichier
      if (this.favoriteInProgress === file.id) {
        return;
      }
      
      this.favoriteInProgress = file.id;
      
      try {
        // Déterminer si on ajoute ou supprime des favoris
        if (!file.favorite) {
          // Ajout aux favoris
          await axios.post('/api/favoris', {
            document_id: file.id
          });
          file.favorite = true;
        } else {
          // Suppression des favoris
          await axios.delete(`/api/favoris/${file.id}`);
          file.favorite = false;
        }
      } catch (error) {
        console.error('Erreur lors de la modification des favoris:', error);
        // Afficher un message d'erreur à l'utilisateur
        alert('Impossible de modifier les favoris. Veuillez réessayer.');
      } finally {
        this.favoriteInProgress = null;
      }
    },
    
    // Méthode pour récupérer les favoris
    async fetchFavorites() {
      try {
        const response = await axios.get('/api/favoris');
        // Créer un ensemble des IDs de favoris pour une recherche plus rapide
        const favoriteIds = new Set(response.data.map(fav => fav.document_id));
        
        // Marquer les documents favoris
        if (Array.isArray(this.recentFiles)) {
          this.recentFiles.forEach(file => {
            file.favorite = favoriteIds.has(file.id);
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
      }
    },
