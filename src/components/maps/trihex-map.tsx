"use client";

import { useEffect, useRef, useState } from "react";
import { 
  MapPin, 
  Activity, 
  Database, 
  Building2, 
  Layers, 
  Info, 
  ExternalLink,
  ShieldCheck,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { SeismicEvent } from "@/lib/nepal/earthquake-adapter";
import { OpenDataset } from "@/lib/nepal/open-data-adapter";

interface TrihexMapProps {
  earthquakes: SeismicEvent[];
  datasets: OpenDataset[];
}

interface MapMarkerItem {
  id: string;
  type: "EARTHQUAKE" | "DATASET" | "HUB";
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  badge: string;
  color: string;
  url?: string;
  details: string;
}

const SERVICE_HUBS = [
  {
    id: "hub-kathmandu",
    title: "TRIHEX DIGITAL Kathmandu Operations Desk",
    subtitle: "New Baneshwor, Kathmandu, Bagmati Province",
    lat: 27.6915,
    lng: 85.3420,
    badge: "TRIHEX Desk",
    color: "#2563eb",
    details: "Primary fulfillment operations desk for automated digital software licenses & support.",
  },
  {
    id: "hub-pokhara",
    title: "TRIHEX Western Nepal Partner Hub",
    subtitle: "Lakeside, Pokhara, Gandaki Province",
    lat: 28.2096,
    lng: 83.9575,
    badge: "Partner Node",
    color: "#0284c7",
    details: "Regional student ambassador node & developer meetup coordination hub.",
  },
  {
    id: "hub-biratnagar",
    title: "TRIHEX Eastern Nepal Distribution Point",
    subtitle: "Main Road, Biratnagar, Koshi Province",
    lat: 26.4525,
    lng: 87.2718,
    badge: "Support Point",
    color: "#0284c7",
    details: "Eastern Nepal payment verification & developer support point.",
  },
];

export function TrihexMap({ earthquakes, datasets }: TrihexMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeLayers, setActiveLayers] = useState({
    earthquakes: true,
    datasets: true,
    hubs: true,
  });

  const [selectedItem, setSelectedItem] = useState<MapMarkerItem | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(7);

  // Transform data into unified marker format
  const allMarkers: MapMarkerItem[] = [
    // Seismic markers
    ...(activeLayers.earthquakes
      ? earthquakes.map((eq) => ({
          id: eq.id,
          type: "EARTHQUAKE" as const,
          title: eq.title,
          subtitle: eq.place,
          lat: eq.latitude,
          lng: eq.longitude,
          badge: `M ${eq.magnitude}`,
          color: eq.magnitude >= 4.5 ? "#ef4444" : eq.magnitude >= 3.5 ? "#f59e0b" : "#10b981",
          url: eq.url,
          details: `Depth: ${eq.depthKm} km · Epicenter: ${eq.latitude.toFixed(2)}°N, ${eq.longitude.toFixed(2)}°E`,
        }))
      : []),

    // Civic dataset markers
    ...(activeLayers.datasets
      ? datasets
          .filter((d) => d.coordinates)
          .map((d) => ({
            id: d.id,
            type: "DATASET" as const,
            title: d.title,
            subtitle: d.organization,
            lat: d.coordinates!.lat,
            lng: d.coordinates!.lng,
            badge: d.category,
            color: "#8b5cf6",
            url: d.downloadUrl,
            details: d.description,
          }))
      : []),

    // TRIHEX Hub markers
    ...(activeLayers.hubs
      ? SERVICE_HUBS.map((h) => ({
          id: h.id,
          type: "HUB" as const,
          title: h.title,
          subtitle: h.subtitle,
          lat: h.lat,
          lng: h.lng,
          badge: h.badge,
          color: h.color,
          details: h.details,
        }))
      : []),
  ];

  // Try loading official Google Maps Platform JS with dynamic importLibrary and attribution tracking
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || typeof window === "undefined") return;

    if ((window as any).google?.maps?.importLibrary) {
      setGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=places,marker`;
    script.async = true;
    script.defer = true;
    // Attribution tracking required by Google Maps Platform guidelines
    script.setAttribute("internal-usage-attribution-ids", "gmp_mcp_codeassist_v0.1_github");
    script.onload = () => setGoogleMapsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Clean up script if unmounted during load
    };
  }, []);

  // Initialize official Google Map if loaded
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainerRef.current || !(window as any).google?.maps) return;

    const google = (window as any).google;
    const nepalCenter = { lat: 28.3949, lng: 84.1240 };

    const map = new google.maps.Map(mapContainerRef.current, {
      center: nepalCenter,
      zoom: 7,
      mapId: "TRIHEX_NEPAL_EXPLORER_MAP",
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
      ],
    });

    // Add AdvancedMarkerElements or standard markers
    allMarkers.forEach((marker) => {
      if (google.maps.marker?.AdvancedMarkerElement) {
        const pin = document.createElement("div");
        pin.className = "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white shadow-lg cursor-pointer transform hover:scale-110 transition";
        pin.style.backgroundColor = marker.color;
        pin.innerHTML = `<span>${marker.badge}</span>`;

        const advMarker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: marker.lat, lng: marker.lng },
          title: marker.title,
          content: pin,
        });

        advMarker.addListener("click", () => setSelectedItem(marker));
      } else {
        const stdMarker = new google.maps.Marker({
          map,
          position: { lat: marker.lat, lng: marker.lng },
          title: marker.title,
        });
        stdMarker.addListener("click", () => setSelectedItem(marker));
      }
    });
  }, [googleMapsLoaded, allMarkers]);

  // Coordinate mapping helper for high-precision SVG canvas when API key is offline
  // Nepal Bounds: Lat: 26.3N to 30.5N, Lng: 80.0E to 88.2E
  const projectCoordsToSvg = (lat: number, lng: number) => {
    const minLat = 26.0;
    const maxLat = 31.0;
    const minLng = 79.5;
    const maxLng = 88.8;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div className="space-y-6">
      {/* Control Layer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
          <Layers className="w-4 h-4 text-blue-400" /> Layer Toggles:
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveLayers((prev) => ({ ...prev, earthquakes: !prev.earthquakes }))
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeLayers.earthquakes
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "bg-slate-800 text-slate-400 border border-white/5"
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Earthquakes ({earthquakes.length})
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveLayers((prev) => ({ ...prev, datasets: !prev.datasets }))
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeLayers.datasets
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-slate-800 text-slate-400 border border-white/5"
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Civic Datasets
          </button>

          <button
            type="button"
            onClick={() => setActiveLayers((prev) => ({ ...prev, hubs: !prev.hubs }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeLayers.hubs
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                : "bg-slate-800 text-slate-400 border border-white/5"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> TRIHEX Hubs
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[550px] sm:h-[620px] rounded-3xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
        {googleMapsLoaded ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          /* High-Fidelity Geodetic Visualizer with Nepal Coordinate Matrix */
          <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden select-none">
            {/* Ambient Nepal Topographic Silhouette Grid */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Nepal Geo-Boundary Mock Contour */}
            <svg
              className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polygon
                points="10,48 20,40 38,32 55,30 75,34 90,44 86,60 70,62 50,68 30,64 15,58"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.5"
                strokeDasharray="1,1"
              />
            </svg>

            {/* Render Geo Points */}
            <div className="absolute inset-0 pointer-events-auto">
              {allMarkers.map((marker) => {
                const { x, y } = projectCoordsToSvg(marker.lat, marker.lng);
                const isSelected = selectedItem?.id === marker.id;

                return (
                  <div
                    key={marker.id}
                    onClick={() => setSelectedItem(marker)}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  >
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-xl transition-all duration-200 transform group-hover:scale-125 ${
                        isSelected ? "ring-2 ring-white scale-125" : ""
                      }`}
                      style={{ backgroundColor: marker.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>{marker.badge}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 backdrop-blur-xl text-xs space-y-1.5 z-30 shadow-xl">
              <div className="font-semibold text-white flex items-center gap-1.5 text-[11px] mb-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> Nepal Coordinate System
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Earthquakes (USGS Live)
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Open Civic Datasets
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> TRIHEX Desk & Hubs
              </div>
            </div>
          </div>
        )}

        {/* Selected Marker Detail Card Drawer */}
        {selectedItem && (
          <div className="absolute top-4 right-4 max-w-sm w-full p-5 rounded-2xl bg-slate-950/95 border border-white/15 backdrop-blur-2xl text-xs text-slate-200 shadow-2xl z-40 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <span
                className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider text-white"
                style={{ backgroundColor: selectedItem.color }}
              >
                {selectedItem.badge}
              </span>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white leading-snug">
                {selectedItem.title}
              </h4>
              <p className="text-slate-400 text-[11px] mt-0.5 font-medium">
                {selectedItem.subtitle}
              </p>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              {selectedItem.details}
            </p>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">
                {selectedItem.lat.toFixed(3)}°N, {selectedItem.lng.toFixed(3)}°E
              </span>

              {selectedItem.url && (
                <a
                  href={selectedItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:underline font-semibold"
                >
                  View Details <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
