/**
 * StationDetail Component
 * Handles the station detail modal and data display
 */
class StationDetail {
  /**
   * Initialize the StationDetail component
   * @param {Object} apiService - API service instance
   */
  constructor(apiService) {
    this.apiService = apiService;
    this.modal = document.getElementById('stationModal');
    this.closeBtn = document.getElementById('modalClose');
    this.stationNameEl = document.getElementById('modalStationName');
    this.occupancyIconEl = document.getElementById('modalOccupancyIcon');
    this.occupancyLevelEl = document.getElementById('modalOccupancyLevel');
    this.occupancyDescEl = document.getElementById('modalOccupancyDesc');
    this.beachDistanceEl = document.getElementById('modalBeachDistance');
    this.platformsEl = document.getElementById('modalPlatforms');
    this.accessibleEl = document.getElementById('modalAccessible');
    this.connectionsEl = document.getElementById('modalConnections');
    this.tempEl = document.getElementById('modalTemp');
    this.conditionEl = document.getElementById('modalCondition');
    this.windEl = document.getElementById('modalWind');
    this.beachSuitabilityEl = document.getElementById('modalBeachSuitability');
    this.departuresEl = document.getElementById('modalDepartures');
    
    this.currentStationId = null;
    this.initEvents();
  }

  /**
   * Initialize event listeners
   */
  initEvents() {
    // Close modal when close button is clicked
    this.closeBtn.addEventListener('click', () => {
      this.hideModal();
    });
    
    // Close modal when clicking outside the content
    window.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.hideModal();
      }
    });
  }

  /**
   * Show station details for a specific station
   * @param {string} stationId - Station ID
   */
  async showStationDetails(stationId) {
    try {
      this.currentStationId = stationId;
      
      // Show modal while loading
      this.modal.style.display = 'flex';
      this.stationNameEl.textContent = 'Wird geladen...';
      this.occupancyIconEl.textContent = '';
      this.occupancyLevelEl.textContent = '';
      this.occupancyDescEl.textContent = '';
      
      // Fetch station details
      const response = await this.apiService.getStationById(stationId);
      
      if (!response.success) {
        this.stationNameEl.textContent = 'Fehler';
        this.occupancyDescEl.textContent = 'Fehler beim Laden der Stationsdaten.';
        return;
      }
      
      const station = response.data;
      
      // Update station name
      this.stationNameEl.textContent = station.name;
      
      // Update occupancy section
      if (station.occupancy) {
        this.occupancyIconEl.textContent = station.occupancy.occupancy_icon || this.getOccupancyIcon(station.occupancy.current_occupancy);
        this.occupancyLevelEl.textContent = this.getOccupancyLevelText(station.occupancy.occupancy_level);
        this.occupancyDescEl.textContent = this.getOccupancyDescription(station.occupancy.current_occupancy);
      } else {
        this.occupancyIconEl.textContent = '❓';
        this.occupancyLevelEl.textContent = 'Keine Daten';
        this.occupancyDescEl.textContent = 'Aktuelle Auslastungsdaten nicht verfügbar.';
      }
      
      // Update station details
      this.beachDistanceEl.textContent = `${station.beach_distance} m`;
      this.platformsEl.textContent = station.platforms;
      this.accessibleEl.textContent = station.accessible ? 'Ja' : 'Nein';
      
      // Update connections
      if (station.connections && Array.isArray(station.connections)) {
        this.connectionsEl.textContent = station.connections.join(', ');
      } else {
        this.connectionsEl.textContent = 'Keine Angabe';
      }
      
      // Update weather section
      if (station.weather) {
        this.tempEl.textContent = `${station.weather.temp}°C`;
        this.conditionEl.textContent = station.weather.condition;
        this.windEl.textContent = `${station.weather.wind} km/h`;
        this.beachSuitabilityEl.textContent = station.weather.beach_suitability;
        this.beachSuitabilityEl.className = `beach-suitability ${this.getBeachSuitabilityClass(station.weather.beach_suitability)}`;
      } else {
        this.tempEl.textContent = '---';
        this.conditionEl.textContent = 'Keine Wetterdaten';
        this.windEl.textContent = '';
        this.beachSuitabilityEl.textContent = '';
      }
      
      // Load departures (simulated for now)
      this.loadDepartures(stationId);
      
      // Subscribe to real-time updates
      this.subscribeToUpdates(stationId);
      
    } catch (error) {
      console.error('Error showing station details:', error);
      this.stationNameEl.textContent = 'Fehler';
      this.occupancyDescEl.textContent = 'Fehler beim Laden der Stationsdaten.';
    }
  }

  /**
   * Hide the modal
   */
  hideModal() {
    this.modal.style.display = 'none';
    this.currentStationId = null;
  }

  /**
   * Subscribe to real-time updates for a station
   * @param {string} stationId - Station ID
   */
  subscribeToUpdates(stationId) {
    this.apiService.subscribeToStationUpdates(stationId, (data) => {
      this.updateOccupancyInfo(data);
    });
  }

  /**
   * Update occupancy information with real-time data
   * @param {Object} data - Updated occupancy data
   */
  updateOccupancyInfo(data) {
    if (this.currentStationId === data.stationId) {
      this.occupancyIconEl.textContent = data.icon || this.getOccupancyIcon(data.occupancy);
      this.occupancyLevelEl.textContent = this.getOccupancyLevelText(data.level);
      this.occupancyDescEl.textContent = this.getOccupancyDescription(data.occupancy);
    }
  }

  /**
   * Load departures for a station
   * @param {string} stationId - Station ID
   */
  async loadDepartures(stationId) {
    // Clear departures list
    this.departuresEl.innerHTML = '<p class="loading">Abfahrtsdaten werden geladen...</p>';
    
    // In a real implementation, this would fetch from the DB API
    // For now, generate mock departures based on station ID
    setTimeout(() => {
      let mockDepartures;
      
      switch (stationId) {
        case 'warnemuende':
          mockDepartures = [
            { time: '14:23', destination: 'Rostock Hbf', platform: '1', delay: 0 },
            { time: '14:55', destination: 'Berlin Hbf', platform: '2', delay: 3 }
          ];
          break;
        case 'binz':
          mockDepartures = [
            { time: '14:31', destination: 'Stralsund Hbf', platform: '2', delay: 5 },
            { time: '15:12', destination: 'Berlin Hbf', platform: '1', delay: 0 }
          ];
          break;
        default:
          mockDepartures = [
            { time: '14:45', destination: 'Hamburg Hbf', platform: '1', delay: 2 },
            { time: '15:30', destination: 'Berlin Hbf', platform: '2', delay: 0 }
          ];
      }
      
      this.displayDepartures(mockDepartures);
    }, 1000);
  }

  /**
   * Display departures in the modal
   * @param {Array} departures - Array of departure objects
   */
  displayDepartures(departures) {
    if (!departures || departures.length === 0) {
      this.departuresEl.innerHTML = '<p>Keine Abfahrten verfügbar.</p>';
      return;
    }
    
    this.departuresEl.innerHTML = '';
    
    departures.forEach(departure => {
      const departureItem = document.createElement('div');
      departureItem.className = 'departure-item';
      
      departureItem.innerHTML = `
        <div class="departure-time ${departure.delay > 0 ? 'delayed' : ''}">
          ${departure.time}
          ${departure.delay > 0 ? `<span class="delay">+${departure.delay}</span>` : ''}
        </div>
        <div class="departure-destination">${departure.destination}</div>
        <div class="departure-platform">Gleis ${departure.platform}</div>
      `;
      
      this.departuresEl.appendChild(departureItem);
    });
  }

  /**
   * Get occupancy icon based on occupancy level
   * @param {number} occupancy - Occupancy percentage
   * @returns {string} Unicode icon
   */
  getOccupancyIcon(occupancy) {
    if (occupancy < 40) {
      return '👤';
    } else if (occupancy < 70) {
      return '👥';
    } else if (occupancy < 85) {
      return '👥👥👥';
    } else {
      return '🚫👥👥👥';
    }
  }

  /**
   * Get occupancy level text from level code
   * @param {string} level - Occupancy level code
   * @returns {string} User-friendly level text
   */
  getOccupancyLevelText(level) {
    const levels = {
      'niedrig': 'Niedrige Bahnhofsauslastung',
      'mittel': 'Mittlere Bahnhofsauslastung',
      'hoch': 'Hohe Bahnhofsauslastung',
      'sehr_hoch': 'Sehr hohe Bahnhofsauslastung'
    };
    
    return levels[level] || 'Unbekannte Bahnhofsauslastung';
  }

  /**
   * Get occupancy description based on occupancy percentage
   * @param {number} occupancy - Occupancy percentage
   * @returns {string} Description text
   */
  getOccupancyDescription(occupancy) {
    if (occupancy < 40) {
      return 'Niedrige Besucherzahl - der Bahnhof ist ruhig und entspannt.';
    } else if (occupancy < 70) {
      return 'Moderate Besucherzahl - der Bahnhof ist mäßig belebt.';
    } else if (occupancy < 85) {
      return 'Hohe Besucherzahl - der Bahnhof ist stark frequentiert.';
    } else {
      return 'Sehr hohe Besucherzahl - es kann zu Gedränge im Bahnhof kommen.';
    }
  }

  /**
   * Get CSS class for beach suitability display
   * @param {string} suitability - Beach suitability text
   * @returns {string} CSS class
   */
  getBeachSuitabilityClass(suitability) {
    switch (suitability) {
      case 'sehr gut':
        return 'excellent';
      case 'gut':
        return 'good';
      case 'mäßig':
        return 'moderate';
      case 'schlecht':
        return 'poor';
      default:
        return '';
    }
  }
}

// Make available for main app.js
window.StationDetail = StationDetail;
