import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameState, GAME_STATUS, LANE_WIDTH, PLAYER_STATE } from '../core/GameState';
import { gameAudio } from '../core/GameAudio';
import {
  ForestTrack,
  OutskirtsTrack,
  HighwayTrack,
  MarketTrack,
  NightHighwayTrack,
  OutskirtsShack,
  NEPAPole,
  BananaTree,
  LagosTenement,
  UnfinishedBuilding,
  JerseyBarrier,
  MarketUmbrellaStall,
  NightStreetlight,
  IrokoTree,
  CarvedMonolith,
  CeremonialTorchArch,
  DynamicBackdrop
} from './EnvironmentAssets';
import { ObstacleItem } from '../obstacles/ObstacleManager';
import { OBSTACLE_TYPE, PICKUP_TYPE } from '../obstacles/ObstacleConstants';
import { NairaCollectible } from '../collectibles/NairaCollectible';
import { ValuablePickup } from '../collectibles/ValuablePickup';
import { FrontWitch } from '../guardian/FrontWitch';
import { collectibleRegistry } from './CollectibleRegistry';
import { segmentEngine } from './SegmentEngine';
import { environmentDirector, ENVIRONMENTS } from './EnvironmentDirector';

const CHUNK_LENGTH = 36;
const TOTAL_CHUNKS = 8; // 8 chunks visible (288m view distance)

