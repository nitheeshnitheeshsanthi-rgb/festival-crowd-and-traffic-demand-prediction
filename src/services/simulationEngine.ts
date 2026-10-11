import {
  FestivalSchedule,
  TransitStop,
  ForecastTimepoint,
  CrowdRiskAssessment,
  AllocationPlan,
  BusTransferRecommendation,
  TimelineMilestone,
} from '../types/festival';

export const DEFAULT_STOPS: TransitStop[] = [
  {
    id: 'stop_a',
    name: 'Main Bus Stand (North Gate)',
    shortCode: 'MBS-North',
    lat: 9.9195,
    lng: 78.1198,
    distanceFromTempleKm: 0.4,
    safeCapacity: 2200,
    burstCapacity: 2800,
    scheduledBuses: 12,
    baseCrowdShare: 0.82,
    status: 'Critical',
    description: 'Primary terminus situated 400m from sanctum exit. Historically captures 80%+ of pilgrims.',
  },
  {
    id: 'stop_b',
    name: 'East Bypass Stop (Ring Road)',
    shortCode: 'EBS-Ring',
    lat: 9.9320,
    lng: 78.1380,
    distanceFromTempleKm: 2.1,
    safeCapacity: 1500,
    burstCapacity: 2000,
    scheduledBuses: 4,
    baseCrowdShare: 0.12,
    status: 'Low',
    description: 'Secondary peripheral terminus 2.1 km away. Has 4 idling buses with very low footfall.',
  },
  {
    id: 'stop_c',
    name: 'South Rail Link Feeder Stand',
    shortCode: 'SRS-South',
    lat: 9.9110,
    lng: 78.1130,
    distanceFromTempleKm: 1.6,
    safeCapacity: 900,
    burstCapacity: 1200,
    scheduledBuses: 2,
    baseCrowdShare: 0.06,
    status: 'Low',
    description: 'Southern suburban link servicing rail interchange passengers.',
  },
];

export const DEFAULT_SCHEDULE: FestivalSchedule = {
  festivalName: 'Grand Chithirai Festival – Concluding Chariot Night',
  location: 'Historic Temple Town Central Enclave',
  festivalDate: '2026-10-17',
  expectedAttendance: 40000,
  finalEventName: 'Maha Deeparadhana & Royal Chariot Return',
  finalEventEndTime: '22:00',
  weather: {
    condition: 'Light Rain',
    tempCelsius: 29.0,
    rainProbability: 0.35,
    humidityPercent: 82,
    windSpeedKmh: 14,
  },
  keyEvents: [
    {
      id: 'ev-1',
      title: 'Sacred Flag Lowering Ritual (Dhwajarohanam)',
      time: '18:30',
      location: 'North Sanctum Gopuram',
      description: 'Devotees begin gathering along the inner perimeter.',
      crowdMovementFactor: 0.2,
    },
    {
      id: 'ev-2',
      title: 'Grand Chariot Final Circumambulation',
      time: '20:15',
      location: 'Four Mada Streets',
      description: 'Massive crowding reaches steady state of 35,000 in temple streets.',
      crowdMovementFactor: 0.45,
    },
    {
      id: 'ev-3',
      title: 'Maha Deeparadhana & Golden Chariot Entry (Final Event)',
      time: '22:00',
      location: 'East Sanctum Steps',
      description: 'Climactic ceremonial conclusion. 40,000 attendees simultaneously seek outbound transit within 2 hours.',
      crowdMovementFactor: 1.0,
    },
  ],
};

