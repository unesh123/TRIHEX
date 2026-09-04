"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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
  ZoomOut,
  List,
  Map as MapIcon,
  Compass,
  Navigation,
  Car,
  Search,
  AlertTriangle,
  LocateFixed,
  X,
  Radio
} from "lucide-react";
import { SeismicEvent, calculateDistanceFromKathmanduKm } from "@/lib/nepal/seismic-types";
import { OpenDataset } from "@/lib/nepal/open-data-adapter";
import { clientEnv } from "@/lib/env/client";

interface TrihexMapProps {
  earthquakes: SeismicEvent[];
  datasets: OpenDataset[];
}

export interface MapMarkerItem {
  id: string;
  type: "EARTHQUAKE" | "DATASET" | "HUB";
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  distanceKm: number;
  badge: string;
  color: string;
  url?: string;
  details: string;
}

const SERVICE_HUBS: MapMarkerItem[] = [
  {
    id: "hub-kathmandu",
    type: "HUB",
    title: "TRIHEX DIGITAL Kathmandu Operations Desk",
    subtitle: "New Baneshwor, Kathmandu, Bagmati Province",
    lat: 27.6915,
    lng: 85.3420,
    distanceKm: 0,
    badge: "TRIHEX Desk",
    color: "#2563eb",
    details: "Primary fulfillment operations desk for automated digital software licenses & support.",
  },
  {
    id: "hub-pokhara",
    type: "HUB",
    title: "TRIHEX Western Nepal Partner Hub",
    subtitle: "Lakeside, Pokhara, Gandaki Province",
    lat: 28.2096,
    lng: 83.9575,
    distanceKm: 145,
    badge: "Partner Node",
    color: "#0284c7",
    details: "Regional student ambassador node & developer meetup coordination hub.",
  },
  {
    id: "hub-biratnagar",
    type: "HUB",
    title: "TRIHEX Eastern Nepal Distribution Point",
    subtitle: "Main Road, Biratnagar, Koshi Province",
    lat: 26.4525,
    lng: 87.2718,
    distanceKm: 235,
    badge: "Support Point",
    color: "#0284c7",
    details: "Eastern Nepal payment verification & developer support point.",
  },
];

