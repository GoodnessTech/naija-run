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
import { ObstacleItem } from '../obstacles/ObstacleManager';
import { OBSTACLE_TYPE, PICKUP_TYPE } from '../obstacles/ObstacleConstants';
import { NairaCollectible } from '../collectibles/NairaCollectible';
import { ValuablePickup } from '../collectibles/ValuablePickup';
import { FrontWitch } from '../guardian/FrontWitch';
import { collectibleRegistry } from './CollectibleRegistry';

const CHUNK_LENGTH = 36;
const TOTAL_CHUNKS = 8; // 8 chunks for deep horizon visibility

// Biome selection based on absolute distance run
function getBiomeForDistance(absZ) {
  const dist = Math.abs(absZ) % 1600;
  if (dist < 380) return 'FOREST';
  if (dist < 780) return 'SHRINE';
  if (dist < 1180) return 'VILLAGE';
  return 'BRIDGE';
}

// Generate unpredictable, highly varied obstacles and pickups for any chunk
function createProceduralChunk(chunkIdx, baseZ) {
  const biome = getBiomeForDistance(baseZ);
  const obstacles = [];
  const collectibles = [];
  const valuables = [];

  // 1. Banknote trails (6 to 10 notes along random lanes)
  const trailLane = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
  const noteCount = 6 + Math.floor(Math.random() * 4);
  for (let i = 0; i < noteCount; i++) {
    collectibles.push({
      id: `c_${chunkIdx}_${i}_${Math.random()}`,
      lane: trailLane,
      z: -4 - i * 2.8,
    });
  }

  // 2. Unpredictable Procedural Obstacles (1 or 2 per chunk after first 30m)
  if (Math.abs(baseZ) > 30) {
    const obstacleCount = Math.random() < 0.45 ? 2 : 1;
    const allTypes = [
      OBSTACLE_TYPE.ROCK,
      OBSTACLE_TYPE.FALLEN_TREE,
      OBSTACLE_TYPE.WOODEN_BARRIER,
      OBSTACLE_TYPE.FIRE_BRAZIER,
      OBSTACLE_TYPE.SACRED_TOTEM,
      OBSTACLE_TYPE.OIL_DRUM_BARRICADE,
      OBSTACLE_TYPE.MUD_POTHOLE,
      OBSTACLE_TYPE.DANFO_WRECK,
      OBSTACLE_TYPE.BENIN_STAFF_GATE,
      OBSTACLE_TYPE.SNAKE_PIT
    ];

    const zPositions = [-12, -26];

    for (let oIdx = 0; oIdx < obstacleCount; oIdx++) {
      const type = allTypes[Math.floor(Math.random() * allTypes.length)];
      const zOffset = zPositions[oIdx] + (Math.random() * 4 - 2);

      if (type === OBSTACLE_TYPE.FALLEN_TREE || type === OBSTACLE_TYPE.BENIN_STAFF_GATE) {
        // Full width arch: spans all 3 lanes, MUST SLIDE!
        obstacles.push({
          id: `obs_${chunkIdx}_${oIdx}_${Math.random()}`,
          type,
          lane: 0,
          z: zOffset,
          width: 3,
        });
      } else if (type === OBSTACLE_TYPE.DANFO_WRECK) {
        // Large vehicle obstacle occupying 1 lane, offset so adjacent lane is safe
        const blockedLane = Math.random() < 0.5 ? -1 : 1;
        obstacles.push({
          id: `obs_${chunkIdx}_${oIdx}_${Math.random()}`,
          type,
          lane: blockedLane,
          z: zOffset,
          width: 1,
        });
      } else {
        // Single lane obstacle (Rock, Barrier, Brazier, Totem, Oil Drum, Pothole, Snake Pit)
        const randLane = Math.floor(Math.random() * 3) - 1;
        obstacles.push({
          id: `obs_${chunkIdx}_${oIdx}_${Math.random()}`,
          type,
          lane: randLane,
          z: zOffset,
          width: 1,
        });
      }
    }
  }

  // 3. 25% Chance to spawn a Valuable Cultural Artifact / 2X Multiplier
  if (Math.random() < 0.35 && Math.abs(baseZ) > 40) {
    const valTypes = [
      PICKUP_TYPE.MULTIPLIER_2X,
      PICKUP_TYPE.CORAL_BEADS,
      PICKUP_TYPE.GOLDEN_SPIKES,
      PICKUP_TYPE.SANGO_SHADES,
      PICKUP_TYPE.ROYAL_AGBADA,
    ];
    const valType = valTypes[Math.floor(Math.random() * valTypes.length)];
    const openLane = Math.floor(Math.random() * 3) - 1;
    valuables.push({
      id: `val_${chunkIdx}_${Math.random()}`,
      type: valType,
      lane: openLane,
      z: -18 + (Math.random() * 6 - 3),
    });
  }

  // 4. 20% Chance to spawn a Point Catalyst Trap (-100 PTS)
  if (Math.random() < 0.22 && Math.abs(baseZ) > 60) {
    const trapLane = Math.floor(Math.random() * 3) - 1;
    valuables.push({
      id: `trap_${chunkIdx}_${Math.random()}`,
      type: PICKUP_TYPE.POINT_CATALYST,
      lane: trapLane,
      z: -22 + (Math.random() * 4 - 2),
    });
  }

  return {
    index: chunkIdx,
    type: biome,
    baseZ,
    obstacles,
    collectibles,
    valuables,
  };
}

