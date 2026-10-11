export interface FestivalSchedule {
  festivalName: string;
  location: string;
  festivalDate: string;
  expectedAttendance: number;
  finalEventName: string;
  finalEventEndTime: string; // "22:00"
  weather: WeatherForecast;
  keyEvents: FestivalEventItem[];
}

export interface WeatherForecast {
  condition: 'Clear' | 'Humid' | 'Light Rain' | 'Heavy Thunderstorm' | 'Cloudy';
  tempCelsius: number;
  rainProbability: number; // 0.0 - 1.0
  humidityPercent: number;
  windSpeedKmh: number;
}

export interface FestivalEventItem {
  id: string;
  title: string;
  time: string;
  location: string;
  description: string;
  crowdMovementFactor: number; // 0 to 1 scale
}

export interface TransitStop {
  id: string;
  name: string;
  shortCode: string;
  lat: number;
  lng: number;
  distanceFromTempleKm: number;
  safeCapacity: number;
  burstCapacity: number;
  scheduledBuses: number;
  baseCrowdShare: number;
  status: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
}

export interface ForecastTimepoint {
  timestamp: string;
  timeStr: string;
  minutesFromEnd: number;
  stopId: string;
  stopName: string;
  demand: number;
  capacityProvided: number;
  accumulatedQueue: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface CrowdRiskAssessment {
  stopId: string;
  stopName: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskColor: string;
  safeCapacity: number;
  peakPassengerDemand: number;
  peakAccumulatedQueue: number;
  capacityOverloadRatio: number; // e.g. 175%
  peakHazardWindow: string; // "22:15 - 23:00"
  description: string;
}

export interface ServiceLossTradeoff {
  donorRouteName: string;
  donorStopId: string;
  donorStopName: string;
  recipientStopName: string;
  recipientRouteName: string;
  busesBefore: number;
  busesAfter: number;
  busesLost: number;
  headwayBeforeMinutes: number;
  headwayAfterMinutes: number;
  headwayIncreaseMinutes: number;
  capacityBeforePaxPerHour: number;
  capacityAfterPaxPerHour: number;
  capacityLostPaxPerHour: number;
  peakDemandPaxPerHour: number;
  utilizationBeforePct: number;
  utilizationAfterPct: number;
  affectedPassengersEstimate: number;
  serviceImpactTier: 'Acceptable Trade-off' | 'Moderate Degradation' | 'Severe Cut';
  tradeoffSummary: string;
  mitigationMeasures: string[];
}

export interface BusTransferRecommendation {
  transferId: string;
  fromStopId: string;
  fromStopName: string;
  fromRouteName: string;
  toStopId: string;
  toStopName: string;
  toRouteName: string;
  busesCount: number;
  distanceKm: number;
  transitMinutes: number;
  dispatchTime: string;
  arrivalTime: string;
  isProactive: boolean;
  operationalRationale: string;
  feasibility: {
    isFeasible: boolean;
    donorRetentionGuaranteed: boolean;
    arrivesBeforeSurge: boolean;
    transitRoute: string;
  };
  serviceLossTradeoff: ServiceLossTradeoff;
}

export interface AllocationPlan {
  summary: {
    totalFleetSize: number;
    totalScheduledBuses: number;
    totalBusesRequired: number;
    totalTransfersRecommended: number;
    netShortfallBeforeTransfers: number;
    netShortfallAfterTransfers: number;
    clearedPassengersBonus: number;
    transitLeadTimeMinutes: number;
    isFleetFixed: boolean;
    netFleetDelta: number;
  };
  stops: {
    stopId: string;
    stopName: string;
    routeName: string;
    scheduledBuses: number;
    busesAfterRedeployment: number;
    busDelta: number;
    busesRequired: number;
    netDeficit: number;
    surplusAvailable: number;
    headwayBeforeMin: number;
    headwayAfterMin: number;
    capacityUtilizationPct: number;
    capacityUtilizationAfterPct: number;
    serviceStatus: 'Surge Recipient' | 'Donor (Service Reduced)' | 'Baseline Maintained';
    isCritical: boolean;
  }[];
  transfers: BusTransferRecommendation[];
}

export interface TimelineMilestone {
  dayLabel: string; // "D-7", "D-5", ... "D-0"
  hoursFromEvent: string;
  title: string;
  targetCategory: 'Governance' | 'Forecasting' | 'Fleet Staging' | 'Operations' | 'Surge Response';
  description: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  actionableStep: string;
}

export interface GeminiBriefing {
  title: string;
  executiveSummary: string;
  whyStopAtRisk: string;
  serviceTradeOffSummary?: string;
  transportOfficialsChecklist: string[];
  sensitivityImpact: string;
  isAiGenerated: boolean;
}

export interface HourlyStopForecast {
  hour: string;
  hour_int: number;
  minutes_since_event_end: number;
  stop_id: string;
  stop_name: string;
  predicted_demand: number;
  safe_capacity: number;
  capacity_utilization_ratio: number;
  capacity_utilization_pct: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_color: string;
}

export interface HourlySlotForecast {
  hour: string;
  hour_int: number;
  minutes_since_event_end: number;
  total_demand: number;
  stops: HourlyStopForecast[];
}

export interface StopPeakSummary {
  stop_id: string;
  stop_name: string;
  peak_hour: string;
  peak_demand: number;
  safe_capacity: number;
  capacity_utilization_ratio: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PeakPredictionResponse {
  status: string;
  peak_hour: string;
  peak_stop: string;
  peak_stop_id: string;
  peak_demand: number;
  peak_capacity: number;
  peak_capacity_ratio: number;
  peak_risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  overall_peak_details: HourlyStopForecast;
  per_stop_peaks: { [stopId: string]: StopPeakSummary };
  hourly_forecast: HourlySlotForecast[];
  parameters: {
    expected_attendance: number;
    final_event_end_time: string;
    rain_probability: number;
    temp_celsius: number;
    festival_date: string;
    selected_stop: string;
  };
  model_metadata: {
    label: string;
    model_file: string;
    dataset_file: string;
    total_slots: number;
    risk_thresholds: {
      LOW: string;
      MEDIUM: string;
      HIGH: string;
    };
  };
}

export interface SectorCrowdDensity {
  name: string;
  count: number;
  density_sqm: number;
}

export interface DetectionBox {
  id: number;
  bbox: [number, number, number, number]; // [x, y, w, h]
  bbox_norm?: [number, number, number, number];
  confidence: number;
  label: string;
  sector?: string;
}

export interface LiveCameraObservation {
  stopId: string;
  stopName: string;
  sourceType: 'webcam' | 'cctv' | 'manual';
  streamName: string;
  streamUrl?: string;
  isConnected: boolean;
  peopleCount: number;
  confidence: number;
  densityLabel: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  inflowRate: number;
  outflowRate: number;
  totalEntries: number;
  totalExits: number;
  sectors: {
    sector_north_gate: SectorCrowdDensity;
    sector_east_concourse: SectorCrowdDensity;
    sector_central_plaza: SectorCrowdDensity;
    sector_bus_bay: SectorCrowdDensity;
  };
  detections: DetectionBox[];
  timestamp: string;
  modelUsed: string;
  isSensorDerived: boolean;
  disclaimer: string;
  processingTimeMs?: number;
}

