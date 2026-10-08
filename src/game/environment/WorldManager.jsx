import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState, GAME_STATUS, LANE, LANE_WIDTH, PLAYER_STATE, BIOMES } from '../core/GameState';
import { gameAudio } from '../core/GameAudio';
import {
  LateritePath,
  IrokoTree,
  CarvedMonolith,
  VillageHut,
  CeremonialTorchArch,
  SuspensionBridge,
  CaveTunnel,
  DistantMistBackdrop,
  MarketStall,
  RoadSign,
  StreetLamp,
  DangerRunePillar
} from './EnvironmentAssets';
import { ObstacleItem } from '../obstacles/ObstacleManager';
import { OBSTACLE_TYPE, PICKUP_TYPE } from '../obstacles/ObstacleConstants';
import { NairaCollectible } from '../collectibles/NairaCollectible';
import { ValuablePickup } from '../collectibles/ValuablePickup';
import { FrontWitch } from '../guardian/FrontWitch';
import { collectibleRegistry } from './CollectibleRegistry';
import { segmentEngine, SEGMENT_TYPE } from './SegmentEngine';

const CHUNK_LENGTH = 36;
const TOTAL_CHUNKS = 8; // 8 chunks for deep horizon visibility (288m visible track)

// Determine biome from distance
function getBiomeForDistance(distance) {
  const dist = Math.abs(distance) % 3600;
  if (dist < 400) return BIOMES.LAGOS_OUTSKIRTS;
  if (dist < 900) return BIOMES.BUSY_LAGOS_ROAD;
  if (dist < 1500) return BIOMES.MARKET_AREA;
  if (dist < 2200) return BIOMES.DARK_FOREST;
  if (dist < 3000) return BIOMES.NIGHT_RUN;
  return BIOMES.DANGER_AREA;
}

// Generate unpredictable, highly varied chunk using Segment Engine
function createProceduralChunk(chunkIdx, baseZ) {
  const distance = Math.abs(baseZ);
  const biome = getBiomeForDistance(distance);

  // Very first starting chunk: gentle introductory sprint with initial Naira
  if (distance < 30) {
    const collectibles = [];
    for (let i = 0; i < 7; i++) {
      collectibles.push({
        id: `c_start_${chunkIdx}_${i}`,
        lane: 0,
        z: -6 - i * 3.5,
        value: 100,
        isRisky: false
      });
    }
    return {
      index: chunkIdx,
      biome,
      baseZ,
      obstacles: [],
      collectibles,
      valuables: []
    };
  }

  // Pick varied segment using 4-history exclusion cooldown!
  const segType = segmentEngine.pickSegment(distance);
  const { obstacles, collectibles, valuables } = segmentEngine.generateSegmentContent(
    segType,
    chunkIdx,
    baseZ,
    distance
  );

  return {
    index: chunkIdx,
    biome,
    baseZ,
    obstacles,
    collectibles,
    valuables
  };
}

