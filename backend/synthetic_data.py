"""
FestivalFlow AI - Synthetic Data Generator
Generates realistic 15-minute time-series crowd surge data for temple festivals.
"""

import math
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

STOPS = [
    {
        "stop_id": "stop_a",
        "name": "Main Bus Stand (North Gate)",
        "distance_km": 0.4,
        "base_share": 0.82,
        "capacity": 2200,
        "scheduled_buses": 12
    },
    {
        "stop_id": "stop_b",
        "name": "East Bypass Stop (Ring Road Link)",
        "distance_km": 2.1,
        "base_share": 0.12,
        "capacity": 1500,
        "scheduled_buses": 4
    },
    {
        "stop_id": "stop_c",
        "name": "South Temple Feeder Stand",
        "distance_km": 1.5,
        "base_share": 0.06,
        "capacity": 800,
        "scheduled_buses": 2
    }
]

def generate_surge_curve(
    attendance: int = 40000,
    event_end_hour: int = 22,
    event_end_minute: int = 0,
    rain_probability: float = 0.25,
    temp_celsius: float = 29.0,
    festival_date_str: str = "2026-10-17"
) -> List[Dict[str, Any]]:
    """
    Simulates passenger departure distribution based on crowd physics:
    - Pre-event buildup (-120 min to -15 min)
    - Concluding ceremony rush (0 to +45 min) - peak surge
    - Dissipation tail (+60 to +180 min)
    - Rain acceleration factor: rain drives people to shelter/transit 25% faster
    """
    records = []
    base_date = datetime.strptime(festival_date_str, "%Y-%m-%d")
    event_end_time = base_date.replace(hour=event_end_hour, minute=event_end_minute)

    # 4-hour evaluation window: from -120 min to +120 min in 15-min buckets
    time_points = list(range(-120, 135, 15))

    # Calculate total departing ratio (usually ~90-95% of attendees use public bus/shuttle)
    transit_seeking_crowd = attendance * 0.88

    # Rain factor shifts the curve forward (people rush earlier when raining)
    peak_offset = -10 if rain_probability > 0.5 else 15

    for minute_offset in time_points:
        current_time = event_end_time + timedelta(minutes=minute_offset)
        
        # Log-normal/Gaussian composite surge probability density
        x = (minute_offset - peak_offset) / 38.0
        surge_intensity = math.exp(-0.5 * (x ** 2)) / (38.0 * math.sqrt(2 * math.pi))
        
        # Scaling multiplier so sum of probabilities across intervals captures the crowd
        interval_passengers = transit_seeking_crowd * surge_intensity * 15.0

        # Adjust for temperature & rain
        weather_factor = 1.0 + (rain_probability * 0.15) - ((temp_celsius - 28) * 0.01)
        interval_passengers *= max(0.8, weather_factor)

        # Distribute between stops
        for stop in STOPS:
            # Main stop absorbs even more share during rain due to closer proximity
            share = stop["base_share"]
            if rain_probability > 0.4 and stop["stop_id"] == "stop_a":
                share += 0.05
            elif rain_probability > 0.4 and stop["stop_id"] != "stop_a":
                share -= 0.025

            stop_passengers = int(round(interval_passengers * share))
            # Safe minimum noise
            noise = random.randint(-15, 15)
            stop_passengers = max(20, stop_passengers + noise)

            records.append({
                "timestamp": current_time.isoformat(),
                "time_str": current_time.strftime("%H:%M"),
                "stop_id": stop["stop_id"],
                "stop_name": stop["name"],
                "minutes_since_event_end": minute_offset,
                "attendance_tier": attendance,
                "rain_prob": rain_probability,
                "temp_celsius": temp_celsius,
                "passenger_arrivals": stop_passengers,
                "scheduled_buses": stop["scheduled_buses"],
                "is_simulated": True
            })

    return records

if __name__ == "__main__":
    data = generate_surge_curve()
    print(f"Generated {len(data)} synthetic record points.")
