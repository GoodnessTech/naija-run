import * as THREE from 'three';

// Global texture loader with caching
const loader = new THREE.TextureLoader();

// Pre-load all textures once
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

// Shared materials across all chunks to eliminate GPU shader compilation stalls
export const SHARED_MATS = {
  path: new THREE.MeshStandardMaterial({
    map: pathTex,
    roughness: 0.85,
    metalness: 0.08,
  }),
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
  fogBackdrop: new THREE.MeshBasicMaterial({
    map: fogTex,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  }),
  mossGreen: new THREE.MeshStandardMaterial({
    color: '#2e6f40',
    roughness: 0.9,
  }),
  potRed: new THREE.MeshStandardMaterial({
    color: '#b9381e',
    roughness: 0.7,
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
  rope: new THREE.MeshStandardMaterial({
    color: '#856b47',
    roughness: 0.9,
  }),
  darkVoid: new THREE.MeshBasicMaterial({
    color: '#080403',
  }),
  spiritGreen: new THREE.MeshBasicMaterial({
    color: '#34d399',
  }),
  chasmWater: new THREE.MeshStandardMaterial({
    color: '#04140e',
    roughness: 0.2,
    metalness: 0.8,
  })
};
