"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

/* ── EV Charging Bay ──────────────────────────────────────── */
function EVChargingBay({ position, active = true }: { position: [number, number, number]; active?: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = active
        ? 0.8 + Math.sin(state.clock.elapsedTime * 2.5) * 0.3
        : 0.1;
    }
  });

  const color = active ? "#00FF88" : "#374151";
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.9, 1.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.4 : 0.05} transparent opacity={0.25} />
      </mesh>
      {/* EV charging bolt icon (simplified) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 0.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.8 : 0.1} transparent opacity={0.7} />
      </mesh>
      {/* Charging cable conduit */}
      <mesh position={[0.35, 0.15, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.5 : 0} transparent opacity={0.8} />
      </mesh>
      {active && <pointLight ref={lightRef} position={[0, 0.5, 0]} color="#00FF88" intensity={0.8} distance={3} />}
    </group>
  );
}

/* ── Individual Parking Slot ──────────────────────────────── */
function ParkingSlot({ position, occupied = false, ev = false }: {
  position: [number, number, number];
  occupied?: boolean;
  ev?: boolean;
}) {
  const color = ev ? "#00FF88" : occupied ? "#374151" : "#00FFFF";

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.8, 1.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={occupied ? 0 : ev ? 0.35 : 0.3} transparent opacity={occupied ? 0.12 : 0.22} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.35, 0.4, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={occupied ? 0.05 : 0.4} transparent opacity={0.6} wireframe />
      </mesh>
      {occupied && (
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.6, 0.25, 1.2]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
        </mesh>
      )}
    </group>
  );
}

