import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from '../core/GameState';

export function JungleParticles({ count = 80 }) {
  const pointsRef = useRef();

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22; // X
      pos[i * 3 + 1] = Math.random() * 6 + 0.5; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60; // Z
      sc[i] = Math.random() * 0.12 + 0.05;
    }
    return [pos, sc];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const dt = Math.min(delta, 0.05);
    const pZ = gameState.playerZ;

    const posArray = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      // Gentle drift
      posArray[i * 3 + 1] += Math.sin(performance.now() * 0.001 + i) * dt * 0.4;
      posArray[i * 3] += Math.cos(performance.now() * 0.0015 + i) * dt * 0.3;

      // Keep particles relative to player running corridor
      const distFromPlayerZ = posArray[i * 3 + 2] - pZ;
      if (distFromPlayerZ > 20) {
        posArray[i * 3 + 2] = pZ - 45 - Math.random() * 10;
        posArray[i * 3] = (Math.random() - 0.5) * 22;
        posArray[i * 3 + 1] = Math.random() * 6 + 0.5;
      } else if (distFromPlayerZ < -55) {
        posArray[i * 3 + 2] = pZ + 15 + Math.random() * 5;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color="#fbbf24"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
