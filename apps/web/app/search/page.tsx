"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, MapPin, Car, Star, ChevronDown,
  Zap, Accessibility, Layers, Shield, Home, ArrowUpDown, ArrowRight
} from "lucide-react";
import Navbar from "@web/components/layout/Navbar";
import BottomNav from "@web/components/layout/BottomNav";
import GlassCard from "@web/components/ui/GlassCard";
import StatusBadge from "@web/components/ui/StatusBadge";
import NeonButton from "@web/components/ui/NeonButton";
import ParkingMap from "@web/components/map/ParkingMap";
import { INDIAN_TIER_1_CITIES, INDIA_PARKING_LOCATIONS } from "@web/lib/india-cities";
import { useCurrencyStore, CURRENCIES, formatPrice, type CurrencyCode } from "@web/lib/currency-store";

type FeatureFilter = "EV" | "ACCESSIBLE" | "COVERED" | "CCTV";
type SortMode = "DEFAULT" | "PRICE_ASC" | "PRICE_DESC" | "RATING" | "SPOTS";
type DensityFilter = "ALL" | "high" | "medium" | "low";

function DensityBadge({ zone }: { zone: "high" | "medium" | "low" }) {
  const map = {
    high: { label: "High Demand", cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
    medium: { label: "Medium Demand", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    low: { label: "Low Demand", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  };
  const { label, cls } = map[zone];
  return (
    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

export default function SearchPage() {
  const [selectedCityId, setSelectedCityId] = useState<string>("bengaluru");
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<"ALL" | "FOUR_WHEELER" | "TWO_WHEELER">("ALL");
  const [selectedParking, setSelectedParking] = useState<string | null>(null);
  const [featureFilters, setFeatureFilters] = useState<Set<FeatureFilter>>(new Set());
  const [densityFilter, setDensityFilter] = useState<DensityFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("DEFAULT");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [realListings, setRealListings] = useState<Array<Record<string, unknown> & { id: string, name: string, address: string, lat: number, lng: number, distance: number, pricePerHour: string, vehicleType: "TWO_WHEELER" | "FOUR_WHEELER" }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from API whenever city/filters change
  useEffect(() => {
    async function fetchSearch() {
      setLoading(true);
      try {
        const city = INDIAN_TIER_1_CITIES.find(c => c.id === selectedCityId);
        let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/search`;
        const params = new URLSearchParams();
        if (city) {
          params.append('lat', city.lat.toString());
          params.append('lng', city.lng.toString());
          params.append('radiusKm', '20'); // Wide search for a city
        }
        if (vehicleFilter !== 'ALL') {
          params.append('vehicleType', vehicleFilter);
        }
        if (params.toString()) {
          url += '?' + params.toString();
        }
        const res = await fetch(url);
        if (res.ok) {
          setRealListings(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSearch();
  }, [selectedCityId, vehicleFilter]);

  const { active: activeCurrency, setActive } = useCurrencyStore();

  const toggleFeature = (f: FeatureFilter) =>
    setFeatureFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) {
        next.delete(f);
      } else {
        next.add(f);
      }
      return next;
    });

  const filtered = useMemo(() => {
    // Merge real listings and mock listings for demo purposes, or just use real if present
    const apiMapped = realListings.map(r => ({
      id: r.id,
      cityId: selectedCityId,
      cityName: selectedCityId === 'ALL' ? 'India' : (INDIAN_TIER_1_CITIES.find(c => c.id === selectedCityId)?.name || 'India'),
      name: r.name,
      address: r.address,
      lat: r.lat,
      lng: r.lng,
      distance: r.distance > 0 ? (r.distance / 1000).toFixed(1) + ' km' : 'Near',
      pricePerHour: r.pricePerHour ? parseInt(r.pricePerHour) / 100 : 50,
      currency: "₹",
      availableSpots: 10, // Mock for now, DB doesn't track live spots without bookings
      totalSpots: 10,
      vehicleTypes: [r.vehicleType],
      rating: 5.0,
      isEV: false, isAccessible: false, isCovered: false, hasCCTV: false, cctvScore: 0, densityZone: "medium" as const
    }));

    // If API returned items, use them, otherwise fallback to mock so UI looks nice
    const baseList = apiMapped.length > 0 ? apiMapped : INDIA_PARKING_LOCATIONS;

    let list = baseList.filter((p) => {
      if (apiMapped.length === 0 && selectedCityId !== "ALL" && p.cityId !== selectedCityId) return false;
      if (vehicleFilter !== "ALL" && !p.vehicleTypes.includes(vehicleFilter)) return false;
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.address.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (featureFilters.has("EV") && !p.isEV) return false;
      if (featureFilters.has("ACCESSIBLE") && !p.isAccessible) return false;
      if (featureFilters.has("COVERED") && !p.isCovered) return false;
      if (featureFilters.has("CCTV") && !p.hasCCTV) return false;
      if (densityFilter !== "ALL" && p.densityZone !== densityFilter) return false;
      return true;
    });

    if (sortMode === "PRICE_ASC") list = [...list].sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (sortMode === "PRICE_DESC") list = [...list].sort((a, b) => b.pricePerHour - a.pricePerHour);
    if (sortMode === "RATING") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sortMode === "SPOTS") list = [...list].sort((a, b) => b.availableSpots - a.availableSpots);

    return list;
  }, [realListings, selectedCityId, vehicleFilter, searchQuery, featureFilters, densityFilter, sortMode]);

  const sortCycles: SortMode[] = ["DEFAULT", "PRICE_ASC", "PRICE_DESC", "RATING", "SPOTS"];
  const sortLabels: Record<SortMode, string> = {
    DEFAULT: "Sort by",
    PRICE_ASC: "Price ↑",
    PRICE_DESC: "Price ↓",
    RATING: "Rating",
    SPOTS: "Spots Available",
  };

  const cycleSortMode = () => {
    const idx = sortCycles.indexOf(sortMode);
    setSortMode(sortCycles[(idx + 1) % sortCycles.length]);
  };

  return (
    <div className="min-h-screen bg-bg-void">
      <Navbar />

      <div className="pt-20 flex flex-col lg:flex-row min-h-screen">
        {/* 3D / Dark Map Container */}
        <div className="flex-1 relative h-[48vh] lg:h-auto bg-bg-void overflow-hidden">
          <ParkingMap
            parkings={filtered}
            selectedId={selectedParking}
            onSelect={(id) => setSelectedParking(id)}
          />

          {/* Density Heatmap Legend Pill */}
          {showHeatmap && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 z-10 glass-elevated px-4 py-3 space-y-2"
            >
              <p className="hud-label text-[10px]">Density Heatmap</p>
              {(["high", "medium", "low"] as const).map((z) => (
                <div key={z} className="flex items-center gap-2.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      z === "high" ? "bg-rose-500 shadow-[0_0_8px_#F43F5E]"
                      : z === "medium" ? "bg-amber-400 shadow-[0_0_8px_#F59E0B]"
                      : "bg-emerald-400 shadow-[0_0_8px_#10B981]"
                    }`}
                  />
                  <span className="text-[11px] text-slate-300 font-mono capitalize">{z} demand</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Map Controls */}
          <div className="absolute bottom-5 left-5 flex gap-2.5 z-10">
            <button
              onClick={() => setShowHeatmap((v) => !v)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono rounded-xl border backdrop-blur-xl transition-all cursor-pointer ${
                showHeatmap
                  ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan shadow-[0_0_20px_rgba(103,232,249,0.3)]"
                  : "bg-bg-deep/80 border-white/10 text-muted hover:text-white hover:border-white/20"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Density Heatmap</span>
            </button>
          </div>
        </div>

        {/* Listings Sidebar */}
        <aside className="lg:w-[480px] bg-bg-deep/60 backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col">
          {/* Controls Panel */}
          <div className="p-4 sm:p-5 border-b border-white/10 space-y-3.5">
            {/* Currency selector + City Pills */}
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <select
                  id="search-currency-select"
                  value={activeCurrency}
                  onChange={(e) => setActive(e.target.value as CurrencyCode)}
                  className="appearance-none pl-2.5 pr-7 py-1.5 rounded-xl bg-white/5 border border-white/12 text-xs font-mono text-accent-cyan focus:outline-none cursor-pointer backdrop-blur-md"
                  aria-label="Select search currency"
                >
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                    <option key={code} value={code} className="bg-bg-deep text-white">
                      {CURRENCIES[code].symbol} {code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
              </div>

              {/* City selector horizontal scroll */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1 py-0.5">
                <button
                  onClick={() => setSelectedCityId("ALL")}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-all ${
                    selectedCityId === "ALL"
                      ? "bg-accent-cyan text-bg-deep font-bold shadow-[0_0_15px_rgba(103,232,249,0.5)]"
                      : "bg-white/5 border border-white/10 text-muted hover:text-white"
                  }`}
                >
                  All India
                </button>
                {INDIAN_TIER_1_CITIES.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCityId(city.id);
                      setSelectedParking(null);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-all ${
                      selectedCityId === city.id
                        ? "bg-accent-cyan text-bg-deep font-bold shadow-[0_0_15px_rgba(103,232,249,0.5)]"
                        : "bg-white/5 border border-white/10 text-muted hover:text-white"
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area, mall, tech park, metro..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted focus:border-accent-cyan focus:outline-none transition-all"
                aria-label="Search for parking"
              />
            </div>

            {/* Feature & Vehicle Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              {(["ALL", "FOUR_WHEELER", "TWO_WHEELER"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVehicleFilter(v)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    vehicleFilter === v
                      ? "bg-accent-cyan/20 border border-accent-cyan text-accent-cyan shadow-[0_0_12px_rgba(103,232,249,0.3)]"
                      : "bg-white/5 border border-white/10 text-muted hover:text-white"
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  {v === "ALL" ? "All Vehicles" : v === "FOUR_WHEELER" ? "4-Wheeler" : "2-Wheeler"}
                </button>
              ))}

              {([
                { key: "EV" as const, icon: <Zap className="w-3.5 h-3.5" />, label: "EV Fast" },
                { key: "ACCESSIBLE" as const, icon: <Accessibility className="w-3.5 h-3.5" />, label: "Accessible" },
                { key: "COVERED" as const, icon: <Home className="w-3.5 h-3.5" />, label: "Covered" },
                { key: "CCTV" as const, icon: <Shield className="w-3.5 h-3.5" />, label: "CCTV Safe" },
              ]).map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => toggleFeature(key)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    featureFilters.has(key)
                      ? "bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : "bg-white/5 border border-white/10 text-muted hover:text-white"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Density Zone Selector */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="hud-label text-[10px] shrink-0">Demand:</span>
              {(["ALL", "high", "medium", "low"] as const).map((z) => (
                <button
                  key={z}
                  onClick={() => setDensityFilter(z)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all cursor-pointer ${
                    densityFilter === z
                      ? z === "high"
                        ? "bg-rose-500/25 text-rose-300 border border-rose-500"
                        : z === "medium"
                        ? "bg-amber-500/25 text-amber-300 border border-amber-500"
                        : z === "low"
                        ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500"
                        : "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan"
                      : "bg-white/5 border border-white/10 text-muted hover:text-white"
                  }`}
                >
                  {z === "ALL" ? "All" : z.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="px-5 py-2.5 flex items-center justify-between border-b border-white/10 text-xs">
            <span className="text-muted">
              {loading ? <span className="animate-pulse">Searching...</span> : (
                <>
                  <span className="font-mono text-accent-cyan font-bold">{filtered.length}</span> locations in{" "}
                  <span className="text-white font-medium">
                    {selectedCityId === "ALL" ? "India" : INDIAN_TIER_1_CITIES.find((c) => c.id === selectedCityId)?.name}
                  </span>
                </>
              )}
            </span>
            <button
              onClick={cycleSortMode}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-white font-mono transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-accent-cyan" />
              {sortLabels[sortMode]}
            </button>
          </div>

          {/* 3D Perspective Tilt Listing Cards */}
          <div className="flex-1 overflow-y-auto px-4 py-3.5 pb-24 lg:pb-5 space-y-3.5">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted space-y-3">
                <MapPin className="w-8 h-8 text-muted/40 mx-auto" />
                <p className="text-sm">No parking hubs match the selected filters</p>
                <NeonButton
                  size="sm"
                  variant="chrome"
                  onClick={() => {
                    setSelectedCityId("ALL");
                    setSearchQuery("");
                    setVehicleFilter("ALL");
                    setFeatureFilters(new Set());
                    setDensityFilter("ALL");
                    setSortMode("DEFAULT");
                  }}
                >
                  Reset all filters
                </NeonButton>
              </div>
            ) : (
              filtered.map((parking) => (
                <Link key={parking.id} href={`/parking/${parking.id}`}>
                  <GlassCard
                    tilt
                    glow={selectedParking === parking.id}
                    className="p-4 space-y-3 group"
                    onClick={() => setSelectedParking(parking.id)}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading text-sm font-bold text-white group-hover:text-accent-cyan transition-colors truncate">
                            {parking.name}
                          </h3>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-chrome font-mono">
                            {parking.cityName}
                          </span>
                          <DensityBadge zone={parking.densityZone} />
                        </div>
                        <p className="text-xs text-muted flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 shrink-0 text-accent-cyan" />
                          <span className="truncate">{parking.address}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs shrink-0 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-mono font-bold text-white">{parking.rating}</span>
                      </div>
                    </div>

                    {/* Spots + Live Converted Price */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2.5">
                        <StatusBadge
                          status={
                            parking.availableSpots > 15
                              ? "available"
                              : parking.availableSpots > 0
                              ? "pending"
                              : "occupied"
                          }
                          dot
                        />
                        <span className="text-xs text-muted font-mono">
                          {parking.availableSpots}/{parking.totalSpots} spots
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-accent-cyan font-bold text-base text-glow">
                          {formatPrice(parking.pricePerHour, activeCurrency)}
                        </span>
                        <span className="text-xs text-muted font-normal">/hr</span>
                      </div>
                    </div>

                    {/* Features & CCTV Badge */}
                    <div className="flex gap-1.5 pt-2 border-t border-white/10 flex-wrap items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap">
                        {parking.isEV && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center gap-1 font-mono">
                            <Zap className="w-2.5 h-2.5" />EV
                          </span>
                        )}
                        {parking.isAccessible && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 flex items-center gap-1 font-mono">
                            <Accessibility className="w-2.5 h-2.5" />Accessible
                          </span>
                        )}
                        {parking.hasCCTV && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-violet/10 border border-accent-violet/25 text-accent-violet flex items-center gap-1 font-mono">
                            <Shield className="w-2.5 h-2.5" />{parking.cctvScore}% Safe
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-accent-cyan font-mono flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Select Bay <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </GlassCard>
                </Link>
              ))
            )}
          </div>
        </aside>
      </div>

      <BottomNav />
    </div>
  );
}
