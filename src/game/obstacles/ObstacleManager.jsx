import React from 'react';
import { LANE_WIDTH } from '../core/GameState';
import { SHARED_MATS } from '../environment/SharedMaterials';
import { OBSTACLE_TYPE } from './ObstacleConstants';

export { OBSTACLE_TYPE };

export function ObstacleItem({ obstacle }) {
  const { type, lane, z } = obstacle;
  const laneX = lane * LANE_WIDTH;

  return (
    <group position={[laneX, 0, z]}>
      {/* 1. Large Mossy Boulder (from rock.jpg reference) */}
      {type === OBSTACLE_TYPE.ROCK && (
        <group position={[0, 1.1, 0]}>
          <mesh castShadow receiveShadow material={SHARED_MATS.rock}>
            <dodecahedronGeometry args={[1.35, 1]} />
          </mesh>
          <mesh position={[0.2, 0.7, 0]} material={SHARED_MATS.rock}>
            <sphereGeometry args={[0.9, 8, 8]} />
          </mesh>
          <mesh position={[0, 1.3, 0]} material={SHARED_MATS.mossGreen}>
            <sphereGeometry args={[0.85, 7, 7]} />
          </mesh>
          <mesh position={[-1.2, -0.7, 0.3]} castShadow material={SHARED_MATS.potRed}>
            <sphereGeometry args={[0.38, 7, 7]} />
          </mesh>
          <mesh position={[1.2, -0.7, -0.2]} castShadow material={SHARED_MATS.potRed}>
            <sphereGeometry args={[0.34, 7, 7]} />
          </mesh>
        </group>
      )}

      {/* 2. Massive Arched Bent Tree (from bent tree.jpg reference - SLIDE UNDERNEATH!) */}
      {type === OBSTACLE_TYPE.FALLEN_TREE && (
        <group position={[-laneX, 0, 0]}>
          <mesh position={[-4.2, 1.2, 0]} castShadow material={SHARED_MATS.tree}>
            <cylinderGeometry args={[0.8, 1.2, 2.5, 6]} />
          </mesh>
          <mesh position={[4.2, 1.2, 0]} castShadow material={SHARED_MATS.tree}>
            <cylinderGeometry args={[0.8, 1.2, 2.5, 6]} />
          </mesh>
          {/* Arched trunk at slide clearance height 1.6m */}
          <mesh position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={SHARED_MATS.tree}>
            <cylinderGeometry args={[0.48, 0.58, 9.2, 10]} />
          </mesh>
          {/* Mossy top */}
          <mesh position={[0, 2.05, 0]} rotation={[0, 0, Math.PI / 2]} material={SHARED_MATS.mossGreen}>
            <boxGeometry args={[0.35, 8.8, 0.65]} />
          </mesh>
          {/* Hanging lianas */}
          <mesh position={[-2.4, 0.9, 0]} material={SHARED_MATS.tree}>
            <cylinderGeometry args={[0.05, 0.05, 1.3, 4]} />
          </mesh>
          <mesh position={[0, 1.0, 0.1]} material={SHARED_MATS.tree}>
            <cylinderGeometry args={[0.04, 0.04, 1.1, 4]} />
          </mesh>
          <mesh position={[2.4, 0.9, -0.1]} material={SHARED_MATS.tree}>
            <cylinderGeometry args={[0.05, 0.05, 1.3, 4]} />
          </mesh>
        </group>
      )}

      {/* 3. Low Spiked Wooden Barrier (JUMP OVER!) */}
      {type === OBSTACLE_TYPE.WOODEN_BARRIER && (
        <group position={[0, 0.5, 0]}>
          <mesh castShadow receiveShadow material={SHARED_MATS.tree}>
            <boxGeometry args={[2.4, 0.38, 0.32]} />
          </mesh>
          <mesh position={[0, 0, 0.17]} material={SHARED_MATS.potRed}>
            <boxGeometry args={[2.2, 0.18, 0.02]} />
          </mesh>
          <mesh position={[-0.9, 0, 0]} material={SHARED_MATS.tree}>
            <cylinderGeometry args={[0.14, 0.16, 1.05, 6]} />
          </mesh>
          <mesh position={[0.9, 0, 0]} material={SHARED_MATS.tree}>
            <cylinderGeometry args={[0.14, 0.16, 1.05, 6]} />
          </mesh>
          <mesh position={[-0.5, 0.35, 0]} material={SHARED_MATS.tree}>
            <coneGeometry args={[0.14, 0.45, 4]} />
          </mesh>
          <mesh position={[0.5, 0.35, 0]} material={SHARED_MATS.tree}>
            <coneGeometry args={[0.14, 0.45, 4]} />
          </mesh>
        </group>
      )}

      {/* 4. Ceremonial Fire Brazier (from torch.jpg reference) */}
      {type === OBSTACLE_TYPE.FIRE_BRAZIER && (
        <group position={[0, 0.65, 0]}>
          <mesh castShadow receiveShadow material={SHARED_MATS.torch}>
            <cylinderGeometry args={[0.85, 0.55, 0.8, 8]} />
          </mesh>
          <mesh position={[0, 0.75, 0]} material={SHARED_MATS.flameOrange}>
            <coneGeometry args={[0.55, 1.25, 6]} />
          </mesh>
          <mesh position={[0, 0.65, 0]} material={SHARED_MATS.flameYellow}>
            <sphereGeometry args={[0.35, 6, 6]} />
          </mesh>
        </group>
      )}

      {/* 5. Sacred Ancestral Totem Pillar */}
      {type === OBSTACLE_TYPE.SACRED_TOTEM && (
        <group position={[0, 2.1, 0]}>
          <mesh castShadow receiveShadow material={SHARED_MATS.tree}>
            <cylinderGeometry args={[0.48, 0.58, 4.2, 8]} />
          </mesh>
          <mesh position={[0, 0.9, 0.48]} material={SHARED_MATS.torch}>
            <boxGeometry args={[0.7, 1.1, 0.22]} />
          </mesh>
          <mesh position={[-0.16, 1.05, 0.6]} material={SHARED_MATS.spiritGreen}>
            <sphereGeometry args={[0.06, 6, 6]} />
          </mesh>
          <mesh position={[0.16, 1.05, 0.6]} material={SHARED_MATS.spiritGreen}>
            <sphereGeometry args={[0.06, 6, 6]} />
          </mesh>
        </group>
      )}
    </group>
  );
}
