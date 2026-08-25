"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { MapParkingItem } from "./ParkingMap";
import StatusBadge from "@web/components/ui/StatusBadge";

interface LeafletDarkMapProps {
  parkings: MapParkingItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Component to dynamically update map center on selection
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1 });
  }, [center, map]);
  return null;
}

// Create custom neon div icons for Leaflet
function createNeonIcon(price: number, isSelected: boolean) {
  const html = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      cursor: pointer;
    ">
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${isSelected ? "#00FFFF" : "rgba(0, 255, 255, 0.15)"};
        color: ${isSelected ? "#0A0A0F" : "#00FFFF"};
        border: 1px solid ${isSelected ? "#00FFFF" : "rgba(0, 255, 255, 0.4)"};
        box-shadow: ${isSelected ? "0 0 20px rgba(0, 255, 255, 0.7)" : "0 0 10px rgba(0, 255, 255, 0.2)"};
        transition: all 0.2s ease;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <span style="
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 9999px;
        background: rgba(10, 10, 15, 0.9);
        border: 1px solid ${isSelected ? "#00FFFF" : "rgba(255, 255, 255, 0.1)"};
        color: ${isSelected ? "#00FFFF" : "#8A8F98"};
        margin-top: 3px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      ">
        $${price.toFixed(2)}/hr
      </span>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-neon-leaflet-marker",
    iconSize: [40, 50],
    iconAnchor: [20, 50],
  });
}

export default function LeafletDarkMap({
  parkings,
  selectedId,
  onSelect,
}: LeafletDarkMapProps) {
  const selected = parkings.find((p) => p.id === selectedId);
  const center: [number, number] = selected
    ? [selected.lat, selected.lng]
    : parkings.length > 0
      ? [parkings[0].lat, parkings[0].lng]
      : [40.7128, -74.006];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full bg-[#0f0f16]"
        zoomControl={false}
      >
        <MapRecenter center={center} />

        {/* CartoDB Dark Matter Tiles (Free & Open Dark Map Layer) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {parkings.map((p) => {
          const isSelected = selectedId === p.id;
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={createNeonIcon(p.pricePerHour, isSelected)}
              eventHandlers={{
                click: () => onSelect(p.id),
              }}
            >
              <Popup className="custom-dark-popup">
                <div className="p-1 space-y-2 text-[#EDEDEF] font-sans min-w-[180px]">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-xs text-[#EDEDEF]">{p.name}</h4>
                    <span className="text-[11px] text-yellow-400 font-mono">★ {p.rating}</span>
                  </div>
                  <p className="text-[11px] text-[#8A8F98]">{p.address}</p>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <StatusBadge
                      status={p.availableSpots > 10 ? "available" : "pending"}
                    />
                    <span className="font-mono text-[#00FFFF] font-bold text-xs">
                      ${p.pricePerHour.toFixed(2)}/hr
                    </span>
                  </div>
                  <Link
                    href={`/parking/${p.id}`}
                    className="block text-center text-xs py-1 px-2 rounded bg-[#00FFFF]/20 text-[#00FFFF] font-medium hover:bg-[#00FFFF]/30 transition-colors mt-2"
                  >
                    Book 3D View →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
