/**
 * Map Component
 * Handles all map-related functionality
 */
class MapComponent {
  /**
   * Initialize the map component
   * @param {string} elementId - ID of the map container element
   * @param {Object} apiService - API service instance
   */
  constructor(elementId, apiService) {
    this.mapContainer = document.getElementById(elementId);
    this.apiService = apiService;
    this.map = null;
    this.markers = {};
    this.radiusCircle = null;
    this.currentPosition = null;
    this.stationClickCallback = null;
    
    this.initMap();
  }

  /**
   * Initialize Leaflet map
   */
  initMap() {
    // Create map with default view of Northern Germany
    this.map = L.map(this.mapContainer).setView([54.0, 11.0], 8);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(this.map);
    
    // Add event listener for map clicks
    this.map.on('click', (event) => {
      this.handleMapClick(event);
    });
    
    // Add legend to explain station colors
    this.createLegend();
    
    // Load stations onto map
    this.loadStations();
  }

  /**
   * Load stations from API and display on map
   */
  async loadStations() {
    try {
      const response = await this.apiService.getStations();
      
      if (response.success) {
        response.data.forEach(station => {
          this.addStationMarker(station);
        });
      } else {
        console.error('Failed to load stations');
      }
    } catch (error) {
      console.error('Error loading stations:', error);
    }
  }

  /**
   * Add a station marker to the map
   * @param {Object} station - Station data object
   */
  addStationMarker(station) {
    // Use default occupancy if not available in station data
    // Ensure we're using a number for occupancy calculations
    const occupancy = station.current_occupancy !== undefined ? 
      parseInt(station.current_occupancy, 10) : Math.floor(Math.random() * 40); // Default to low occupancy (0-39%)
    
    console.log(`Adding marker for ${station.name} with occupancy: ${occupancy}%`);
    
    const occupancyColor = this.getOccupancyColor(occupancy);
    const markerOptions = {
      radius: 8,
      fillColor: occupancyColor,
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.9
    };
    
    // Create marker with popup that includes occupancy info, showing only the level text
    const occupancyLevel = this.getOccupancyLevelText(occupancy);
    const marker = L.circleMarker([station.lat, station.lng], markerOptions)
      .bindTooltip(`<strong>${station.name}</strong><br>
                   Auslastung: <span style="color:${occupancyColor}">${occupancyLevel}</span>`)
      .addTo(this.map);
      
    // Add click event
    marker.on('click', () => {
      if (this.stationClickCallback) {
        this.stationClickCallback(station.id);
      }
    });
    
    // Store marker reference and current occupancy value
    this.markers[station.id] = {
      marker,
      data: {
        ...station,
        current_occupancy: occupancy  // Ensure we store the numeric value
      }
    };
  }

  /**
   * Handle map click event
   * @param {Object} event - Leaflet click event
   */
  handleMapClick(event) {
    const { lat, lng } = event.latlng;
    this.currentPosition = { lat, lng };
    
    // Update radius circle if it exists
    if (this.radiusCircle) {
      this.radiusCircle.setLatLng(this.currentPosition);
    } else {
      // Create new radius circle
      this.radiusCircle = L.circle(this.currentPosition, {
        radius: 25000, // 25km default radius
        fillColor: '#ec0016',
        fillOpacity: 0.1,
        color: '#ec0016',
        weight: 1
      }).addTo(this.map);
    }
    
    // Trigger search for alternatives
    const radiusKm = parseFloat(document.getElementById('radiusValue').textContent);
    this.findAlternatives(lat, lng, radiusKm);
  }

  /**
   * Update station markers with new occupancy data
   * @param {Array} occupancyData - Array of station occupancy data
   */
  updateStationMarkers(occupancyData) {
    console.log(`Updating ${occupancyData.length} station markers with new occupancy data`);
    
    occupancyData.forEach(data => {
      const stationMarker = this.markers[data.station_id];
      
      if (stationMarker && data.current_occupancy !== undefined) {
        // Ensure we're working with numbers
        const occupancy = parseInt(data.current_occupancy, 10);
        
        console.log(`Updating station ${data.station_id} (${stationMarker.data.name}) with occupancy: ${occupancy}%`);
        
        const occupancyColor = this.getOccupancyColor(occupancy);
        
        // Update marker color based on occupancy
        stationMarker.marker.setStyle({
          fillColor: occupancyColor
        });
        
        // Update tooltip content with new occupancy data, showing only the level text
        const occupancyLevel = this.getOccupancyLevelText(occupancy);
        stationMarker.marker.setTooltipContent(
          `<strong>${stationMarker.data.name}</strong><br>
           Auslastung: <span style="color:${occupancyColor}">${occupancyLevel}</span>`
        );
        
        // Update stored data
        stationMarker.data.current_occupancy = occupancy;
        stationMarker.data.occupancy_level = data.occupancy_level;
        stationMarker.data.occupancy_icon = data.occupancy_icon;
      }
    });
  }