export function WorldManager() {
  const backdropRef = useRef();
  const chunkGroupsRef = useRef([]);
  const hitObstaclesRef = useRef(new Set());
  const nearMissCheckedRef = useRef(new Set());

  // Dynamic chunk pool data
  const [chunks, setChunks] = useState(() => {
    segmentEngine.reset();
    return Array.from({ length: TOTAL_CHUNKS }).map((_, idx) => {
      return createProceduralChunk(idx, -idx * CHUNK_LENGTH);
    });
  });

  // Front witches state
  const [frontWitches, setFrontWitches] = useState([]);

  // Reset positions on restart
  useEffect(() => {
    const unsubscribe = gameState.subscribe((snap) => {
      if ((snap.status === GAME_STATUS.COUNTDOWN || snap.status === GAME_STATUS.PLAYING) && snap.distance < 2) {
        collectibleRegistry.reset();
        segmentEngine.reset();
        hitObstaclesRef.current.clear();
        nearMissCheckedRef.current.clear();
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

    // Dynamic Chunk Recycling: leap forward and generate unpredictable fresh content!
    chunkGroupsRef.current.forEach((grp, chunkIdx) => {
      if (!grp) return;
      if (grp.position.z > pZ + 36) {
        const newZ = grp.position.z - poolSpan;
        grp.position.z = newZ;

        const freshChunk = createProceduralChunk(chunkIdx, newZ);
        setChunks((prev) => {
          const next = [...prev];
          next[chunkIdx] = freshChunk;
          return next;
        });
      }
    });

    if (gameState.status !== GAME_STATUS.PLAYING) return;

    // Mathematical Collisions, Pickups, and Near-Miss Detection
    for (let cIdx = 0; cIdx < TOTAL_CHUNKS; cIdx++) {
      const grp = chunkGroupsRef.current[cIdx];
      if (!grp) continue;
      const chunkZ = grp.position.z;

      // Only test chunks near runner
      if (Math.abs(chunkZ - pZ) > 55) continue;

      const data = chunks[cIdx];
      if (!data) continue;

      // 1. Banknote Collections with Denominations and Streaks
      for (let i = 0; i < data.collectibles.length; i++) {
        const col = data.collectibles[i];
        if (collectibleRegistry.collectedNotes.has(col.id)) continue;

        const noteWorldZ = chunkZ - CHUNK_LENGTH / 2 + col.z;
        const dz = Math.abs(pZ - noteWorldZ);
        if (dz > 2.2) continue;

        const noteWorldX = col.lane * LANE_WIDTH;
        const dx = Math.abs(pX - noteWorldX);

        // Magnet range
        const maxDx = isMagnetActive ? 4.5 : 1.38;

        if (dx < maxDx && pY < (col.isHighJump ? 3.2 : 2.7)) {
          collectibleRegistry.collectedNotes.add(col.id);
          const value = col.value || 100;
          gameState.collectNaira(value, col.isRisky || false);
        }
      }

      // 2. Cultural Valuable Pickups, 2X Multiplier, and Point Catalyst Traps
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

      // 3. Obstacle Collision & Near-Miss Mechanics
      for (let i = 0; i < data.obstacles.length; i++) {
        const obs = data.obstacles[i];
        const obsWorldZ = chunkZ - CHUNK_LENGTH / 2 + obs.z;
        const dz = Math.abs(pZ - obsWorldZ);

        if (dz > 2.4) continue;

        const obsWorldX = obs.lane * LANE_WIDTH;
        const dx = Math.abs(pX - obsWorldX);

        // Near-miss check: player passed very close without colliding!
        if (
          !gameState.isDowned &&
          dz < 1.35 &&
          dx >= 1.25 &&
          dx <= 2.15 &&
          !hitObstaclesRef.current.has(obs.id) &&
          !nearMissCheckedRef.current.has(obs.id)
        ) {
          nearMissCheckedRef.current.add(obs.id);
          gameState.triggerNearMiss(obs.type);
        }

        // Fatal/Impact Collision check
        if (!gameState.isDowned && !gameState.isInvincible && !gameState.isSpeedBurstActive) {
          if (hitObstaclesRef.current.has(obs.id)) continue;
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
            if (dx < 1.35) {
              if (pY < 0.85) isCollision = true;
            }
          } else {
            // Dodge obstacles (Rock, Brazier, Totem, Oil Drum, Pothole, Danfo Wreck)
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
        if (dx < 1.4 && !gameState.isInvincible && !gameState.isDowned && !gameState.isSpeedBurstActive) {
          collectibleRegistry.clearedFrontWitches.add(fw.id);
          gameAudio.playImpact();
          gameState.hitObstacle();
        }
      } else if (pZ < fw.z - 3.0) {
        collectibleRegistry.clearedFrontWitches.add(fw.id);
        gameState.score += 200 * (gameState.pointMultiplier || 1);
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
            biome={data.biome}
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

// Sub-component for chunk geometry and zone decorations
function ChunkContent({ biome, obstacles, collectibles, valuables = [] }) {
  return (
    <group position={[0, 0, -CHUNK_LENGTH / 2]}>
      {/* Track Base */}
      <LateritePath length={CHUNK_LENGTH} width={7.6} />

      {/* Zone Scenery Variations */}
      {biome === BIOMES.LAGOS_OUTSKIRTS && (
        <>
          <IrokoTree position={[-5.8, 0, -8]} scale={1.2} />
          <IrokoTree position={[5.8, 0, 10]} scale={1.1} />
          <CarvedMonolith position={[-4.2, 0, 0]} rotationY={0.3} />
          <CarvedMonolith position={[4.2, 0, 4]} rotationY={-0.4} />
          <VillageHut position={[-5.2, 0, -18]} rotationY={0.6} />
        </>
      )}

      {biome === BIOMES.BUSY_LAGOS_ROAD && (
        <>
          <RoadSign position={[-4.8, 0, -6]} rotationY={0.2} />
          <RoadSign position={[4.8, 0, 12]} rotationY={-0.2} />
          <StreetLamp position={[-4.5, 0, -16]} />
          <StreetLamp position={[4.5, 0, 4]} />
          <CarvedMonolith position={[-4.2, 0, 8]} />
        </>
      )}

      {biome === BIOMES.MARKET_AREA && (
        <>
          <MarketStall position={[-4.6, 0, -10]} rotationY={0.3} color="red" />
          <MarketStall position={[4.6, 0, -10]} rotationY={-0.3} color="yellow" />
          <MarketStall position={[-4.6, 0, 10]} rotationY={0.2} color="green" />
          <MarketStall position={[4.6, 0, 10]} rotationY={-0.2} color="yellow" />
          <VillageHut position={[5.2, 0, 0]} rotationY={-0.8} />
        </>
      )}

      {biome === BIOMES.DARK_FOREST && (
        <>
          <IrokoTree position={[-5.6, 0, -12]} scale={1.4} />
          <IrokoTree position={[5.6, 0, 6]} scale={1.35} />
          <CarvedMonolith position={[-4.2, 0, -4]} />
          <CarvedMonolith position={[4.2, 0, 4]} />
          <CeremonialTorchArch position={[0, 0, 0]} />
          <pointLight position={[0, 3.5, 0]} color="#10b981" intensity={2.0} distance={14} />
        </>
      )}

      {biome === BIOMES.NIGHT_RUN && (
        <>
          <StreetLamp position={[-4.5, 0, -14]} />
          <StreetLamp position={[4.5, 0, 2]} />
          <StreetLamp position={[-4.5, 0, 16]} />
          <CarvedMonolith position={[4.2, 0, -6]} />
          <CeremonialTorchArch position={[0, 0, 16]} />
        </>
      )}

      {biome === BIOMES.DANGER_AREA && (
        <>
          <DangerRunePillar position={[-4.4, 0, -10]} />
          <DangerRunePillar position={[4.4, 0, 6]} />
          <CeremonialTorchArch position={[0, 0, -16]} />
          <pointLight position={[0, 3.5, 0]} color="#ef4444" intensity={2.5} distance={15} />
        </>
      )}

      {/* Obstacles */}
      {obstacles.map((obs) => (
        <ObstacleItem key={obs.id} obstacle={obs} />
      ))}

      {/* Naira Banknotes with Denominations */}
      {collectibles.map((col) => (
        <NairaCollectible
          key={col.id}
          id={col.id}
          lane={col.lane}
          z={col.z}
          value={col.value || 100}
          isHighJump={col.isHighJump || false}
          isSlideBonus={col.isSlideBonus || false}
        />
      ))}

      {/* Valuable Cultural Pickups & 2X Multiplier & Catalyst Traps */}
      {valuables.map((val) => (
        <ValuablePickup key={val.id} id={val.id} type={val.type} lane={val.lane} z={val.z} />
      ))}
    </group>
  );
}