// Standard Haversine distance formula
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function TrihexMap({ earthquakes, datasets }: TrihexMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapInstanceRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Resolve browser key from clientEnv canonical or legacy
  const apiKey = clientEnv.googleMapsBrowserKey || (typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) : undefined);
  const mapId = clientEnv.googleMapsMapId || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID : undefined);

  // If no API key configured, default to LIST view to immediately present accessible data
  const [viewMode, setViewMode] = useState<"MAP" | "LIST">(apiKey ? "MAP" : "LIST");
  const [listSearch, setListSearch] = useState("");
  const [activeLayers, setActiveLayers] = useState({
    earthquakes: true,
    datasets: true,
    hubs: true,
  });

  const [selectedItem, setSelectedItem] = useState<MapMarkerItem | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapsLoadError, setMapsLoadError] = useState<string | null>(null);
  const [trafficEnabled, setTrafficEnabled] = useState(false);

  // Places search state
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [placeSearching, setPlaceSearching] = useState(false);

  // Around Me (ephemeral geolocation) state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoRadiusKm, setGeoRadiusKm] = useState<number>(50);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showAroundMeDrawer, setShowAroundMeDrawer] = useState(false);

  // Transform data into unified marker format
  const allMarkers: MapMarkerItem[] = useMemo(() => [
    ...(activeLayers.earthquakes
      ? earthquakes.map((eq) => ({
          id: eq.id,
          type: "EARTHQUAKE" as const,
          title: eq.title,
          subtitle: eq.place,
          lat: eq.latitude,
          lng: eq.longitude,
          distanceKm: eq.distanceFromKathmanduKm ?? calculateDistanceFromKathmanduKm(eq.latitude, eq.longitude),
          badge: `M ${eq.magnitude}`,
          color: eq.magnitude >= 4.5 ? "#ef4444" : eq.magnitude >= 3.5 ? "#f59e0b" : "#10b981",
          url: eq.url,
          details: `Depth: ${eq.depthKm} km · Epicenter: ${eq.latitude.toFixed(2)}°N, ${eq.longitude.toFixed(2)}°E`,
        }))
      : []),

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
            distanceKm: calculateDistanceFromKathmanduKm(d.coordinates!.lat, d.coordinates!.lng),
            badge: d.category,
            color: "#8b5cf6",
            url: d.downloadUrl,
            details: d.description,
          }))
      : []),

    ...(activeLayers.hubs ? SERVICE_HUBS : []),
  ], [earthquakes, datasets, activeLayers]);

  // Load Google Maps JavaScript Platform
  useEffect(() => {
    if (!apiKey || typeof window === "undefined") {
      return;
    }

    if ((window as any).google?.maps?.importLibrary) {
      setGoogleMapsLoaded(true);
      return;
    }

    const scriptId = "google-maps-platform-script";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.addEventListener("load", () => setGoogleMapsLoaded(true));
      existingScript.addEventListener("error", () => setMapsLoadError("Failed to load Google Maps SDK"));
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&libraries=places,marker`;
    script.async = true;
    script.defer = true;
    script.setAttribute("internal-usage-attribution-ids", "gmp_mcp_codeassist_v0.1_github");
    script.onload = () => {
      setGoogleMapsLoaded(true);
      setMapsLoadError(null);
    };
    script.onerror = () => {
      setMapsLoadError("Google Maps script failed to load. Check browser network or key restrictions.");
    };
    document.head.appendChild(script);
  }, [apiKey]);

  // Initialize and update Google Maps instance
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainerRef.current || !(window as any).google?.maps) return;

    const google = (window as any).google;
    const nepalCenter = { lat: 28.3949, lng: 84.1240 };

    // Clear previous markers
    markersRef.current.forEach((m) => {
      if (typeof m.setMap === "function") m.setMap(null);
      else if (m.map) m.map = null;
    });
    markersRef.current = [];

    if (!googleMapInstanceRef.current) {
      const mapOptions: any = {
        center: nepalCenter,
        zoom: 7,
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
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
        ],
      };

      if (mapId) {
        mapOptions.mapId = mapId;
      }

      const map = new google.maps.Map(mapContainerRef.current, mapOptions);
      googleMapInstanceRef.current = map;

      // Initialize TrafficLayer
      trafficLayerRef.current = new google.maps.TrafficLayer();
    }

    const map = googleMapInstanceRef.current;

    // Toggle Traffic Layer
    if (trafficLayerRef.current) {
      if (trafficEnabled) {
        trafficLayerRef.current.setMap(map);
      } else {
        trafficLayerRef.current.setMap(null);
      }
    }

    // Add Markers (prefer modern AdvancedMarkerElement if Map ID or supported)
    allMarkers.forEach((marker) => {
      if (google.maps.marker?.AdvancedMarkerElement && mapId) {
        const pin = document.createElement("div");
        pin.className = "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-xl cursor-pointer transform hover:scale-110 transition";
        pin.style.backgroundColor = marker.color;
        pin.innerHTML = `<span>${marker.badge}</span>`;

        const advMarker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: marker.lat, lng: marker.lng },
          title: marker.title,
          content: pin,
        });

        advMarker.addListener("click", () => setSelectedItem(marker));
        markersRef.current.push(advMarker);
      } else {
        const stdMarker = new google.maps.Marker({
          map,
          position: { lat: marker.lat, lng: marker.lng },
          title: marker.title,
        });

        stdMarker.addListener("click", () => setSelectedItem(marker));
        markersRef.current.push(stdMarker);
      }
    });

    // If user location is active, add user location marker
    if (userLocation) {
      const userPin = new google.maps.Marker({
        map,
        position: userLocation,
        title: "Your Location (Around Me)",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      markersRef.current.push(userPin);
    }
  }, [googleMapsLoaded, allMarkers, trafficEnabled, userLocation, mapId]);

  // Execute modern Places Text Search
  const handlePlaceSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeSearchQuery.trim()) return;

    if (googleMapInstanceRef.current && (window as any).google?.maps?.places) {
      setPlaceSearching(true);
      const google = (window as any).google;
      const service = new google.maps.places.PlacesService(googleMapInstanceRef.current);

      service.textSearch(
        {
          query: placeSearchQuery,
          location: { lat: 28.3949, lng: 84.1240 },
          radius: 150000,
        },
        (results: any[], status: any) => {
          setPlaceSearching(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]?.geometry?.location) {
            const loc = results[0].geometry.location;
            googleMapInstanceRef.current.setCenter(loc);
            googleMapInstanceRef.current.setZoom(12);
          }
        }
      );
    } else {
      // Offline fallback: filter accessible list
      setListSearch(placeSearchQuery);
      setViewMode("LIST");
    }
  };

  // "Around Me" ephemeral user geolocation handler (triggered strictly on user click)
  const handleAroundMeClick = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not supported by your device or browser.");
      return;
    }

    setGeoLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setGeoLocating(false);
        setShowAroundMeDrawer(true);

        if (googleMapInstanceRef.current) {
          googleMapInstanceRef.current.setCenter(coords);
          googleMapInstanceRef.current.setZoom(10);
        }
      },
      (error) => {
        setGeoLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError("Location permission was denied. Enable location in browser settings to use Around Me.");
        } else {
          setGeoError("Unable to acquire GPS fix. Please check connectivity.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Calculate items within Around Me radius
  const aroundMeItems = useMemo(() => {
    if (!userLocation) return [];
    return allMarkers
      .map((m) => {
        const dist = haversineDistanceKm(userLocation.lat, userLocation.lng, m.lat, m.lng);
        return { ...m, userDistanceKm: dist };
      })
      .filter((m) => m.userDistanceKm <= geoRadiusKm)
      .sort((a, b) => a.userDistanceKm - b.userDistanceKm);
  }, [allMarkers, userLocation, geoRadiusKm]);

  // Coordinate mapping helper for vector outline preview when API key is unconfigured
  const projectCoordsToSvg = (lat: number, lng: number) => {
    const minLat = 26.0;
    const maxLat = 31.0;
    const minLng = 79.5;
    const maxLng = 88.8;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const filteredMarkers = allMarkers.filter((m) => {
    if (!listSearch.trim()) return true;
    const q = listSearch.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.subtitle.toLowerCase().includes(q) ||
      m.badge.toLowerCase().includes(q) ||
      m.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Configuration Status Notice Banner */}
      {!apiKey && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">
              Notice: Interactive Google Maps Platform is temporarily unconfigured or offline
            </p>
            <p className="text-amber-300/80 leading-relaxed">
              Displaying the Accessible Civic Data Cards and point registry below. To enable dynamic satellite tiles, traffic overlays, and Places search, configure <code className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-amber-200">NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY</code>.
            </p>
          </div>
        </div>
      )}

      {mapsLoadError && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{mapsLoadError} — Showing Accessible List View</span>
        </div>
      )}

      {/* Control Layer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-white/10" role="tablist" aria-label="Geospatial Explorer View Options">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "MAP"}
            onClick={() => setViewMode("MAP")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "MAP"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" /> Map View
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "LIST"}
            onClick={() => setViewMode("LIST")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "LIST"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <List className="w-3.5 h-3.5" /> Accessible List ({allMarkers.length})
          </button>
        </div>

        {/* Layer Toggles & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Traffic Layer Toggle */}
          {apiKey && (
            <button
              type="button"
              onClick={() => setTrafficEnabled((prev) => !prev)}
              title="Current traffic conditions via Google Maps (frequently refreshed, not instant telemetry)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                trafficEnabled
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border border-white/5 hover:text-white"
              }`}
            >
              <Car className="w-3.5 h-3.5" /> Traffic
            </button>
          )}

          {/* "Around Me" Ephemeral Geolocation Trigger */}
          <button
            type="button"
            onClick={handleAroundMeClick}
            disabled={geoLocating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              userLocation
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-slate-800 text-slate-300 border border-white/5 hover:bg-slate-700"
            }`}
          >
            <LocateFixed className={`w-3.5 h-3.5 ${geoLocating ? "animate-spin text-cyan-400" : ""}`} />
            <span>{geoLocating ? "Locating..." : userLocation ? "Around Me (Active)" : "Around Me"}</span>
          </button>

          {/* Earthquakes Layer */}
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

          {/* Civic Datasets Layer */}
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
            <Database className="w-3.5 h-3.5" /> Open Data ({datasets.filter((d) => d.coordinates).length})
          </button>

          {/* TRIHEX Service Hubs Layer */}
          <button
            type="button"
            onClick={() =>
              setActiveLayers((prev) => ({ ...prev, hubs: !prev.hubs }))
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeLayers.hubs
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                : "bg-slate-800 text-slate-400 border border-white/5"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Hubs ({SERVICE_HUBS.length})
          </button>
        </div>
      </div>

      {/* Places Search Bar (When in Map View) */}
      {viewMode === "MAP" && (
        <form onSubmit={handlePlaceSearch} className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={placeSearchQuery}
            onChange={(e) => setPlaceSearchQuery(e.target.value)}
            placeholder="Search any place, city, or district in Nepal (e.g., Pokhara, Butwal, Bhaktapur)..."
            className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-xl"
          />
          <button
            type="submit"
            disabled={placeSearching}
            className="absolute right-2 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition disabled:opacity-50"
          >
            {placeSearching ? "Searching..." : "Explore"}
          </button>
        </form>
      )}

      {/* Geolocation Error Notice */}
      {geoError && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          <span>{geoError}</span>
          <button type="button" onClick={() => setGeoError(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* View 1: Map View */}
      {viewMode === "MAP" && (
        <div className="relative w-full h-[620px] rounded-3xl bg-slate-950 border border-white/10 overflow-hidden shadow-2xl">
          {/* Interactive Google Map Canvas Container */}
          <div
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ display: apiKey && googleMapsLoaded ? "block" : "none" }}
          />

          {/* Google Maps Live status indicator */}
          {apiKey && googleMapsLoaded && (
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-[11px] text-emerald-300 backdrop-blur-md shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Google Maps Live</span>
            </div>
          )}

          {/* Offline Vector Representation (Only if API Key is not set or failed) */}
          {(!apiKey || !googleMapsLoaded) && (
            <div className="relative w-full h-full flex items-center justify-center p-6 bg-slate-950">
              {/* Informational Watermark Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-[11px] text-slate-300 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Interactive Canvas Mode (Maps Key Unset) · Vector Fallback</span>
              </div>

              {/* Geographic Coordinates Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

              <svg
                viewBox="0 0 100 100"
                className="w-full h-full max-h-[500px] text-slate-800/40"
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

              {/* Render Geo Points on Vector Fallback */}
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
            </div>
          )}

          {/* Traffic Legend Banner (When Traffic is active) */}
          {trafficEnabled && apiKey && (
            <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 backdrop-blur-xl text-[11px] text-emerald-300 z-30 flex items-center gap-2 shadow-lg">
              <Car className="w-3.5 h-3.5 text-emerald-400" />
              <span>Current traffic conditions via Google Maps (frequently refreshed)</span>
            </div>
          )}

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 backdrop-blur-xl text-xs space-y-1.5 z-30 shadow-xl">
            <div className="font-semibold text-white flex items-center gap-1.5 text-[11px] mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" /> Nepal Geodetic System
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Earthquakes (USGS Live)
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Open Civic Datasets
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> TRIHEX Desk &amp; Hubs
            </div>
          </div>

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
                  aria-label="Close details"
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
                <span className="text-[10px] font-mono text-cyan-400">
                  {selectedItem.distanceKm} km from KTM
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

          {/* Around Me Ephemeral Sliding Drawer */}
          {showAroundMeDrawer && userLocation && (
            <div className="absolute bottom-4 right-4 max-w-md w-full max-h-[480px] overflow-y-auto p-5 rounded-2xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl text-xs text-slate-200 shadow-2xl z-40 space-y-4 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <LocateFixed className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white text-sm">Around Me Registry</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAroundMeDrawer(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Radius Selector */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400 font-medium">Search Radius:</div>
                <div className="flex items-center gap-1.5">
                  {[5, 10, 25, 50, 100].map((radius) => (
                    <button
                      key={radius}
                      type="button"
                      onClick={() => setGeoRadiusKm(radius)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition ${
                        geoRadiusKm === radius
                          ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                          : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {radius} km
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Found <span className="font-bold text-white">{aroundMeItems.length}</span> civic points &amp; hubs within {geoRadiusKm} km of your location:
              </div>

              {/* Nearest Items List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {aroundMeItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      if (googleMapInstanceRef.current) {
                        googleMapInstanceRef.current.setCenter({ lat: item.lat, lng: item.lng });
                        googleMapInstanceRef.current.setZoom(12);
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-900/80 border border-white/5 hover:border-cyan-500/40 cursor-pointer transition flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="px-2 py-0.2 rounded text-[9px] font-bold text-white uppercase"
                          style={{ backgroundColor: item.color }}
                        >
                          {item.badge}
                        </span>
                        <span className="font-semibold text-white truncate max-w-[200px]">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.details}</p>
                    </div>
                    <span className="text-cyan-400 font-mono font-bold text-[11px] shrink-0">
                      {item.userDistanceKm} km
                    </span>
                  </div>
                ))}

                {aroundMeItems.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No seismic events or hubs found within {geoRadiusKm} km. Try selecting a wider radius (e.g., 50 km or 100 km).
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* View 2: Accessible List Alternative View */}
      {viewMode === "LIST" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10">
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-white">Accessible Point Registry:</span> All geospatial locations formatted for screen readers, high-contrast reading, and search.
            </div>
            <div className="w-full sm:w-72">
              <input
                type="text"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Search locations, magnitude, datasets..."
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Search geospatial locations"
              />
            </div>
          </div>

          <div className="sr-only" aria-live="polite">
            {filteredMarkers.length} location items matching criteria.
          </div>

          {/* Strictly 1 card per row on mobile (<640px) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {filteredMarkers.map((marker) => (
              <div
                key={marker.id}
                role="listitem"
                tabIndex={0}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-blue-500/40 hover:bg-slate-900/90 transition shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase font-mono"
                      style={{ backgroundColor: marker.color }}
                    >
                      {marker.badge}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                      {marker.distanceKm} km from KTM
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {marker.title}
                  </h3>

                  <p className="text-xs text-slate-400 font-medium">
                    {marker.subtitle}
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {marker.details}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-slate-500">
                    {marker.lat.toFixed(3)}°N, {marker.lng.toFixed(3)}°E
                  </span>

                  {marker.url ? (
                    <a
                      href={marker.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(marker);
                        setViewMode("MAP");
                      }}
                      className="text-xs text-slate-400 hover:text-white font-medium"
                    >
                      Locate on Map →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredMarkers.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-white/10 bg-slate-900/40 text-slate-400 text-sm">
              No geospatial points match your current search or layer filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
