import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { LANE_WIDTH, GAME_STATUS } from '../core/GameState';
import { collectibleRegistry } from '../environment/CollectibleRegistry';

export function NairaCollectible({ id, lane = 0, z = 0 }) {
  const meshRef = useRef();

  // Load the authentic fictional ₦1,000 banknote texture
  const texture = useLoader(THREE.TextureLoader, '/assets/textures/naira_1000.jpg');

  const noteMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.1,
      emissive: new THREE.Color('#059669'),
      emissiveIntensity: 0.95,
      side: THREE.DoubleSide
    });
  }, [texture]);

  const haloMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#34d399',
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
  }, []);

  const laneX = lane * LANE_WIDTH;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const isCollected = collectibleRegistry.collectedNotes.has(id);
    meshRef.current.visible = !isCollected;
    if (isCollected) return;

    const dt = Math.min(delta, 0.05);
    // Smooth floating rotation and hover bob
    meshRef.current.rotation.y += dt * 3.2;
    meshRef.current.position.y = 1.25 + Math.sin(performance.now() * 0.005 + z) * 0.15;
  });

  return (
    <group ref={meshRef} position={[laneX, 1.25, z]}>
      {/* 3D Banknote Card */}
      <mesh material={noteMaterial}>
        <boxGeometry args={[1.5, 0.8, 0.03]} />
      </mesh>

      {/* Outer Holographic Glow Halo */}
      <mesh material={haloMaterial}>
        <planeGeometry args={[1.75, 1.05]} />
      </mesh>
    </group>
  );
}
