import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { gameState, GAME_STATUS } from '../core/GameState';
import { gameAudio } from '../core/GameAudio';
import { SHARED_MATS } from '../environment/SharedMaterials';

export function Guardian() {
  const groupRef = useRef();
  const innerRef = useRef();

  // Load guardian GLB
  const { scene } = useGLTF('/assets/characters/guardian.glb');

  const eyeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fbbf24'),
      emissive: new THREE.Color('#f59e0b'),
      emissiveIntensity: 3.5,
      roughness: 0.1,
    });
  }, []);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = SHARED_MATS.tree;
        child.castShadow = true;
        child.receiveShadow = false;
      }
    });
    return clone;
  }, [scene]);

  // Motion state
  const guardianState = useRef({
    x: 0,
    strideTime: 0,
    lunging: false,
  });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const g = guardianState.current;
    if (!groupRef.current) return;

    if (gameState.status === GAME_STATUS.PLAYING || gameState.status === GAME_STATUS.COUNTDOWN) {
      const gDist = gameState.guardianDistance;
      const targetZ = gameState.playerZ + gDist;
      const targetX = gameState.currentLane * 1.8;
      g.x = THREE.MathUtils.lerp(g.x, targetX, dt * 5.5);

      // Chaser 5-Phase System:
      // Phase 1: > 16m
      // Phase 2: 12 - 16m
      // Phase 3: 8 - 12m
      // Phase 4: 4 - 8m
      // Phase 5: < 4m
      // Chaser is always active in the world, escalating visibility with phases or strikes
      const isVisible = gameState.strikes >= 1 || gDist < 18.0 || gameState.distance > 500;
      groupRef.current.visible = isVisible;

      if (isVisible) {
        // Stride frequency scales with speed and phase
        const phaseFactor = gDist < 6.0 ? 0.65 : 0.45;
        g.strideTime += dt * (gameState.speed * phaseFactor);
        const heavyBob = Math.sin(g.strideTime * 2) * (gDist < 6.0 ? 0.32 : 0.22);
        const menacingSway = Math.cos(g.strideTime) * (gDist < 6.0 ? 0.25 : 0.16);

        groupRef.current.position.set(g.x, heavyBob, targetZ);

        // Visual reaction to Phase & Strikes:
        // Phase 4 & 5 or Strike 2: Furious Red
        // Phase 3 or Strike 1: Blazing Amber
        // Phase 1 & 2: Eerie Emerald Glow
        if (eyeMaterial) {
          if (gDist < 6.0 || gameState.strikes >= 2) {
            eyeMaterial.color.set('#ef4444');
            eyeMaterial.emissive.set('#dc2626');
            eyeMaterial.emissiveIntensity = 7.0;
          } else if (gDist < 12.0 || gameState.strikes === 1) {
            eyeMaterial.color.set('#f59e0b');
            eyeMaterial.emissive.set('#d97706');
            eyeMaterial.emissiveIntensity = 4.8;
          } else {
            eyeMaterial.color.set('#10b981');
            eyeMaterial.emissive.set('#059669');
            eyeMaterial.emissiveIntensity = 3.2;
          }
        }

        // Heartbeat audio triggers in Phase 3, 4, 5 (<12m)
        if (gDist < 12.0) {
          const pressure = THREE.MathUtils.clamp((16.0 - gDist) / 14.0, 0, 1.0);
          gameAudio.playHeartbeat(pressure);
        }

        // Occasional supernatural roar when aggressive (<7m)
        if (gDist < 7.0 && Math.random() < 0.004) {
          gameAudio.playGuardianRoar();
        }

        // Menacing posture tilt
        if (innerRef.current) {
          innerRef.current.rotation.y = Math.PI; // Face running direction (-Z)
          innerRef.current.rotation.z = menacingSway;
          const forwardLungeAngle = gDist < 5.0 ? 0.45 : 0.22;
          innerRef.current.rotation.x = forwardLungeAngle;
        }

        // Fatal Catch check
        if (gDist <= 1.2 && !g.lunging) {
          g.lunging = true;
          gameAudio.playGuardianRoar();
          gameAudio.playImpact();
          gameState.hitObstacle();
        }
      }
    } else if (gameState.status === GAME_STATUS.GAMEOVER) {
      groupRef.current.visible = true;
      if (innerRef.current) {
        innerRef.current.rotation.x = 0.5;
      }
    } else {
      groupRef.current.visible = false;
      groupRef.current.position.set(0, 0, 18);
      g.lunging = false;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 18]}>
      {/* Scaled Guardian Mesh */}
      <group ref={innerRef} position={[0, 1.7, 0]} scale={[1.7, 1.7, 1.7]}>
        <primitive object={clonedScene} />

        {/* Piercing Glowing Eyes */}
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
      </group>

      {/* Trailing Mystical Dark Smoke Ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 2.4, 12]} />
        <meshBasicMaterial color="#052e16" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

useGLTF.preload('/assets/characters/guardian.glb');