  /**
   * Set the current position using geolocation
   */
  useCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          this.currentPosition = { lat, lng };
          this.map.setView(this.currentPosition, 11);
          
          // Update radius circle
          const radiusKm = parseFloat(document.getElementById('radiusValue').textContent);
          
          if (this.radiusCircle) {
            this.radiusCircle.setLatLng(this.currentPosition);
          } else {
            this.radiusCircle = L.circle(this.currentPosition, {
              radius: radiusKm * 1000,
              fillColor: '#ec0016',
              fillOpacity: 0.1,
              color: '#ec0016',
              weight: 1
            }).addTo(this.map);
          }
          
          // Find alternatives
          this.findAlternatives(lat, lng, radiusKm);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Standortabfrage nicht möglich. Bitte erlauben Sie den Zugriff auf Ihren Standort.');
        }
      );
    } else {
      alert('Ihr Browser unterstützt keine Standortabfrage.');
    }
  }

  /**
   * Update the radius of the search circle
   * @param {number} radiusKm - Radius in kilometers
   */
  updateRadius(radiusKm) {
    if (this.radiusCircle && this.currentPosition) {
      this.radiusCircle.setRadius(radiusKm * 1000);
      this.findAlternatives(this.currentPosition.lat, this.currentPosition.lng, radiusKm);
    }
  }

  /**
   * Find alternative stations based on location and radius
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radiusKm - Radius in kilometers
   */
  async findAlternatives(lat, lng, radiusKm) {
    try {
      // Show searching message
      document.getElementById('alternativesInfo').innerHTML = '<p>Suche nach Alternativen...</p>';
      
      // Find alternatives via API
      const response = await this.apiService.findAlternatives(lat, lng, radiusKm);
      
      // Trigger custom event with results
      const event = new CustomEvent('alternativesFound', {
        detail: response
      });
      document.dispatchEvent(event);
    } catch (error) {
      console.error('Error finding alternatives:', error);
      document.getElementById('alternativesInfo').innerHTML = '<p>Fehler bei der Suche nach Alternativen.</p>';
    }
  }

  /**
   * Set callback function for station marker clicks
   * @param {Function} callback - Function to call when a station marker is clicked
   */
  onStationClick(callback) {
    this.stationClickCallback = callback;
  }

  /**
   * Get color based on occupancy level
   * @param {number} occupancy - Occupancy percentage
   * @returns {string} Color hex code
   */
  getOccupancyColor(occupancy) {
    if (occupancy < 40) {
      return '#00C853'; // Bright green - Low occupancy
    } else if (occupancy < 70) {
      return '#FFD600'; // Yellow - Medium occupancy
    } else if (occupancy < 85) {
      return '#FF6D00'; // Orange - High occupancy
    } else {
      return '#D50000'; // Bright red - Very high occupancy
    }
  }
  
  /**
   * Get text description of occupancy level
   * @param {number} occupancy - Occupancy percentage
   * @returns {string} Occupancy level description
   */
  getOccupancyLevelText(occupancy) {
    if (occupancy < 40) {
      return 'niedrig';
    } else if (occupancy < 70) {
      return 'mittel';
    } else if (occupancy < 85) {
      return 'hoch';
    } else {
      return 'sehr hoch';
    }
  }
  
  /**
   * Create a legend for the map showing occupancy levels
   */
  createLegend() {
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '8px';
      div.style.borderRadius = '4px';
      div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
      
      const levels = [
        { color: '#00C853', label: 'Niedrig' },
        { color: '#FFD600', label: 'Mittel' },
        { color: '#FF6D00', label: 'Hoch' },
        { color: '#D50000', label: 'Sehr hoch' }
      ];

      div.innerHTML = '<strong>Auslastung</strong><br>';
      
      levels.forEach(level => {
        div.innerHTML += 
          `<div style="display: flex; align-items: center; margin-top: 3px;">
            <div style="background: ${level.color}; width: 15px; height: 15px; border-radius: 50%; margin-right: 5px;"></div>
            <span>${level.label}</span>
          </div>`;
      });
      
      return div;
    };
    
    legend.addTo(this.map);
  }
}

// Make available for main app.js
window.MapComponent = MapComponent;
