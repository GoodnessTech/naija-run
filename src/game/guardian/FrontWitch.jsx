import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { LANE_WIDTH } from '../core/GameState';
import { SHARED_MATS } from '../environment/SharedMaterials';

export function FrontWitch({ id, lane = 0, z = -500 }) {
  const groupRef = useRef();
  const innerRef = useRef();
  const { scene } = useGLTF('/assets/characters/guardian.glb');

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = SHARED_MATS.tree;
        child.castShadow = true;
      }
    });
    return clone;
  }, [scene]);

  const eyeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ef4444'),
      emissive: new THREE.Color('#dc2626'),
      emissiveIntensity: 6.0,
      roughness: 0.1,
    });
  }, []);

  const laneX = lane * LANE_WIDTH;

  useFrame((_, delta) => {
    if (innerRef.current) {
      // Menacing spectral float and weave
      const time = performance.now() * 0.003;
      innerRef.current.position.y = 1.2 + Math.sin(time * 2) * 0.25;
      innerRef.current.rotation.z = Math.sin(time) * 0.15;
      innerRef.current.rotation.y = 0; // Face runner directly (+Z)
    }
  });

  return (
    <group ref={groupRef} position={[laneX, 0, z]}>
      <group ref={innerRef} scale={[1.8, 1.8, 1.8]}>
        <primitive object={clonedScene} />

        {/* Piercing Crimson Glowing Eyes */}
        <mesh position={[-0.22, 0.48, 0.45]} material={eyeMaterial}>
          <sphereGeometry args={[0.08, 8, 8]} />
        </mesh>
        <mesh position={[0.22, 0.48, 0.45]} material={eyeMaterial}>
          <sphereGeometry args={[0.08, 8, 8]} />
        </mesh>

        {/* Supernatural Glowing Chest Rune */}
        <mesh position={[0, 0.05, 0.38]} material={eyeMaterial}>
          <octahedronGeometry args={[0.14, 0]} />
        </mesh>

        <pointLight color="#ef4444" intensity={3.5} distance={7} />
      </group>

      {/* Trailing Dark Mystical Smoke Ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 2.5, 16]} />
        <meshBasicMaterial color="#3b0764" transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

useGLTF.preload('/assets/characters/guardian.glb');
