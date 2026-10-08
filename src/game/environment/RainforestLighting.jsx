import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState } from '../core/GameState';
import { environmentDirector } from './EnvironmentDirector';

export function RainforestLighting() {
  const bgRef = useRef();
  const fogRef = useRef();
  const sunRef = useRef();
  const ambientRef = useRef();
  const hemiRef = useRef();

  useFrame((_, delta) => {
    const { config, nextConfig, isTransition, transitionProgress } = environmentDirector.getEnvironmentAtDistance(gameState.distance);
    const lerpSpeed = Math.min(delta * 2.8, 0.15);

    // Target colors
    let targetBg = new THREE.Color(config.skyColor);
    let targetFog = new THREE.Color(config.fogColor);
    let targetSun = new THREE.Color(config.sunColor);
    let targetAmbient = new THREE.Color(config.ambientColor);
    let targetNear = config.fogNear;
    let targetFar = config.fogFar;
    let targetSunIntensity = config.sunIntensity || 2.8;

    // Smooth blend during environment transition
    if (isTransition) {
      targetBg.lerp(new THREE.Color(nextConfig.skyColor), transitionProgress);
      targetFog.lerp(new THREE.Color(nextConfig.fogColor), transitionProgress);
      targetSun.lerp(new THREE.Color(nextConfig.sunColor), transitionProgress);
      targetAmbient.lerp(new THREE.Color(nextConfig.ambientColor), transitionProgress);
      targetNear = THREE.MathUtils.lerp(config.fogNear, nextConfig.fogNear, transitionProgress);
      targetFar = THREE.MathUtils.lerp(config.fogFar, nextConfig.fogFar, transitionProgress);
      targetSunIntensity = THREE.MathUtils.lerp(config.sunIntensity || 2.8, nextConfig.sunIntensity || 2.8, transitionProgress);
    }

    // Mist Surge chaos event
    if (gameState.activeChaosEvent?.type === 'MIST_SURGE') {
      targetFar = 50;
    }

    if (bgRef.current) {
      bgRef.current.lerp(targetBg, lerpSpeed);
    }
    if (fogRef.current) {
      fogRef.current.color.lerp(targetFog, lerpSpeed);
      fogRef.current.near = THREE.MathUtils.lerp(fogRef.current.near, targetNear, lerpSpeed);
      fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, targetFar, lerpSpeed);
    }
    if (sunRef.current) {
      sunRef.current.color.lerp(targetSun, lerpSpeed);
      sunRef.current.intensity = THREE.MathUtils.lerp(sunRef.current.intensity, targetSunIntensity, lerpSpeed);
    }
    if (ambientRef.current) {
      ambientRef.current.color.lerp(targetAmbient, lerpSpeed);
    }
  });

  return (
    <>
      {/* Dynamic Zone Sky & Fog */}
      <color ref={bgRef} attach="background" args={['#0e2617']} />
      <fog ref={fogRef} attach="fog" args={['#0d2315', 35, 110]} />

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

      {/* Supernatural Edge Rim Lighting */}
      <directionalLight
        position={[-16, 15, -28]}
        intensity={0.9}
        color="#34d399"
      />
    </>
  );
}
