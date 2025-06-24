/**
 * Ostsee Bahnreise Dashboard - Main Application
 */
class OstseeBahnApp {
  /**
   * Initialize the application
   */
  constructor() {
    // Initialize API service
    this.apiService = new ApiService();
    
    // Initialize components
    this.mapComponent = new MapComponent('map', this.apiService);
    this.stationList = new StationList(this.apiService);
    this.stationDetail = new StationDetail(this.apiService);
    this.calendarComponent = new CalendarComponent(this.apiService);
    
    // Current state
    this.currentRadius = 25;
    this.tabs = ['karte', 'verbindungen', 'auslastung', 'alternativen', 'kalender'];
    
    // Register beforeinstallprompt event
    this.installPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.installPrompt = e;
      // Add UI to show install button if needed
      console.log('PWA can be installed. Install prompt available.');
    });
    
    // Initialize UI elements
    this.initUI();
    this.initEventListeners();
    
    // Check for connectivity status
    window.addEventListener('online', () => {
      console.log('Application is back online');
      // Refresh data if needed
      this.showConnectivityStatus('online');
    });
    
    window.addEventListener('offline', () => {
      console.log('Application is offline');
      this.showConnectivityStatus('offline');
    });
    
    // Handle URL parameters for deep linking
    this.handleUrlParams();
  }

  /**
   * Display connectivity status to the user
   * @param {string} status - 'online' or 'offline'
   */
  showConnectivityStatus(status) {
    // Create or get status toast element
    let toast = document.getElementById('connectivity-toast');
    
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'connectivity-toast';
      document.body.appendChild(toast);
      
      // Style the toast
      toast.style.position = 'fixed';
      toast.style.bottom = '70px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.padding = '10px 20px';
      toast.style.borderRadius = '4px';
      toast.style.color = 'white';
      toast.style.zIndex = '9999';
      toast.style.textAlign = 'center';
      toast.style.transition = 'opacity 0.5s';
    }
    
    if (status === 'online') {
      toast.style.backgroundColor = '#4CAF50';
      toast.textContent = 'Sie sind wieder online';
    } else {
      toast.style.backgroundColor = '#F44336';
      toast.textContent = 'Sie sind offline. Einige Funktionen sind eingeschränkt.';
    }
    
    // Show the toast
    toast.style.opacity = '1';
    
    // Hide after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 3000);
  }
  
  /**
   * Handle URL parameters for deep linking
   */
  handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam && this.tabs.includes(tabParam)) {
      // Activate the requested tab
      this.activateTab(tabParam);
    }
    
    // Handle station parameter
    const stationParam = urlParams.get('station');
    if (stationParam) {
      this.stationDetail.showStationDetails(stationParam);
    }
  }
  
  /**
   * Activate a specific tab
   * @param {string} tabId - Tab ID to activate
   */
  activateTab(tabId) {
    // Find the nav item
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all items
    navItems.forEach(navItem => {
      navItem.classList.remove('active');
    });
    
    // Add active class to selected item
    const selectedNavItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (selectedNavItem) {
      selectedNavItem.classList.add('active');
    }
    
    // Hide all tab contents
    tabContents.forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    // Special actions for specific tabs
    if (tabId === 'kalender') {
      // Refresh calendar when tab is shown
      this.calendarComponent.renderCalendar('calendarView');
    }
  }

  /**
   * Initialize UI elements
   */
  initUI() {
    // Initialize bottom navigation
    this.initBottomNav();
    
    // Initialize WebSocket
    this.apiService.initWebSocket();
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Station detail callbacks
    this.mapComponent.onStationClick((stationId) => {
      this.stationDetail.showStationDetails(stationId);
      
      // Show install prompt after user interaction
      if (this.installPrompt && !localStorage.getItem('installPromptDismissed')) {
        // Wait a bit before showing the prompt (give time to see station details first)
        setTimeout(() => this.showInstallPrompt(), 3000);
      }
    });
    
    this.stationList.onStationClick((stationId) => {
      this.stationDetail.showStationDetails(stationId);
    });
    
    // GPS button
    document.getElementById('gpsBtn').addEventListener('click', () => {
      this.mapComponent.useCurrentLocation();
      
      // Show install prompt after meaningful user interaction with the map
      if (this.installPrompt && !localStorage.getItem('installPromptDismissed')) {
        setTimeout(() => this.showInstallPrompt(), 3000);
      }
    });
    
    // Search input
    const searchInput = document.getElementById('stationSearch');
    const searchClear = document.getElementById('searchClear');
    
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value.trim().toLowerCase();
      
      if (value.length > 0) {
        searchClear.style.display = 'block';
        
        // Implement basic search functionality
        this.performSearch(value);
      } else {
        searchClear.style.display = 'none';
      }
    });
    
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.style.display = 'none';
      // Reset search
      this.performSearch('');
    });
    
    // Radius slider
    const radiusSlider = document.getElementById('radiusSlider');
    const radiusValue = document.getElementById('radiusValue');
    
    radiusSlider.addEventListener('input', (e) => {
      const radius = e.target.value;
      radiusValue.textContent = radius;
      this.currentRadius = radius;
      
      if (this.mapComponent.radiusCircle) {
        this.mapComponent.updateRadius(radius);
      }
    });
    
    // Connections refresh button
    document.getElementById('refreshConnections').addEventListener('click', () => {
      this.updateConnections();
    });
    
    // Add unload event listener to update last used tab
    window.addEventListener('beforeunload', () => {
      // Store current tab for next visit
      const activeNavItem = document.querySelector('.nav-item.active');
      if (activeNavItem) {
        localStorage.setItem('lastTab', activeNavItem.dataset.tab);
      }
    });
    
    // Check for last used tab
    const lastTab = localStorage.getItem('lastTab');
    if (lastTab && this.tabs.includes(lastTab)) {
      this.activateTab(lastTab);
    }
  }
  
  /**
   * Perform search on stations
   * @param {string} query - Search query
   */
  performSearch(query) {
    if (!query) {
      // Reset search, show all stations
      this.mapComponent.showAllStations();
      return;
    }
    
    // Search stations by name
    this.apiService.getStations()
      .then(response => {
        if (response.success) {
          const stations = response.data.filter(station => 
            station.name.toLowerCase().includes(query.toLowerCase()));
          
          this.mapComponent.filterStationsBySearch(stations);
        }
      })
      .catch(error => console.error('Error searching stations:', error));
  }

  /**
   * Initialize bottom navigation
   */
  initBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Initialize calendar on first load
    this.calendarComponent.renderCalendar('calendarView');
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tabId = item.dataset.tab;
        this.activateTab(tabId);
        
        // Update URL for deep linking without page reload
        const url = new URL(window.location);
        url.searchParams.set('tab', tabId);
        window.history.pushState({}, '', url);
      });
    });
  }

  /**
   * Show PWA install promotion banner
   * This is triggered after user has interacted with the app
   */
  showInstallPrompt() {
    // Only show if install prompt is available and not already shown
    if (!this.installPrompt || localStorage.getItem('installPromptShown')) {
      return;
    }

    // Create install banner
    const installBanner = document.createElement('div');
    installBanner.className = 'install-banner';
    installBanner.innerHTML = `
      <div class="install-content">
        <div class="install-icon">📱</div>
        <div class="install-text">
          <strong>Ostsee Bahnreise als App installieren</strong>
          <span>Für schnelleren Zugriff und bessere Offline-Funktionalität</span>
        </div>
      </div>
      <div class="install-actions">
        <button id="installBtn" class="install-btn">Installieren</button>
        <button id="installClose" class="install-close">✕</button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .install-banner {
        position: fixed;
        bottom: 70px;
        left: 10px;
        right: 10px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        padding: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 1000;
        animation: slideUp 0.3s ease-out forwards;
      }
      
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      
      .install-content {
        display: flex;
        align-items: center;
      }
      
      .install-icon {
        font-size: 24px;
        margin-right: 12px;
      }
      
      .install-text {
        display: flex;
        flex-direction: column;
      }
      
      .install-text span {
        font-size: 0.85rem;
        color: #666;
      }
      
      .install-actions {
        display: flex;
        align-items: center;
      }
      
      .install-btn {
        background-color: #EC0016;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        margin-right: 8px;
        cursor: pointer;
      }
      
      .install-close {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(installBanner);

    // Add event listeners
    document.getElementById('installBtn').addEventListener('click', async () => {
      // Hide banner
      installBanner.style.display = 'none';
      
      // Show installation prompt
      this.installPrompt.prompt();
      
      // Wait for user response
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the saved prompt since it can only be used once
      this.installPrompt = null;
      
      // Mark as shown in localStorage
      localStorage.setItem('installPromptShown', 'true');
    });

    document.getElementById('installClose').addEventListener('click', () => {
      installBanner.style.display = 'none';
      localStorage.setItem('installPromptDismissed', Date.now().toString());
    });

    // Mark as shown in localStorage (will show again after browser session)
    localStorage.setItem('installPromptShown', 'true');
  }

  /**
   * Update connections tab
   * In a real implementation, this would fetch real departure data
   */
  updateConnections() {
    const connectionsList = document.getElementById('connectionsList');
    connectionsList.innerHTML = '<p class="loading">Verbindungen werden geladen...</p>';
    
    // Simulate API call delay
    setTimeout(() => {
      connectionsList.innerHTML = '';
      
      const mockConnections = [
        {
          from: 'Berlin Hbf',
          to: 'Warnemünde',
          departureTime: '13:30',
          arrivalTime: '15:45',
          trainNumber: 'RE 1',
          platform: '5',
          delay: 2,
          occupancy: 65
        },
        {
          from: 'Hamburg Hbf',
          to: 'Travemünde Strand',
          departureTime: '14:15',
          arrivalTime: '15:30',
          trainNumber: 'RE 8',
          platform: '3',
          delay: 0,
          occupancy: 40
        }
      ];
      
      mockConnections.forEach(connection => {
        const connectionItem = document.createElement('div');
        connectionItem.className = 'connection-item';
        
        connectionItem.innerHTML = `
          <div class="connection-header">
            <div class="connection-train">${connection.trainNumber}</div>
            <div class="connection-occupancy">
              <span class="occupancy-icon">${this.getOccupancyIcon(connection.occupancy)}</span>
              <span class="occupancy-percent">${connection.occupancy}%</span>
            </div>
          </div>
          <div class="connection-route">
            <div class="connection-stations">
              <span class="connection-from">${connection.from}</span>
              <span class="connection-arrow">→</span>
              <span class="connection-to">${connection.to}</span>
            </div>
          </div>
          <div class="connection-times">
            <div class="connection-departure ${connection.delay > 0 ? 'delayed' : ''}">
              ${connection.departureTime}
              ${connection.delay > 0 ? `<span class="delay">+${connection.delay}</span>` : ''}
            </div>
            <span class="connection-time-separator">→</span>
            <div class="connection-arrival">
              ${connection.arrivalTime}
            </div>
          </div>
          <div class="connection-platform">
            Gleis ${connection.platform}
          </div>
        `;
        
        connectionsList.appendChild(connectionItem);
      });
    }, 1000);
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new OstseeBahnApp();
});