/* ── Garage Floor ─────────────────────────────────────────── */
function GarageFloor({ yOffset = 0, slots, evBays = [] }: {
  yOffset?: number;
  slots: boolean[];
  evBays?: number[];
}) {
  return (
    <group position={[0, yOffset, 0]}>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 6]} />
        <meshStandardMaterial color="#0A0A12" metalness={0.5} roughness={0.7} transparent opacity={0.95} />
      </mesh>
      {/* Edge glow lines */}
      {[-4.5, 4.5].map((x, i) => (
        <mesh key={`edge-${i}`} position={[x, 0.05, 0]}>
          <boxGeometry args={[0.02, 0.02, 6]} />
          <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.5} transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Regular parking slots (top row) */}
      {slots.slice(0, 4).map((occupied, i) => {
        const isEV = evBays.includes(i);
        if (isEV) return <EVChargingBay key={i} position={[(i % 4) * 2 - 3, 0.01, -1.4]} active={!occupied} />;
        return <ParkingSlot key={i} position={[(i % 4) * 2 - 3, 0.01, -1.4]} occupied={occupied} ev={false} />;
      })}
      {/* Bottom row */}
      {slots.slice(4, 8).map((occupied, i) => {
        const isEV = evBays.includes(i + 4);
        if (isEV) return <EVChargingBay key={i + 4} position={[(i % 4) * 2 - 3, 0.01, 1.4]} active={!occupied} />;
        return <ParkingSlot key={i + 4} position={[(i % 4) * 2 - 3, 0.01, 1.4]} occupied={occupied} ev={false} />;
      })}
      {/* Column pillars */}
      {[-3.5, 0, 3.5].map((x, i) => (
        <mesh key={`pillar-${i}`} position={[x, 0.8, -2.9]}>
          <boxGeometry args={[0.2, 1.6, 0.2]} />
          <meshStandardMaterial color="#12121A" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Scroll-Driven Camera Controller ──────────────────────── */
function ScrollCamera({ scrollY }: { scrollY: number }) {
  const { camera } = useThree();

  useFrame(() => {
    // Keyframe positions for different scroll progress (0–1)
    const t = Math.min(Math.max(scrollY, 0), 1);

    // Camera sweeps: entrance → level 2 → EV zone → wide overhead
    const keyframes = [
      { pos: [6, 4, 8], target: [0, 0, 0] },       // 0% – hero overview
      { pos: [0, 2, 6], target: [0, 1.8, 0] },     // 33% – zoom into L1
      { pos: [-5, 5, 2], target: [0, 3.6, 0] },    // 66% – EV floor sweep
      { pos: [0, 9, 0.5], target: [0, 0, 0] },     // 100% – top-down
    ];

    const seg = t * (keyframes.length - 1);
    const i0 = Math.floor(seg);
    const i1 = Math.min(i0 + 1, keyframes.length - 1);
    const alpha = seg - i0;
    const ease = alpha < 0.5 ? 2 * alpha * alpha : -1 + (4 - 2 * alpha) * alpha;

    const from = keyframes[i0];
    const to = keyframes[i1];

    const tx = THREE.MathUtils.lerp(from.pos[0], to.pos[0], ease);
    const ty = THREE.MathUtils.lerp(from.pos[1], to.pos[1], ease);
    const tz = THREE.MathUtils.lerp(from.pos[2], to.pos[2], ease);

    camera.position.set(tx, ty, tz);
    camera.lookAt(
      THREE.MathUtils.lerp(from.target[0], to.target[0], ease),
      THREE.MathUtils.lerp(from.target[1], to.target[1], ease),
      THREE.MathUtils.lerp(from.target[2], to.target[2], ease),
    );
  });

  return null;
}

/* ── Animated Parking Garage ──────────────────────────────── */
function ParkingGarageModel({ autoRotate }: { autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.08 + 0.18;
    }
  });

  const floor1Slots = [true, false, true, false, false, true, false, false];
  const floor2Slots = [false, true, false, false, true, false, true, false];
  const floor3Slots = [false, false, true, false, false, false, false, true]; // EV floor

  return (
    <group ref={groupRef} rotation={[0.25, 0.18, 0]} position={[0, -1, 0]} scale={0.88}>
      <GarageFloor yOffset={0} slots={floor1Slots} />
      <GarageFloor yOffset={1.8} slots={floor2Slots} />
      <GarageFloor yOffset={3.6} slots={floor3Slots} evBays={[0, 2, 4, 6]} />

      {/* Inter-floor connecting columns */}
      {[-3.5, 0, 3.5].map((x) =>
        [0, 1.8].map((y, yi) => (
          <mesh key={`conn-${x}-${yi}`} position={[x, y + 0.9, 2.9]}>
            <boxGeometry args={[0.15, 1.8, 0.15]} />
            <meshStandardMaterial color="#12121A" metalness={0.7} roughness={0.3} />
          </mesh>
        ))
      )}

      {/* Roof accent line */}
      <mesh position={[0, 4.6, 0]}>
        <boxGeometry args={[9, 0.03, 0.03]} />
        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.9} transparent opacity={0.7} />
      </mesh>
      {/* EV floor accent (green) */}
      <mesh position={[0, 3.62, 0]}>
        <boxGeometry args={[9, 0.025, 0.025]} />
        <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={0.7} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/* ── Precomputed particle positions (module-level, stable) ── */
const GLOW_COUNT = 60;
const GLOW_POSITIONS = (() => {
  const pos = new Float32Array(GLOW_COUNT * 3);
  for (let i = 0; i < GLOW_COUNT; i++) {
    // Use deterministic pseudo-random based on index to satisfy purity
    const r1 = (((i * 7919 + 13) % 997) / 997) - 0.5;
    const r2 = (((i * 6271 + 17) % 883) / 883) - 0.5;
    const r3 = (((i * 5381 + 31) % 769) / 769) - 0.5;
    pos[i * 3] = r1 * 18;
    pos[i * 3 + 1] = r2 * 12;
    pos[i * 3 + 2] = r3 * 12;
  }
  return pos;
})();

const EV_COUNT = 25;
const EV_POSITIONS = (() => {
  const pos = new Float32Array(EV_COUNT * 3);
  for (let i = 0; i < EV_COUNT; i++) {
    const r1 = (((i * 4099 + 11) % 631) / 631) - 0.5;
    const r2 = ((i * 3571 + 23) % 541) / 541;
    const r3 = (((i * 2999 + 7) % 503) / 503) - 0.5;
    pos[i * 3] = r1 * 8;
    pos[i * 3 + 1] = 3.5 + r2 * 2;
    pos[i * 3 + 2] = r3 * 6;
  }
  return pos;
})();

/* ── Glow Particles ───────────────────────────────────────── */
function GlowParticles() {
  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.015;
      ref.current.rotation.x = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[GLOW_POSITIONS, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00FFFF" size={0.035} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

/* ── EV Particle Sparks (green) ───────────────────────────── */
function EVParticles() {
  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.04;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[EV_POSITIONS, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00FF88" size={0.05} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ── Main Hero Scene ──────────────────────────────────────── */
interface HeroSceneProps {
  /** Scroll progress 0–1 to drive cinematic camera. If undefined, auto-rotate mode. */
  scrollProgress?: number;
}

export default function HeroScene({ scrollProgress }: HeroSceneProps) {
  const cinematic = scrollProgress !== undefined;

  return (
    <div className="w-full h-full" aria-hidden="true">
      <Canvas
        camera={{ position: [6, 4, 8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#08080E"]} />
        <fog attach="fog" args={["#08080E", 14, 28]} />

        {/* Lighting */}
        <ambientLight intensity={0.12} />
        <directionalLight position={[5, 9, 5]} intensity={0.4} color="#E0E0FF" />
        <pointLight position={[-3, 2, -2]} intensity={0.7} color="#00FFFF" distance={14} />
        <pointLight position={[3, 4.5, 1]} intensity={0.5} color="#00FF88" distance={10} />
        <pointLight position={[3, 1, 3]} intensity={0.25} color="#3B82F6" distance={10} />

        {/* Stars background */}
        <Stars radius={40} depth={30} count={300} factor={2} saturation={0.5} fade speed={0.6} />

        {cinematic ? (
          <>
            <ScrollCamera scrollY={scrollProgress!} />
            <ParkingGarageModel autoRotate={false} />
          </>
        ) : (
          <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.25} floatingRange={[-0.08, 0.08]}>
            <ParkingGarageModel autoRotate={true} />
          </Float>
        )}

        <GlowParticles />
        <EVParticles />
      </Canvas>
    </div>
  );
}
