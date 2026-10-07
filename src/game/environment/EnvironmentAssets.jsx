import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SHARED_MATS } from './SharedMaterials';

// 1. Laterite Red Soil Path with Photorealistic Texture from References
export function LateritePath({ length = 36, width = 7.6 }) {
  return (
    <group>
      {/* Center red laterite trail */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={SHARED_MATS.path}>
        <planeGeometry args={[width, length]} />
      </mesh>

      {/* Jungle verges */}
      <mesh position={[-width / 2 - 4.5, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={SHARED_MATS.wall}>
        <planeGeometry args={[9, length]} />
      </mesh>
      <mesh position={[width / 2 + 4.5, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={SHARED_MATS.wall}>
        <planeGeometry args={[9, length]} />
      </mesh>

      {/* Dense rainforest flanking corridor walls (Temple Run style) */}
      <mesh position={[-width / 2 - 0.2, 4.5, 0]} rotation={[0, Math.PI / 2, 0]} material={SHARED_MATS.wall}>
        <planeGeometry args={[length, 9.5]} />
      </mesh>
      <mesh position={[width / 2 + 0.2, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]} material={SHARED_MATS.wall}>
        <planeGeometry args={[length, 9.5]} />
      </mesh>
    </group>
  );
}

// 2. Giant Iroko Hardwood Tree with Roots & Canopy
export function IrokoTree({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Main Trunk */}
      <mesh position={[0, 8, 0]} castShadow receiveShadow material={SHARED_MATS.tree}>
        <cylinderGeometry args={[1.3, 2.2, 16, 8]} />
      </mesh>
      {/* Buttress Roots */}
      <mesh position={[1.6, 2.0, 0.4]} rotation={[0, 0.4, -0.25]} castShadow material={SHARED_MATS.tree}>
        <boxGeometry args={[2.0, 4.0, 0.7]} />
      </mesh>
      <mesh position={[-1.5, 2.0, -0.3]} rotation={[0, -0.5, 0.25]} castShadow material={SHARED_MATS.tree}>
        <boxGeometry args={[2.0, 3.8, 0.7]} />
      </mesh>
      {/* Dense Tropical Canopy */}
      <mesh position={[0, 16, 0]} castShadow material={SHARED_MATS.mossGreen}>
        <sphereGeometry args={[5.8, 7, 7]} />
      </mesh>
      <mesh position={[2.6, 17.5, -1]} castShadow material={SHARED_MATS.mossGreen}>
        <sphereGeometry args={[4.4, 6, 6]} />
      </mesh>
    </group>
  );
}

// 3. Ancient Nigerian Carved Stone Monolith (from rock.jpg reference)
export function CarvedMonolith({ position = [0, 0, 0], rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 2.0, 0]} castShadow receiveShadow material={SHARED_MATS.rock}>
        <boxGeometry args={[1.1, 4.0, 1.1]} />
      </mesh>
      <mesh position={[0, 4.25, 0]} castShadow material={SHARED_MATS.rock}>
        <coneGeometry args={[0.85, 0.8, 4]} />
      </mesh>
      <mesh position={[0.8, 0.35, 0.4]} castShadow material={SHARED_MATS.potRed}>
        <sphereGeometry args={[0.36, 8, 8]} />
      </mesh>
    </group>
  );
}

// 4. Traditional Mud Village Hut (directly from village.jpg reference)
export function VillageHut({ position = [0, 0, 0], rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Circular Clay Mud Wall */}
      <mesh position={[0, 1.9, 0]} castShadow receiveShadow material={SHARED_MATS.villageHut}>
        <cylinderGeometry args={[2.8, 3.1, 3.8, 10]} />
      </mesh>
      {/* Conical Thatched Palm Roof */}
      <mesh position={[0, 5.2, 0]} castShadow material={SHARED_MATS.villageHut}>
        <coneGeometry args={[4.0, 3.2, 10]} />
      </mesh>
      {/* Carved Doorway with interior darkness */}
      <mesh position={[0, 1.3, 3.0]} material={SHARED_MATS.darkVoid}>
        <planeGeometry args={[1.2, 2.4]} />
      </mesh>
      {/* Wooden Stool / Drum at entrance */}
      <mesh position={[1.4, 0.35, 2.8]} castShadow material={SHARED_MATS.woodDark}>
        <cylinderGeometry args={[0.3, 0.28, 0.7, 6]} />
      </mesh>
      {/* Clay Pottery Pots at door */}
      <mesh position={[-1.4, 0.35, 2.8]} castShadow material={SHARED_MATS.potRed}>
        <sphereGeometry args={[0.38, 8, 8]} />
      </mesh>
    </group>
  );
}

// 5. Ceremonial Torch Archway (directly from torch.jpg reference)
export function CeremonialTorchArch({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Left and Right Arch Posts */}
      <mesh position={[-3.8, 2.5, 0]} castShadow material={SHARED_MATS.tree}>
        <cylinderGeometry args={[0.35, 0.45, 5.0, 6]} />
      </mesh>
      <mesh position={[3.8, 2.5, 0]} castShadow material={SHARED_MATS.tree}>
        <cylinderGeometry args={[0.35, 0.45, 5.0, 6]} />
      </mesh>
      {/* Top Crossbeam */}
      <mesh position={[0, 5.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={SHARED_MATS.tree}>
        <cylinderGeometry args={[0.32, 0.36, 8.2, 6]} />
      </mesh>

      {/* 3 Blazing Torches on Arch */}
      {[-3.6, 0, 3.6].map((x, idx) => (
        <group key={idx} position={[x, 5.2, 0.2]}>
          <mesh material={SHARED_MATS.torch}>
            <cylinderGeometry args={[0.2, 0.1, 0.6, 6]} />
          </mesh>
          <mesh position={[0, 0.55, 0]} material={SHARED_MATS.flameYellow}>
            <coneGeometry args={[0.32, 0.85, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 6. Suspension Rope Bridge (directly from bridge.jpg reference)
export function SuspensionBridge({ length = 36, width = 6.6 }) {
  const plankCount = Math.floor(length / 1.1);
  const planks = useMemo(() => {
    return Array.from({ length: plankCount }).map((_, i) => {
      const z = -length / 2 + i * 1.1 + 0.55;
      const sag = Math.sin((i / plankCount) * Math.PI) * 0.4;
      return { z, sag };
    });
  }, [length, plankCount]);

  return (
    <group>
      {/* Deep misty gorge chasm */}
      <mesh position={[0, -7.0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={SHARED_MATS.chasmWater}>
        <planeGeometry args={[20, length]} />
      </mesh>

      {/* Wooden Planks */}
      {planks.map((p, idx) => (
        <mesh key={idx} position={[0, -p.sag, p.z]} castShadow receiveShadow material={SHARED_MATS.bridge}>
          <boxGeometry args={[width, 0.18, 0.9]} />
        </mesh>
      ))}

      {/* Suspension Ropes */}
      <mesh position={[-width / 2 + 0.2, 1.2, 0]} material={SHARED_MATS.rope}>
        <cylinderGeometry args={[0.09, 0.09, length, 4]} />
      </mesh>
      <mesh position={[width / 2 - 0.2, 1.2, 0]} material={SHARED_MATS.rope}>
        <cylinderGeometry args={[0.09, 0.09, length, 4]} />
      </mesh>

      {/* Entrance Posts */}
      {[-width / 2 + 0.1, width / 2 - 0.1].map((x, i) => (
        <React.Fragment key={i}>
          <mesh position={[x, 1.5, length / 2]} castShadow material={SHARED_MATS.bridge}>
            <cylinderGeometry args={[0.3, 0.38, 3.2, 6]} />
          </mesh>
          <mesh position={[x, 1.5, -length / 2]} castShadow material={SHARED_MATS.bridge}>
            <cylinderGeometry args={[0.3, 0.38, 3.2, 6]} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}

// 7. Colossal Ancient Rock Cave Tunnel (directly from cave.jpg reference)
export function CaveTunnel({ length = 36 }) {
  return (
    <group>
      {/* Massive Cavern Mouth Entrance Arch */}
      <group position={[0, 0, length / 2 - 2]}>
        <mesh position={[-4.5, 3.8, 0]} castShadow receiveShadow material={SHARED_MATS.cave}>
          <dodecahedronGeometry args={[4.0, 1]} />
        </mesh>
        <mesh position={[4.5, 3.8, 0]} castShadow receiveShadow material={SHARED_MATS.cave}>
          <dodecahedronGeometry args={[4.0, 1]} />
        </mesh>
        {/* Overhead Cave Lintel Arch */}
        <mesh position={[0, 7.5, 0]} castShadow material={SHARED_MATS.cave}>
          <boxGeometry args={[12.5, 3.5, 5.0]} />
        </mesh>
      </group>

      {/* Cavern Side Walls & Ceiling Tunnel */}
      <mesh position={[-4.6, 4.0, 0]} rotation={[0, Math.PI / 2, 0]} material={SHARED_MATS.cave}>
        <planeGeometry args={[length, 8.5]} />
      </mesh>
      <mesh position={[4.6, 4.0, 0]} rotation={[0, -Math.PI / 2, 0]} material={SHARED_MATS.cave}>
        <planeGeometry args={[length, 8.5]} />
      </mesh>
      <mesh position={[0, 8.0, 0]} rotation={[Math.PI / 2, 0, 0]} material={SHARED_MATS.cave}>
        <planeGeometry args={[9.5, length]} />
      </mesh>

      {/* Glowing Emerald Torches Inside Cavern */}
      {[-10, 0, 10].map((z, idx) => (
        <group key={idx} position={[idx % 2 === 0 ? -3.8 : 3.8, 2.2, z]}>
          <mesh material={SHARED_MATS.spiritGreen}>
            <sphereGeometry args={[0.2, 6, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 8. Distant Atmospheric Mist Backdrop (fog.jpg)
export function DistantMistBackdrop() {
  return (
    <mesh position={[0, 18, -100]} material={SHARED_MATS.fogBackdrop}>
      <planeGeometry args={[150, 70]} />
    </mesh>
  );
}
