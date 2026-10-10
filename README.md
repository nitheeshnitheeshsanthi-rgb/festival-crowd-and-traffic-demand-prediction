# FestivalFlow AI – Advance Crowd Prediction and Smart Bus Planning

> **7-Day Advance Crowd Demand Forecasting, Risk Detection, Proactive Bus Redeployment Allocation, and Gemini Operations Assistant for Temple Festival Closing Nights.**

---

## 1. Problem Scenario & Key Insight

### The Scenario
On a historic temple festival closing night (e.g., Grand Chithirai Festival / Brahmotsavam / Maha Deeparadhana), approximately **40,000 devotees** need to leave a compact town within a **2-hour window**.
- **Main Bus Stand (North Gate)**: Situated 400m from the sanctum exit, has **12 scheduled buses** and becomes dangerously overcrowded with over **4,400 passengers waiting on platforms**, exceeding safe physical limits by 190%.
- **East Bypass Stop (Ring Road)**: Situated **2.0 km away**, has **4 scheduled buses** idling with virtually empty seats (<15% utilization).

### The Core Innovation: Proactive Transport Planning
**The crowd is 100% predictable 7 days in advance.**
The ceremonial programme, final-event ending time (e.g., 22:00 Maha Deeparadhana), expected attendance (40,000), and meteorological forecast are available 7 days earlier.
Rather than waiting for the crush to begin and dispatching buses reactively into traffic gridlock:
- FestivalFlow AI forecasts 15-minute interval demand for every stop.
- It detects the deficit at the Main Stand and surplus at the East Stand.
- It calculates route physics (2.0 km distance, 18-minute transit in festival crawl).
- It generates a mandatory **proactive dispatch order** to redeploy 3 buses from East Stop at **21:37**, ensuring they dock at the Main Terminal by **21:55**, 15 minutes **before** the final ceremony concludes!
- Result: **Max passenger wait time plunges from 110 minutes to 18 minutes (-83.6%)**, and platform stampede risk is completely neutralized.

---

## 2. System Architecture & Tech Stack

```
                                  [ FestivalFlow AI Architecture ]

  7-Day Advance Inputs
  ┌────────────────────────┐      ┌───────────────────────────────┐      ┌─────────────────────────────────┐
  │ Festival Programme     │      │ Scikit-Learn Demand Predictor │      │ Bus Allocation Engine           │
  │ • Date: 2026-10-17     │ ───> │ • 15-min interval regression  │ ───> │ • Fleet deficit/surplus balance │
  │ • Attendance: 40,000   │      │ • Weather acceleration shift  │      │ • 2.0 km transit physics        │
  │ • End Time: 22:00      │      │ • Safe capacity boundaries    │      │ • Pre-surge docking guarantee   │
  │ • Rain Prob: 35%       │      └───────────────────────────────┘      └─────────────────────────────────┘
  └────────────────────────┘                      │                                       │
                                                  ▼                                       ▼
                                  ┌───────────────────────────────┐      ┌─────────────────────────────────┐
                                  │ Google Gemini 3.8 Flash       │      │ Interactive Dashboard           │
                                  │ • Server-side synthesis       │ ───> │ • Leaflet + OpenStreetMap       │
                                  │ • Police tactical checklist   │      │ • Recharts demand vs capacity   │
                                  │ • Zero-hallucination guard    │      │ • Reactive vs Proactive matrix  │
                                  └───────────────────────────────┘      └─────────────────────────────────┘
```

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React, Motion.
- **Maps**: Leaflet + OpenStreetMap with custom animated corridor markers.
- **Charts**: Recharts 15-minute time-series area and line charts.
- **Backend (Python)**: FastAPI, Uvicorn, Pandas, Scikit-learn, NumPy.
- **Full-Stack Runtime**: Express.js server and Vite dev middleware with `@google/genai` server-side integration.
- **GenAI**: Google Gemini API (`gemini-3.8-flash`) via official `@google/genai` TypeScript SDK and Python SDK.
- **Deployment**: Vercel (Frontend / Full-stack) & Render / Cloud Run (FastAPI microservice).

---

## 3. Project Directory Structure

