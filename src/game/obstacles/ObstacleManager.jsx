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

      {/* 6. Oil Drum Barricade (Stack of Nigerian industrial barrels & tyres) */}
      {type === OBSTACLE_TYPE.OIL_DRUM_BARRICADE && (
        <group position={[0, 0.6, 0]}>
          {/* Bottom Left Drum */}
          <mesh position={[-0.45, 0, 0]} castShadow receiveShadow material={SHARED_MATS.oilDrumBlue}>
            <cylinderGeometry args={[0.38, 0.38, 1.1, 10]} />
          </mesh>
          {/* Bottom Right Drum */}
          <mesh position={[0.45, 0, 0]} castShadow receiveShadow material={SHARED_MATS.oilDrumRust}>
            <cylinderGeometry args={[0.38, 0.38, 1.1, 10]} />
          </mesh>
          {/* Top Center Drum */}
          <mesh position={[0, 0.85, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={SHARED_MATS.oilDrumRust}>
            <cylinderGeometry args={[0.34, 0.34, 0.9, 10]} />
          </mesh>
          {/* Flanking Tyres */}
          <mesh position={[-0.9, -0.2, 0.1]} rotation={[0, 0.3, Math.PI / 2]} material={SHARED_MATS.tyreBlack}>
            <torusGeometry args={[0.32, 0.12, 6, 12]} />
          </mesh>
          <mesh position={[0.9, -0.2, -0.1]} rotation={[0, -0.2, Math.PI / 2]} material={SHARED_MATS.tyreBlack}>
            <torusGeometry args={[0.32, 0.12, 6, 12]} />
          </mesh>
        </group>
      )}

      {/* 7. Mud Pothole (Lagos road mud fissure with warning stick) */}
      {type === OBSTACLE_TYPE.MUD_POTHOLE && (
        <group position={[0, 0.05, 0]}>
          {/* Sunken Mud Basin */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} material={SHARED_MATS.mudPuddle}>
            <cylinderGeometry args={[1.3, 1.4, 0.1, 12]} />
          </mesh>
          {/* Cracked Dirt Rim */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} material={SHARED_MATS.woodDark}>
            <ringGeometry args={[1.2, 1.6, 12]} />
          </mesh>
          {/* Makeshift Warning Sign / Stick */}
          <mesh position={[0.8, 0.5, 0]} material={SHARED_MATS.tree}>
            <cylinderGeometry args={[0.06, 0.08, 1.1, 6]} />
          </mesh>
          <mesh position={[0.8, 0.95, 0]} material={SHARED_MATS.potRed}>
            <boxGeometry args={[0.45, 0.25, 0.05]} />
          </mesh>
        </group>
      )}

      {/* 8. Danfo Wreck (Abandoned Yellow Lagos Bus Roadblock) */}
      {type === OBSTACLE_TYPE.DANFO_WRECK && (
        <group position={[0, 0.9, 0]}>
          {/* Main Danfo Yellow Chassis */}
          <mesh castShadow receiveShadow material={SHARED_MATS.danfoYellow}>
            <boxGeometry args={[2.0, 1.5, 2.8]} />
          </mesh>
          {/* Iconic Green Side Stripes */}
          <mesh position={[0, -0.1, 0]} material={SHARED_MATS.danfoStripe}>
            <boxGeometry args={[2.04, 0.22, 2.84]} />
          </mesh>
          {/* Dark Windows */}
          <mesh position={[0, 0.35, 0]} material={SHARED_MATS.darkVoid}>
            <boxGeometry args={[2.05, 0.45, 2.4]} />
          </mesh>
          {/* Windshield */}
          <mesh position={[0, 0.35, -1.41]} material={SHARED_MATS.darkVoid}>
            <boxGeometry args={[1.7, 0.5, 0.02]} />
          </mesh>
          {/* 4 Tyres */}
          <mesh position={[-0.98, -0.5, 0.8]} rotation={[0, Math.PI / 2, 0]} material={SHARED_MATS.tyreBlack}>
            <cylinderGeometry args={[0.35, 0.35, 0.22, 10]} />
          </mesh>
          <mesh position={[0.98, -0.5, 0.8]} rotation={[0, Math.PI / 2, 0]} material={SHARED_MATS.tyreBlack}>
            <cylinderGeometry args={[0.35, 0.35, 0.22, 10]} />
          </mesh>
          <mesh position={[-0.98, -0.5, -0.8]} rotation={[0, Math.PI / 2, 0]} material={SHARED_MATS.tyreBlack}>
            <cylinderGeometry args={[0.35, 0.35, 0.22, 10]} />
          </mesh>
          <mesh position={[0.98, -0.5, -0.8]} rotation={[0, Math.PI / 2, 0]} material={SHARED_MATS.tyreBlack}>
            <cylinderGeometry args={[0.35, 0.35, 0.22, 10]} />
          </mesh>
        </group>
      )}

      {/* 9. Benin Bronze Staff Gate (Ancient Ritual Portcullis - SLIDE UNDER!) */}
      {type === OBSTACLE_TYPE.BENIN_STAFF_GATE && (
        <group position={[-laneX, 0, 0]}>
          {/* Left Bronze Pillar */}
          <mesh position={[-4.0, 1.6, 0]} castShadow material={SHARED_MATS.bronzeBenin}>
            <cylinderGeometry args={[0.32, 0.42, 3.2, 8]} />
          </mesh>
          {/* Right Bronze Pillar */}
          <mesh position={[4.0, 1.6, 0]} castShadow material={SHARED_MATS.bronzeBenin}>
            <cylinderGeometry args={[0.32, 0.42, 3.2, 8]} />
          </mesh>
          {/* Horizontal Spanning Bronze Bar (Slide under at height 1.55m) */}
          <mesh position={[0, 1.55, 0]} rotation={[0, 0, Math.PI / 2]} material={SHARED_MATS.bronzeBenin}>
            <cylinderGeometry args={[0.22, 0.22, 8.4, 8]} />
          </mesh>
          {/* Glowing Energy Arc */}
          <mesh position={[0, 1.75, 0]} rotation={[0, 0, Math.PI / 2]} material={SHARED_MATS.lightningCyan}>
            <cylinderGeometry args={[0.06, 0.06, 8.2, 6]} />
          </mesh>
          {/* Ceremonial Masks atop Pillars */}
          <mesh position={[-4.0, 3.3, 0]} material={SHARED_MATS.goldShimmer}>
            <octahedronGeometry args={[0.45, 0]} />
          </mesh>
          <mesh position={[4.0, 3.3, 0]} material={SHARED_MATS.goldShimmer}>
            <octahedronGeometry args={[0.45, 0]} />
          </mesh>
        </group>
      )}

      {/* 10. Snake Pit (Sacred Ceremonial Pit with jungle serpents & thorns - HIGH JUMP!) */}
      {type === OBSTACLE_TYPE.SNAKE_PIT && (
        <group position={[0, 0.25, 0]}>
          {/* Thorns Trench Frame */}
          <mesh position={[0, 0.1, 0]} material={SHARED_MATS.tree}>
            <boxGeometry args={[2.4, 0.22, 1.8]} />
          </mesh>
          {/* Dark Pit Bed */}
          <mesh position={[0, 0.18, 0]} material={SHARED_MATS.darkVoid}>
            <boxGeometry args={[2.1, 0.1, 1.5]} />
          </mesh>
          {/* Sharp Upward Thorns */}
          {[-0.7, -0.2, 0.3, 0.8].map((px, i) => (
            <mesh key={i} position={[px, 0.45, (i % 2 === 0 ? 0.3 : -0.3)]} material={SHARED_MATS.potRed}>
              <coneGeometry args={[0.12, 0.55, 5]} />
            </mesh>
          ))}
          {/* Coiled Serpent Head */}
          <mesh position={[0, 0.55, 0]} material={SHARED_MATS.spiritGreen}>
            <sphereGeometry args={[0.22, 8, 8]} />
          </mesh>
          <mesh position={[0, 0.55, -0.22]} material={SHARED_MATS.potRed}>
            <coneGeometry args={[0.06, 0.25, 4]} />
          </mesh>
        </group>
      )}
    </group>
  );
}
