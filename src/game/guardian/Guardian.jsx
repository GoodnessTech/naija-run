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

  // Load the actual guardian GLB
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

    if (gameState.status === GAME_STATUS.PLAYING) {
      // 1. Follow player along Z with current chase distance
      const targetZ = gameState.playerZ + gameState.guardianDistance;
      const targetX = gameState.currentLane * 1.8;
      g.x = THREE.MathUtils.lerp(g.x, targetX, dt * 5.0);

      // Heavy lumbering stride
      g.strideTime += dt * (gameState.speed * 0.45);
      const heavyBob = Math.sin(g.strideTime * 2) * 0.22;
      const menacingSway = Math.cos(g.strideTime) * 0.18;

      groupRef.current.position.set(g.x, heavyBob, targetZ);

      // Dynamically react eye color to strikes: Red on Strike 2 (Right on heels!)
      if (eyeMaterial) {
        if (gameState.strikes >= 2) {
          eyeMaterial.color.set('#ef4444');
          eyeMaterial.emissive.set('#dc2626');
          eyeMaterial.emissiveIntensity = 5.5;
        } else if (gameState.strikes === 1) {
          eyeMaterial.color.set('#f59e0b');
          eyeMaterial.emissive.set('#d97706');
          eyeMaterial.emissiveIntensity = 3.8;
        } else {
          eyeMaterial.color.set('#fbbf24');
          eyeMaterial.emissive.set('#f59e0b');
          eyeMaterial.emissiveIntensity = 2.5;
        }
      }

      // Calculate guardian pressure (0 to 1)
      const pressure = THREE.MathUtils.clamp((18.0 - gameState.guardianDistance) / 15.0, 0, 1.0);
      gameState.guardianPressure = pressure;

      // Heartbeat audio triggers as guardian gets close
      if (gameState.guardianDistance < 12.0) {
        gameAudio.playHeartbeat(pressure);
      }

      // Supernatural roar when close
      if (gameState.guardianDistance < 7.0 && Math.random() < 0.003) {
        gameAudio.playGuardianRoar();
      }

      // Menacing posture tilt
      if (innerRef.current) {
        innerRef.current.rotation.y = Math.PI; // Face running direction (-Z)
        innerRef.current.rotation.z = menacingSway;
        innerRef.current.rotation.x = 0.2 + pressure * 0.25;
      }

      // Catch check!
      if (gameState.guardianDistance <= 1.3 && !g.lunging) {
        g.lunging = true;
        gameAudio.playGuardianRoar();
        gameAudio.playImpact();
        gameAudio.playGameOver();
        gameState.gameOver('GUARDIAN_CAUGHT');
      }
    } else if (gameState.status === GAME_STATUS.GAMEOVER) {
      if (innerRef.current) {
        innerRef.current.rotation.x = 0.4;
      }
    } else {
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
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>
        <mesh position={[0.22, 0.48, 0.45]} material={eyeMaterial}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>

        {/* Supernatural Glowing Chest Rune */}
        <mesh position={[0, 0.05, 0.38]} material={eyeMaterial}>
          <octahedronGeometry args={[0.12, 0]} />
        </mesh>
      </group>

      {/* Trailing Dark Mystical Aura Ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 2.2, 12]} />
        <meshBasicMaterial color="#052e16" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

useGLTF.preload('/assets/characters/guardian.glb');
