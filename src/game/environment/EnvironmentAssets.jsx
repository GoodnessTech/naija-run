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

      {/* Flanking corridor walls */}
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

// 3. Ancient Nigerian Carved Stone Monolith
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

// 4. Traditional Mud Village Hut
export function VillageHut({ position = [0, 0, 0], rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1.9, 0]} castShadow receiveShadow material={SHARED_MATS.villageHut}>
        <cylinderGeometry args={[2.8, 3.1, 3.8, 10]} />
      </mesh>
      <mesh position={[0, 5.2, 0]} castShadow material={SHARED_MATS.villageHut}>
        <coneGeometry args={[4.0, 3.2, 10]} />
      </mesh>
      <mesh position={[0, 1.3, 3.0]} material={SHARED_MATS.darkVoid}>
        <planeGeometry args={[1.2, 2.4]} />
      </mesh>
      <mesh position={[1.4, 0.35, 2.8]} castShadow material={SHARED_MATS.woodDark}>
        <cylinderGeometry args={[0.3, 0.28, 0.7, 6]} />
      </mesh>
      <mesh position={[-1.4, 0.35, 2.8]} castShadow material={SHARED_MATS.potRed}>
        <sphereGeometry args={[0.38, 8, 8]} />
      </mesh>
    </group>
  );
}

// 5. Ceremonial Torch Archway
export function CeremonialTorchArch({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[-3.8, 2.5, 0]} castShadow material={SHARED_MATS.tree}>
        <cylinderGeometry args={[0.35, 0.45, 5.0, 6]} />
      </mesh>
      <mesh position={[3.8, 2.5, 0]} castShadow material={SHARED_MATS.tree}>
        <cylinderGeometry args={[0.35, 0.45, 5.0, 6]} />
      </mesh>
      <mesh position={[0, 5.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={SHARED_MATS.tree}>
        <cylinderGeometry args={[0.32, 0.36, 8.2, 6]} />
      </mesh>

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

// 6. Suspension Rope Bridge
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
      <mesh position={[0, -7.0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={SHARED_MATS.chasmWater}>
        <planeGeometry args={[20, length]} />
      </mesh>

      {planks.map((p, idx) => (
        <mesh key={idx} position={[0, -p.sag, p.z]} castShadow receiveShadow material={SHARED_MATS.bridge}>
          <boxGeometry args={[width, 0.18, 0.9]} />
        </mesh>
      ))}

      <mesh position={[-width / 2 + 0.2, 1.2, 0]} material={SHARED_MATS.rope}>
        <cylinderGeometry args={[0.09, 0.09, length, 4]} />
      </mesh>
      <mesh position={[width / 2 - 0.2, 1.2, 0]} material={SHARED_MATS.rope}>
        <cylinderGeometry args={[0.09, 0.09, length, 4]} />
      </mesh>
    </group>
  );
}

// 7. Ancient Rock Cave Tunnel
export function CaveTunnel({ length = 36 }) {
  return (
    <group>
      <group position={[0, 0, length / 2 - 2]}>
        <mesh position={[-4.5, 3.8, 0]} castShadow receiveShadow material={SHARED_MATS.cave}>
          <dodecahedronGeometry args={[4.0, 1]} />
        </mesh>
        <mesh position={[4.5, 3.8, 0]} castShadow receiveShadow material={SHARED_MATS.cave}>
          <dodecahedronGeometry args={[4.0, 1]} />
        </mesh>
        <mesh position={[0, 7.5, 0]} castShadow material={SHARED_MATS.cave}>
          <boxGeometry args={[12.5, 3.5, 5.0]} />
        </mesh>
      </group>

      <mesh position={[-4.6, 4.0, 0]} rotation={[0, Math.PI / 2, 0]} material={SHARED_MATS.cave}>
        <planeGeometry args={[length, 8.5]} />
      </mesh>
      <mesh position={[4.6, 4.0, 0]} rotation={[0, -Math.PI / 2, 0]} material={SHARED_MATS.cave}>
        <planeGeometry args={[length, 8.5]} />
      </mesh>
      <mesh position={[0, 8.0, 0]} rotation={[Math.PI / 2, 0, 0]} material={SHARED_MATS.cave}>
        <planeGeometry args={[9.5, length]} />
      </mesh>
    </group>
  );
}

// 8. Distant Atmospheric Mist Backdrop
export function DistantMistBackdrop() {
  return (
    <mesh position={[0, 18, -100]} material={SHARED_MATS.fogBackdrop}>
      <planeGeometry args={[150, 70]} />
    </mesh>
  );
}

// 9. Market Stall (Zone 3: Market Area)
export function MarketStall({ position = [0, 0, 0], rotationY = 0, color = 'red' }) {
  const canopyMat = color === 'yellow' ? SHARED_MATS.marketFabricYellow : color === 'green' ? SHARED_MATS.marketFabricGreen : SHARED_MATS.marketFabricRed;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Wooden Frame posts */}
      {[-1.2, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 1.6, 0]} castShadow material={SHARED_MATS.woodDark}>
          <cylinderGeometry args={[0.08, 0.08, 3.2, 6]} />
        </mesh>
      ))}
      {/* Striped Canopy Top */}
      <mesh position={[0, 3.1, 0]} rotation={[0.2, 0, 0]} castShadow material={canopyMat}>
        <boxGeometry args={[2.8, 0.1, 2.2]} />
      </mesh>
      {/* Wooden Table / Counter */}
      <mesh position={[0, 0.9, 0.2]} castShadow material={SHARED_MATS.woodDark}>
        <boxGeometry args={[2.5, 0.8, 1.4]} />
      </mesh>
      {/* Fruit baskets on counter */}
      <mesh position={[-0.6, 1.45, 0.2]} castShadow material={SHARED_MATS.flameOrange}>
        <sphereGeometry args={[0.25, 8, 8]} />
      </mesh>
      <mesh position={[0.6, 1.45, 0.2]} castShadow material={SHARED_MATS.marketFabricGreen}>
        <sphereGeometry args={[0.28, 8, 8]} />
      </mesh>
    </group>
  );
}

