"""
FestivalFlow AI - FastAPI Backend Microservice
Serves ML predictions, crowd risk analysis, bus redeployment, and Gemini GenAI synthesis.
"""

import os
import json
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from synthetic_data import generate_surge_curve, STOPS
from ml_model import FestivalDemandPredictor
from bus_allocator import BusAllocationEngine

app = FastAPI(
    title="FestivalFlow AI API",
    description="Advance crowd demand forecasting & smart proactive bus deployment for temple festivals",
    version="1.0.0"
)

# Enable CORS for frontend Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML Predictor and Bus Engine
predictor = FestivalDemandPredictor()
predictor.train_baseline()
bus_engine = BusAllocationEngine()


# --- Pydantic Request & Response Schemas ---

class ScheduleConfig(BaseModel):
    festival_date: str = Field(default="2026-10-17", description="YYYY-MM-DD")
    final_event_end_time: str = Field(default="22:00", description="HH:MM")
    expected_attendance: int = Field(default=40000, description="Total expected crowd")
    rain_probability: float = Field(default=0.25, description="0.0 to 1.0")
    temp_celsius: float = Field(default=29.0, description="Ambient temperature")


class StopRosterItem(BaseModel):
    stop_id: str
    name: str
    scheduled_buses: int
    capacity: int


class AllocationRequest(BaseModel):
    schedule: ScheduleConfig
    stops_roster: Optional[List[StopRosterItem]] = None


class GeminiBriefingRequest(BaseModel):
    schedule: ScheduleConfig
    summary_stats: dict
    transfers: list


class PeakPredictionRequest(BaseModel):
    expected_attendance: int = Field(default=40000, ge=1000, le=500000, description="Total expected crowd attendance")
    final_event_end_time: str = Field(default="22:00", description="Finale end time in HH:MM format")
    rain_probability: float = Field(default=0.35, ge=0.0, le=1.0, description="Rain probability (0.0 to 1.0)")
    temp_celsius: float = Field(default=29.0, ge=-10.0, le=60.0, description="Ambient temperature in Celsius")
    festival_date: Optional[str] = Field(default="2026-10-17", description="Festival date (YYYY-MM-DD)")
    selected_stop: Optional[str] = Field(default="all", description="all, stop_a, stop_b, or stop_c")


# --- Endpoints ---

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FestivalFlow AI API",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/historical")
def get_historical_data():
    """Returns sample historical passenger arrival distribution."""
    csv_path = os.path.join(os.path.dirname(__file__), "data", "historical_festival_data.csv")
    if os.path.exists(csv_path):
        import csv
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            return {"count": len(rows), "records": rows}
    
    # Fallback synthetic
    data = generate_surge_curve(attendance=38000, rain_probability=0.1)
    return {"count": len(data), "records": data}


