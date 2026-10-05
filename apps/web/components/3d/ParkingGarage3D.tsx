"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { rawColors } from "@web/lib/design-tokens";

/* ── Types ─────────────────────────────────────────────── */
export interface SlotData {
  id: string;
  index: number;
  occupied: boolean;
  label: string;
}

interface ParkingGarageProps {
  floors: FloorData[];
  activeFloor: number;
  selectedSlot: string | null;
  onSlotClick: (slotId: string) => void;
}

export interface FloorData {
  id: string;
  label: string;
  slots: SlotData[];
}

/* ── Individual 3D Slot ────────────────────────────────── */
function Slot3D({
  slot,
  position,
  isSelected,
  onClick,
}: {
  slot: SlotData;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = slot.occupied
    ? rawColors.dark.occupied
    : isSelected
      ? rawColors.dark.selected
      : hovered
        ? "#00DDDD"
        : rawColors.dark.accentCyan;

  const emissiveIntensity = slot.occupied ? 0 : isSelected ? 0.8 : hovered ? 0.5 : 0.3;
  const opacity = slot.occupied ? 0.2 : isSelected ? 0.5 : hovered ? 0.4 : 0.3;

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y =
        position[1] + 0.01 + Math.sin(state.clock.elapsedTime * 3) * 0.005;
    }
  });

  return (
    <group position={position}>
      {/* Slot surface */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (!slot.occupied) onClick();
        }}
        onPointerOver={() => {
          if (!slot.occupied) {
            setHovered(true);
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <planeGeometry args={[0.85, 1.7]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Slot label */}
      <React.Suspense fallback={null}>
        <Text
          position={[0, 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.18}
          color={slot.occupied ? rawColors.dark.textMuted : rawColors.dark.textPrimary}
          anchorX="center"
          anchorY="middle"
        >
          {slot.label}
        </Text>
      </React.Suspense>

      {/* Occupied car block */}
      {slot.occupied && (
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.65, 0.28, 1.2]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
        </mesh>
      )}

      {/* Selection glow ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[0.5, 0.55, 32]} />
          <meshStandardMaterial
            color={rawColors.dark.selected}
            emissive={rawColors.dark.selected}
            emissiveIntensity={1}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

/* ── Floor Level ───────────────────────────────────────── */
function FloorLevel({
  floor,
  yOffset,
  isActive,
  selectedSlot,
  onSlotClick,
}: {
  floor: FloorData;
  yOffset: number;
  isActive: boolean;
  selectedSlot: string | null;
  onSlotClick: (slotId: string) => void;
}) {
  const opacity = isActive ? 0.95 : 0.15;

  return (
    <group position={[0, yOffset, 0]}>
      {/* Floor platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial
          color={rawColors.dark.bgBase}
          metalness={0.4}
          roughness={0.7}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Edge glows */}
      {[-10, 10].map((x, i) => (
        <mesh key={`edge-${i}`} position={[x, 0.03, 0]}>
          <boxGeometry args={[0.02, 0.02, 15]} />
          <meshStandardMaterial
            color={rawColors.dark.accentCyan}
            emissive={rawColors.dark.accentCyan}
            emissiveIntensity={isActive ? 0.6 : 0.1}
            transparent
            opacity={isActive ? 0.7 : 0.1}
          />
        </mesh>
      ))}

      {/* Slots - Grid of 10 columns by 5 rows */}
      {isActive &&
        floor.slots.map((slot, i) => {
          const colIndex = i % 10;
          const rowIndex = Math.floor(i / 10);
          
          const col = colIndex * 1.8 - 8.1;
          const row = rowIndex * 2.8 - 5.6;
          return (
            <Slot3D
              key={slot.id}
              slot={slot}
              position={[col, 0.01, row]}
              isSelected={selectedSlot === slot.id}
              onClick={() => onSlotClick(slot.id)}
            />
          );
        })}

      {/* Pillars */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <mesh key={`pillar-${i}`} position={[x, 0.9, -7]}>
          <boxGeometry args={[0.3, 1.8, 0.3]} />
          <meshStandardMaterial
            color={rawColors.dark.bgElevated}
            metalness={0.6}
            roughness={0.4}
            transparent
            opacity={isActive ? 0.9 : 0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Main 3D Parking Garage Viewer ─────────────────────── */
export default function ParkingGarage3D({
  floors,
  activeFloor,
  selectedSlot,
  onSlotClick,
}: ParkingGarageProps) {
  return (
    <div className="w-full h-full" role="img" aria-label="Interactive 3D parking garage viewer">
      <Canvas
        camera={{ position: [0, 15, 12], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <React.Suspense fallback={null}>
          <color attach="background" args={[rawColors.dark.bgDeep]} />
          <fog attach="fog" args={[rawColors.dark.bgDeep, 15, 30]} />

          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 10, 5]} intensity={0.5} color="#E0E0FF" />
          <pointLight position={[-4, 3, -3]} intensity={0.5} color="#00FFFF" distance={15} />
          <pointLight position={[4, 2, 4]} intensity={0.3} color="#3B82F6" distance={12} />

          {/* Floors */}
          {floors.map((floor, i) => (
            <FloorLevel
              key={floor.id}
              floor={floor}
              yOffset={i * 2.2}
              isActive={i === activeFloor}
              selectedSlot={selectedSlot}
              onSlotClick={onSlotClick}
            />
          ))}

          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={8}
            maxDistance={20}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
