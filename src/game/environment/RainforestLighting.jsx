import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState, BIOMES } from '../core/GameState';

const ZONE_PALETTES = {
  [BIOMES.LAGOS_OUTSKIRTS]: {
    bg: '#0e2617',
    fog: '#0d2315',
    sun: '#fffbeb',
    ambient: '#86a88b',
    hemiTop: '#fef9c3',
    hemiBottom: '#963c22',
  },
  [BIOMES.BUSY_LAGOS_ROAD]: {
    bg: '#2d3748',
    fog: '#1e293b',
    sun: '#fde047',
    ambient: '#94a3b8',
    hemiTop: '#fef08a',
    hemiBottom: '#475569',
  },
  [BIOMES.MARKET_AREA]: {
    bg: '#3b1d11',
    fog: '#31170d',
    sun: '#fbbf24',
    ambient: '#b45309',
    hemiTop: '#fed7aa',
    hemiBottom: '#78350f',
  },
  [BIOMES.DARK_FOREST]: {
    bg: '#051b14',
    fog: '#041610',
    sun: '#34d399',
    ambient: '#064e3b',
    hemiTop: '#a7f3d0',
    hemiBottom: '#022c22',
  },
  [BIOMES.NIGHT_RUN]: {
    bg: '#090d16',
    fog: '#060911',
    sun: '#38bdf8',
    ambient: '#1e293b',
    hemiTop: '#7dd3fc',
    hemiBottom: '#020617',
  },
  [BIOMES.DANGER_AREA]: {
    bg: '#250709',
    fog: '#1d0507',
    sun: '#f87171',
    ambient: '#7f1d1d',
    hemiTop: '#fecaca',
    hemiBottom: '#450a0a',
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
    const pal = ZONE_PALETTES[biome] || ZONE_PALETTES[BIOMES.LAGOS_OUTSKIRTS];
    const lerpSpeed = Math.min(delta * 2.5, 0.12);

    if (bgRef.current) {
      bgRef.current.lerp(new THREE.Color(pal.bg), lerpSpeed);
    }
    if (fogRef.current) {
      fogRef.current.color.lerp(new THREE.Color(pal.fog), lerpSpeed);
      // Dense fog during low-visibility chaos event
      const targetFar = gameState.activeChaosEvent?.type === 'MIST_SURGE' ? 55 : (biome === BIOMES.DANGER_AREA ? 90 : 115);
      fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, targetFar, lerpSpeed);
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
      {/* Dynamic Zone Sky & Fog */}
      <color ref={bgRef} attach="background" args={['#0e2617']} />
      <fog ref={fogRef} attach="fog" args={['#0d2315', 35, 115]} />

      {/* Dynamic Ambient Fill */}
      <ambientLight ref={ambientRef} intensity={1.3} color="#86a88b" />

      {/* Hemisphere Sky Light */}
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

      {/* Supernatural Rim Lighting */}
      <directionalLight
        position={[-16, 15, -28]}
        intensity={0.9}
        color="#34d399"
      />
    </>
  );
}
