import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from '../core/GameState';

const BIOME_PALETTES = {
  FOREST: {
    bg: '#0e2617',
    fog: '#0d2315',
    sun: '#fffbeb',
    ambient: '#86a88b',
    hemiTop: '#fef9c3',
    hemiBottom: '#963c22',
  },
  SHRINE: {
    bg: '#251233',
    fog: '#1e0c29',
    sun: '#c084fc',
    ambient: '#581c87',
    hemiTop: '#e9d5ff',
    hemiBottom: '#3b0764',
  },
  VILLAGE: {
    bg: '#331b0e',
    fog: '#2d1509',
    sun: '#fbbf24',
    ambient: '#92400e',
    hemiTop: '#fef3c7',
    hemiBottom: '#78350f',
  },
  BRIDGE: {
    bg: '#0b1926',
    fog: '#07121c',
    sun: '#38bdf8',
    ambient: '#0369a1',
    hemiTop: '#bae6fd',
    hemiBottom: '#082f49',
  },
};

export function RainforestLighting() {
  const bgRef = useRef();
  const fogRef = useRef();
  const sunRef = useRef();
  const ambientRef = useRef();
  const hemiRef = useRef();

  useFrame((_, delta) => {
    const biome = gameState.getCurrentBiome();
    const pal = BIOME_PALETTES[biome] || BIOME_PALETTES.FOREST;
    const lerpSpeed = Math.min(delta * 2.0, 0.1);

    if (bgRef.current) {
      bgRef.current.lerp(new THREE.Color(pal.bg), lerpSpeed);
    }
    if (fogRef.current) {
      fogRef.current.color.lerp(new THREE.Color(pal.fog), lerpSpeed);
    }
    if (sunRef.current) {
      sunRef.current.color.lerp(new THREE.Color(pal.sun), lerpSpeed);
    }
    if (ambientRef.current) {
      ambientRef.current.color.lerp(new THREE.Color(pal.ambient), lerpSpeed);
    }
  });

  return (
    <>
      {/* Dynamic Biome Sky & Atmosphere */}
      <color ref={bgRef} attach="background" args={['#0e2617']} />
      <fog ref={fogRef} attach="fog" args={['#0d2315', 38, 115]} />

      {/* Dynamic Ambient Fill */}
      <ambientLight ref={ambientRef} intensity={1.25} color="#86a88b" />

      {/* Hemisphere Light */}
      <hemisphereLight
        ref={hemiRef}
        args={['#fef9c3', '#963c22', 1.35]}
      />

      {/* Directional Sunlight / Moonbeam */}
      <directionalLight
        ref={sunRef}
        position={[14, 32, 18]}
        intensity={2.8}
        color="#fffbeb"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={95}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0004}
      />

      {/* Rim light: Emerald supernatural edge illumination */}
      <directionalLight
        position={[-16, 15, -28]}
        intensity={0.9}
        color="#34d399"
      />
    </>
  );
}
