import * as THREE from 'three';

// Global texture loader with caching
const loader = new THREE.TextureLoader();

// Textures from official asset references
const pathTex = loader.load('/assets/references/running_path.jpg');
pathTex.wrapS = THREE.RepeatWrapping;
pathTex.wrapT = THREE.RepeatWrapping;
pathTex.repeat.set(1, 4);

const wallTex = loader.load('/assets/references/forest_running_path.jpg');
wallTex.wrapS = THREE.RepeatWrapping;
wallTex.wrapT = THREE.RepeatWrapping;
wallTex.repeat.set(2, 1);

const rockTex = loader.load('/assets/references/rock.jpg');
const treeTex = loader.load('/assets/references/bent_tree.jpg');
treeTex.wrapS = THREE.RepeatWrapping;
treeTex.wrapT = THREE.RepeatWrapping;
treeTex.repeat.set(1, 2);

const villageTex = loader.load('/assets/references/village.jpg');
const torchTex = loader.load('/assets/references/torch.jpg');

const bridgeTex = loader.load('/assets/references/bridge.jpg');
bridgeTex.wrapS = THREE.RepeatWrapping;
bridgeTex.wrapT = THREE.RepeatWrapping;
bridgeTex.repeat.set(1, 4);

const caveTex = loader.load('/assets/references/cave.jpg');
const fogTex = loader.load('/assets/references/fog.jpg');

// Backdrop textures from environment asset packs
const backdropOutskirtsTex = loader.load('/assets/references/environment5.jpg');
const backdropCityTex = loader.load('/assets/references/environment4.jpg');
const backdropNightTex = loader.load('/assets/references/environment1.jpg');