// Create procedural chunk using Environment Director & Segment Engine
function createProceduralChunk(chunkIdx, baseZ) {
  const distance = Math.abs(baseZ);
  const { currentEnv, nextEnv, isTransition, config } = environmentDirector.getEnvironmentAtDistance(distance);

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
      env: currentEnv,
      nextEnv,
      isTransition,
      config,
      baseZ,
      obstacles: [],
      collectibles,
      valuables: []
    };
  }

  // Pick varied segment obeying cooldown history and environment obstacle vocabulary
  const segType = segmentEngine.pickSegment(distance);
  const { obstacles, collectibles, valuables } = segmentEngine.generateSegmentContent(
    segType,
    chunkIdx,
    baseZ,
    distance,
    config.allowedObstacles
  );

  return {
    index: chunkIdx,
    env: currentEnv,
    nextEnv,
    isTransition,
    config,
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
    environmentDirector.resetForNewRun();
    return Array.from({ length: TOTAL_CHUNKS }).map((_, idx) => {
      return createProceduralChunk(idx, -idx * CHUNK_LENGTH);
    });
  });

  const [frontWitches, setFrontWitches] = useState([]);
  const [currentBackdropType, setCurrentBackdropType] = useState('FOREST_MIST');

  // Reset positions on restart
  useEffect(() => {
    const unsubscribe = gameState.subscribe((snap) => {
      if ((snap.status === GAME_STATUS.COUNTDOWN || snap.status === GAME_STATUS.PLAYING) && snap.distance < 2) {
        collectibleRegistry.reset();
        segmentEngine.reset();
        environmentDirector.resetForNewRun();
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

  // Update front witches state
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

    // Follow player with dynamic backdrop
    if (backdropRef.current) {
      backdropRef.current.position.z = pZ - 95;
    }

    // Update backdrop type based on active environment
    const { config } = environmentDirector.getEnvironmentAtDistance(gameState.distance);
    if (config.backdropType !== currentBackdropType) {
      setCurrentBackdropType(config.backdropType);
    }

    const poolSpan = TOTAL_CHUNKS * CHUNK_LENGTH;

    // Dynamic Chunk Recycling: only keep current & upcoming chunks in memory!
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

      // Only test chunks in immediate proximity of runner
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
        const maxDx = isMagnetActive ? 4.5 : 1.38;

        if (dx < maxDx && pY < (col.isHighJump ? 3.2 : 2.7)) {
          collectibleRegistry.collectedNotes.add(col.id);
          const value = col.value || 100;
          gameState.collectNaira(value, col.isRisky || false);
        }
      }

      // 2. Cultural Valuable Pickups, Multiplier, and Traps
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

        // Near-miss check
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

        // Collision check
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
      {/* Distant Dynamic Atmospheric Backdrop */}
      <group ref={backdropRef} position={[0, 0, -95]}>
        <DynamicBackdrop type={currentBackdropType} />
      </group>

      {/* Procedural Chunks */}
      {chunks.map((data, idx) => (
        <group
          key={data.index}
          ref={(el) => (chunkGroupsRef.current[idx] = el)}
          position={[0, 0, data.baseZ]}
        >
          <ChunkContent
            env={data.env}
            roadType={data.config.roadType}
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

// Sub-component for chunk geometry, road type, and environment pack assets
function ChunkContent({ env, roadType, obstacles, collectibles, valuables = [] }) {
  return (
    <group position={[0, 0, -CHUNK_LENGTH / 2]}>
      {/* Modular Track based on Environment */}
      {roadType === 'OUTSKIRTS_ROAD' ? (
        <OutskirtsTrack length={CHUNK_LENGTH} width={7.6} />
      ) : roadType === 'HIGHWAY_TARMAC' ? (
        <HighwayTrack length={CHUNK_LENGTH} width={7.6} />
      ) : roadType === 'MARKET_STREET' ? (
        <MarketTrack length={CHUNK_LENGTH} width={7.6} />
      ) : roadType === 'NIGHT_ASPHALT' ? (
        <NightHighwayTrack length={CHUNK_LENGTH} width={7.6} />
      ) : (
        <ForestTrack length={CHUNK_LENGTH} width={7.6} />
      )}

      {/* Environment-Specific Side Modules & Props from Asset Packs */}
      {env === ENVIRONMENTS.FOREST && (
        <>
          <IrokoTree position={[-5.8, 0, -8]} scale={1.2} />
          <IrokoTree position={[5.8, 0, 10]} scale={1.1} />
          <CarvedMonolith position={[-4.2, 0, 0]} rotationY={0.3} />
          <CarvedMonolith position={[4.2, 0, 4]} rotationY={-0.4} />
        </>
      )}

      {env === ENVIRONMENTS.FOREST_VARIATION && (
        <>
          <IrokoTree position={[-5.8, 0, -10]} scale={1.3} />
          <IrokoTree position={[5.8, 0, 8]} scale={1.25} />
          <CarvedMonolith position={[-4.2, 0, -2]} />
          <CarvedMonolith position={[4.2, 0, 6]} />
          <CeremonialTorchArch position={[0, 0, -18]} />
        </>
      )}

      {env === ENVIRONMENTS.LAGOS_OUTSKIRTS && (
        <>
          <OutskirtsShack position={[-5.4, 0, -10]} rotationY={0.4} />
          <BananaTree position={[-5.2, 0, 8]} scale={1.1} />
          <BananaTree position={[5.2, 0, -14]} scale={1.0} />
          <NEPAPole position={[4.8, 0, 4]} />
          <JerseyBarrier position={[4.8, 0, -6]} rotationY={0.2} />
        </>
      )}

      {env === ENVIRONMENTS.BUSY_LAGOS_ROAD && (
        <>
          <LagosTenement position={[-5.8, 0, -12]} rotationY={0.2} stories={3} />
          <UnfinishedBuilding position={[5.8, 0, 6]} />
          <JerseyBarrier position={[-4.8, 0, 8]} />
          <JerseyBarrier position={[4.8, 0, -4]} />
        </>
      )}

      {env === ENVIRONMENTS.MARKET_DISTRICT && (
        <>
          <MarketUmbrellaStall position={[-4.8, 0, -10]} color="red" />
          <MarketUmbrellaStall position={[4.8, 0, -10]} color="yellow" />
          <MarketUmbrellaStall position={[-4.8, 0, 10]} color="green" />
          <MarketUmbrellaStall position={[4.8, 0, 10]} color="blue" />
        </>
      )}

      {env === ENVIRONMENTS.DARK_FOREST && (
        <>
          <IrokoTree position={[-5.8, 0, -12]} scale={1.4} />
          <IrokoTree position={[5.8, 0, 6]} scale={1.35} />
          <CarvedMonolith position={[-4.2, 0, -4]} />
          <CeremonialTorchArch position={[0, 0, 0]} />
          <pointLight position={[0, 3.5, 0]} color="#10b981" intensity={2.2} distance={14} />
        </>
      )}

      {env === ENVIRONMENTS.NIGHT_LAGOS && (
        <>
          <NightStreetlight position={[-4.8, 0, -14]} />
          <NightStreetlight position={[4.8, 0, 4]} />
          <NightStreetlight position={[-4.8, 0, 16]} />
          <LagosTenement position={[5.8, 0, -12]} rotationY={-0.3} stories={2} />
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
