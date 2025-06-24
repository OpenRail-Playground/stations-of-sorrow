# Stations of Sun

## Overview

Stations of Sun is an open-source project developed during the Hack4Rail 2025 hackathon, organized by SBB, ÖBB, and DB in partnership with the OpenRail Association. The project leverages real-time passenger counting data (via Paxcounter devices) to help railway station managers and stakeholders identify usage patterns, optimize resources, and improve the passenger experience—especially for weekend and holiday travelers.

## Features

- Data analysis notebooks for passenger congestion and holiday impact
- Dashboard mockups for visualizing key station metrics
- Backend scripts for data integration and prototyping
- Modular and extensible codebase for further development

## Getting Started

### Prerequisites

- Python 3.x
- Jupyter Notebook
- (Optional) Node.js for dashboard/frontend development

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/OpenRail-Playground/stations-of-sun.git
   cd stations-of-sun
   ```

2. (Optional) Create and activate a virtual environment:

   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install Python dependencies:

   ```sh
   pip install -r requirements.txt
   ```

4. Start Jupyter Notebook:

   ```sh
   jupyter notebook data_prep/
   ```

## Project Structure

- `data_prep/` – Jupyter notebooks for data analysis
- `src/` – Application scripts, dashboard, and styles
- `img/` – Project images and logos