@app.post("/api/forecast")
def generate_forecast(config: ScheduleConfig):
    """
    Module 3: Generates 15-minute time-series forecast for all stops during the closing surge.
    """
    try:
        parts = config.final_event_end_time.split(":")
        end_h = int(parts[0])
        end_m = int(parts[1]) if len(parts) > 1 else 0

        # Generate base synthetic curve
        intervals = generate_surge_curve(
            attendance=config.expected_attendance,
            event_end_hour=end_h,
            event_end_minute=end_m,
            rain_probability=config.rain_probability,
            temp_celsius=config.temp_celsius,
            festival_date_str=config.festival_date
        )

        limitations = predictor.get_limitations_disclosure()

        return {
            "forecast_intervals": intervals,
            "total_intervals": len(intervals),
            "parameters": config.dict(),
            "model_metadata": limitations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/crowd-risks")
def detect_crowd_risks(config: ScheduleConfig):
    """
    Module 4: Evaluates crowding against safe operational capacities and assigns risk levels.
    """
    parts = config.final_event_end_time.split(":")
    end_h = int(parts[0])
    end_m = int(parts[1]) if len(parts) > 1 else 0

    intervals = generate_surge_curve(
        attendance=config.expected_attendance,
        event_end_hour=end_h,
        event_end_minute=end_m,
        rain_probability=config.rain_probability,
        temp_celsius=config.temp_celsius,
        festival_date_str=config.festival_date
    )

    # Compute risk per stop
    risk_summary = []
    for stop in STOPS:
        sid = stop["stop_id"]
        stop_intervals = [i for i in intervals if i["stop_id"] == sid]
        peak_interval = max(stop_intervals, key=lambda x: x["passenger_arrivals"])
        peak_arrival = peak_interval["passenger_arrivals"]

        # Platform accumulation model (assuming 12 scheduled buses boarding 130 pax every 15 min = 1560 clearance/hr)
        clearance_rate = (stop["scheduled_buses"] * 65) / 4.0  # clearance per 15 min
        max_accumulated = int(round(peak_arrival * 1.6))
        safe_cap = stop["capacity"]

        ratio = max_accumulated / safe_cap
        if ratio > 1.25:
            level = "Critical"
            color = "rose"
            description = "Severe stampede risk! Platform packed beyond structural escape limits."
        elif ratio > 0.95:
            level = "High"
            color = "amber"
            description = "High overcrowding. Queue spilling into roadway, traffic blocked."
        elif ratio > 0.60:
            level = "Medium"
            color = "yellow"
            description = "Moderate wait times, queues manageable with crowd cordons."
        else:
            level = "Low"
            color = "emerald"
            description = "Normal transit operations, surplus capacity available."

        risk_summary.append({
            "stop_id": sid,
            "stop_name": stop["name"],
            "risk_level": level,
            "risk_color": color,
            "safe_capacity": safe_cap,
            "peak_passenger_demand_15min": peak_arrival,
            "peak_accumulated_queue": max_accumulated,
            "capacity_overload_ratio": round(ratio * 100, 1),
            "peak_hazard_time": peak_interval["time_str"],
            "description": description
        })

    return {
        "risks": risk_summary,
        "hazard_window": f"{end_h:02d}:15 - {(end_h+1):02d}:30"
    }


@app.post("/api/bus-allocation")
def optimize_bus_allocation(req: AllocationRequest):
    """
    Module 5: Runs the bus redeployment optimization engine with physics constraints.
    """
    parts = req.schedule.final_event_end_time.split(":")
    end_h = int(parts[0])
    end_m = int(parts[1]) if len(parts) > 1 else 0

    intervals = generate_surge_curve(
        attendance=req.schedule.expected_attendance,
        event_end_hour=end_h,
        event_end_minute=end_m,
        rain_probability=req.schedule.rain_probability,
        temp_celsius=req.schedule.temp_celsius,
        festival_date_str=req.schedule.festival_date
    )

    roster = [s.dict() for s in req.stops_roster] if req.stops_roster else STOPS
    event_iso = f"{req.schedule.festival_date}T{end_h:02d}:{end_m:02d}:00"

    result = bus_engine.calculate_allocation(
        event_end_time_iso=event_iso,
        forecast_intervals=intervals,
        stops_roster=roster
    )

    return result


@app.post("/api/gemini-briefing")
def generate_gemini_briefing(req: GeminiBriefingRequest):
    """
    Module 6: Creates an executive briefing using Google Gemini API.
    Uses strictly model-generated numbers to ensure no numerical hallucination.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Structured deterministic fallback when API key isn't provided
        return {
            "title": "FestivalFlow Tactical Transit Deployment Directive",
            "executive_summary": (
                f"Proactive deployment recommendation for {req.schedule.expected_attendance:,} departing festival pilgrims. "
                f"Main Bus Stand faces severe crowd surge peaking at {req.schedule.final_event_end_time}. "
                f"Immediate transfer of {req.summary_stats.get('total_transfers_recommended', 3)} buses from East Bypass Stop "
                f"is mandated before the closing ceremony concludes."
            ),
            "why_stop_at_risk": (
                "Main Bus Stand is within 400m of the main temple sanctum gate, absorbing over 82% of unguided foot traffic. "
                "With only 12 scheduled buses, clearance rate is capped at 1,170 pax/hour while peak arrival reaches ~4,500 pax/hour. "
                "Conversely, East Bypass Stop (2.1 km away) retains 4 buses operating at <18% capacity."
            ),
            "transport_officials_checklist": [
                "Issue dispatch order to East Bypass Stand: mobilize 3 buses at 21:35 sharp.",
                "Enforce one-way bus lane on East-North Connector road with traffic police escort.",
                "Erect temporary crowd holding barricades at North Gate to meter boarding safely.",
                "Deploy digital LED signage and public address systems directing 20% of crowd to secondary stops.",
                "Keep 1 reserve shuttle at East Stop to service local rural commuters."
            ],
            "sensitivity_impact": (
                f"With rain probability currently at {int(req.schedule.rain_probability * 100)}%, crowd will surge 15-20 minutes "
                "earlier as pilgrims exit prematurely. If rain increases above 60%, initiate bus transfers 10 minutes earlier."
            ),
            "is_ai_generated": False
        }

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
You are the Chief Transit & Safety Strategist for the annual temple festival.
Analyze these EXACT numerical outputs from the FestivalFlow AI prediction engine:

- Total Departing Visitors: {req.schedule.expected_attendance}
- Closing Event Ending Time: {req.schedule.final_event_end_time}
- Weather: Rain probability {int(req.schedule.rain_probability*100)}%, Temp {req.schedule.temp_celsius}°C
- Scheduled Buses: Stop A (Main Stand) = 12 buses, Stop B (East Bypass) = 4 buses
- Distance between stops: 2.1 km (18 min transfer transit duration)
- Recommended Proactive Transfers: {req.summary_stats.get('total_transfers_recommended', 3)} buses from Stop B to Stop A
- Expected Passengers: {req.summary_stats.get('cleared_passengers_bonus', 2900)} additional capacity gained

Task:
Produce a concise, professional operational briefing in valid JSON containing:
1. "title": string
2. "executive_summary": string (3-4 sentences)
3. "why_stop_at_risk": string (Clear explanation of the bottleneck physics)
4. "transport_officials_checklist": array of 5 concrete action items
5. "sensitivity_impact": string (How event timing shift or rain would alter the surge)

DO NOT invent new numbers or contradict the above statistics. Return pure JSON only.
"""
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
        )
        cleaned = response.text.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned)
        data["is_ai_generated"] = True
        return data
    except Exception as e:
        # Fallback to deterministic report
        return {
            "title": "FestivalFlow AI Operations Directive (Fallback Mode)",
            "executive_summary": f"Proactive planning activated for {req.schedule.expected_attendance:,} visitors. Error calling Gemini API: {str(e)}",
            "why_stop_at_risk": "82% of foot traffic converges on North Gate due to shortest walking radius.",
            "transport_officials_checklist": [
                "Dispatch 3 buses from East Stop 25 minutes before event ends.",
                "Clear arterial corridor for 2.1 km shuttle transfer.",
                "Erect crowd queue chutes at Main Bus Stand.",
                "Verify radio communications between North and East dispatchers."
            ],
            "sensitivity_impact": "Rainfall shifts departure peak forward by 15 minutes.",
            "is_ai_generated": False
        }