// Shared materials across all chunks to eliminate GPU shader compilation stalls
export const SHARED_MATS = {
  // Road & Path materials
  pathForest: new THREE.MeshStandardMaterial({
    map: pathTex,
    roughness: 0.85,
    metalness: 0.08,
  }),
  pathOutskirts: new THREE.MeshStandardMaterial({
    color: '#9a3412',
    roughness: 0.92,
    metalness: 0.05,
  }),
  pathHighway: new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.55,
    metalness: 0.2,
  }),
  pathMarket: new THREE.MeshStandardMaterial({
    color: '#78350f',
    roughness: 0.88,
    metalness: 0.1,
  }),
  pathNight: new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.25,
    metalness: 0.45,
  }),
  asphaltStripeYellow: new THREE.MeshBasicMaterial({
    color: '#facc15',
  }),
  asphaltStripeWhite: new THREE.MeshBasicMaterial({
    color: '#f8fafc',
  }),
  concreteCurb: new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.75,
  }),
  drainageChannel: new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.8,
  }),
  drainageWater: new THREE.MeshStandardMaterial({
    color: '#0f291e',
    roughness: 0.15,
    metalness: 0.8,
  }),

  // Wall & Tree materials
  wall: new THREE.MeshStandardMaterial({
    map: wallTex,
    roughness: 0.9,
  }),
  rock: new THREE.MeshStandardMaterial({
    map: rockTex,
    roughness: 0.85,
    metalness: 0.1,
  }),
  tree: new THREE.MeshStandardMaterial({
    map: treeTex,
    roughness: 0.88,
    metalness: 0.05,
  }),
  villageHut: new THREE.MeshStandardMaterial({
    map: villageTex,
    roughness: 0.9,
  }),
  torch: new THREE.MeshStandardMaterial({
    map: torchTex,
    roughness: 0.75,
  }),
  bridge: new THREE.MeshStandardMaterial({
    map: bridgeTex,
    roughness: 0.85,
  }),
  cave: new THREE.MeshStandardMaterial({
    map: caveTex,
    roughness: 0.88,
  }),

  // Backdrops
  fogBackdrop: new THREE.MeshBasicMaterial({
    map: fogTex,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  }),
  outskirtsBackdrop: new THREE.MeshBasicMaterial({
    map: backdropOutskirtsTex,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  }),
  cityBackdrop: new THREE.MeshBasicMaterial({
    map: backdropCityTex,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  }),
  nightBackdrop: new THREE.MeshBasicMaterial({
    map: backdropNightTex,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  }),

  // Foliage
  mossGreen: new THREE.MeshStandardMaterial({
    color: '#2e6f40',
    roughness: 0.9,
  }),
  palmGreen: new THREE.MeshStandardMaterial({
    color: '#15803d',
    roughness: 0.75,
  }),
  bananaLeaf: new THREE.MeshStandardMaterial({
    color: '#22c55e',
    roughness: 0.65,
  }),

  // Market & Kiosks
  marketFabricRed: new THREE.MeshStandardMaterial({
    color: '#e11d48',
    roughness: 0.6,
  }),
  marketFabricYellow: new THREE.MeshStandardMaterial({
    color: '#eab308',
    roughness: 0.6,
  }),
  marketFabricGreen: new THREE.MeshStandardMaterial({
    color: '#16a34a',
    roughness: 0.6,
  }),
  marketFabricBlue: new THREE.MeshStandardMaterial({
    color: '#2563eb',
    roughness: 0.6,
  }),
  woodCrate: new THREE.MeshStandardMaterial({
    color: '#78350f',
    roughness: 0.85,
  }),
  corrugatedZinc: new THREE.MeshStandardMaterial({
    color: '#64748b',
    roughness: 0.45,
    metalness: 0.65,
  }),
  rustZinc: new THREE.MeshStandardMaterial({
    color: '#9a3412',
    roughness: 0.75,
    metalness: 0.4,
  }),

  // Traffic & Urban Props
  danfoYellow: new THREE.MeshStandardMaterial({
    color: '#facc15',
    roughness: 0.4,
    metalness: 0.2,
  }),
  danfoStripe: new THREE.MeshStandardMaterial({
    color: '#15803d',
    roughness: 0.5,
  }),
  jerseyBarrierConcrete: new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    roughness: 0.85,
  }),
  jerseyHazardStripe: new THREE.MeshBasicMaterial({
    color: '#f59e0b',
  }),
  oilDrumBlue: new THREE.MeshStandardMaterial({
    color: '#0284c7',
    roughness: 0.55,
    metalness: 0.6,
  }),
  oilDrumRust: new THREE.MeshStandardMaterial({
    color: '#c2410c',
    roughness: 0.7,
    metalness: 0.4,
  }),
  tyreBlack: new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.9,
  }),
  trafficConeOrange: new THREE.MeshStandardMaterial({
    color: '#ea580c',
    roughness: 0.4,
  }),
  roadSignGreen: new THREE.MeshStandardMaterial({
    color: '#15803d',
    roughness: 0.4,
  }),
  signPoleMetal: new THREE.MeshStandardMaterial({
    color: '#64748b',
    roughness: 0.3,
    metalness: 0.7,
  }),
  nightLampGlow: new THREE.MeshBasicMaterial({
    color: '#fef08a',
  }),

  // Supernatural / Ancient Artifacts
  bronzeBenin: new THREE.MeshStandardMaterial({
    color: '#b45309',
    roughness: 0.25,
    metalness: 0.85,
  }),
  goldShimmer: new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    emissive: new THREE.Color('#f59e0b'),
    emissiveIntensity: 0.6,
    roughness: 0.15,
    metalness: 0.95,
  }),
  coralRed: new THREE.MeshStandardMaterial({
    color: '#e11d48',
    emissive: new THREE.Color('#be123c'),
    emissiveIntensity: 0.5,
    roughness: 0.2,
  }),
  spiritGreen: new THREE.MeshBasicMaterial({
    color: '#34d399',
  }),
  dangerObsidian: new THREE.MeshStandardMaterial({
    color: '#18181b',
    roughness: 0.3,
    metalness: 0.8,
  }),
  dangerRuneCrimson: new THREE.MeshBasicMaterial({
    color: '#ef4444',
  }),
  flameOrange: new THREE.MeshBasicMaterial({
    color: '#ea580c',
  }),
  flameYellow: new THREE.MeshBasicMaterial({
    color: '#fef08a',
  }),
  woodDark: new THREE.MeshStandardMaterial({
    color: '#4a2e18',
    roughness: 0.9,
  }),
  potRed: new THREE.MeshStandardMaterial({
    color: '#b9381e',
    roughness: 0.7,
  }),
  chasmWater: new THREE.MeshStandardMaterial({
    color: '#04140e',
    roughness: 0.2,
    metalness: 0.8,
  }),
  mudPuddle: new THREE.MeshStandardMaterial({
    color: '#1c130d',
    roughness: 0.1,
    metalness: 0.2,
  }),
  catalystPurple: new THREE.MeshStandardMaterial({
    color: '#3b0764',
    emissive: new THREE.Color('#7e22ce'),
    emissiveIntensity: 0.8,
    roughness: 0.3,
  }),
  lightningCyan: new THREE.MeshBasicMaterial({
    color: '#22d3ee',
  }),
  darkVoid: new THREE.MeshBasicMaterial({
    color: '#080403',
  }),
  rope: new THREE.MeshStandardMaterial({
    color: '#856b47',
    roughness: 0.9,
  })
};