```
├── .env.example                     # Environment template (GEMINI_API_KEY, PORT)
├── metadata.json                    # AI Studio applet capabilities & metadata
├── package.json                     # Node dependencies & build scripts
├── index.html                       # HTML entry point with synced meta & Leaflet CDN
├── vite.config.ts                   # Vite configuration with API middleware plugin
├── server.ts                        # Full-stack Node/Express server for production
├── README.md                        # Documentation & evaluation manual
│
├── server/
│   └── apiHandler.ts                # Server-side Gemini & API routing logic
│
├── backend/                         # Standalone Python + FastAPI ML Microservice
│   ├── main.py                      # FastAPI app with 5 core endpoints
│   ├── ml_model.py                  # Scikit-learn Random Forest regression model
│   ├── bus_allocator.py             # Physics-constrained bus redeployment optimizer
│   ├── synthetic_data.py            # 15-min synthetic crowd distribution generator
│   ├── test_api.py                  # Unit and integration test suite
│   ├── requirements.txt             # Python packages (FastAPI, scikit-learn, pandas)
│   ├── Dockerfile                   # Docker containerfile for Render deployment
│   └── data/
│       ├── historical_festival_data.csv # Multi-year calibrated festival records
│       └── schema.json              # JSON schema for synthetic dataset
│
└── src/
    ├── App.tsx                      # Master layout, navigation tabs, and modal controls
    ├── main.tsx                     # React 19 root bootstrap
    ├── index.css                    # Tailwind CSS imports & Leaflet dark popup styles
    ├── types/
    │   └── festival.ts              # TypeScript interfaces for schedule, forecast, bus plan
    ├── services/
    │   ├── api.ts                   # Client API calls with resilient fallback handling
    │   └── simulationEngine.ts      # Mathematical demand model & allocation engine
    └── components/
        ├── Header.tsx               # Top command bar, scenario pills, tab navigation
        ├── KpiCards.tsx             # Executive metrics (Surge, Risk, Deficit, Redeployment)
        ├── InteractiveMap.tsx       # Leaflet map with stop markers and 2km transfer polyline
        ├── DemandForecastChart.tsx  # Recharts 15-min demand vs capacity curves & ML notice
        ├── CrowdRiskPanel.tsx       # Safety capacity audit cards (Low to Critical)
        ├── BusAllocationView.tsx    # Step-by-step vehicle redeployment plan & dispatch order
        ├── GeminiAssistant.tsx      # Gemini 3.8 Flash strategic operations briefing
        ├── ScheduleManager.tsx      # Festival schedule editor & 7-day preparation timeline
        ├── ReactiveVsProactive.tsx  # Side-by-side comparison matrix (reactive vs proactive)
        ├── WeatherAndHistory.tsx    # Weather sliders & historical festival dataset table
        ├── WhatIfSimulator.tsx      # Interactive sensitivity simulator modal with presets
        └── ExportModal.tsx          # Download JSON dispatch manifest, CSV, and TXT directives
```

---

## 4. Functional Modules

### Module 1: Festival Schedule Manager
- Configure festival date, expected attendance (default 40,000), and final-event conclusion time.
- Chronological breakdown of key rituals (Flag lowering, Chariot procession, Maha Deeparadhana).
- **Interactive 7-Day Timeline (D-7 to D-0)** outlining governance milestones from initial schedule lockdown to pre-surge bus staging.

### Module 2: Weather & Historical Data
- Weather forecast inputs: Temperature (°C), Rain Probability (0-100%), Wind speed, Condition.
- Rain factor shifts the crowd egress curve 15-20 minutes earlier as pilgrims rush to seek shelter.
- Historical dataset viewer displaying prior festival incidents (2023-2025) and crowd shares.

### Module 3: Passenger Demand Forecasting
- 15-minute time series forecast modeling passenger arrival curves from -105 to +120 minutes around event ending.
- Feature parameters: minutes from event end, expected attendance, rain probability, stop proximity, base share.
- ML baseline model disclosure explaining synthetic training calibration and ±12% confidence bounds.

### Module 4: Crowd Risk Detection
- Calculates passenger demand against each stop's safe structural capacity.
- Risk Tiers:
  - **Low (<60% load)**: Emerald, orderly boarding.
  - **Medium (60-85% load)**: Yellow, manageable queues.
  - **High (85-110% load)**: Amber, platform spilling onto road.
  - **Critical (>110% load)**: Rose, severe crush/stampede hazard.
