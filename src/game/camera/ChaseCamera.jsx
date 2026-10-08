import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState, GAME_STATUS } from '../core/GameState';

export function ChaseCamera({ targetRef, shakeIntensity = 0 }) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 4.2, 7.5));
  const currentLookAt = useRef(new THREE.Vector3(0, 1.5, -8));
  const shakeOffset = useRef(new THREE.Vector3(0, 0, 0));
  const nearMissKick = useRef(0);
  const lastNearMissCount = useRef(0);

  useEffect(() => {
    const unsub = gameState.subscribe((snap) => {
      if (gameState.nearMissCount > lastNearMissCount.current) {
        lastNearMissCount.current = gameState.nearMissCount;
        nearMissKick.current = 0.35; // Brief near-miss camera shudder
      }
    });
    return unsub;
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    if (
      gameState.status === GAME_STATUS.PLAYING ||
      gameState.status === GAME_STATUS.COUNTDOWN ||
      gameState.status === GAME_STATUS.GAMEOVER
    ) {
      const pZ = gameState.playerZ;
      const pX = gameState.currentLane * 0.85;
      const pY = gameState.playerY || 0;

      // Subtle running cadence bob (communicates stride rhythm while keeping obstacle view rock-steady)
      const isRunning = gameState.playerState === 'RUNNING';
      const runCadenceBob = isRunning ? Math.cos(performance.now() * 0.001 * (gameState.speed * 0.45)) * 0.024 : 0;

      // Camera position: behind and above player
      const idealX = pX;
      const idealY = 3.6 + pY * 0.45 + runCadenceBob;
      const idealZ = pZ + 6.8;

      currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, idealX, dt * 9.0);
      currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, idealY, dt * 7.0);
      currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, idealZ, dt * 18.0);

      // Camera shake based on chaser proximity, stumbling, or near-miss
      let shake = shakeIntensity;
      if (gameState.guardianDistance < 6.0) {
        shake += (6.0 - gameState.guardianDistance) * 0.05;
      }
      if (gameState.isDowned) {
        shake += 0.45;
      }
      if (nearMissKick.current > 0) {
        shake += nearMissKick.current;
        nearMissKick.current = Math.max(0, nearMissKick.current - dt * 2.5);
      }

      if (shake > 0) {
        shakeOffset.current.set(
          (Math.random() - 0.5) * shake,
          (Math.random() - 0.5) * shake,
          (Math.random() - 0.5) * shake * 0.5
        );
      } else {
        shakeOffset.current.set(0, 0, 0);
      }

      camera.position.copy(currentPos.current).add(shakeOffset.current);

      // Target lookAt
      const targetLookX = pX * 0.45;
      const targetLookY = 1.6 + pY * 0.2;
      const targetLookZ = pZ - 12.0;

      currentLookAt.current.x = THREE.MathUtils.lerp(currentLookAt.current.x, targetLookX, dt * 11.0);
      currentLookAt.current.y = THREE.MathUtils.lerp(currentLookAt.current.y, targetLookY, dt * 9.0);
      currentLookAt.current.z = THREE.MathUtils.lerp(currentLookAt.current.z, targetLookZ, dt * 18.0);

      camera.lookAt(currentLookAt.current);

      // Dynamic FOV based on speed and speed burst
      let targetFOV = 62 + ((gameState.speed - 21.0) / 16.0) * 12;
      if (gameState.isSpeedBurstActive) {
        targetFOV += 8.0; // Supersonic tunnel vision feel!
      }
      targetFOV = THREE.MathUtils.clamp(targetFOV, 60, 84);

      if (Math.abs(camera.fov - targetFOV) > 0.05) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, dt * 3.5);
        camera.updateProjectionMatrix();
      }
    } else {
      // Menu / Cinematic framing
      const time = performance.now() * 0.0006;
      camera.position.set(Math.sin(time) * 2.5, 2.6, 6.0);
      camera.lookAt(0, 1.2, 0);
    }
  });

  return null;
}
