/**
 * StationList Component
 * Handles station lists for occupancy and alternatives tabs
 */
class StationList {
  /**
   * Initialize the StationList component
   * @param {Object} apiService - API service instance
   */
  constructor(apiService) {
    this.apiService = apiService;
    this.occupancyListEl = document.getElementById('occupancyList');
    this.alternativesListEl = document.getElementById('alternativesList');
    this.alternativesInfoEl = document.getElementById('alternativesInfo');
    this.stationClickCallback = null;
    
    this.initEvents();
    this.loadOccupancyData();
  }

  /**
   * Initialize event listeners
   */
  initEvents() {
    // Listen for alternatives found event
    document.addEventListener('alternativesFound', (event) => {
      this.displayAlternatives(event.detail);
    });
    
    // Set up click listeners for station list items
    this.occupancyListEl.addEventListener('click', (event) => {
      const listItem = event.target.closest('.station-list-item');
      if (listItem && this.stationClickCallback) {
        const stationId = listItem.dataset.stationId;
        this.stationClickCallback(stationId);
      }
    });
    
    this.alternativesListEl.addEventListener('click', (event) => {
      const listItem = event.target.closest('.station-list-item');
      if (listItem && this.stationClickCallback) {
        const stationId = listItem.dataset.stationId;
        this.stationClickCallback(stationId);
      }
    });
  }

  /**
   * Load occupancy data from API
   */
  async loadOccupancyData() {
    try {
      const response = await this.apiService.getCurrentOccupancy();
      
      if (response.success) {
        this.displayOccupancyList(response.data);
      } else {
        this.occupancyListEl.innerHTML = '<p class="error-message">Fehler beim Laden der Auslastungsdaten.</p>';
      }
    } catch (error) {
      console.error('Error loading occupancy data:', error);
      this.occupancyListEl.innerHTML = '<p class="error-message">Fehler beim Laden der Auslastungsdaten.</p>';
    }
  }

  /**
   * Display occupancy list
   * @param {Array} occupancyData - Array of station occupancy data
   */
  displayOccupancyList(occupancyData) {
    // Clear existing list
    this.occupancyListEl.innerHTML = '';
    
    if (occupancyData.length === 0) {
      this.occupancyListEl.innerHTML = '<p>Keine Auslastungsdaten verfügbar.</p>';
      return;
    }
    
    // Sort by occupancy (highest first)
    const sortedData = [...occupancyData].sort((a, b) => b.current_occupancy - a.current_occupancy);
    
    // Create list items
    sortedData.forEach(station => {
      const listItem = document.createElement('div');
      listItem.className = 'station-list-item';
      listItem.dataset.stationId = station.station_id;
      
      listItem.innerHTML = `
        <div class="station-info">
          <h3>${station.name}</h3>
          <div class="occupancy-badge ${this.getOccupancyClass(station.current_occupancy)}">
            <span class="occupancy-icon">${station.occupancy_icon || this.getOccupancyIcon(station.current_occupancy)}</span>
            <span class="occupancy-percent">${station.current_occupancy}%</span>
          </div>
        </div>
      `;
      
      this.occupancyListEl.appendChild(listItem);
    });
  }

  /**
   * Display alternatives list
   * @param {Object} response - Alternatives API response
   */
  displayAlternatives(response) {
    // Clear alternatives info
    this.alternativesInfoEl.innerHTML = '';
    
    // Clear existing list
    this.alternativesListEl.innerHTML = '';
    
    if (!response.success) {
      this.alternativesInfoEl.innerHTML = '<p>Fehler bei der Suche nach Alternativen.</p>';
      return;
    }
    
    const { data, searchParams } = response;
    
    if (data.length === 0) {
      this.alternativesInfoEl.innerHTML = '<p>Keine alternativen Bahnhöfe im Suchradius gefunden.</p>';
      return;
    }
    
    // Show search parameters
    this.alternativesInfoEl.innerHTML = `
      <p>
        <strong>${data.length} Alternativen</strong> gefunden im Umkreis von ${searchParams.radius} km
      </p>
    `;
    
    // Create list items
    data.forEach(station => {
      const listItem = document.createElement('div');
      listItem.className = 'station-list-item alternative-item';
      listItem.dataset.stationId = station.id;
      
      listItem.innerHTML = `
        <div class="station-info">
          <h3>${station.name}</h3>
          <div class="alternative-details">
            <div class="occupancy-badge ${this.getOccupancyClass(station.current_occupancy)}">
              <span class="occupancy-icon">${this.getOccupancyIcon(station.current_occupancy)}</span>
              <span class="occupancy-percent">${station.current_occupancy}%</span>
            </div>
            <div class="distance-badge">
              <span>${Math.round(station.distance_km * 10) / 10} km</span>
            </div>
          </div>
          <div class="recommendation-score">
            <span class="score-label">Empfehlungswert:</span>
            <div class="score-bar">
              <div class="score-fill" style="width: ${station.recommendation_score}%;"></div>
            </div>
          </div>
        </div>
      `;
      
      this.alternativesListEl.appendChild(listItem);
    });
  }

  /**
   * Update occupancy data for a station
   * @param {Object} data - Updated occupancy data
   */
  updateStationOccupancy(data) {
    const listItem = this.occupancyListEl.querySelector(`[data-station-id="${data.stationId}"]`);
    
    if (listItem) {
      const occupancyBadge = listItem.querySelector('.occupancy-badge');
      const occupancyIcon = listItem.querySelector('.occupancy-icon');
      const occupancyPercent = listItem.querySelector('.occupancy-percent');
      
      // Update class
      occupancyBadge.className = `occupancy-badge ${this.getOccupancyClass(data.occupancy)}`;
      
      // Update icon
      occupancyIcon.textContent = data.icon || this.getOccupancyIcon(data.occupancy);
      
      // Update percentage
      occupancyPercent.textContent = `${data.occupancy}%`;
    }
  }

  /**
   * Set callback function for station item clicks
   * @param {Function} callback - Function to call when a station item is clicked
   */
  onStationClick(callback) {
    this.stationClickCallback = callback;
  }

  /**
   * Get occupancy class based on occupancy level
   * @param {number} occupancy - Occupancy percentage
   * @returns {string} CSS class
   */
  getOccupancyClass(occupancy) {
    if (occupancy < 40) {
      return 'occupancy-low';
    } else if (occupancy < 70) {
      return 'occupancy-medium';
    } else if (occupancy < 85) {
      return 'occupancy-high';
    } else {
      return 'occupancy-very-high';
    }
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
}

// Make available for main app.js
window.StationList = StationList;