export const SEVEN_DAY_TIMELINE: TimelineMilestone[] = [
  {
    dayLabel: 'D-7',
    hoursFromEvent: '168 hrs prior',
    title: 'Programme Lockdown & Preliminary Forecast Run',
    targetCategory: 'Governance',
    description: 'Publish official festival schedule; feed event duration and 40,000 attendance target into FestivalFlow AI model.',
    status: 'Completed',
    actionableStep: 'Freeze ending time at 22:00; identify initial fleet gap of 14 buses.',
  },
  {
    dayLabel: 'D-5',
    hoursFromEvent: '120 hrs prior',
    title: 'Regional Weather Forecast Integration & Fleet Reservation',
    targetCategory: 'Forecasting',
    description: 'Incorporate 5-day meteorological predictions (light rain forecast accelerates departure rush by 20 minutes).',
    status: 'Completed',
    actionableStep: 'Place 6 auxiliary depot buses on cold standby across the district depot.',
  },
  {
    dayLabel: 'D-3',
    hoursFromEvent: '72 hrs prior',
    title: 'Inter-Stop Route Clearance & Barricade Plan',
    targetCategory: 'Fleet Staging',
    description: 'Designate the 2.0 km East-to-North connector as an Emergency Transit Rapid Corridor.',
    status: 'Completed',
    actionableStep: 'Coordinate with local traffic police to prevent private vehicle parking along the transfer route.',
  },
  {
    dayLabel: 'D-1',
    hoursFromEvent: '24 hrs prior',
    title: 'Driver Crew Briefing & GPS Staging Check',
    targetCategory: 'Operations',
    description: 'Verify 4 scheduled buses at East Bypass Stand; brief drivers on proactive transfer order at 21:35.',
    status: 'In Progress',
    actionableStep: 'Conduct radio check between North Gate controller and East Bypass depot supervisor.',
  },
  {
    dayLabel: 'D-0 (Evening)',
    hoursFromEvent: '-30 mins prior',
    title: 'Execution of Proactive Bus Redeployment',
    targetCategory: 'Surge Response',
    description: 'Trigger dispatch of 3 buses from East Stop to Main Stop at 21:35 so they dock at North Gate before 22:00.',
    status: 'Upcoming',
    actionableStep: 'Monitor live platform queue sensors and board departing pilgrims without queue collapse.',
  },
];

export function calculateDemandCurve(
  schedule: FestivalSchedule,
  stops: TransitStop[] = DEFAULT_STOPS
): ForecastTimepoint[] {
  const [endHourStr, endMinuteStr] = schedule.finalEventEndTime.split(':');
  const endHour = parseInt(endHourStr, 10) || 22;
  const endMinute = parseInt(endMinuteStr, 10) || 0;

  const totalAttendees = schedule.expectedAttendance;
  const transitSeekingCrowd = totalAttendees * 0.88; // 88% depart via bus
  const rainProb = schedule.weather.rainProbability;
  const peakShift = rainProb > 0.4 ? -10 : 15; // Rain drives crowd out earlier

  // 15-minute buckets from -105 mins to +120 mins
  const timeBuckets = [-105, -90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75, 90, 105, 120];

  const results: ForecastTimepoint[] = [];

  for (const stop of stops) {
    let accumulatedQueue = 0;
    // Clearance rate per 15 min: scheduled buses * 65 capacity / 3 trips per 45 min
    const scheduledRate15m = Math.round((stop.scheduledBuses * 65) / 3.2);

    for (const offset of timeBuckets) {
      const pointMinutes = endHour * 60 + endMinute + offset;
      const hours = Math.floor((pointMinutes + 1440) % 1440 / 60);
      const mins = Math.floor((pointMinutes + 1440) % 1440 % 60);
      const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

      // Gaussian bell with skew
      const x = (offset - peakShift) / 36.0;
      const intensity = Math.exp(-0.5 * (x * x)) / (36.0 * Math.sqrt(2 * Math.PI));
      const totalInterval = transitSeekingCrowd * intensity * 15.0;

      // Adjust for stop share and weather
      let stopShare = stop.baseCrowdShare;
      if (rainProb > 0.4 && stop.id === 'stop_a') {
        stopShare += 0.04;
      } else if (rainProb > 0.4) {
        stopShare -= 0.02;
      }

      const demand = Math.max(15, Math.round(totalInterval * stopShare));

      // Compute dynamic queue
      accumulatedQueue = Math.max(0, accumulatedQueue + demand - scheduledRate15m);

      let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      const overloadRatio = accumulatedQueue / stop.safeCapacity;
      if (overloadRatio > 1.25) {
        riskLevel = 'Critical';
      } else if (overloadRatio > 0.95) {
        riskLevel = 'High';
      } else if (overloadRatio > 0.6) {
        riskLevel = 'Medium';
      }

      results.push({
        timestamp: `${schedule.festivalDate}T${timeStr}:00`,
        timeStr,
        minutesFromEnd: offset,
        stopId: stop.id,
        stopName: stop.name,
        demand,
        capacityProvided: scheduledRate15m,
        accumulatedQueue,
        riskLevel,
      });
    }
  }

  return results;
}

