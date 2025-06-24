/**
 * Calendar Component
 * Displays holiday and event information
 */
class CalendarComponent {
  /**
   * Initialize the calendar component
   * @param {Object} apiService - API service instance
   */
  constructor(apiService) {
    this.apiService = apiService;
    this.currentMonth = new Date();
    this.holidayData = [];
  }

  /**
   * Load calendar data for the current month
   */
  async loadCalendarData() {
    try {
      const start = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
      const end = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
      
      // Format dates for API
      const startStr = this.formatDateForAPI(start);
      const endStr = this.formatDateForAPI(end);
      
      const response = await this.apiService.getCalendarData(startStr, endStr);
      
      if (response.success) {
        this.holidayData = response.data;
        return this.holidayData;
      } else {
        console.error('Failed to load calendar data');
        return [];
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
      return [];
    }
  }

  /**
   * Format a date for API calls (YYYY-MM-DD)
   * @param {Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Render calendar for container element
   * @param {string} containerId - Container element ID
   */
  async renderCalendar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Load data
    await this.loadCalendarData();
    
    // Clear container
    container.innerHTML = '';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'calendar-header';
    
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    
    header.innerHTML = `
      <h3>${monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}</h3>
      <div class="calendar-nav">
        <button id="prevMonth" class="nav-button">←</button>
        <button id="nextMonth" class="nav-button">→</button>
      </div>
    `;
    
    container.appendChild(header);
    
    // Add event listeners for navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
      this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
      this.renderCalendar(containerId);
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
      this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
      this.renderCalendar(containerId);
    });
    
    // Create calendar grid
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    
    // Add day headers
    const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    dayNames.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      calendarGrid.appendChild(dayHeader);
    });
    
    // Calculate first day of month
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    let startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startingDay = startingDay === 0 ? 6 : startingDay - 1; // Adjust for Monday start
    
    // Calculate days in month
    const daysInMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0).getDate();
    
    // Create empty cells for days before first of month
    for (let i = 0; i < startingDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      calendarGrid.appendChild(emptyDay);
    }
    
    // Create cells for days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
      const dateStr = this.formatDateForAPI(date);
      
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-day';
      
      // Check if this day has any events or holidays
      const dayEvents = this.holidayData.filter(item => item.date === dateStr);
      
      if (dayEvents.length > 0) {
        const event = dayEvents[0];
        if (event.is_holiday) {
          dayCell.classList.add('holiday');
        } else if (event.is_school_holiday) {
          dayCell.classList.add('school-holiday');
        }
        
        if (event.event_name) {
          dayCell.setAttribute('data-tooltip', event.event_name);
        }
      }
      
      // Check if today
      const today = new Date();
      if (today.getDate() === day && 
          today.getMonth() === this.currentMonth.getMonth() && 
          today.getFullYear() === this.currentMonth.getFullYear()) {
        dayCell.classList.add('today');
      }
      
      dayCell.innerHTML = `
        <span class="day-number">${day}</span>
        ${dayEvents.length > 0 ? '<span class="event-indicator">•</span>' : ''}
      `;
      
      calendarGrid.appendChild(dayCell);
    }
    
    container.appendChild(calendarGrid);
    
    // Add legend
    const legend = document.createElement('div');
    legend.className = 'calendar-legend';
    legend.innerHTML = `
      <div class="legend-item">
        <span class="legend-marker holiday"></span>
        <span>Feiertag</span>
      </div>
      <div class="legend-item">
        <span class="legend-marker school-holiday"></span>
        <span>Schulferien</span>
      </div>
      <div class="legend-item">
        <span class="legend-marker today"></span>
        <span>Heute</span>
      </div>
    `;
    container.appendChild(legend);
  }
}

// Export for use in app.js
window.CalendarComponent = CalendarComponent;
