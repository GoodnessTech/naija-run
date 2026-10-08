import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { LANE_WIDTH } from '../core/GameState';
import { collectibleRegistry } from '../environment/CollectibleRegistry';

export function NairaCollectible({ id, lane = 0, z = 0, value = 100, isHighJump = false, isSlideBonus = false }) {
  const meshRef = useRef();

  // Load banknote texture
  const texture = useLoader(THREE.TextureLoader, '/assets/textures/naira_1000.jpg');

  // Value-based color styling:
  // ₦100: Warm Laterite Bronze / Copper tone with green accent
  // ₦500: Vivid Cyan / Electric Blue with silver hologram
  // ₦1,000: Rich Emerald Green / Gold hologram
  // ₦5,000: Royal Purple / Iridescent Gold high-roller note
  const { noteColor, emissiveColor, glowColor, scaleRatio } = useMemo(() => {
    if (value >= 5000) {
      return {
        noteColor: new THREE.Color('#9333ea'),
        emissiveColor: new THREE.Color('#7e22ce'),
        glowColor: '#c084fc',
        scaleRatio: 1.25,
      };
    } else if (value >= 1000) {
      return {
        noteColor: new THREE.Color('#059669'),
        emissiveColor: new THREE.Color('#047857'),
        glowColor: '#34d399',
        scaleRatio: 1.15,
      };
    } else if (value >= 500) {
      return {
        noteColor: new THREE.Color('#0284c7'),
        emissiveColor: new THREE.Color('#0369a1'),
        glowColor: '#38bdf8',
        scaleRatio: 1.05,
      };
    } else {
      // ₦100 default
      return {
        noteColor: new THREE.Color('#b45309'),
        emissiveColor: new THREE.Color('#92400e'),
        glowColor: '#fbbf24',
        scaleRatio: 0.95,
      };
    }
  }, [value]);

  const noteMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      color: noteColor,
      roughness: 0.25,
      metalness: 0.15,
      emissive: emissiveColor,
      emissiveIntensity: value >= 5000 ? 1.6 : 0.9,
      side: THREE.DoubleSide
    });
  }, [texture, noteColor, emissiveColor, value]);

  const haloMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: value >= 5000 ? 0.65 : 0.4,
      side: THREE.DoubleSide
    });
  }, [glowColor, value]);

  const laneX = lane * LANE_WIDTH;
  const baseY = isHighJump ? 2.4 : isSlideBonus ? 0.45 : 1.2;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const isCollected = collectibleRegistry.collectedNotes.has(id);
    meshRef.current.visible = !isCollected;
    if (isCollected) return;

    const dt = Math.min(delta, 0.05);
    // Smooth floating rotation and hover bob
    meshRef.current.rotation.y += dt * (value >= 1000 ? 3.8 : 3.0);
    meshRef.current.position.y = baseY + Math.sin(performance.now() * 0.005 + z) * 0.14;
  });

  return (
    <group ref={meshRef} position={[laneX, baseY, z]} scale={[scaleRatio, scaleRatio, scaleRatio]}>
      {/* 3D Banknote Card */}
      <mesh material={noteMaterial}>
        <boxGeometry args={[1.5, 0.78, 0.03]} />
      </mesh>

      {/* Holographic Glowing Border Halo */}
      <mesh material={haloMaterial}>
        <planeGeometry args={[1.72, 0.98]} />
      </mesh>

      {/* Denomination Value Token Ring for High-Value Notes (₦1k and ₦5k) */}
      {value >= 1000 && (
        <mesh position={[0, 0.65, 0]}>
          <ringGeometry args={[0.2, 0.32, 16]} />
          <meshBasicMaterial color={glowColor} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