export function evaluateCrowdRisks(
  timepoints: ForecastTimepoint[],
  stops: TransitStop[] = DEFAULT_STOPS
): CrowdRiskAssessment[] {
  return stops.map((stop) => {
    const stopPoints = timepoints.filter((tp) => tp.stopId === stop.id);
    const peakDemand = Math.max(...stopPoints.map((tp) => tp.demand), 100);
    const peakQueue = Math.max(...stopPoints.map((tp) => tp.accumulatedQueue), 50);
    const ratio = Math.round((peakQueue / stop.safeCapacity) * 100);

    const peakPoint = stopPoints.find((tp) => tp.accumulatedQueue === peakQueue) || stopPoints[0];

    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    let riskColor = 'emerald';
    let description = 'Operations stable. Ample safe waiting room with smooth boarding.';

    if (ratio > 125) {
      riskLevel = 'Critical';
      riskColor = 'rose';
      description = 'CRITICAL DANGER: Platform queue surpasses safe structural capacity. Severe crush risk if unmitigated.';
    } else if (ratio > 95) {
      riskLevel = 'High';
      riskColor = 'amber';
      description = 'High congestion: Queues spill across peripheral roadways, causing vehicular gridlock.';
    } else if (ratio > 60) {
      riskLevel = 'Medium';
      riskColor = 'yellow';
      description = 'Moderate crowding: Platforms near capacity; requires queue marshals and active boarding control.';
    }

    return {
      stopId: stop.id,
      stopName: stop.name,
      riskLevel,
      riskColor,
      safeCapacity: stop.safeCapacity,
      peakPassengerDemand: peakDemand,
      peakAccumulatedQueue: peakQueue,
      capacityOverloadRatio: ratio,
      peakHazardWindow: `${peakPoint?.timeStr || '22:15'} - 23:15`,
      description,
    };
  });
}