export function WorldManager() {
  const backdropRef = useRef();
  const chunkGroupsRef = useRef([]);
  const hitObstaclesRef = useRef(new Set());

  // Dynamic chunk pool data
  const [chunks, setChunks] = useState(() => {
    return Array.from({ length: TOTAL_CHUNKS }).map((_, idx) => {
      return createProceduralChunk(idx, -idx * CHUNK_LENGTH);
    });
  });

  // Track front witches
  const [frontWitches, setFrontWitches] = useState([]);

  // Reset positions on restart
  useEffect(() => {
    const unsubscribe = gameState.subscribe((snap) => {
      if (snap.status === GAME_STATUS.PLAYING && snap.distance < 2) {
        collectibleRegistry.reset();
        hitObstaclesRef.current.clear();
        chunkGroupsRef.current.forEach((grp, idx) => {
          if (grp) grp.position.z = -idx * CHUNK_LENGTH;
        });
        setChunks(
          Array.from({ length: TOTAL_CHUNKS }).map((_, idx) =>
            createProceduralChunk(idx, -idx * CHUNK_LENGTH)
          )
        );
        setFrontWitches([]);
      }
    });
    return unsubscribe;
  }, []);

  // Update front witches state when gameState spawns them
  useEffect(() => {
    const checkWitches = () => {
      if (gameState.activeFrontWitches.length !== frontWitches.length) {
        setFrontWitches([...gameState.activeFrontWitches]);
      }
    };
    const timer = setInterval(checkWitches, 200);
    return () => clearInterval(timer);
  }, [frontWitches.length]);

  useFrame(() => {
    if (gameState.status !== GAME_STATUS.PLAYING && gameState.status !== GAME_STATUS.GAMEOVER) return;

    const pZ = gameState.playerZ;
    const pX = gameState.playerX;
    const pY = gameState.playerY || 0;
    const pState = gameState.playerState;
    const isMagnetActive = gameState.magnetTimer > 0;

    // Follow player with distant mist backdrop
    if (backdropRef.current) {
      backdropRef.current.position.z = pZ - 95;
    }

    const poolSpan = TOTAL_CHUNKS * CHUNK_LENGTH;

    // Dynamic Chunk Recycling: when 36m behind player, leap forward and GENERATE FRESH RANDOM CONTENT!
    chunkGroupsRef.current.forEach((grp, chunkIdx) => {
      if (!grp) return;
      if (grp.position.z > pZ + 36) {
        const newZ = grp.position.z - poolSpan;
        grp.position.z = newZ;

        // Generate brand new procedural content for this recycled chunk
        const freshChunk = createProceduralChunk(chunkIdx, newZ);
        setChunks((prev) => {
          const next = [...prev];
          next[chunkIdx] = freshChunk;
          return next;
        });
      }
    });

    if (gameState.status !== GAME_STATUS.PLAYING) return;

    // Precise Mathematical Collision and Pickup Logic
    for (let cIdx = 0; cIdx < TOTAL_CHUNKS; cIdx++) {
      const grp = chunkGroupsRef.current[cIdx];
      if (!grp) continue;
      const chunkZ = grp.position.z;

      // Only test chunks near runner
      if (Math.abs(chunkZ - pZ) > 55) continue;

      const data = chunks[cIdx];
      if (!data) continue;

      // 1. Banknote Collections (with Sango Shades Coin Magnet support!)
      for (let i = 0; i < data.collectibles.length; i++) {
        const col = data.collectibles[i];
        if (collectibleRegistry.collectedNotes.has(col.id)) continue;

        const noteWorldZ = chunkZ - CHUNK_LENGTH / 2 + col.z;
        const dz = Math.abs(pZ - noteWorldZ);
        if (dz > 2.2) continue;

        const noteWorldX = col.lane * LANE_WIDTH;
        const dx = Math.abs(pX - noteWorldX);

        // If magnet is active, pulls coins within 4.5m horizontally!
        const maxDx = isMagnetActive ? 4.5 : 1.38;

        if (dx < maxDx && pY < 2.8) {
          collectibleRegistry.collectedNotes.add(col.id);
          gameAudio.playCollectCash();
          gameState.collectCash(1000);
        }
      }

      // 2. Valuable Artifacts & 2X Multiplier & Point Catalyst Traps
      for (let i = 0; i < data.valuables.length; i++) {
        const val = data.valuables[i];
        const isCatalyst = val.type === PICKUP_TYPE.POINT_CATALYST;

        if (isCatalyst) {
          if (collectibleRegistry.triggeredCatalysts.has(val.id)) continue;
        } else {
          if (collectibleRegistry.collectedValuables.has(val.id)) continue;
        }

        const valWorldZ = chunkZ - CHUNK_LENGTH / 2 + val.z;
        const dz = Math.abs(pZ - valWorldZ);
        if (dz > 1.85) continue;

        const valWorldX = val.lane * LANE_WIDTH;
        const dx = Math.abs(pX - valWorldX);

        if (dx < 1.35 && pY < 2.5) {
          if (isCatalyst) {
            collectibleRegistry.triggeredCatalysts.add(val.id);
            gameState.triggerPointCatalyst(100);
          } else {
            collectibleRegistry.collectedValuables.add(val.id);
            if (val.type === PICKUP_TYPE.MULTIPLIER_2X) {
              gameState.activateMultiplier(2, 15);
            } else {
              gameState.collectValuable(val.type);
            }
          }
        }
      }

      // 3. Obstacle Collisions: Dies on 2nd hit! Slide / Jump / Dodge mechanics
      if (!gameState.isDowned && !gameState.isInvincible) {
        for (let i = 0; i < data.obstacles.length; i++) {
          const obs = data.obstacles[i];
          if (hitObstaclesRef.current.has(obs.id)) continue;

          const obsWorldZ = chunkZ - CHUNK_LENGTH / 2 + obs.z;
          const dz = Math.abs(pZ - obsWorldZ);
          if (dz > 1.65) continue;

          let isCollision = false;

          if (obs.type === OBSTACLE_TYPE.FALLEN_TREE || obs.type === OBSTACLE_TYPE.BENIN_STAFF_GATE) {
            // Full width arch (MUST SLIDE!)
            if (Math.abs(pX) < 3.8) {
              if (pState !== PLAYER_STATE.SLIDING) {
                isCollision = true;
              }
            }
          } else if (obs.type === OBSTACLE_TYPE.WOODEN_BARRIER || obs.type === OBSTACLE_TYPE.SNAKE_PIT) {
            // Jump hurdle (MUST JUMP OVER!)
            const obsWorldX = obs.lane * LANE_WIDTH;
            const dx = Math.abs(pX - obsWorldX);
            if (dx < 1.35) {
              if (pY < 0.82) isCollision = true;
            }
          } else {
            // Dodge obstacles (Rock, Brazier, Totem, Oil Drum, Pothole, Danfo Wreck)
            const obsWorldX = obs.lane * LANE_WIDTH;
            const dx = Math.abs(pX - obsWorldX);
            const hitThreshold = obs.type === OBSTACLE_TYPE.DANFO_WRECK ? 1.65 : 1.35;

            if (dx < hitThreshold) {
              if (obs.type === OBSTACLE_TYPE.MUD_POTHOLE) {
                if (pY < 0.6 && pState !== PLAYER_STATE.SLIDING) isCollision = true;
              } else if (pY < 1.2) {
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

    // 4. Front Witch Ambush Collision Check
    for (let i = 0; i < gameState.activeFrontWitches.length; i++) {
      const fw = gameState.activeFrontWitches[i];
      if (collectibleRegistry.clearedFrontWitches.has(fw.id)) continue;

      const dz = Math.abs(pZ - fw.z);
      if (dz < 1.7) {
        const fwWorldX = fw.lane * LANE_WIDTH;
        const dx = Math.abs(pX - fwWorldX);
        if (dx < 1.4 && !gameState.isInvincible && !gameState.isDowned) {
          collectibleRegistry.clearedFrontWitches.add(fw.id);
          gameAudio.playImpact();
          gameState.hitObstacle();
        }
      } else if (pZ < fw.z - 3.0) {
        // Player passed front witch safely!
        collectibleRegistry.clearedFrontWitches.add(fw.id);
        gameState.score += 150 * (gameState.pointMultiplier || 1);
      }
    }
  });

  return (
    <group>
      {/* Distant Atmospheric Mist Backdrop */}
      <group ref={backdropRef} position={[0, 0, -95]}>
        <DistantMistBackdrop />
      </group>

      {/* Procedural Chunks */}
      {chunks.map((data, idx) => (
        <group
          key={data.index}
          ref={(el) => (chunkGroupsRef.current[idx] = el)}
          position={[0, 0, data.baseZ]}
        >
          <ChunkContent
            type={data.type}
            obstacles={data.obstacles}
            collectibles={data.collectibles}
            valuables={data.valuables}
          />
        </group>
      ))}

      {/* Front Witch Ambushes appearing every 500m */}
      {frontWitches.map((fw) => (
        <FrontWitch key={fw.id} id={fw.id} lane={fw.lane} z={fw.z} />
      ))}
    </group>
  );
}

// Sub-component for chunk geometry and decorations
function ChunkContent({ type, obstacles, collectibles, valuables = [] }) {
  return (
    <group position={[0, 0, -CHUNK_LENGTH / 2]}>
      {/* Track Road Base */}
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

      {/* Biome Scenery based on current distance / region */}
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
          <VillageHut position={[-5.0, 0, -9]} rotationY={0.8} />
          <VillageHut position={[5.0, 0, -9]} rotationY={-0.8} />
          <VillageHut position={[-5.0, 0, 9]} rotationY={0.5} />
          <VillageHut position={[5.0, 0, 9]} rotationY={-0.5} />
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
          <pointLight position={[0, 3.5, 0]} color="#10b981" intensity={2.4} distance={14} />
        </>
      )}

      {/* Obstacles (10 distinct types) */}
      {obstacles.map((obs) => (
        <ObstacleItem key={obs.id} obstacle={obs} />
      ))}

      {/* Naira Banknotes */}
      {collectibles.map((col) => (
        <NairaCollectible key={col.id} id={col.id} lane={col.lane} z={col.z} />
      ))}

      {/* Valuable Cultural Pickups & 2X Multiplier & Catalyst Traps */}
      {valuables.map((val) => (
        <ValuablePickup key={val.id} id={val.id} type={val.type} lane={val.lane} z={val.z} />
      ))}
    </group>
  );
}