// 10. Lagos Road Sign (Zone 2: Busy Lagos Road)
export function RoadSign({ position = [0, 0, 0], rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Steel Post */}
      <mesh position={[0, 2.4, 0]} castShadow material={SHARED_MATS.signPoleMetal}>
        <cylinderGeometry args={[0.08, 0.1, 4.8, 6]} />
      </mesh>
      {/* Green Highway Signboard */}
      <mesh position={[0, 4.2, 0]} castShadow material={SHARED_MATS.roadSignGreen}>
        <boxGeometry args={[2.6, 1.2, 0.08]} />
      </mesh>
      {/* White reflective text border */}
      <mesh position={[0, 4.2, 0.05]}>
        <planeGeometry args={[2.4, 1.0]} />
        <meshBasicMaterial color="#ffffff" wireframe />
      </mesh>
    </group>
  );
}

// 11. Highway Streetlight (Zone 5: Night Run)
export function StreetLamp({ position = [0, 0, 0], rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Tall Pole */}
      <mesh position={[0, 3.5, 0]} castShadow material={SHARED_MATS.signPoleMetal}>
        <cylinderGeometry args={[0.07, 0.1, 7.0, 6]} />
      </mesh>
      {/* Curved Arm */}
      <mesh position={[0.6, 6.8, 0]} rotation={[0, 0, -0.4]} material={SHARED_MATS.signPoleMetal}>
        <cylinderGeometry args={[0.06, 0.06, 1.6, 6]} />
      </mesh>
      {/* Glowing Lamp Head */}
      <mesh position={[1.2, 6.7, 0]} material={SHARED_MATS.nightLampGlow}>
        <sphereGeometry args={[0.22, 8, 8]} />
      </mesh>
      <pointLight position={[1.2, 6.5, 0]} color="#fef08a" intensity={2.2} distance={15} />
    </group>
  );
}

// 12. Danger Rune Pillar (Zone 6: High-Speed Danger Area)
export function DangerRunePillar({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Scorched Obsidian Pillar */}
      <mesh position={[0, 2.2, 0]} castShadow material={SHARED_MATS.dangerObsidian}>
        <boxGeometry args={[0.9, 4.4, 0.9]} />
      </mesh>
      {/* Glowing Crimson Runes */}
      <mesh position={[0, 2.2, 0.46]} material={SHARED_MATS.dangerRuneCrimson}>
        <planeGeometry args={[0.5, 2.8]} />
      </mesh>
      {/* Floating Fiery Crystal */}
      <mesh position={[0, 4.8, 0]} material={SHARED_MATS.dangerRuneCrimson}>
        <octahedronGeometry args={[0.35, 0]} />
      </mesh>
      <pointLight position={[0, 4.8, 0]} color="#ef4444" intensity={2.0} distance={12} />
    </group>
  );
}
