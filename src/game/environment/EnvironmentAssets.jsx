import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SHARED_MATS } from './SharedMaterials';

// ==========================================
// 1. MODULAR ROAD TRACKS
// ==========================================

// Rainforest Trail (Dense Green / Supernatural Forest)
export function ForestTrack({ length = 36, width = 7.6 }) {
  return (
    <group>
      {/* Red laterite soil trail */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={SHARED_MATS.pathForest}>
        <planeGeometry args={[width, length]} />
      </mesh>
      {/* Jungle verges */}
      <mesh position={[-width / 2 - 4.5, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={SHARED_MATS.wall}>
        <planeGeometry args={[9, length]} />
      </mesh>
      <mesh position={[width / 2 + 4.5, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={SHARED_MATS.wall}>
        <planeGeometry args={[9, length]} />
      </mesh>
      {/* Flanking rainforest tree walls */}
      <mesh position={[-width / 2 - 0.2, 4.5, 0]} rotation={[0, Math.PI / 2, 0]} material={SHARED_MATS.wall}>
        <planeGeometry args={[length, 9.5]} />
      </mesh>
      <mesh position={[width / 2 + 0.2, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]} material={SHARED_MATS.wall}>
        <planeGeometry args={[length, 9.5]} />
      </mesh>
    </group>
  );
}

// Lagos Outskirts Road (Red dirt road + concrete drainage gutters)
export function OutskirtsTrack({ length = 36, width = 7.6 }) {
  return (
    <group>
      {/* Dusty laterite road */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={SHARED_MATS.pathOutskirts}>
        <planeGeometry args={[width, length]} />
      </mesh>
      {/* Concrete curbs */}
      {[-width / 2, width / 2].map((x, i) => (
        <mesh key={i} position={[x, 0.08, 0]} receiveShadow material={SHARED_MATS.concreteCurb}>
          <boxGeometry args={[0.3, 0.16, length]} />
        </mesh>
      ))}
      {/* Open concrete roadside drainage gutters */}
      {[-width / 2 - 1.0, width / 2 + 1.0].map((x, i) => (
        <group key={i} position={[x, -0.15, 0]}>
          <mesh material={SHARED_MATS.drainageChannel}>
            <boxGeometry args={[1.2, 0.45, length]} />
          </mesh>
          <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={SHARED_MATS.drainageWater}>
            <planeGeometry args={[1.0, length]} />
          </mesh>
        </group>
      ))}
      {/* Weed/dirt verges */}
      <mesh position={[-width / 2 - 3.8, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={SHARED_MATS.pathOutskirts}>
        <planeGeometry args={[4.5, length]} />
      </mesh>
      <mesh position={[width / 2 + 3.8, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={SHARED_MATS.pathOutskirts}>
        <planeGeometry args={[4.5, length]} />
      </mesh>
    </group>
  );
}

// Busy Lagos Highway Road (Tarmac + white dashes + yellow lane stripes)
export function HighwayTrack({ length = 36, width = 7.6 }) {
  return (
    <group>
      {/* Tarmac asphalt highway */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={SHARED_MATS.pathHighway}>
        <planeGeometry args={[width, length]} />
      </mesh>
      {/* Yellow boundary lines */}
      {[-width / 2 + 0.35, width / 2 - 0.35].map((x, i) => (
        <mesh key={i} position={[x, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={SHARED_MATS.asphaltStripeYellow}>
          <planeGeometry args={[0.18, length]} />
        </mesh>
      ))}
      {/* White center lane dashes */}
      {[-1.2, 1.2].map((x, laneIdx) => (
        <group key={laneIdx}>
          {Array.from({ length: Math.floor(length / 6) }).map((_, dashIdx) => (
            <mesh
              key={dashIdx}
              position={[x, 0.002, -length / 2 + dashIdx * 6 + 3]}
              rotation={[-Math.PI / 2, 0, 0]}
              material={SHARED_MATS.asphaltStripeWhite}
            >
              <planeGeometry args={[0.16, 3.2]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Concrete curbs */}
      {[-width / 2, width / 2].map((x, i) => (
        <mesh key={i} position={[x, 0.1, 0]} receiveShadow material={SHARED_MATS.concreteCurb}>
          <boxGeometry args={[0.35, 0.2, length]} />
        </mesh>
      ))}
    </group>
  );
}

// Market Street (Crowded paved street with drainage and verge steps)
export function MarketTrack({ length = 36, width = 7.6 }) {
  return (
    <group>
      {/* Weathered street pavement */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={SHARED_MATS.pathMarket}>
        <planeGeometry args={[width, length]} />
      </mesh>
      {/* Roadside drainage channels with wooden plank crossings */}
      {[-width / 2 - 0.8, width / 2 + 0.8].map((x, i) => (
        <group key={i} position={[x, -0.12, 0]}>
          <mesh material={SHARED_MATS.drainageChannel}>
            <boxGeometry args={[1.0, 0.35, length]} />
          </mesh>
          {/* Wooden crossing planks */}
          {[-12, 0, 12].map((z, pIdx) => (
            <mesh key={pIdx} position={[0, 0.18, z]} material={SHARED_MATS.woodCrate}>
              <boxGeometry args={[1.2, 0.08, 0.8]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Night Lagos Highway (Wet reflective dark asphalt with glossy lane stripes)
export function NightHighwayTrack({ length = 36, width = 7.6 }) {
  return (
    <group>
      {/* Dark wet asphalt */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={SHARED_MATS.pathNight}>
        <planeGeometry args={[width, length]} />
      </mesh>
      {/* Reflective yellow lines */}
      {[-width / 2 + 0.35, width / 2 - 0.35].map((x, i) => (
        <mesh key={i} position={[x, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={SHARED_MATS.asphaltStripeYellow}>
          <planeGeometry args={[0.18, length]} />
        </mesh>
      ))}
      {/* Reflective white dashes */}
      {[-1.2, 1.2].map((x, laneIdx) => (
        <group key={laneIdx}>
          {Array.from({ length: Math.floor(length / 6) }).map((_, dashIdx) => (
            <mesh
              key={dashIdx}
              position={[x, 0.002, -length / 2 + dashIdx * 6 + 3]}
              rotation={[-Math.PI / 2, 0, 0]}
              material={SHARED_MATS.asphaltStripeWhite}
            >
              <planeGeometry args={[0.16, 3.2]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ==========================================
// 2. ENVIRONMENT SIDE MODULES & PROPS
// ==========================================

// Lagos Outskirts Shack & Zinc Fences
export function OutskirtsShack({ position = [0, 0, 0], rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Wooden Plank Walls */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow material={SHARED_MATS.woodDark}>
        <boxGeometry args={[3.2, 2.8, 2.6]} />
      </mesh>
      {/* Corrugated Rusted Zinc Slanted Roof */}
      <mesh position={[0, 2.9, 0]} rotation={[0.15, 0, 0]} castShadow material={SHARED_MATS.rustZinc}>
        <boxGeometry args={[3.6, 0.12, 3.0]} />
      </mesh>
      {/* Doorway */}
      <mesh position={[0, 1.1, 1.32]} material={SHARED_MATS.darkVoid}>
        <planeGeometry args={[1.0, 2.2]} />
      </mesh>
      {/* Sacks of grain/cement at entrance */}
      <mesh position={[-1.1, 0.35, 1.4]} castShadow material={SHARED_MATS.woodCrate}>
        <sphereGeometry args={[0.35, 6, 6]} />
      </mesh>
    </group>
  );
}

// NEPA Utility Power Pole with Cables
export function NEPAPole({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Wooden / Concrete Pole */}
      <mesh position={[0, 3.8, 0]} castShadow material={SHARED_MATS.signPoleMetal}>
        <cylinderGeometry args={[0.1, 0.14, 7.6, 6]} />
      </mesh>
      {/* Top Crossbar */}
      <mesh position={[0, 7.2, 0]} rotation={[0, 0, Math.PI / 2]} material={SHARED_MATS.woodDark}>
        <boxGeometry args={[0.12, 1.8, 0.12]} />
      </mesh>
      {/* Transformer Box */}
      <mesh position={[0.2, 5.2, 0]} castShadow material={SHARED_MATS.corrugatedZinc}>
        <boxGeometry args={[0.45, 0.7, 0.35]} />
      </mesh>
    </group>
  );
}

// Banana Palm Tree (Tropical Roadside Vegetation)
export function BananaTree({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Curved Green Trunk */}
      <mesh position={[0, 2.2, 0]} castShadow material={SHARED_MATS.palmGreen}>
        <cylinderGeometry args={[0.18, 0.28, 4.4, 6]} />
      </mesh>
      {/* Large Drooping Banana Leaves */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((rot, idx) => (
        <group key={idx} position={[0, 4.2, 0]} rotation={[0.4, rot, 0]}>
          <mesh position={[0, 0, 1.4]} rotation={[-0.3, 0, 0]} castShadow material={SHARED_MATS.bananaLeaf}>
            <boxGeometry args={[0.65, 0.05, 2.6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Multi-Storey Lagos Tenement Building (Busy Lagos Road)
export function LagosTenement({ position = [0, 0, 0], rotationY = 0, stories = 3 }) {
  const height = stories * 3.2;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main Concrete Block */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow material={SHARED_MATS.concreteCurb}>
        <boxGeometry args={[5.2, height, 4.4]} />
      </mesh>
      {/* Storefront / Shop on ground floor */}
      <mesh position={[0, 1.4, 2.25]} material={SHARED_MATS.danfoYellow}>
        <boxGeometry args={[4.4, 2.6, 0.2]} />
      </mesh>
      {/* Corrugated zinc awning */}
      <mesh position={[0, 2.9, 2.6]} rotation={[0.25, 0, 0]} material={SHARED_MATS.corrugatedZinc}>
        <boxGeometry args={[4.8, 0.08, 1.4]} />
      </mesh>
      {/* Balconies */}
      {Array.from({ length: stories - 1 }).map((_, idx) => (
        <mesh key={idx} position={[0, 3.4 + idx * 3.2, 2.4]} material={SHARED_MATS.signPoleMetal}>
          <boxGeometry args={[4.8, 0.9, 0.5]} />
        </mesh>
      ))}
    </group>
  );
}

// Unfinished Concrete Skeleton Building with Rebar (Lagos Road / Outskirts)
export function UnfinishedBuilding({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Concrete Floor Slabs */}
      {[0.2, 3.4, 6.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow material={SHARED_MATS.concreteCurb}>
          <boxGeometry args={[4.8, 0.35, 4.2]} />
        </mesh>
      ))}
      {/* Corner Columns with Protruding Rebar */}
      {[
        [-2.2, -1.9],
        [2.2, -1.9],
        [-2.2, 1.9],
        [2.2, 1.9],
      ].map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, 3.4, z]} castShadow material={SHARED_MATS.concreteCurb}>
            <boxGeometry args={[0.45, 6.8, 0.45]} />
          </mesh>
          {/* Rebar sticking out at top */}
          <mesh position={[x, 7.3, z]} material={SHARED_MATS.rustZinc}>
            <cylinderGeometry args={[0.04, 0.04, 1.4, 4]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Concrete Jersey Barrier with Diagonal Yellow/Black Hazard Stripes
export function JerseyBarrier({ position = [0, 0, 0], rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Base Concrete Barrier */}
      <mesh position={[0, 0.45, 0]} castShadow material={SHARED_MATS.jerseyBarrierConcrete}>
        <boxGeometry args={[2.2, 0.9, 0.6]} />
      </mesh>
      {/* Diagonal Hazard Stripe */}
      <mesh position={[0, 0.48, 0.31]} material={SHARED_MATS.jerseyHazardStripe}>
        <planeGeometry args={[1.8, 0.4]} />
      </mesh>
    </group>
  );
}

// Market District Umbrella Stall (Red, Yellow, Green, Blue canvas)
export function MarketUmbrellaStall({ position = [0, 0, 0], color = 'red' }) {
  const canopyMat =
    color === 'yellow'
      ? SHARED_MATS.marketFabricYellow
      : color === 'green'
      ? SHARED_MATS.marketFabricGreen
      : color === 'blue'
      ? SHARED_MATS.marketFabricBlue
      : SHARED_MATS.marketFabricRed;

  return (
    <group position={position}>
      {/* Umbrella Center Pole */}
      <mesh position={[0, 1.8, 0]} material={SHARED_MATS.woodDark}>
        <cylinderGeometry args={[0.06, 0.06, 3.6, 6]} />
      </mesh>
      {/* Conical Umbrella Canvas */}
      <mesh position={[0, 3.2, 0]} castShadow material={canopyMat}>
        <coneGeometry args={[2.0, 0.8, 10]} />
      </mesh>
      {/* Wooden Vegetable/Fruit Counter */}
      <mesh position={[0, 0.7, 0]} castShadow material={SHARED_MATS.woodCrate}>
        <boxGeometry args={[2.2, 0.8, 1.4]} />
      </mesh>
      {/* Fruit produce on display */}
      <mesh position={[-0.5, 1.25, 0]} material={SHARED_MATS.flameOrange}>
        <sphereGeometry args={[0.22, 6, 6]} />
      </mesh>
      <mesh position={[0.5, 1.25, 0]} material={SHARED_MATS.marketFabricGreen}>
        <sphereGeometry args={[0.25, 6, 6]} />
      </mesh>
    </group>
  );
}

// Night Streetlight with Overhead Glow (Night Lagos Run)
export function NightStreetlight({ position = [0, 0, 0], rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Steel Pole */}
      <mesh position={[0, 3.6, 0]} castShadow material={SHARED_MATS.signPoleMetal}>
        <cylinderGeometry args={[0.08, 0.12, 7.2, 6]} />
      </mesh>
      {/* Curved Arm */}
      <mesh position={[0.7, 7.0, 0]} rotation={[0, 0, -0.45]} material={SHARED_MATS.signPoleMetal}>
        <cylinderGeometry args={[0.06, 0.06, 1.8, 6]} />
      </mesh>
      {/* Glowing Lamp Head */}
      <mesh position={[1.4, 6.9, 0]} material={SHARED_MATS.nightLampGlow}>
        <sphereGeometry args={[0.26, 8, 8]} />
      </mesh>
      {/* Point Light Casting Pool on Road */}
      <pointLight position={[1.4, 6.7, 0]} color="#fef08a" intensity={2.6} distance={18} />
    </group>
  );
}

// Forest Iroko Tree
export function IrokoTree({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 8, 0]} castShadow receiveShadow material={SHARED_MATS.tree}>
        <cylinderGeometry args={[1.3, 2.2, 16, 8]} />
      </mesh>
      <mesh position={[1.6, 2.0, 0.4]} rotation={[0, 0.4, -0.25]} castShadow material={SHARED_MATS.tree}>
        <boxGeometry args={[2.0, 4.0, 0.7]} />
      </mesh>
      <mesh position={[-1.5, 2.0, -0.3]} rotation={[0, -0.5, 0.25]} castShadow material={SHARED_MATS.tree}>
        <boxGeometry args={[2.0, 3.8, 0.7]} />
      </mesh>
      <mesh position={[0, 16, 0]} castShadow material={SHARED_MATS.mossGreen}>
        <sphereGeometry args={[5.8, 7, 7]} />
      </mesh>
    </group>
  );
}

// Ancient Carved Stone Monolith
export function CarvedMonolith({ position = [0, 0, 0], rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 2.0, 0]} castShadow receiveShadow material={SHARED_MATS.rock}>
        <boxGeometry args={[1.1, 4.0, 1.1]} />
      </mesh>
      <mesh position={[0, 4.25, 0]} castShadow material={SHARED_MATS.rock}>
        <coneGeometry args={[0.85, 0.8, 4]} />
      </mesh>
    </group>
  );
}

// Ceremonial Torch Arch
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

// ==========================================
// 3. DYNAMIC PANORAMIC BACKDROPS
// ==========================================

export function DynamicBackdrop({ type = 'FOREST_MIST' }) {
  let mat = SHARED_MATS.fogBackdrop;
  if (type === 'OUTSKIRTS_SKYLINE') mat = SHARED_MATS.outskirtsBackdrop;
  else if (type === 'CITY_SKYLINE') mat = SHARED_MATS.cityBackdrop;
  else if (type === 'NIGHT_SKYLINE') mat = SHARED_MATS.nightBackdrop;

  return (
    <mesh position={[0, 20, -100]} material={mat}>
      <planeGeometry args={[160, 75]} />
    </mesh>
  );
}
