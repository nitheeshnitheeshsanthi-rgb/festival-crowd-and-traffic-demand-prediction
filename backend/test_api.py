"""
Unit and integration tests for FestivalFlow AI FastAPI microservice.
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_historical_endpoint():
    response = client.get("/api/historical")
    assert response.status_code == 200
    data = response.json()
    assert "records" in data
    assert len(data["records"]) > 0

def test_forecast_endpoint():
    payload = {
        "festival_date": "2026-10-17",
        "final_event_end_time": "22:00",
        "expected_attendance": 40000,
        "rain_probability": 0.25,
        "temp_celsius": 29.0
    }
    response = client.post("/api/forecast", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "forecast_intervals" in data
    assert len(data["forecast_intervals"]) > 10

def test_crowd_risk_detection():
    payload = {
        "festival_date": "2026-10-17",
        "final_event_end_time": "22:00",
        "expected_attendance": 40000,
        "rain_probability": 0.25,
        "temp_celsius": 29.0
    }
    response = client.post("/api/crowd-risks", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risks" in data
    main_stop = next(r for r in data["risks"] if r["stop_id"] == "stop_a")
    assert main_stop["risk_level"] in ["Critical", "High"]

def test_bus_allocation_engine():
    payload = {
        "schedule": {
            "festival_date": "2026-10-17",
            "final_event_end_time": "22:00",
            "expected_attendance": 40000,
            "rain_probability": 0.25,
            "temp_celsius": 29.0
        }
    }
    response = client.post("/api/bus-allocation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "transfers" in data
    assert len(data["transfers"]) > 0
    # Donor stop retains at least 1 bus
    transfer = data["transfers"][0]
    assert transfer["buses_count"] >= 1
    assert transfer["buses_count"] <= 3

def test_predict_peak_endpoint():
    payload = {
        "expected_attendance": 40000,
        "final_event_end_time": "22:00",
        "rain_probability": 0.35,
        "temp_celsius": 29.0,
        "festival_date": "2026-10-17",
        "selected_stop": "all"
    }
    response = client.post("/api/predict-peak", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "hourly_forecast" in data
    assert len(data["hourly_forecast"]) == 24
    assert "peak_hour" in data
    assert "peak_stop" in data
    assert "peak_risk_level" in data
    assert data["peak_risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert "per_stop_peaks" in data
    assert "stop_a" in data["per_stop_peaks"]
    assert data["model_metadata"]["label"] == "Model forecast based on synthetic dataset"

if __name__ == "__main__":
    test_health()
    test_historical_endpoint()
    test_forecast_endpoint()
    test_crowd_risk_detection()
    test_bus_allocation_engine()
    test_predict_peak_endpoint()
    print("All backend tests passed successfully!")
