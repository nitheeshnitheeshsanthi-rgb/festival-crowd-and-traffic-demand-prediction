import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TransitStop, AllocationPlan, CrowdRiskAssessment } from '../types/festival';
import { Bus, MapPin, Navigation, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface InteractiveMapProps {
  stops: TransitStop[];
  plan: AllocationPlan;
  risks: CrowdRiskAssessment[];
  selectedStopId: string;
  onSelectStop: (id: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  stops,
  plan,
  risks,
  selectedStopId,
  onSelectStop,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const templeCenter = { lat: 9.9168, lng: 78.1189, name: 'Meenakshi Sundareswarar Temple Sanctum' };
  const primaryTransfer = plan.transfers[0];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered between the temple and the two bus stops
      const map = L.map(mapContainerRef.current, {
        center: [9.9230, 78.1270],
        zoom: 14,
        zoomControl: true,
      });

      // Dark / modern OpenStreetMap tiles (CartoDB Dark Matter / OSM)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // 1. Add Temple Sanctum Center Marker
    const templeIcon = L.divIcon({
      className: 'custom-temple-marker',
      html: `
        <div style="background: #ea580c; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 14px rgba(234, 88, 12, 0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
          🛕
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const templeMarker = L.marker([templeCenter.lat, templeCenter.lng], { icon: templeIcon }).addTo(map);
    templeMarker.bindPopup(`
      <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
        <h4 style="font-weight: bold; margin: 0 0 4px 0; color: #ea580c;">Temple Sanctum & Chariot Arena</h4>
        <p style="margin: 0; font-size: 12px; color: #475569;">Origin of 40,000 departing devotees post Maha Deeparadhana ceremony.</p>
      </div>
    `);

    // 2. Add Stop Markers
    stops.forEach((stop) => {
      const risk = risks.find((r) => r.stopId === stop.id);
      const alloc = plan.stops.find((s) => s.stopId === stop.id);
      const isCritical = risk?.riskLevel === 'Critical';
      const isDonor = alloc && alloc.busDelta < 0;
      const isRecipient = alloc && alloc.busDelta > 0;

      const color = isCritical ? '#f43f5e' : isDonor ? '#f59e0b' : '#3b82f6';

      const deltaBadge = isRecipient
        ? `<div style="position: absolute; bottom: -8px; left: -6px; background: #064e3b; color: #34d399; font-size: 9px; font-weight: bold; border-radius: 4px; padding: 1px 4px; border: 1px solid #10b981;">+${alloc.busDelta}B</div>`
        : isDonor
        ? `<div style="position: absolute; bottom: -8px; left: -6px; background: #78350f; color: #fbbf24; font-size: 9px; font-weight: bold; border-radius: 4px; padding: 1px 4px; border: 1px solid #f59e0b;">${alloc.busDelta}B</div>`
        : '';

      const stopIcon = L.divIcon({
        className: `custom-stop-marker-${stop.id}`,
        html: `
          <div style="position: relative;">
            <div style="background: ${color}; width: 36px; height: 36px; border-radius: 10px; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px;">
              🚌
            </div>
            <div style="position: absolute; top: -6px; right: -6px; background: #0f172a; color: ${color}; font-size: 10px; font-weight: bold; border-radius: 9999px; padding: 1px 5px; border: 1px solid ${color};">
              ${alloc?.busesAfterRedeployment ?? stop.scheduledBuses}B
            </div>
            ${deltaBadge}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(map);
      markersRef.current[stop.id] = marker;

      marker.on('click', () => {
        onSelectStop(stop.id);
      });

      // Crowd buffer circle
      const circleRadius = isCritical ? 260 : isDonor ? 90 : 120;
      L.circle([stop.lat, stop.lng], {
        color: color,
        fillColor: color,
        fillOpacity: isCritical ? 0.22 : 0.12,
        radius: circleRadius,
        dashArray: isCritical ? '4, 4' : undefined,
      }).addTo(map);

      // Popup with trade-off details
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 220px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #0f172a; font-size: 13px;">${stop.name}</strong>
            <span style="font-size: 10px; font-weight: bold; color: white; background: ${color}; padding: 2px 6px; border-radius: 4px;">
              ${risk?.riskLevel || 'Normal'}
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.5;">
            <div>• Route: <b>${alloc?.routeName || stop.name}</b></div>
            <div>• Scheduled Fleet: <b>${stop.scheduledBuses} buses</b></div>
            <div>• Effective Fleet: <b>${alloc?.busesAfterRedeployment ?? stop.scheduledBuses} buses (${alloc?.busDelta && alloc.busDelta > 0 ? `+${alloc.busDelta}` : alloc?.busDelta || '0'})</b></div>
            <div>• Headway: <b>${alloc?.headwayBeforeMin || 15}m → ${alloc?.headwayAfterMin || 15}m interval</b></div>
            <div>• Safe Platform Cap: <b>${stop.safeCapacity} pax</b></div>
          </div>
          ${
            isDonor
              ? `<div style="margin-top: 8px; font-size: 11px; background: #fffbeb; color: #b45309; border: 1px solid #fde68a; padding: 6px; border-radius: 6px;">
                  <b>Route Service Trade-Off:</b>
                  <div>Loses ${Math.abs(alloc.busDelta)} buses to North Gate. Headway stretches to ${alloc.headwayAfterMin}m (+${alloc.headwayAfterMin - alloc.headwayBeforeMin}m wait). 1 bus retained permanently.</div>
                </div>`
              : ''
          }
          ${
            isRecipient
              ? `<div style="margin-top: 8px; font-size: 11px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 6px; border-radius: 6px;">
                  <b>Surge Relief Beneficiary:</b>
                  <div>Receives +${alloc.busDelta} buses from East Bypass, preventing platform stampede. Continuous 4-min departures.</div>
                </div>`
              : ''
          }
        </div>
      `);
    });

    // 3. Draw 2.0 km Bus Transfer Corridor Polyline
    const stopA = stops.find((s) => s.id === 'stop_a');
    const stopB = stops.find((s) => s.id === 'stop_b');

    if (stopA && stopB) {
      // Waypoint trajectory simulating the arterial road
      const routeCoords: [number, number][] = [
        [stopB.lat, stopB.lng],
        [9.9285, 78.1320],
        [9.9240, 78.1255],
        [stopA.lat, stopA.lng],
      ];

      const polyline = L.polyline(routeCoords, {
        color: '#f97316',
        weight: 4.5,
        opacity: 0.9,
        dashArray: '8, 8',
      }).addTo(map);

      polyline.bindPopup(`
        <div style="font-family: sans-serif; min-width: 230px; padding: 6px;">
          <h4 style="font-weight: bold; margin: 0 0 4px 0; color: #ea580c;">2.0 km Fixed Fleet Transfer Corridor</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569;">
            Strict zero-sum reallocation of ${plan.summary.totalTransfersRecommended} existing buses from East Bypass to Main Bus Stand.
          </p>
          <div style="font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; line-height: 1.4;">
            <div>⏱ Travel Time: <b>18 mins (dedicated bus corridor)</b></div>
            <div>🚌 Shift: <b>${plan.summary.totalTransfersRecommended} Buses (East → North)</b></div>
            <div>🚦 Dispatch: <b>${primaryTransfer?.dispatchTime || '21:37'}</b></div>
            <div>🏁 Arrival: <b>${primaryTransfer?.arrivalTime || '21:55'} (Pre-event)</b></div>
            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; color: #b45309;">
              ⚠️ <b>Trade-Off:</b> East Bypass departure interval extended from 15m to 60m.
            </div>
          </div>
        </div>
      `);
    }

    return () => {
      // Map cleanup handled on unmount
    };
  }, [stops, plan, risks, selectedStopId]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
      {/* Map Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-orange-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Geospatial Transit Corridor & Crowd Density Map
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live GIS layout of temple terminus bottlenecks and 2.0 km bypass connector
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            North Terminus
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            East Bypass
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800/80">
        <div ref={mapContainerRef} className="w-full h-[360px] z-10" />

        {/* Floating Operational Overlay Card */}
        <div className="absolute bottom-3 left-3 z-20 max-w-xs bg-slate-900/95 backdrop-blur-md p-3 rounded-lg border border-slate-700/80 shadow-xl text-xs text-slate-300">
          <div className="flex items-center justify-between font-semibold text-white mb-1">
            <span className="flex items-center gap-1.5 text-xs">
              <Bus className="w-3.5 h-3.5 text-emerald-400" />
              Proactive Deployment
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              21:37 Dispatch
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
            Pre-staging <strong className="text-emerald-300">{plan.summary.totalTransfersRecommended} buses</strong> from East Stand to absorb North Terminal surge.
          </p>
          <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded border border-slate-800 text-[10px] font-mono tabular-nums">
            <span className="text-slate-400">Arrives: <b className="text-emerald-300">{primaryTransfer?.arrivalTime || '21:55'}</b></span>
            <span className="text-slate-400">Distance: <b>2.0 km</b></span>
          </div>
        </div>
      </div>

      {/* Synchronized Bottom Telemetry Card */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Arterial Right-of-Way Coordination: </span>
          <span>
            The 2.0 km corridor along East Ring Road to North Terminal requires transit-only lane enforcement starting at 21:30. Traffic police escort ensures buses traverse the route in 18 minutes, docking before crowd exits.
          </span>
        </div>
      </div>
    </div>
  );
};