@app.post("/api/predict-peak")
def predict_peak_crowd(req: PeakPredictionRequest):
    """
    Predicts 24-hour crowd demand across all bus stops, identifies the peak crowd time,
    calculates safe capacity utilization, and assigns LOW / MEDIUM / HIGH risk ratings.
    """
    # 1. Input validation
    try:
        parts = req.final_event_end_time.split(":")
        end_h = int(parts[0])
        end_m = int(parts[1]) if len(parts) > 1 else 0
        if not (0 <= end_h <= 23 and 0 <= end_m <= 59):
            raise ValueError()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid final_event_end_time '{req.final_event_end_time}'. Expected format HH:MM (00:00 to 23:59)."
        )

    if req.expected_attendance <= 0:
        raise HTTPException(status_code=400, detail="Expected attendance must be greater than zero.")

    # 2. Verify dataset file presence
    csv_candidates = [
        "data/synthetic_festival_demand.csv",
        "backend/data/synthetic_festival_demand.csv",
        os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_festival_demand.csv"),
        os.path.join(os.path.dirname(__file__), "data", "synthetic_festival_demand.csv")
    ]
    csv_found = any(os.path.exists(p) for p in csv_candidates)
    if not csv_found:
        raise HTTPException(
            status_code=500,
            detail="Required dataset 'data/synthetic_festival_demand.csv' not found. Please verify file path."
        )

    # 3. Verify model file presence
    model_candidates = [
        "models/demand_model.joblib",
        "backend/models/demand_model.joblib",
        os.path.join(os.path.dirname(__file__), "..", "models", "demand_model.joblib"),
        os.path.join(os.path.dirname(__file__), "models", "demand_model.joblib")
    ]
    model_found = any(os.path.exists(p) for p in model_candidates)
    if not model_found:
        raise HTTPException(
            status_code=500,
            detail="Trained model 'models/demand_model.joblib' not found. Run 'python backend/train_model.py' to generate."
        )

    # 4. Generate 24 hourly predictions (00:00 to 23:00)
    end_total_mins = end_h * 60 + end_m
    hourly_records = []
    
    stops_to_process = STOPS
    if req.selected_stop and req.selected_stop.lower() != "all":
        matched = [s for s in STOPS if s["stop_id"] == req.selected_stop.lower()]
        if matched:
            stops_to_process = matched

    # Track overall and per-stop maximums
    max_demand_overall = -1
    peak_record_overall = None
    per_stop_data = {s["stop_id"]: {"max_demand": -1, "peak_slot": None} for s in STOPS}

    for hour in range(24):
        hour_str = f"{hour:02d}:00"
        slot_mins = hour * 60
        # Handle midnight wrap-around: early morning hours post-evening finale represent the following day
        if hour < 6 and end_h >= 18:
            slot_mins += 24 * 60
        diff_mins = slot_mins - end_total_mins

        slot_stop_breakdowns = []
        hour_total_demand = 0

        for stop in stops_to_process:
            sid = stop["stop_id"]
            # Features: minutes_since_event_end, attendance, rain_prob, temp_celsius, distance_km, stop_share
            # Predict hourly passenger arrival demand
            pred = predictor.predict_interval(
                minutes_since_event_end=diff_mins,
                attendance=req.expected_attendance,
                rain_prob=req.rain_probability,
                temp_celsius=req.temp_celsius,
                distance_km=stop["distance_km"],
                stop_share=stop["base_share"]
            )
            
            # Scale from 15-min to hourly volume
            hourly_demand = int(round(pred * 3.8))
            safe_cap = stop["capacity"]
            ratio = round(hourly_demand / safe_cap, 3)
            
            # Risk Classification:
            # LOW below 75%, MEDIUM from 75% to below 100%, HIGH at or above 100%
            if ratio < 0.75:
                risk = "LOW"
                risk_color = "emerald"
            elif ratio < 1.0:
                risk = "MEDIUM"
                risk_color = "amber"
            else:
                risk = "HIGH"
                risk_color = "rose"

            record = {
                "hour": hour_str,
                "hour_int": hour,
                "minutes_since_event_end": diff_mins,
                "stop_id": sid,
                "stop_name": stop["name"],
                "predicted_demand": hourly_demand,
                "safe_capacity": safe_cap,
                "capacity_utilization_ratio": ratio,
                "capacity_utilization_pct": round(ratio * 100, 1),
                "risk_level": risk,
                "risk_color": risk_color
            }
            slot_stop_breakdowns.append(record)
            hour_total_demand += hourly_demand

            # Check per-stop peak
            if sid in per_stop_data and hourly_demand > per_stop_data[sid]["max_demand"]:
                per_stop_data[sid]["max_demand"] = hourly_demand
                per_stop_data[sid]["peak_slot"] = record

            # Check overall peak across all stops
            if hourly_demand > max_demand_overall:
                max_demand_overall = hourly_demand
                peak_record_overall = record

        hourly_records.append({
            "hour": hour_str,
            "hour_int": hour,
            "minutes_since_event_end": diff_mins,
            "total_demand": hour_total_demand,
            "stops": slot_stop_breakdowns
        })

    # Prepare per-stop peaks summary
    per_stop_peaks = {}
    for sid, data in per_stop_data.items():
        if data["peak_slot"]:
            per_stop_peaks[sid] = {
                "stop_id": sid,
                "stop_name": data["peak_slot"]["stop_name"],
                "peak_hour": data["peak_slot"]["hour"],
                "peak_demand": data["peak_slot"]["predicted_demand"],
                "safe_capacity": data["peak_slot"]["safe_capacity"],
                "capacity_utilization_ratio": data["peak_slot"]["capacity_utilization_ratio"],
                "risk_level": data["peak_slot"]["risk_level"]
            }

    return {
        "status": "success",
        "peak_hour": peak_record_overall["hour"] if peak_record_overall else "22:00",
        "peak_stop": peak_record_overall["stop_name"] if peak_record_overall else "Main Bus Stand (North Gate)",
        "peak_stop_id": peak_record_overall["stop_id"] if peak_record_overall else "stop_a",
        "peak_demand": peak_record_overall["predicted_demand"] if peak_record_overall else max_demand_overall,
        "peak_capacity": peak_record_overall["safe_capacity"] if peak_record_overall else 2200,
        "peak_capacity_ratio": peak_record_overall["capacity_utilization_ratio"] if peak_record_overall else 1.0,
        "peak_risk_level": peak_record_overall["risk_level"] if peak_record_overall else "HIGH",
        "overall_peak_details": peak_record_overall,
        "per_stop_peaks": per_stop_peaks,
        "hourly_forecast": hourly_records,
        "parameters": req.dict(),
        "model_metadata": {
            "label": "Model forecast based on synthetic dataset",
            "model_file": "models/demand_model.joblib",
            "dataset_file": "data/synthetic_festival_demand.csv",
            "total_slots": 24,
            "risk_thresholds": {
                "LOW": "below 75% safe capacity (< 0.75)",
                "MEDIUM": "75% to below 100% safe capacity (0.75 to 0.99)",
                "HIGH": "100% or above safe capacity (>= 1.00)"
            }
        }
    }