export function computeBusAllocation(
  schedule: FestivalSchedule,
  stops: TransitStop[] = DEFAULT_STOPS
): AllocationPlan {
  const [endHourStr, endMinuteStr] = schedule.finalEventEndTime.split(':');
  const endHour = parseInt(endHourStr, 10) || 22;
  const endMinute = parseInt(endMinuteStr, 10) || 0;

  const ROUTE_NAMES: Record<string, string> = {
    stop_a: 'Line 1 – Temple Central & North Sanctum Express',
    stop_b: 'Line 7 – East Bypass & Outer Ring Road Feeder',
    stop_c: 'Line 4 – South Rail Link & Suburban Connector',
  };

  const timepoints = calculateDemandCurve(schedule, stops);

  // Focus on rush window: -15 to +75 min
  const rushPoints = timepoints.filter((tp) => tp.minutesFromEnd >= -15 && tp.minutesFromEnd <= 75);

  // Bus carries ~65 passengers per trip, ~1.5 trips in 90 min window
  const clearancePerBus = 65 * 1.5;

  const rawStats = stops.map((stop) => {
    const points = rushPoints.filter((tp) => tp.stopId === stop.id);
    const totalRushDemand = points.reduce((sum, p) => sum + p.demand, 0);
    const busesRequired = Math.max(1, Math.ceil(totalRushDemand / clearancePerBus));
    const netDeficit = Math.max(0, busesRequired - stop.scheduledBuses);
    const surplusAvailable = Math.max(0, stop.scheduledBuses - Math.max(1, busesRequired));

    const scheduledBuses = stop.scheduledBuses;
    const headwayBeforeMin = scheduledBuses > 0 ? Math.round(60 / scheduledBuses) : 90;

    return {
      stopId: stop.id,
      stopName: stop.name,
      routeName: ROUTE_NAMES[stop.id] || `${stop.name} Route`,
      scheduledBuses,
      busesRequired,
      netDeficit,
      surplusAvailable,
      totalRushDemand,
      headwayBeforeMin,
      capacityUtilizationPct: scheduledBuses > 0
        ? Math.round((totalRushDemand / (scheduledBuses * clearancePerBus)) * 100)
        : 999,
    };
  });

  // Calculate transfers under STRICT Fixed Fleet constraint:
  // Fleet is fixed = sum of scheduled buses across all stops.
  // Recommendations may only redistribute existing buses.
  const donor = rawStats.find((s) => s.stopId === 'stop_b') || rawStats.find((s) => s.surplusAvailable > 0);
  const recipient = rawStats.find((s) => s.stopId === 'stop_a') || rawStats.find((s) => s.netDeficit > 0);

  const transfers: BusTransferRecommendation[] = [];
  let busesMoved = 0;

  if (donor && recipient && donor.stopId !== recipient.stopId) {
    // Retain minimum 1 bus at donor stop so the route is never abandoned completely
    const availableToDonate = Math.max(0, donor.scheduledBuses - 1);
    const neededByRecipient = recipient.netDeficit;
    const busesCount = Math.min(availableToDonate, Math.max(1, Math.min(neededByRecipient, 3)));

    if (busesCount > 0) {
      busesMoved = busesCount;

      const transitMinutes = 18;
      const targetArrivalTotalMins = endHour * 60 + endMinute - 15;
      const dispatchTotalMins = targetArrivalTotalMins - transitMinutes;

      const formatMins = (totalM: number) => {
        const h = Math.floor(((totalM + 1440) % 1440) / 60);
        const m = Math.floor(((totalM + 1440) % 1440) % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      };

      const donorBusesBefore = donor.scheduledBuses;
      const donorBusesAfter = donorBusesBefore - busesCount;
      const donorHeadwayBefore = donor.headwayBeforeMin;
      const donorHeadwayAfter = donorBusesAfter > 0 ? Math.round(60 / donorBusesAfter) : 120;
      const headwayIncrease = donorHeadwayAfter - donorHeadwayBefore;

      const donorCapBeforePerHour = donorBusesBefore * 65;
      const donorCapAfterPerHour = donorBusesAfter * 65;
      const capacityLostPerHour = donorCapBeforePerHour - donorCapAfterPerHour;

      const donorUtilBefore = donor.capacityUtilizationPct;
      const donorUtilAfter = Math.round((donor.totalRushDemand / (donorBusesAfter * clearancePerBus)) * 100);

      const recipientRoute = recipient.routeName;
      const donorRoute = donor.routeName;

      transfers.push({
        transferId: 'TRF-PROACTIVE-01',
        fromStopId: donor.stopId,
        fromStopName: donor.stopName,
        fromRouteName: donorRoute,
        toStopId: recipient.stopId,
        toStopName: recipient.stopName,
        toRouteName: recipientRoute,
        busesCount,
        distanceKm: 2.0,
        transitMinutes,
        dispatchTime: formatMins(dispatchTotalMins),
        arrivalTime: formatMins(targetArrivalTotalMins),
        isProactive: true,
        operationalRationale: `Fixed Fleet Redistribution: Reallocate ${busesCount} buses from ${donor.stopName} (${donorRoute}) to ${recipient.stopName} (${recipientRoute}). Service frequency on ${donorRoute} decreases from every ${donorHeadwayBefore}m to every ${donorHeadwayAfter}m (+${headwayIncrease}m wait for ~${Math.round(donor.totalRushDemand)} commuters), in order to supply +${Math.round(busesCount * clearancePerBus)} capacity to North Gate and prevent a fatal 190% platform crush.`,
        feasibility: {
          isFeasible: true,
          donorRetentionGuaranteed: true,
          arrivesBeforeSurge: true,
          transitRoute: 'East Ring Road -> Kamarajar Salai -> North Terminal dedicated bus lane',
        },
        serviceLossTradeoff: {
          donorRouteName: donorRoute,
          donorStopId: donor.stopId,
          donorStopName: donor.stopName,
          recipientStopName: recipient.stopName,
          recipientRouteName: recipientRoute,
          busesBefore: donorBusesBefore,
          busesAfter: donorBusesAfter,
          busesLost: busesCount,
          headwayBeforeMinutes: donorHeadwayBefore,
          headwayAfterMinutes: donorHeadwayAfter,
          headwayIncreaseMinutes: headwayIncrease,
          capacityBeforePaxPerHour: donorCapBeforePerHour,
          capacityAfterPaxPerHour: donorCapAfterPerHour,
          capacityLostPaxPerHour: capacityLostPerHour,
          peakDemandPaxPerHour: Math.round(donor.totalRushDemand / 1.5),
          utilizationBeforePct: donorUtilBefore,
          utilizationAfterPct: donorUtilAfter,
          affectedPassengersEstimate: Math.round(donor.totalRushDemand),
          serviceImpactTier: donorUtilAfter > 90 ? 'Severe Cut' : donorUtilAfter > 50 ? 'Moderate Degradation' : 'Acceptable Trade-off',
          tradeoffSummary: `By moving ${busesCount} buses away, ${donor.stopName} loses ${capacityLostPerHour} pax/hr of clearance capacity. Waiting passengers on ${donorRoute} experience headway expansion from ${donorHeadwayBefore} min to ${donorHeadwayAfter} min (+${headwayIncrease} min delay). This sacrifice is operationally justified because ${donor.stopName} peak demand is only ${Math.round(donor.totalRushDemand)} pax, while ${recipient.stopName} faces ${Math.round(recipient.totalRushDemand)} devotees and would suffer catastrophic crush conditions without these ${busesCount} redistributed buses.`,
          mitigationMeasures: [
            `Broadcast updated ${donorHeadwayAfter}-minute departure timetable on digital VMS signs at ${donor.stopName}.`,
            `Permanently retain ${donorBusesAfter} bus on ${donorRoute} to guarantee basic service continuity for local commuters.`,
            `Station queue conductors at ${donor.stopName} to manage expectations and inform passengers of departure intervals.`,
            `Enforce dedicated transit corridor to ensure transferred buses arrive at ${recipient.stopName} prior to crowd surge.`,
          ],
        },
      });
    }
  }

  // Build stop stats with before & after allocations
  const stopFinalStats = rawStats.map((item) => {
    let busDelta = 0;
    let serviceStatus: 'Surge Recipient' | 'Donor (Service Reduced)' | 'Baseline Maintained' = 'Baseline Maintained';

    if (donor && item.stopId === donor.stopId && busesMoved > 0) {
      busDelta = -busesMoved;
      serviceStatus = 'Donor (Service Reduced)';
    } else if (recipient && item.stopId === recipient.stopId && busesMoved > 0) {
      busDelta = +busesMoved;
      serviceStatus = 'Surge Recipient';
    }

    const busesAfter = item.scheduledBuses + busDelta;
    const headwayAfterMin = busesAfter > 0 ? Math.round(60 / busesAfter) : 120;
    const capacityUtilizationAfterPct = busesAfter > 0
      ? Math.round((item.totalRushDemand / (busesAfter * clearancePerBus)) * 100)
      : 999;

    return {
      stopId: item.stopId,
      stopName: item.stopName,
      routeName: item.routeName,
      scheduledBuses: item.scheduledBuses,
      busesAfterRedeployment: busesAfter,
      busDelta,
      busesRequired: item.busesRequired,
      netDeficit: item.netDeficit,
      surplusAvailable: item.surplusAvailable,
      headwayBeforeMin: item.headwayBeforeMin,
      headwayAfterMin,
      capacityUtilizationPct: item.capacityUtilizationPct,
      capacityUtilizationAfterPct,
      serviceStatus,
      isCritical: item.netDeficit >= 4 && busDelta <= 0,
    };
  });

  const totalTransfers = transfers.reduce((acc, t) => acc + t.busesCount, 0);
  const totalBusesRequired = stopFinalStats.reduce((acc, s) => acc + s.busesRequired, 0);
  const totalScheduled = stopFinalStats.reduce((acc, s) => acc + s.scheduledBuses, 0);
  const totalAfter = stopFinalStats.reduce((acc, s) => acc + s.busesAfterRedeployment, 0);
  const initialDeficit = stopFinalStats.reduce((acc, s) => acc + s.netDeficit, 0);

  return {
    summary: {
      totalFleetSize: totalScheduled,
      totalScheduledBuses: totalScheduled,
      totalBusesRequired,
      totalTransfersRecommended: totalTransfers,
      netShortfallBeforeTransfers: initialDeficit,
      netShortfallAfterTransfers: Math.max(0, initialDeficit - totalTransfers),
      clearedPassengersBonus: totalTransfers * 65 * 1.5,
      transitLeadTimeMinutes: 18,
      isFleetFixed: true,
      netFleetDelta: totalAfter - totalScheduled, // Strictly 0
    },
    stops: stopFinalStats,
    transfers,
  };
}

export function compareReactiveVsProactive(schedule: FestivalSchedule) {
  const multiplier = schedule.expectedAttendance / 40000;

  return {
    reactive: {
      strategyName: 'Reactive Status Quo (Post-Crush Response)',
      busesAtMainStand: 12,
      peakPlatformQueue: Math.round(4400 * multiplier),
      maxPassengerWaitTimeMin: 110,
      clearingDurationMin: 195,
      stampedeRiskTier: 'CRITICAL',
      passengerStrandedCount: Math.round(3800 * multiplier),
      driverConfusionScore: 'High (Dispatched after road gridlock)',
      keyFlaw: 'Buses dispatched from East Stop at 22:30 get trapped in departing crowd traffic on the 2km road, taking 45+ minutes to arrive.',
    },
    proactive: {
      strategyName: 'FestivalFlow AI Proactive Deployment (D-7 Plan)',
      busesAtMainStand: 15, // 12 scheduled + 3 transferred ahead of time
      peakPlatformQueue: Math.round(1180 * multiplier),
      maxPassengerWaitTimeMin: 18,
      clearingDurationMin: 85,
      stampedeRiskTier: 'LOW',
      passengerStrandedCount: 0,
      driverConfusionScore: 'Zero (Pre-staged 15m before surge)',
      keyAdvantage: '3 buses transferred at 21:35 dock quietly before crowd exits. Platform boarding flows continuously with zero queue breakdown.',
    },
    metricDiff: {
      waitTimeReductionPercent: 83.6,
      clearingSpeedupPercent: 56.4,
      platformQueueReduction: Math.round((4400 - 1180) * multiplier),
    },
  };
}
