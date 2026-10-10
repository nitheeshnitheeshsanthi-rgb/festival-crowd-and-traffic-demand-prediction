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
        <div style="background: #f97316; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 15px rgba(249, 115, 22, 0.8); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
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
      const isDonor = stop.id === 'stop_b';

      const color = isCritical ? '#f43f5e' : isDonor ? '#10b981' : '#3b82f6';
      const pulseAnimation = isCritical ? 'animation: pulse 1.5s infinite;' : '';

      const stopIcon = L.divIcon({
        className: `custom-stop-marker-${stop.id}`,
        html: `
          <div style="position: relative;">
            <div style="background: ${color}; width: 36px; height: 36px; border-radius: 10px; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px; ${pulseAnimation}">
              🚌
            </div>
            <div style="position: absolute; top: -6px; right: -6px; background: #0f172a; color: ${color}; font-size: 10px; font-weight: bold; border-radius: 9999px; padding: 1px 5px; border: 1px solid ${color};">
              ${stop.scheduledBuses}B
            </div>
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

      // Popup
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 210px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #0f172a; font-size: 13px;">${stop.name}</strong>
            <span style="font-size: 10px; font-weight: bold; color: white; background: ${color}; padding: 2px 6px; border-radius: 4px;">
              ${risk?.riskLevel || 'Normal'}
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.5;">
            <div>• Distance to Sanctum: <b>${stop.distanceFromTempleKm} km</b></div>
            <div>• Scheduled Buses: <b>${stop.scheduledBuses} buses</b></div>
            <div>• Buses Required: <b>${alloc?.busesRequired || 0} buses</b></div>
            <div>• Peak Crowd Demand: <b>${risk?.peakPassengerDemand.toLocaleString() || 0} pax/15m</b></div>
            <div>• Safe Platform Cap: <b>${stop.safeCapacity} pax</b></div>
          </div>
          ${
            isDonor
              ? `<div style="margin-top: 8px; font-size: 11px; background: #ecfdf5; color: #047857; padding: 4px; border-radius: 4px; font-weight: 500;">
                  Underused Stand: ${plan.summary.totalTransfersRecommended} surplus buses ready for transfer.
                </div>`
              : ''
          }
          ${
            isCritical
              ? `<div style="margin-top: 8px; font-size: 11px; background: #fff1f2; color: #be123c; padding: 4px; border-radius: 4px; font-weight: 500;">
                  Critical Deficit: Lacks ${alloc?.netDeficit || 0} buses. Overcrowding starts at 22:15.
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
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      polyline.bindPopup(`
        <div style="font-family: sans-serif; min-width: 220px; padding: 6px;">
          <h4 style="font-weight: bold; margin: 0 0 4px 0; color: #ea580c;">2.0 km Rapid Transit Corridor</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569;">
            Inter-terminal route from East Bypass Stop to Main Bus Stand.
          </p>
          <div style="font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px;">
            <div>⏱ Travel Time: <b>18 mins (with festival traffic)</b></div>
            <div>🚌 Redeploying: <b>${plan.summary.totalTransfersRecommended} Buses</b></div>
            <div>🚦 Dispatch: <b>${primaryTransfer?.dispatchTime || '21:37'}</b></div>
            <div>🏁 Arrival: <b>${primaryTransfer?.arrivalTime || '21:55'} (Pre-event)</b></div>
          </div>
        </div>
      `);
    }

    return () => {
      // Map cleanup handled on unmount
    };
  }, [stops, plan, risks, selectedStopId]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Map Header Bar */}
      <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-semibold text-white">
            Geospatial Transit Corridor & Crowd Density Map
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
            <span className="text-slate-300">Stop A: Main Stand (Critical Surge)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-300">Stop B: East Stand (Idle 4 Buses)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 border-t-2 border-dashed border-orange-400 inline-block" />
            <span className="text-slate-300">2.0 km Transfer Corridor</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative">
        <div ref={mapContainerRef} className="w-full h-[440px] z-10" />

        {/* Floating Operational Overlay Card */}
        <div className="absolute bottom-4 left-4 z-20 max-w-sm bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 shadow-2xl text-xs text-slate-300">
          <div className="flex items-center justify-between font-semibold text-white mb-1.5">
            <span className="flex items-center gap-1.5">
              <Bus className="w-4 h-4 text-emerald-400" />
              Active Transfer Corridor
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
              Route Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
            Moving <strong className="text-emerald-300">{plan.summary.totalTransfersRecommended} buses</strong> from{' '}
            <span className="text-slate-200">East Bypass Stop</span> along 2.0 km link to{' '}
            <span className="text-rose-300 font-medium">Main Bus Stand</span>.
          </p>
          <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-2 rounded-lg border border-slate-700/50 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Dispatch From East</span>
              <span className="font-semibold text-amber-300">{primaryTransfer?.dispatchTime || '21:37'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Arrival at Main</span>
              <span className="font-semibold text-emerald-300">
                {primaryTransfer?.arrivalTime || '21:55'} (15m before end)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
