// Environment Director & Progression System for Naija Run
// Directs unpredictable multi-environment journeys using official asset packs

export const ENVIRONMENTS = {
  FOREST: 'FOREST',
  FOREST_VARIATION: 'FOREST_VARIATION',
  LAGOS_OUTSKIRTS: 'LAGOS_OUTSKIRTS',
  BUSY_LAGOS_ROAD: 'BUSY_LAGOS_ROAD',
  MARKET_DISTRICT: 'MARKET_DISTRICT',
  DARK_FOREST: 'DARK_FOREST',
  NIGHT_LAGOS: 'NIGHT_LAGOS',
};

export const ENV_CONFIG = {
  [ENVIRONMENTS.FOREST]: {
    name: 'RAINFOREST TRAIL',
    subtitle: 'Tropical Foliage & Laterite Earth',
    roadType: 'DIRT_PATH',
    skyColor: '#0e2617',
    fogColor: '#0d2315',
    fogNear: 35,
    fogFar: 110,
    sunColor: '#fffbeb',
    ambientColor: '#86a88b',
    sunIntensity: 2.8,
    backdropType: 'FOREST_MIST',
    allowedObstacles: ['ROCK', 'FALLEN_TREE', 'MUD_POTHOLE', 'SNAKE_PIT'],
  },
  [ENVIRONMENTS.FOREST_VARIATION]: {
    name: 'ANCIENT SUNSET FOREST',
    subtitle: 'Golden Canopy & Sacred Monoliths',
    roadType: 'STONE_DIRT',
    skyColor: '#381e0d',
    fogColor: '#2b1406',
    fogNear: 32,
    fogFar: 115,
    sunColor: '#f59e0b',
    ambientColor: '#b45309',
    sunIntensity: 3.0,
    backdropType: 'FOREST_MIST',
    allowedObstacles: ['ROCK', 'FALLEN_TREE', 'SACRED_TOTEM', 'WOODEN_BARRIER'],
  },
  [ENVIRONMENTS.LAGOS_OUTSKIRTS]: {
    name: 'LAGOS OUTSKIRTS',
    subtitle: 'Red Earth Highway & Roadside Shacks',
    roadType: 'OUTSKIRTS_ROAD',
    skyColor: '#422a1d',
    fogColor: '#361e12',
    fogNear: 38,
    fogFar: 120,
    sunColor: '#fbbf24',
    ambientColor: '#a16207',
    sunIntensity: 2.9,
    backdropType: 'OUTSKIRTS_SKYLINE',
    allowedObstacles: ['WOODEN_BARRIER', 'MUD_POTHOLE', 'OIL_DRUM_BARRICADE', 'ROCK'],
  },
  [ENVIRONMENTS.BUSY_LAGOS_ROAD]: {
    name: 'BUSY LAGOS ROAD',
    subtitle: 'Commercial Highway & Danfo Roadblocks',
    roadType: 'HIGHWAY_TARMAC',
    skyColor: '#1e293b',
    fogColor: '#172033',
    fogNear: 40,
    fogFar: 125,
    sunColor: '#fef08a',
    ambientColor: '#64748b',
    sunIntensity: 2.8,
    backdropType: 'CITY_SKYLINE',
    allowedObstacles: ['DANFO_WRECK', 'OIL_DRUM_BARRICADE', 'WOODEN_BARRIER', 'MUD_POTHOLE'],
  },
  [ENVIRONMENTS.MARKET_DISTRICT]: {
    name: 'MARKET DISTRICT',
    subtitle: 'Colorful Umbrella Kiosks & Crates',
    roadType: 'MARKET_STREET',
    skyColor: '#31170d',
    fogColor: '#261109',
    fogNear: 36,
    fogFar: 115,
    sunColor: '#fbbf24',
    ambientColor: '#92400e',
    sunIntensity: 2.7,
    backdropType: 'OUTSKIRTS_SKYLINE',
    allowedObstacles: ['OIL_DRUM_BARRICADE', 'WOODEN_BARRIER', 'MUD_POTHOLE', 'ROCK'],
  },
  [ENVIRONMENTS.DARK_FOREST]: {
    name: 'DARK SUPERNATURAL FOREST',
    subtitle: 'Supernatural Wisps & Ancient Benin Portals',
    roadType: 'DIRT_PATH',
    skyColor: '#051b14',
    fogColor: '#03140e',
    fogNear: 28,
    fogFar: 95,
    sunColor: '#34d399',
    ambientColor: '#064e3b',
    sunIntensity: 2.2,
    backdropType: 'FOREST_MIST',
    allowedObstacles: ['BENIN_STAFF_GATE', 'SACRED_TOTEM', 'FIRE_BRAZIER', 'FALLEN_TREE', 'SNAKE_PIT'],
  },
  [ENVIRONMENTS.NIGHT_LAGOS]: {
    name: 'NIGHT LAGOS RUN',
    subtitle: 'Wet Asphalt & Streetlight Illuminations',
    roadType: 'NIGHT_ASPHALT',
    skyColor: '#060911',
    fogColor: '#04060c',
    fogNear: 32,
    fogFar: 105,
    sunColor: '#38bdf8',
    ambientColor: '#1e293b',
    sunIntensity: 2.4,
    backdropType: 'NIGHT_SKYLINE',
    allowedObstacles: ['DANFO_WRECK', 'OIL_DRUM_BARRICADE', 'FIRE_BRAZIER', 'MUD_POTHOLE'],
  },
};

