"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { MapPin, Navigation, Star } from "lucide-react";
import Link from "next/link";
import GlassCard from "@web/components/ui/GlassCard";
import StatusBadge from "@web/components/ui/StatusBadge";

export interface MapParkingItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  pricePerHour: number;
  availableSpots: number;
  totalSpots: number;
  vehicleTypes: string[];
  rating: number;
}

interface ParkingMapProps {
  parkings: MapParkingItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

// Dynamically load Leaflet Dark Map (SSR false) for open dark tile mapping
const LeafletDarkMap = dynamic(() => import("./LeafletDarkMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg bg-bg-base flex items-center justify-center">
      <div className="flex items-center gap-2 text-muted text-xs">
        <div className="w-4 h-4 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
        <span>Loading Vector Dark Map...</span>
      </div>
    </div>
  ),
});

/* ── Dark Cyberpunk Google Map Style ───────────────────── */
export const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0f0f16" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f0f16" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8f98" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#00ffff" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#16161f" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1d1d28" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#16161f" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8f98" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1e3a8a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0a0a0f" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#00ffff" }],
  },
];

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 };

export default function ParkingMap({
  parkings,
  selectedId,
  onSelect,
  className = "",
}: ParkingMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);
  const [forceVectorMap, setForceVectorMap] = useState(false);

  useEffect(() => {
    // Intercept Google Maps auth failure globally
    if (typeof window !== "undefined") {
      (window as any).gm_authFailure = () => {
        console.warn("Google Maps auth failure detected. Auto-switching to Open Vector Map.");
        setMapError(true);
      };
    }
  }, []);

  const selectedParking = parkings.find((p) => p.id === selectedId);
  const center = selectedParking
    ? { lat: selectedParking.lat, lng: selectedParking.lng }
    : parkings.length > 0
      ? { lat: parkings[0].lat, lng: parkings[0].lng }
      : DEFAULT_CENTER;

  // Open Dark Map (CartoDB Dark Matter) if Google Maps API key is not configured, failed, or user prefers vector
  if (!apiKey || mapError || forceVectorMap) {
    return (
      <div className={`relative w-full h-full bg-bg-base overflow-hidden ${className}`}>
        {/* Full Open Dark Vector Map */}
        <LeafletDarkMap
          parkings={parkings}
          selectedId={selectedId}
          onSelect={onSelect}
        />

        {/* API Key / Provider info overlay */}
        <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 z-20 max-w-sm">
          <GlassCard className="p-3 text-xs space-y-1.5" glow>
            <div className="flex items-center justify-between text-accent-cyan">
              <span className="font-semibold flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 animate-pulse" /> Dark Vector Map Active
              </span>
              <span className="hud-label text-[9px] bg-accent-cyan/10 px-1.5 py-0.5 rounded border border-accent-cyan/20">
                100% ONLINE
              </span>
            </div>
            <p className="text-muted text-[11px] leading-relaxed">
              {mapError
                ? "Google Maps key encountered an authorization or billing error. Auto-fallback to High-Performance Dark Vector Map is active."
                : "Rendering Open Dark Vector Tiles (CartoDB/OpenStreetMap). Fully operational with zero API key dependencies."}
            </p>
            {apiKey && mapError && (
              <button
                onClick={() => { setMapError(false); setForceVectorMap(false); }}
                className="mt-1 text-[10px] text-accent-cyan underline hover:text-white transition-colors cursor-pointer"
              >
                Retry Google Maps Platform
              </button>
            )}
          </GlassCard>
        </div>
      </div>
    );
  }

  // Full Google Maps JS API view when API key is provided
  return (
    <div className={`relative w-full h-full ${className}`}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={14}
          styles={darkMapStyle}
          disableDefaultUI={false}
          zoomControl={true}
          mapId="SMART_PARKING_DARK_MAP"
          className="w-full h-full"
        >
          {parkings.map((p) => {
            const isSelected = selectedId === p.id;
            return (
              <AdvancedMarker
                key={p.id}
                position={{ lat: p.lat, lng: p.lng }}
                onClick={() => {
                  onSelect(p.id);
                  setActiveInfoWindow(p.id);
                }}
              >
                <div
                  className={`
                    flex flex-col items-center gap-1 group cursor-pointer
                    transition-all duration-200
                    ${isSelected ? "scale-125 z-20" : "hover:scale-110 z-10"}
                  `}
                >
                  <div
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center
                      ${
                        isSelected
                          ? "bg-accent-cyan text-bg-deep shadow-[0_0_20px_rgba(0,255,255,0.7)]"
                          : "bg-bg-elevated border border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/20"
                      }
                    `}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bg-deep/90 border border-accent-cyan/30 text-accent-cyan font-bold shadow-md">
                    ${p.pricePerHour.toFixed(2)}
                  </span>
                </div>
              </AdvancedMarker>
            );
          })}

          {activeInfoWindow && (
            <InfoWindow
              position={{
                lat: parkings.find((p) => p.id === activeInfoWindow)?.lat ?? 0,
                lng: parkings.find((p) => p.id === activeInfoWindow)?.lng ?? 0,
              }}
              onCloseClick={() => setActiveInfoWindow(null)}
            >
              {(() => {
                const info = parkings.find((p) => p.id === activeInfoWindow);
                if (!info) return null;
                return (
                  <div className="p-2 space-y-2 text-foreground font-sans min-w-[200px]">
                    <div className="flex items-start justify-between">
                      <h4 className="font-heading font-semibold text-sm">{info.name}</h4>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{info.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted">{info.address}</p>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <StatusBadge
                        status={info.availableSpots > 10 ? "available" : "pending"}
                      />
                      <span className="font-mono text-accent-cyan font-bold">
                        ${info.pricePerHour.toFixed(2)}/hr
                      </span>
                    </div>
                    <Link
                      href={`/parking/${info.id}`}
                      className="block text-center text-xs py-1.5 rounded bg-accent-cyan/20 text-accent-cyan font-medium hover:bg-accent-cyan/30 transition-colors mt-2"
                    >
                      Book 3D View →
                    </Link>
                  </div>
                );
              })()}
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
