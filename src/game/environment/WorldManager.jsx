import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState, GAME_STATUS, LANE, LANE_WIDTH, PLAYER_STATE } from '../core/GameState';
import { gameAudio } from '../core/GameAudio';
import {
  LateritePath,
  IrokoTree,
  CarvedMonolith,
  VillageHut,
  CeremonialTorchArch,
  SuspensionBridge,
  CaveTunnel,
  DistantMistBackdrop
} from './EnvironmentAssets';
import { ObstacleItem, OBSTACLE_TYPE } from '../obstacles/ObstacleManager';
import { NairaCollectible } from '../collectibles/NairaCollectible';
import { collectibleRegistry } from './CollectibleRegistry';

const CHUNK_LENGTH = 36;
const TOTAL_CHUNKS = 6;

// Biome chunk types
const CHUNK_TYPES = [
  'FOREST',
  'VILLAGE',
  'BRIDGE',
  'CAVE',
  'SHRINE',
  'FOREST'
];

export function WorldManager() {
  const backdropRef = useRef();
  const chunkGroupsRef = useRef([]);
  const hitObstaclesRef = useRef(new Set());

  // Fixed static definition of chunk internal items so there is ZERO allocation during runtime
  const chunkData = useMemo(() => {
    return Array.from({ length: TOTAL_CHUNKS }).map((_, chunkIdx) => {
      const type = CHUNK_TYPES[chunkIdx % CHUNK_TYPES.length];
      const baseZ = -chunkIdx * CHUNK_LENGTH;

      // Banknotes for this chunk: 12 notes in 2 clean trails
      const collectibles = [];
      const trailLane = (chunkIdx % 3) - 1;
      const altLane = trailLane === 0 ? 1 : 0;

      for (let i = 0; i < 6; i++) {
        collectibles.push({
          id: `c_${chunkIdx}_a_${i}`,
          lane: trailLane,
          z: -4 - i * 2.5
        });
      }
      for (let i = 0; i < 6; i++) {
        collectibles.push({
          id: `c_${chunkIdx}_b_${i}`,
          lane: altLane,
          z: -20 - i * 2.5
        });
      }

      // Obstacles for this chunk
      const obstacles = [];
      if (chunkIdx > 0) {
        if (type === 'BRIDGE') {
          obstacles.push({
            id: `obs_${chunkIdx}_1`,
            type: OBSTACLE_TYPE.WOODEN_BARRIER,
            lane: 0,
            z: -18,
            width: 1
          });
        } else if (type === 'CAVE') {
          obstacles.push({
            id: `obs_${chunkIdx}_1`,
            type: OBSTACLE_TYPE.FIRE_BRAZIER,
            lane: 0,
            z: -18,
            width: 1
          });
        } else if (chunkIdx % 2 === 1) {
          // Fallen Tree (Slide hurdle!)
          obstacles.push({
            id: `obs_${chunkIdx}_1`,
            type: OBSTACLE_TYPE.FALLEN_TREE,
            lane: 0,
            z: -18,
            width: 3
          });
        } else {
          // Boulder (Dodge/Jump hurdle!)
          obstacles.push({
            id: `obs_${chunkIdx}_1`,
            type: OBSTACLE_TYPE.ROCK,
            lane: 1,
            z: -18,
            width: 1
          });
        }
      }

      return {
        index: chunkIdx,
        type,
        initialZ: baseZ,
        obstacles,
        collectibles
      };
    });
  }, []);

  // Reset positions and collision sets on restart
  useEffect(() => {
    const unsubscribe = gameState.subscribe((snap) => {
      if (snap.status === GAME_STATUS.PLAYING && snap.distance < 2) {
        collectibleRegistry.collectedNotes.clear();
        hitObstaclesRef.current.clear();
        chunkGroupsRef.current.forEach((grp, idx) => {
          if (grp) {
            grp.position.z = -idx * CHUNK_LENGTH;
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  // Ultra-high-performance 60fps game loop with 100% deterministic mathematical collision!
  useFrame(() => {
    if (gameState.status !== GAME_STATUS.PLAYING && gameState.status !== GAME_STATUS.GAMEOVER) return;

    const pZ = gameState.playerZ;
    const pX = gameState.playerX;
    const pY = gameState.playerY || 0;
    const pState = gameState.playerState;

    // Follow player with distant fog vista
    if (backdropRef.current) {
      backdropRef.current.position.z = pZ - 90;
    }

    // Direct scene graph recycling: zero GC allocations, zero React re-renders!
    const poolSpan = TOTAL_CHUNKS * CHUNK_LENGTH;

    chunkGroupsRef.current.forEach((grp, chunkIdx) => {
      if (!grp) return;
      // If chunk is more than 36 meters behind player, leap forward by poolSpan
      if (grp.position.z > pZ + 36) {
        grp.position.z -= poolSpan;
        // Respawn banknotes and reset obstacles for this recycled chunk
        const chunkInfo = chunkData[chunkIdx];
        if (chunkInfo) {
          chunkInfo.collectibles.forEach((c) => collectibleRegistry.collectedNotes.delete(c.id));
          chunkInfo.obstacles.forEach((o) => hitObstaclesRef.current.delete(o.id));
        }
      }
    });

    // Authoritative Centralized Mathematical Collision Detection
    if (gameState.status === GAME_STATUS.PLAYING) {
      for (let cIdx = 0; cIdx < TOTAL_CHUNKS; cIdx++) {
        const grp = chunkGroupsRef.current[cIdx];
        if (!grp) continue;
        const chunkZ = grp.position.z;

        // Only test chunks within 50m of player Z
        if (Math.abs(chunkZ - pZ) > 52) continue;

        const data = chunkData[cIdx];

        // 1. Banknote collection: 100% reliable math on every note
        for (let i = 0; i < data.collectibles.length; i++) {
          const col = data.collectibles[i];
          if (collectibleRegistry.collectedNotes.has(col.id)) continue;

          const noteWorldZ = chunkZ - 18 + col.z;
          const dz = Math.abs(pZ - noteWorldZ);
          if (dz > 1.85) continue;

          const noteWorldX = col.lane * LANE_WIDTH;
          const dx = Math.abs(pX - noteWorldX);
          if (dx > 1.35) continue;

          if (pY < 2.5) {
            collectibleRegistry.collectedNotes.add(col.id);
            gameAudio.playCollectCash();
            gameState.collectCash(1000);
          }
        }

        // 2. Obstacle collisions: reduces speed, closes witch distance, kills on 3rd hit
        if (!gameState.isDowned) {
          for (let i = 0; i < data.obstacles.length; i++) {
            const obs = data.obstacles[i];
            if (hitObstaclesRef.current.has(obs.id)) continue;

            const obsWorldZ = chunkZ - 18 + obs.z;
            const dz = Math.abs(pZ - obsWorldZ);
            if (dz > 1.65) continue;

            let isCollision = false;

            if (obs.type === OBSTACLE_TYPE.FALLEN_TREE) {
              // Spans entire track corridor (width 3): must SLIDE!
              if (Math.abs(pX) < 3.8) {
                if (pState !== PLAYER_STATE.SLIDING) {
                  isCollision = true;
                }
              }
            } else {
              // Single-lane hurdles (Rock, Barrier, Brazier)
              const obsWorldX = obs.lane * LANE_WIDTH;
              const dx = Math.abs(pX - obsWorldX);

              if (dx < 1.35) {
                if (obs.type === OBSTACLE_TYPE.WOODEN_BARRIER) {
                  if (pY < 0.85) isCollision = true;
                } else if (obs.type === OBSTACLE_TYPE.ROCK) {
                  if (pY < 1.4) isCollision = true;
                } else if (obs.type === OBSTACLE_TYPE.FIRE_BRAZIER) {
                  if (pY < 1.1) isCollision = true;
                } else {
                  isCollision = true;
                }
              }
            }

            if (isCollision) {
              hitObstaclesRef.current.add(obs.id);
              gameAudio.playImpact();
              gameState.hitObstacle();
              break;
            }
          }
        }
      }
    }
  });

  return (
    <group>
      {/* Distant Atmospheric Mist Backdrop (fog.jpg) */}
      <group ref={backdropRef} position={[0, 0, -90]}>
        <DistantMistBackdrop />
      </group>

      {/* 6 Pooled Procedural Chunks */}
      {chunkData.map((data, idx) => (
        <group
          key={data.index}
          ref={(el) => (chunkGroupsRef.current[idx] = el)}
          position={[0, 0, data.initialZ]}
        >
          <ChunkContent type={data.type} obstacles={data.obstacles} collectibles={data.collectibles} />
        </group>
      ))}
    </group>
  );
}

// Sub-component for chunk geometry
function ChunkContent({ type, obstacles, collectibles }) {
  return (
    <group position={[0, 0, -CHUNK_LENGTH / 2]}>
      {/* 1. Track Ground Base */}
      {type === 'BRIDGE' ? (
        <SuspensionBridge length={CHUNK_LENGTH} width={6.6} />
      ) : type === 'CAVE' ? (
        <>
          <LateritePath length={CHUNK_LENGTH} width={7.6} />
          <CaveTunnel length={CHUNK_LENGTH} />
        </>
      ) : (
        <LateritePath length={CHUNK_LENGTH} width={7.6} />
      )}

      {/* 2. Biome Hero Set Pieces from Reference Images */}
      {type === 'FOREST' && (
        <>
          <IrokoTree position={[-5.8, 0, -8]} scale={1.2} />
          <IrokoTree position={[5.8, 0, 10]} scale={1.1} />
          <CarvedMonolith position={[-4.2, 0, 0]} rotationY={0.3} />
          <CarvedMonolith position={[4.2, 0, 4]} rotationY={-0.4} />
          <CeremonialTorchArch position={[0, 0, 15]} />
        </>
      )}

      {type === 'VILLAGE' && (
        <>
          {/* Traditional Nigerian Mud Huts right along the track verges (from village.jpg) */}
          <VillageHut position={[-4.8, 0, -9]} rotationY={0.8} />
          <VillageHut position={[4.8, 0, -9]} rotationY={-0.8} />
          <VillageHut position={[-4.8, 0, 9]} rotationY={0.5} />
          <VillageHut position={[4.8, 0, 9]} rotationY={-0.5} />
          <CeremonialTorchArch position={[0, 0, -17]} />
        </>
      )}

      {type === 'SHRINE' && (
        <>
          <CarvedMonolith position={[-4.2, 0, -10]} />
          <CarvedMonolith position={[4.2, 0, -10]} />
          <CarvedMonolith position={[-4.2, 0, 10]} />
          <CarvedMonolith position={[4.2, 0, 10]} />
          <CeremonialTorchArch position={[0, 0, 0]} />
          <pointLight position={[0, 3.5, 0]} color="#10b981" intensity={2.2} distance={12} />
        </>
      )}

      {/* 3. Obstacles */}
      {obstacles.map((obs) => (
        <ObstacleItem key={obs.id} obstacle={obs} />
      ))}

      {/* 4. Constant trails of ₦1,000 Cash Notes */}
      {collectibles.map((col) => (
        <NairaCollectible key={col.id} id={col.id} lane={col.lane} z={col.z} />
      ))}
    </group>
  );
}
