import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { RainforestLighting } from './environment/RainforestLighting';
import { WorldManager } from './environment/WorldManager';
import { Runner } from './player/Runner';
import { Guardian } from './guardian/Guardian';
import { ChaseCamera } from './camera/ChaseCamera';
import { JungleParticles } from './effects/JungleParticles';
import { difficultyManager } from './systems/DifficultyManager';
import { gameState } from './core/GameState';
import { useControls } from '../hooks/useControls';

export function GameScene() {
  const runnerPosRef = useRef({ x: 0, y: 0, z: 0 });

  // Hook controls to window functions created by Runner
  useControls(
    () => window.__naija_jump && window.__naija_jump(),
    () => window.__naija_slide && window.__naija_slide(),
    (dir) => window.__naija_lane && window.__naija_lane(dir)
  );

  useFrame((_, delta) => {
    gameState.tick(delta);
    difficultyManager.update(delta);
  });

  return (
    <>
      {/* Dynamic Lighting & Atmospheric Fog */}
      <RainforestLighting />

      {/* Atmospheric Particles (Fireflies / Spores) */}
      <JungleParticles count={70} />

      <Suspense fallback={null}>
        {/* Procedural Endless Nigerian Rainforest Track */}
        <WorldManager />

        {/* 3D Runner Model */}
        <Runner
          onRunnerUpdate={(pos) => {
            runnerPosRef.current = pos;
          }}
        />

        {/* 3D Forest Guardian Model */}
        <Guardian />
      </Suspense>

      {/* Third Person Chase Camera */}
      <ChaseCamera targetRef={runnerPosRef} />
    </>
  );
}
