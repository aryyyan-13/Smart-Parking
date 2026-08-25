"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MapPin, Clock, Shield, Zap, Search, CarFront,
  CalendarCheck, ChevronDown, Cpu, Sparkles, ArrowRight, Activity, BatteryCharging, Radio
} from "lucide-react";
import Navbar from "@web/components/layout/Navbar";
import NeonButton from "@web/components/ui/NeonButton";
import GlassCard from "@web/components/ui/GlassCard";
import HUDLabel from "@web/components/ui/HUDLabel";
import ParticleField from "@web/components/ui/ParticleField";

// Lazy-load 3D garage scene
const HeroScene = dynamic(() => import("@web/components/3d/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#050508] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
    </div>
  ),
});

/* ── 3D Interactive Feature Items with Flip Details ────────── */
const interactiveFeatures = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Spatial Discovery",
    desc: "3D map search with density heatmaps, safety ratings, and multi-currency pricing across 12 Tier-1 cities.",
    backTitle: "Telemetry Specs",
    backDetails: ["Sub-second GPS geocoding", "CCTV AI safety scoring", "Real-time occupancy heatmaps"],
    tag: "LIVE MAP",
    accent: "cyan",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "150 kW EV Supercharge",
    desc: "Reserve dual-connector ultra-fast charging bays. Real-time kilowatt delivery tracking and status alerts.",
    backTitle: "Charging Matrix",
    backDetails: ["CCS2 & CHAdeMO standards", "20% → 80% in 28 mins", "Dynamic load balancing"],
    tag: "FAST-CHARGE",
    accent: "cyan",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "ANPR Computer Vision",
    desc: "Automated license plate recognition and line-crossing rule enforcement powered by ESP32 sensor mesh.",
    backTitle: "Vision Engine",
    backDetails: ["99.4% OCR precision", "Automated gate barrier clearance", "Double-bay violation alarms"],
    tag: "AI VISION",
    accent: "violet",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Pay-As-You-Park",
    desc: "Live in-app parking meter ticking by the second. Expiry warning alerts and 1-tap extension checkout.",
    backTitle: "Meter Engine",
    backDetails: ["Exact duration billing", "15-min proactive expiry alerts", "UPI / Card / NetBanking"],
    tag: "LIVE METER",
    accent: "rose",
  },
];

/* ── Step items ───────────────────────────────────────────── */
const steps = [
  {
    num: "01",
    icon: <Search className="w-7 h-7" />,
    title: "Discover Spatial Hubs",
    desc: "Explore high-density parking zones on the interactive 3D heatmap filtered by EV, 2-wheeler, or coverage.",
  },
  {
    num: "02",
    icon: <CarFront className="w-7 h-7" />,
    title: "Lock Your Bay",
    desc: "Choose standard or 150 kW ultra-fast charge tiers with instant slot allocation and price conversion.",
  },
  {
    num: "03",
    icon: <CalendarCheck className="w-7 h-7" />,
    title: "Gate Clearance",
    desc: "Roll up to the barrier — ANPR plate recognition and holographic passes grant immediate zero-touch entry.",
  },
];