class EnvironmentDirectorManager {
  constructor() {
    this.stageLength = 360; // Each environment lasts 360m (10 chunks of 36m)
    this.transitionLength = 72; // Last 72m of a stage blends into the next
    this.currentRunSequence = [];
    this.lastUsedEnvironments = [];
    this.initRunSequence();
  }

  // Generates unpredictable environment combination for each new run
  initRunSequence() {
    // Available non-starting candidates
    const allEnvs = [
      ENVIRONMENTS.LAGOS_OUTSKIRTS,
      ENVIRONMENTS.BUSY_LAGOS_ROAD,
      ENVIRONMENTS.MARKET_DISTRICT,
      ENVIRONMENTS.DARK_FOREST,
      ENVIRONMENTS.NIGHT_LAGOS,
      ENVIRONMENTS.FOREST_VARIATION,
    ];

    // Shuffle pool
    const shuffled = [...allEnvs].sort(() => Math.random() - 0.5);

    // Pick 5 distinct environments following initial Forest
    // E.g.: Run 1: Forest -> Outskirts -> Market -> Dark Forest -> Night Lagos
    // Run 2: Forest -> Busy Road -> Outskirts -> Night Lagos -> Market
    // Run 3: Forest -> Dark Forest -> Market -> Lagos Road -> Forest Variation
    this.currentRunSequence = [
      ENVIRONMENTS.FOREST,
      shuffled[0],
      shuffled[1],
      shuffled[2],
      shuffled[3],
      shuffled[4],
      // Repeat cycle with randomized tail
      ENVIRONMENTS.DARK_FOREST,
      ENVIRONMENTS.NIGHT_LAGOS,
      ENVIRONMENTS.BUSY_LAGOS_ROAD
    ];
  }

  // Get active environment, transition factor (0 to 1), and upcoming environment
  getEnvironmentAtDistance(distance) {
    const stageIdx = Math.floor(distance / this.stageLength) % this.currentRunSequence.length;
    const nextStageIdx = (stageIdx + 1) % this.currentRunSequence.length;

    const currentEnv = this.currentRunSequence[stageIdx];
    const nextEnv = this.currentRunSequence[nextStageIdx];

    const distInStage = distance % this.stageLength;
    const isTransition = distInStage > (this.stageLength - this.transitionLength);
    const transitionProgress = isTransition
      ? (distInStage - (this.stageLength - this.transitionLength)) / this.transitionLength
      : 0.0;

    return {
      currentEnv,
      nextEnv,
      isTransition,
      transitionProgress,
      config: ENV_CONFIG[currentEnv] || ENV_CONFIG[ENVIRONMENTS.FOREST],
      nextConfig: ENV_CONFIG[nextEnv] || ENV_CONFIG[ENVIRONMENTS.FOREST],
    };
  }

  // Start fresh randomized sequence on game restart
  resetForNewRun() {
    this.initRunSequence();
  }
}

export const environmentDirector = new EnvironmentDirectorManager();