- Estimates peak hazard window (e.g., 22:15 - 23:15).

### Module 5: Bus Allocation Engine
- Computes required fleet based on 65 passengers/bus and 1.5 trips per 90-minute rush window.
- Physics and operational constraints:
  - Inter-stop corridor distance: **2.0 km**.
  - Congested transit speed: **8.5 km/h** (~14 min transit + 4 min buffer = **18 min lead time**).
  - Donor retention rule: **Never strand donor stop** (always keeps at least 1 bus at East Stand).
  - Timeliness verification: Arrives 15 minutes before the crowd leaves the temple.

### Module 6: GenAI Planning Assistant
- Connects to Google Gemini (`gemini-3.8-flash`) through server-side `@google/genai`.
- Strict numerical grounding: Uses exact model outputs to prevent numerical hallucination.
- Generates:
  1. Executive Operations Directive.
  2. Root-cause analysis of why Stop A is overwhelmed while Stop B idles.
  3. 5-point actionable checklist for Transport Commissioners and Police.
  4. Environmental sensitivity explanation.

### Module 7: Interactive Dashboard
- Live Leaflet map with OpenStreetMap tiles, stop density circles, and 2.0 km transfer route.
- Recharts 15-minute curves comparing arrival demand, scheduled capacity, and proactive augmented clearance.
- Interactive **What-If Simulator** with instant presets (Standard, Downpour, Moderate, Mega Crowd).
- Reactive vs Proactive head-to-head comparison matrix.

---

## 5. Setup & Running Instructions

### Option A: Running the Full-Stack Web App (Recommended)

1. Clone or open the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY in .env
   ```
4. Start the interactive development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. Build for production:
   ```bash
   npm run build
   node server.ts
   ```

---

### Option B: Running the Python + FastAPI Microservice

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Run automated test suite:
   ```bash
   python test_api.py
   ```
5. Start the FastAPI microservice:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   FastAPI interactive OpenAPI docs will be available at `http://localhost:8000/docs`.

---

## 6. Sample API Endpoints & Responses

### 1. `POST /api/forecast`
**Request:**
```json
{
  "festival_date": "2026-10-17",
  "final_event_end_time": "22:00",
  "expected_attendance": 40000,
  "rain_probability": 0.35,
  "temp_celsius": 29.0
}
```

**Response Sample:**
```json
{
  "forecast_intervals": [
    {
      "timestamp": "2026-10-17T22:00:00",
      "time_str": "22:00",
      "stop_id": "stop_a",
      "stop_name": "Main Bus Stand (North Gate)",
      "minutes_since_event_end": 0,
      "passenger_arrivals": 4120,
      "scheduled_buses": 12,
      "is_simulated": true
    }
  ],
  "total_intervals": 48
}
```

### 2. `POST /api/bus-allocation`
**Request:**
```json
{
  "schedule": {
    "festival_date": "2026-10-17",
    "final_event_end_time": "22:00",
    "expected_attendance": 40000,
    "rain_probability": 0.35,
    "temp_celsius": 29.0
  }
}
```

**Response Sample:**
```json
{
  "summary": {
    "total_scheduled_buses": 18,
    "total_buses_required": 25,
    "total_transfers_recommended": 3,
    "transit_lead_time_minutes": 18
  },
  "transfers": [
    {
      "transfer_id": "TRF-001",
      "from_stop_id": "stop_b",
      "from_stop_name": "East Bypass Stop (Ring Road)",
      "to_stop_id": "stop_a",
      "to_stop_name": "Main Bus Stand (North Gate)",
      "buses_count": 3,
      "distance_km": 2.0,
      "scheduled_dispatch_time": "21:37",
      "estimated_arrival_time": "21:55",
      "is_proactive": true
    }
  ]
}
```

---

## 7. Deployment Guide

### Deploying Frontend to Vercel
1. Push project to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Set build command: `npm run build` and output directory: `dist`.
4. Configure environment variable `GEMINI_API_KEY`.

### Deploying Python Backend to Render
1. In Render, select **New Web Service** and link your repo.
2. Select **Docker** environment (using `backend/Dockerfile`), or **Python** environment with root directory set to `backend`.
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Configure environment variables (`GEMINI_API_KEY`).

---

## 8. License
Apache-2.0 License. Built for hackathon demonstration of proactive transit intelligence.
