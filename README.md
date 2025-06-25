# Stations of Sun

## Overview

Stations of Sun is an open-source project developed during the Hack4Rail 2025 hackathon, organized by SBB, ÖBB, and DB in partnership with the OpenRail Association. The project provides a real-time dashboard for monitoring railway station occupancy (crowdedness), helping railway station managers and travelers identify usage patterns, optimize travel plans, and improve the passenger experience—especially for weekend and holiday travelers.

## Features

- Real-time station occupancy monitoring with color-coded map visualization
- PWA (Progressive Web App) for cross-platform functionality
- Holiday and event calendar integration
- Alternative station suggestions based on proximity and occupancy level
- Station detail view with facilities, platform information, and accessibility data
- WebSocket-based live updates for occupancy changes
- Fully responsive design for mobile and desktop
- Offline capability

## Tech Stack

### Backend

- Node.js with Express.js
- SQLite database (development environment)
- RESTful API for data access
- Socket.IO for real-time updates

### Frontend

- Vanilla JavaScript with modular components
- Leaflet.js for interactive mapping
- Progressive Web App (PWA) implementation
- Service Worker for offline functionality
- Responsive CSS for mobile and desktop interfaces

### Data Processing

- Data analysis notebooks for passenger congestion and holiday impact
- CSV data integration for station information

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- SQLite (included as a dependency)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/OpenRail-Playground/stations-of-sun.git
   cd stations-of-sun
   ```

2. Install Node.js dependencies:

   ```sh
   npm install
   ```

3. Set up the database:

   ```sh
   npm run db:setup
   npm run db:seed
   ```

4. Start the application:

   ```sh
   npm start
   ```

5. Access the application in your browser:

   ```text
   http://localhost:3000
   ```

## Occupancy Levels

The application uses a color-coded system to represent station occupancy (crowdedness) levels:

- **Niedrig** (Low) - Green: Comfortable experience with plenty of space
- **Mittel** (Medium) - Yellow: Moderately busy but still comfortable
- **Hoch** (High) - Orange: Busy with limited space
- **Sehr hoch** (Very high) - Red: Very crowded, potential for delays

## API Endpoints

The application provides the following RESTful API endpoints:

- `GET /api/v1/stations` - Get all stations
- `GET /api/v1/stations/:id` - Get a specific station by ID
- `GET /api/v1/occupancy` - Get current occupancy data for all stations
- `GET /api/v1/occupancy/:id/history` - Get historical occupancy data for a station
- `POST /api/v1/alternatives` - Find alternative stations based on coordinates and radius
- `GET /api/v1/calendar` - Get holiday and event calendar data

WebSocket events (via Socket.IO):

- `occupancy_update` - Real-time occupancy updates
- `weather_update` - Real-time weather updates

## Project Structure

- `backend/` – Express server, API routes, controllers, and models
  - `app.js` – Express application setup
  - `server.js` – Main server entry point
  - `config/` – Database and environment configuration
  - `controllers/` – API endpoint controllers
  - `models/` – Data models
  - `routes/` – API route definitions
  - `db/` – Database migrations and seed data
  - `services/` – Business logic services
  - `utils/` – Utility functions

- `frontend/` – Client-side application
  - `public/` – Publicly served files
    - `index.html` – Main HTML file
    - `app.js` – Main application script
    - `components/` – JavaScript UI components
    - `services/` – Frontend service modules
    - `styles/` – CSS stylesheets
    - `icons/` – Application icons
    - `sw.js` – Service Worker for PWA functionality
    - `manifest.json` – PWA manifest file
    - `offline.html` – Offline fallback page

- `data_prep/` – Jupyter notebooks for data analysis
- `img/` – Project images and logos
