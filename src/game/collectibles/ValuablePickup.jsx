import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { LANE_WIDTH } from '../core/GameState';
import { SHARED_MATS } from '../environment/SharedMaterials';
import { PICKUP_TYPE } from '../obstacles/ObstacleConstants';

import { collectibleRegistry } from '../environment/CollectibleRegistry';

export function ValuablePickup({ id, type, lane, z }) {
  const groupRef = useRef();
  const laneX = lane * LANE_WIDTH;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const isCollected =
      type === PICKUP_TYPE.POINT_CATALYST
        ? collectibleRegistry.triggeredCatalysts.has(id)
        : collectibleRegistry.collectedValuables.has(id);

    groupRef.current.visible = !isCollected;
    if (isCollected) return;

    // Smooth continuous 3D rotation and bobbing
    groupRef.current.rotation.y += delta * 2.4;
    groupRef.current.position.y = 1.1 + Math.sin(performance.now() * 0.004) * 0.15;
  });

  return (
    <group position={[laneX, 0, z]}>
      <group ref={groupRef} position={[0, 1.1, 0]}>
        {/* 1. 2X MULTIPLIER TOKEN */}
        {type === PICKUP_TYPE.MULTIPLIER_2X && (
          <group>
            {/* Spinning Golden Hexagonal Medallion */}
            <mesh material={SHARED_MATS.goldShimmer}>
              <cylinderGeometry args={[0.55, 0.55, 0.12, 6]} />
            </mesh>
            {/* Emerald Core Ring */}
            <mesh position={[0, 0, 0.07]} material={SHARED_MATS.spiritGreen}>
              <torusGeometry args={[0.38, 0.08, 8, 16]} />
            </mesh>
            {/* 2X Cross Symbol */}
            <mesh position={[-0.1, 0, 0.08]} material={SHARED_MATS.goldShimmer}>
              <boxGeometry args={[0.08, 0.32, 0.04]} />
            </mesh>
            <mesh position={[0.12, 0, 0.08]} rotation={[0, 0, Math.PI / 4]} material={SHARED_MATS.goldShimmer}>
              <boxGeometry args={[0.08, 0.28, 0.04]} />
            </mesh>
            <mesh position={[0.12, 0, 0.08]} rotation={[0, 0, -Math.PI / 4]} material={SHARED_MATS.goldShimmer}>
              <boxGeometry args={[0.08, 0.28, 0.04]} />
            </mesh>
            {/* Pulsing Aura */}
            <pointLight color="#10b981" intensity={2.5} distance={5} />
          </group>
        )}

        {/* 2. CORAL BEADS (+₦5,000 cash & +500 PTS) */}
        {type === PICKUP_TYPE.CORAL_BEADS && (
          <group rotation={[Math.PI / 3, 0, 0]}>
            {/* Double Row of Radiant Red Beads */}
            <mesh material={SHARED_MATS.coralRed}>
              <torusGeometry args={[0.42, 0.09, 8, 20]} />
            </mesh>
            <mesh material={SHARED_MATS.coralRed}>
              <torusGeometry args={[0.55, 0.08, 8, 24]} />
            </mesh>
            {/* Central Royal Pendant */}
            <mesh position={[0, -0.6, 0]} material={SHARED_MATS.goldShimmer}>
              <octahedronGeometry args={[0.18, 0]} />
            </mesh>
            <pointLight color="#e11d48" intensity={2.0} distance={4} />
          </group>
        )}

        {/* 3. GOLDEN SPIKES (Shield + Speed) */}
        {type === PICKUP_TYPE.GOLDEN_SPIKES && (
          <group scale={[0.85, 0.85, 0.85]}>
            {/* Left Shoe */}
            <mesh position={[-0.2, 0, 0]} material={SHARED_MATS.goldShimmer}>
              <boxGeometry args={[0.22, 0.18, 0.55]} />
            </mesh>
            {/* Right Shoe */}
            <mesh position={[0.2, 0.08, 0]} material={SHARED_MATS.goldShimmer}>
              <boxGeometry args={[0.22, 0.18, 0.55]} />
            </mesh>
            {/* Wings */}
            <mesh position={[-0.34, 0.12, 0]} rotation={[0, 0, 0.4]} material={SHARED_MATS.lightningCyan}>
              <coneGeometry args={[0.14, 0.4, 4]} />
            </mesh>
            <mesh position={[0.34, 0.2, 0]} rotation={[0, 0, -0.4]} material={SHARED_MATS.lightningCyan}>
              <coneGeometry args={[0.14, 0.4, 4]} />
            </mesh>
            <pointLight color="#fbbf24" intensity={2.2} distance={4} />
          </group>
        )}

        {/* 4. SANGO SHADES (Naira Magnet for 12s) */}
        {type === PICKUP_TYPE.SANGO_SHADES && (
          <group scale={[1.1, 1.1, 1.1]}>
            {/* Left Lens */}
            <mesh position={[-0.22, 0, 0]} material={SHARED_MATS.flameOrange}>
              <cylinderGeometry args={[0.16, 0.16, 0.04, 12]} />
            </mesh>
            {/* Right Lens */}
            <mesh position={[0.22, 0, 0]} material={SHARED_MATS.flameOrange}>
              <cylinderGeometry args={[0.16, 0.16, 0.04, 12]} />
            </mesh>
            {/* Gold Frame Bridge */}
            <mesh material={SHARED_MATS.goldShimmer}>
              <boxGeometry args={[0.65, 0.04, 0.05]} />
            </mesh>
            <pointLight color="#ea580c" intensity={2.4} distance={4} />
          </group>
        )}

        {/* 5. ROYAL AGBADA (+₦10,000 Mega Cash) */}
        {type === PICKUP_TYPE.ROYAL_AGBADA && (
          <group scale={[0.9, 0.9, 0.9]}>
            {/* Broad flowing ceremonial robe mantle */}
            <mesh material={SHARED_MATS.goldShimmer}>
              <cylinderGeometry args={[0.18, 0.65, 0.9, 6]} />
            </mesh>
            {/* Traditional neck embroidery */}
            <mesh position={[0, 0.45, 0]} material={SHARED_MATS.coralRed}>
              <torusGeometry args={[0.22, 0.05, 6, 12]} />
            </mesh>
            <pointLight color="#f59e0b" intensity={3.0} distance={5} />
          </group>
        )}

        {/* 6. POINT CATALYST (-100 PTS CURSED HAZARD!) */}
        {type === PICKUP_TYPE.POINT_CATALYST && (
          <group scale={[0.9, 0.9, 0.9]}>
            {/* Dark Cursed Skull */}
            <mesh material={SHARED_MATS.catalystPurple}>
              <dodecahedronGeometry args={[0.38, 1]} />
            </mesh>
            {/* Glowing Red Eyes */}
            <mesh position={[-0.14, 0.08, 0.32]} material={SHARED_MATS.potRed}>
              <sphereGeometry args={[0.07, 6, 6]} />
            </mesh>
            <mesh position={[0.14, 0.08, 0.32]} material={SHARED_MATS.potRed}>
              <sphereGeometry args={[0.07, 6, 6]} />
            </mesh>
            {/* Spiked Horns */}
            <mesh position={[-0.24, 0.35, 0]} rotation={[0, 0, 0.5]} material={SHARED_MATS.tree}>
              <coneGeometry args={[0.08, 0.4, 5]} />
            </mesh>
            <mesh position={[0.24, 0.35, 0]} rotation={[0, 0, -0.5]} material={SHARED_MATS.tree}>
              <coneGeometry args={[0.08, 0.4, 5]} />
            </mesh>
            {/* Floating Warning -100 Badge */}
            <mesh position={[0, 0.65, 0]} material={SHARED_MATS.potRed}>
              <boxGeometry args={[0.5, 0.22, 0.06]} />
            </mesh>
            <pointLight color="#7e22ce" intensity={2.8} distance={5} />
          </group>
        )}
      </group>

      {/* Floating Ground Reflection / Shadow */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.5, 12]} />
        <meshBasicMaterial
          color={type === PICKUP_TYPE.POINT_CATALYST ? '#7e22ce' : '#10b981'}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}