/* ── Staggered Scroll-Driven Section Reveal ─────────────────── */
function RevealSection({
  children,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const initialVariants = {
    up: { opacity: 0, y: 40 },
    left: { opacity: 0, x: -40 },
    right: { opacity: 0, x: 40 },
  };

  return (
    <motion.div
      initial={initialVariants[direction]}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const [scrollProgress3D, setScrollProgress3D] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      // Drive 3D camera from 0 to 0.25 of page scroll
      setScrollProgress3D(Math.min(v / 0.25, 1));
    });
  }, [scrollYProgress]);

  // Parallax transforms for hero typography
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <main ref={containerRef} className="min-h-screen bg-bg-void relative selection:bg-accent-cyan/30">
      <Navbar />

      {/* ── HERO SECTION WITH 3D CANVAS & AMBIENT PARTICLES ─── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
        aria-label="SmartPark Hero"
      >
        {/* Background 3D Scene */}
        <div className="absolute inset-0 z-0">
          <HeroScene scrollProgress={scrollProgress3D} />
        </div>

        {/* Ambient Particle Field */}
        <ParticleField count={32} className="z-[2]" />

        {/* Depth Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg-void/90 via-bg-void/50 to-transparent z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-bg-void via-bg-void/80 to-transparent z-[1]" />

        {/* Hero Content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-20"
        >
          <div className="max-w-2xl space-y-8">
            {/* Status Pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/12 backdrop-blur-xl shadow-[0_0_20px_rgba(103,232,249,0.15)]"
            >
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse shadow-[0_0_8px_#67E8F9]" />
              <span className="text-xs font-mono tracking-wider text-chrome-bright">
                SPATIAL 3D ARCHITECTURE · v2.4
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-accent-cyan/20 text-accent-cyan font-bold">
                LIVE
              </span>
            </motion.div>

            {/* Headline with Staggered Word Reveal */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]"
              >
                <span className="text-chrome">Next-Gen</span>{" "}
                <span className="text-ice text-glow">Spatial</span>
                <br />
                <span className="text-white">Parking Mesh.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg sm:text-xl text-muted max-w-xl leading-relaxed font-normal"
              >
                Real-time parking discovery with 150 kW EV fast-charging, ESP32 computer vision ANPR,
                and pay-as-you-park live telemetry.
              </motion.p>
            </div>

            {/* Magnetic CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-3.5 pt-1"
            >
              <Link href="/search">
                <NeonButton variant="primary" size="lg" pulse magnetic>
                  <Search className="w-4 h-4" />
                  Explore Live 3D Map
                  <ArrowRight className="w-4 h-4 ml-1" />
                </NeonButton>
              </Link>
              <Link href="/meter">
                <NeonButton variant="chrome" size="lg" magnetic>
                  <Clock className="w-4 h-4" />
                  Open Live Meter
                </NeonButton>
              </Link>
              <Link href="/deck">
                <NeonButton variant="secondary" size="lg" magnetic>
                  <Cpu className="w-4 h-4" />
                  HUD Deck
                </NeonButton>
              </Link>
            </motion.div>

            {/* Live Telemetry Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap gap-3 pt-3"
            >
              <HUDLabel icon={<Activity className="w-3.5 h-3.5 text-accent-cyan" />} value="99.4%">
                Mesh Uptime
              </HUDLabel>
              <HUDLabel icon={<BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />} value="150 kW">
                EV Fast Power
              </HUDLabel>
              <HUDLabel icon={<Radio className="w-3.5 h-3.5 text-accent-violet" />} value="< 30ms">
                Sensor Latency
              </HUDLabel>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 pointer-events-none"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[10px] text-chrome font-mono tracking-widest uppercase">Explore Garage</span>
          <ChevronDown className="w-4 h-4 text-accent-cyan" />
        </motion.div>
      </section>

      {/* ── 3D FLIP FEATURE CARDS SECTION ────────────────────── */}
      <section className="relative py-28 sm:py-36 border-t border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/25 text-accent-cyan text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                INTERACTIVE 3D PLATFORM
              </div>
              <h2 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight">
                Architected for <span className="text-ice text-glow">Spatial Precision</span>
              </h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                Hover or click any card to flip and inspect live hardware telemetry and AI specs.
              </p>
            </div>
          </RevealSection>

          {/* Grid of 3D Flip Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {interactiveFeatures.map((f, i) => (
              <RevealSection key={i} delay={i * 0.08} direction="up">
                <GlassCard
                  flip
                  className="h-[280px]"
                  front={
                    <div className="h-full flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-accent-cyan shadow-[0_0_20px_rgba(103,232,249,0.25)]">
                            {f.icon}
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-chrome">
                            {f.tag}
                          </span>
                        </div>
                        <h3 className="font-heading text-lg font-bold text-white">{f.title}</h3>
                        <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-accent-cyan">
                        <span>Flip to inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  }
                  back={
                    <div className="h-full flex flex-col justify-between text-left">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-accent-cyan">
                          <Activity className="w-4 h-4" />
                          <span className="font-mono text-xs font-bold uppercase tracking-wider">{f.backTitle}</span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {f.backDetails.map((detail, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 text-center">
                        ✓ Hardware Simulated Nominal
                      </div>
                    </div>
                  }
                />
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CINEMATIC EV FAST-CHARGE GRID ────────────────────── */}
      <section className="relative py-28 sm:py-36 border-t border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
                <Zap className="w-3.5 h-3.5" />
                INTEGRATED CHARGING MATRIX
              </div>
              <h2 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight">
                High-Voltage <span className="text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">Fast Charging</span>
              </h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                Select your power tier during booking. High-efficiency DC converters deliver guaranteed output.
              </p>
            </div>
          </RevealSection>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { kW: "50 kW", label: "AC Fast Hub", desc: "Designed for 2–3 hour stays. Full 20% to 80% charge in ~60 min.", price: "₹120 / session", badge: "POPULAR" },
              { kW: "150 kW", label: "DC Ultra-Fast", desc: "High-voltage direct charging. Up to 250 km range in just 20 minutes.", price: "₹220 / session", badge: "FASTEST" },
              { kW: "11 kW", label: "Overnight Eco", desc: "Standard level-2 charging for work days and long airport parking.", price: "₹60 / session", badge: "SAVINGS" },
            ].map((tier, i) => (
              <RevealSection key={i} delay={i * 0.1} direction="up">
                <GlassCard tilt hover className="p-6 space-y-4 h-full relative group">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300">
                      <Zap className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                      {tier.badge}
                    </span>
                  </div>
                  <div>
                    <p className="font-heading text-3xl font-black text-white">{tier.kW}</p>
                    <p className="text-xs font-mono text-emerald-400">{tier.label}</p>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{tier.desc}</p>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between font-mono text-sm">
                    <span className="text-white font-bold">{tier.price}</span>
                    <span className="text-[11px] text-muted">Add at checkout</span>
                  </div>
                </GlassCard>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS STEPS ───────────────────────────────── */}
      <section className="relative py-28 sm:py-36 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight">
                Three Steps to <span className="text-ice text-glow">Frictionless Parking</span>
              </h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                No tickets, no barrier queues. Pure spatial intelligence.
              </p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <RevealSection key={i} delay={i * 0.12} direction={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                <GlassCard tilt className="p-8 text-center space-y-4 h-full relative">
                  <div className="font-mono text-5xl font-black text-white/10">{step.num}</div>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-accent-cyan shadow-[0_0_25px_rgba(103,232,249,0.25)]">
                    {step.icon}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-muted leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </GlassCard>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMAND DECK CTA SECTION ─────────────────────────── */}
      <section className="relative py-28 sm:py-36 border-t border-white/10 overflow-hidden">
        <RevealSection>
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/25 text-accent-cyan text-xs font-mono">
              <Cpu className="w-3.5 h-3.5" />
              COMMAND & CONTROL
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight">
              Ready to Step Into the{" "}
              <span className="text-ice text-glow">Future?</span>
            </h2>
            <p className="text-lg text-muted max-w-xl mx-auto leading-relaxed">
              Launch our full suite of interactive tools: Live Parking Meter, 3D Heatmaps,
              IoT Sensor Sandbox, and Host Verification Desk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <NeonButton variant="primary" size="lg" pulse magnetic>
                  <Search className="w-4 h-4" />
                  Find Live Parking
                </NeonButton>
              </Link>
              <Link href="/deck">
                <NeonButton variant="chrome" size="lg" magnetic>
                  <Cpu className="w-4 h-4" />
                  Launch HUD Deck
                </NeonButton>
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-10 bg-bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
            </div>
            <span className="font-heading text-base font-bold text-white">
              Smart<span className="text-accent-cyan">Park</span> 3D
            </span>
          </div>
          <p className="text-xs text-muted font-mono">
            © {new Date().getFullYear()} SmartPark Spatial Intelligence. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
