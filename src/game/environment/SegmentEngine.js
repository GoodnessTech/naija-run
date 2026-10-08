import { OBSTACLE_TYPE, PICKUP_TYPE } from '../obstacles/ObstacleConstants.js';

export const SEGMENT_TYPE = {
  A_OPEN_SIMPLE: 'SEGMENT_A',          // Open path + simple obstacles
  B_THREE_LANE_SHIFT: 'SEGMENT_B',     // Three-lane obstacle sequence (slalom)
  C_JUMP_FOCUS: 'SEGMENT_C',           // Jump-focused section (consecutive hurdles)
  D_FAST_SEQUENCE: 'SEGMENT_D',        // Fast obstacle sequence (rapid reactions)
  E_NARROW_SAFE_PATH: 'SEGMENT_E',     // Narrow safe-path section (2 lanes blocked)
  F_TIMED_COMBO: 'SEGMENT_F',          // Slide + Jump / varied timing combination
  G_REACTION_RUSH: 'SEGMENT_G',        // High-speed reaction section
  H_ENV_TRANSITION: 'SEGMENT_H',       // Environmental transition stretch
  I_MIXED_SECTION: 'SEGMENT_I',        // Mixed asymmetric hazard section
  J_RISK_REWARD: 'SEGMENT_J',          // High-risk/high-reward section
};

class SegmentEngineManager {
  constructor() {
    this.recentSegments = [];
    this.historyLimit = 4; // Exclude last 4 segments to prevent repetition
    // First meaningful Naira reward at ~200m (randomized 190m - 220m)
    this.nextNairaDistance = 195 + Math.random() * 25;
  }

  reset() {
    this.recentSegments = [];
    this.nextNairaDistance = 195 + Math.random() * 25;
  }

  // Pick a varied segment ensuring no recent repetition
  pickSegment(distance = 0) {
    const allSegments = Object.values(SEGMENT_TYPE);

    // Filter out recently used segments
    let available = allSegments.filter((seg) => !this.recentSegments.includes(seg));
    if (available.length === 0) {
      available = allSegments;
    }

    // Distance progression weighting
    let pool = [];
    if (distance < 350) {
      // Early game: clear telegraphing and rhythm
      pool = available.filter((s) => [
        SEGMENT_TYPE.A_OPEN_SIMPLE,
        SEGMENT_TYPE.B_THREE_LANE_SHIFT,
        SEGMENT_TYPE.C_JUMP_FOCUS,
        SEGMENT_TYPE.H_ENV_TRANSITION,
        SEGMENT_TYPE.J_RISK_REWARD
      ].includes(s));
    } else if (distance < 1200) {
      // Mid game: balanced variety
      pool = available;
    } else {
      // Late game: fast reaction, narrow corridors, mixed hazards
      pool = available.filter((s) => [
        SEGMENT_TYPE.B_THREE_LANE_SHIFT,
        SEGMENT_TYPE.D_FAST_SEQUENCE,
        SEGMENT_TYPE.E_NARROW_SAFE_PATH,
        SEGMENT_TYPE.F_TIMED_COMBO,
        SEGMENT_TYPE.G_REACTION_RUSH,
        SEGMENT_TYPE.I_MIXED_SECTION,
        SEGMENT_TYPE.J_RISK_REWARD
      ].includes(s));
    }

    if (pool.length === 0) pool = available;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    // Push to cooldown history
    this.recentSegments.push(chosen);
    if (this.recentSegments.length > this.historyLimit) {
      this.recentSegments.shift();
    }

    return chosen;
  }

  // Build the concrete obstacles, Naira pickups, and valuables for a segment
  generateSegmentContent(segmentType, chunkIdx, baseZ, distance, allowedObstacleTypes = null) {
    const obstacles = [];
    const collectibles = [];
    const valuables = [];

    // Filter obstacle type based on environment vocabulary
    const pickObs = (preferredFallback) => {
      if (allowedObstacleTypes && allowedObstacleTypes.length > 0) {
        return OBSTACLE_TYPE[allowedObstacleTypes[Math.floor(Math.random() * allowedObstacleTypes.length)]] || preferredFallback;
      }
      return preferredFallback;
    };

    // Random safe lane picker (-1, 0, 1)
    const randomLane = () => Math.floor(Math.random() * 3) - 1;
    const oppositeLanes = (safeLane) => [-1, 0, 1].filter((l) => l !== safeLane);

    let preferredSafeLane = 0;
    let preferredRiskLane = 1;

    switch (segmentType) {
      case SEGMENT_TYPE.A_OPEN_SIMPLE: {
        // SEGMENT A: Open path + simple single hazard
        preferredSafeLane = randomLane();
        preferredRiskLane = oppositeLanes(preferredSafeLane)[Math.floor(Math.random() * 2)];
        const chosenType = pickObs(OBSTACLE_TYPE.ROCK);

        obstacles.push({
          id: `obs_${chunkIdx}_a_${Math.random()}`,
          type: chosenType,
          lane: preferredRiskLane,
          z: -18,
          width: 1
        });
        break;
      }

      case SEGMENT_TYPE.B_THREE_LANE_SHIFT: {
        // SEGMENT B: Three-lane obstacle sequence (Slalom weave)
        const sequence = Math.random() < 0.5 ? [-1, 0, 1] : [1, 0, -1];
        const zOffsets = [-10, -19, -28];

        for (let i = 0; i < 3; i++) {
          obstacles.push({
            id: `obs_${chunkIdx}_b_${i}_${Math.random()}`,
            type: pickObs(OBSTACLE_TYPE.OIL_DRUM_BARRICADE),
            lane: sequence[i],
            z: zOffsets[i],
            width: 1
          });
        }
        preferredSafeLane = sequence[1] === 0 ? (Math.random() < 0.5 ? -1 : 1) : 0;
        preferredRiskLane = sequence[2];
        break;
      }

      case SEGMENT_TYPE.C_JUMP_FOCUS: {
        // SEGMENT C: Jump-focused section (hurdles)
        const jumpLane = randomLane();
        const otherLane = oppositeLanes(jumpLane)[0];
        preferredSafeLane = [-1, 0, 1].find((l) => l !== jumpLane && l !== otherLane) || 0;
        preferredRiskLane = jumpLane;

        obstacles.push({
          id: `obs_${chunkIdx}_c1_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.WOODEN_BARRIER),
          lane: jumpLane,
          z: -12,
          width: 1
        });
        obstacles.push({
          id: `obs_${chunkIdx}_c2_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.SNAKE_PIT),
          lane: otherLane,
          z: -24,
          width: 1
        });
        break;
      }

      case SEGMENT_TYPE.D_FAST_SEQUENCE: {
        // SEGMENT D: Fast obstacle sequence (quick lateral snap reaction)
        const laneA = Math.random() < 0.5 ? -1 : 1;
        const laneB = -laneA;
        preferredSafeLane = 0;
        preferredRiskLane = laneA;

        obstacles.push({
          id: `obs_${chunkIdx}_d1_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.FIRE_BRAZIER),
          lane: laneA,
          z: -11,
          width: 1
        });
        obstacles.push({
          id: `obs_${chunkIdx}_d2_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.ROCK),
          lane: 0,
          z: -19,
          width: 1
        });
        obstacles.push({
          id: `obs_${chunkIdx}_d3_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.OIL_DRUM_BARRICADE),
          lane: laneB,
          z: -27,
          width: 1
        });
        break;
      }

      case SEGMENT_TYPE.E_NARROW_SAFE_PATH: {
        // SEGMENT E: Narrow safe corridor (2 lanes blocked, 1 tight escape)
        preferredSafeLane = randomLane();
        const blocked1 = oppositeLanes(preferredSafeLane)[0];
        const blocked2 = oppositeLanes(preferredSafeLane)[1];
        preferredRiskLane = blocked1;

        obstacles.push({
          id: `obs_${chunkIdx}_e1_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.DANFO_WRECK),
          lane: blocked1,
          z: -17,
          width: 1
        });
        obstacles.push({
          id: `obs_${chunkIdx}_e2_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.OIL_DRUM_BARRICADE),
          lane: blocked2,
          z: -17,
          width: 1
        });
        break;
      }

      case SEGMENT_TYPE.F_TIMED_COMBO: {
        // SEGMENT F: Slide + Jump combination
        preferredSafeLane = randomLane();
        preferredRiskLane = 0;

        // Full width arch (MUST SLIDE!)
        obstacles.push({
          id: `obs_${chunkIdx}_f_slide_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.FALLEN_TREE),
          lane: 0,
          z: -13,
          width: 3
        });

        // Follow up hurdle
        const hurdleLane = randomLane();
        obstacles.push({
          id: `obs_${chunkIdx}_f_jump_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.WOODEN_BARRIER),
          lane: hurdleLane,
          z: -25,
          width: 1
        });
        break;
      }

      case SEGMENT_TYPE.G_REACTION_RUSH: {
        // SEGMENT G: High-speed reaction section
        const pattern = Math.random() < 0.5 ? [0, -1, 1] : [0, 1, -1];
        preferredSafeLane = pattern[0] === 0 ? 1 : 0;
        preferredRiskLane = pattern[1];

        for (let i = 0; i < 3; i++) {
          obstacles.push({
            id: `obs_${chunkIdx}_g_${i}_${Math.random()}`,
            type: pickObs(OBSTACLE_TYPE.ROCK),
            lane: pattern[i],
            z: -10 - i * 8,
            width: 1
          });
        }
        break;
      }

      case SEGMENT_TYPE.H_ENV_TRANSITION: {
        // SEGMENT H: Environmental transition stretch
        const sideLane = Math.random() < 0.5 ? -1 : 1;
        preferredSafeLane = -sideLane;
        preferredRiskLane = sideLane;

        obstacles.push({
          id: `obs_${chunkIdx}_h_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.SACRED_TOTEM),
          lane: sideLane,
          z: -20,
          width: 1
        });

        // Occasional cultural collectible
        if (Math.random() < 0.35) {
          const valTypes = [
            PICKUP_TYPE.MULTIPLIER_2X,
            PICKUP_TYPE.CORAL_BEADS,
            PICKUP_TYPE.SANGO_SHADES,
            PICKUP_TYPE.GOLDEN_SPIKES
          ];
          valuables.push({
            id: `val_${chunkIdx}_${Math.random()}`,
            type: valTypes[Math.floor(Math.random() * valTypes.length)],
            lane: 0,
            z: -16
          });
        }
        break;
      }

      case SEGMENT_TYPE.I_MIXED_SECTION: {
        // SEGMENT I: Mixed asymmetric hazard section
        const busLane = Math.random() < 0.5 ? -1 : 1;
        preferredSafeLane = -busLane;
        preferredRiskLane = busLane;

        obstacles.push({
          id: `obs_${chunkIdx}_i_bus_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.DANFO_WRECK),
          lane: busLane,
          z: -14,
          width: 1
        });
        obstacles.push({
          id: `obs_${chunkIdx}_i_rock_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.ROCK),
          lane: 0,
          z: -24,
          width: 1
        });
        break;
      }

      case SEGMENT_TYPE.J_RISK_REWARD: {
        // SEGMENT J: High-risk decision section
        preferredSafeLane = -1;
        preferredRiskLane = 1;

        obstacles.push({
          id: `obs_${chunkIdx}_j_${Math.random()}`,
          type: pickObs(OBSTACLE_TYPE.OIL_DRUM_BARRICADE),
          lane: preferredRiskLane,
          z: -20,
          width: 1
        });

        if (Math.random() < 0.3) {
          valuables.push({
            id: `val_j_${chunkIdx}_${Math.random()}`,
            type: PICKUP_TYPE.MULTIPLIER_2X,
            lane: 0,
            z: -16
          });
        }
        break;
      }

      default:
        break;
    }

    // ==========================================
    // MEANINGFUL NAIRA REWARD PACING & RARITY
    // First reward ~200m into the run, then every ~200-300m
    // ₦100 Common, ₦500 Uncommon, ₦1,000 Rare, ₦5,000 Very Rare
    // ==========================================
    const isRewardMilestone = distance >= (this.nextNairaDistance - 18) && distance < (this.nextNairaDistance + 18);

    if (isRewardMilestone) {
      // Schedule next milestone ~200-300m later (e.g. ~200m -> ~430m -> ~680m -> ~930m -> ~1,180m)
      this.nextNairaDistance = distance + (220 + Math.random() * 80);

      // Determine primary denomination for this reward milestone
      const roll = Math.random();
      let primaryValue = 100; // 65% Common
      if (roll >= 0.65 && roll < 0.90) {
        primaryValue = 500; // 25% Uncommon
      } else if (roll >= 0.90 && roll < 0.98) {
        primaryValue = 1000; // 8% Rare
      } else if (roll >= 0.98) {
        primaryValue = 5000; // 2% Very Rare
      }

      // Spawn a clean, satisfying formation of 3-4 notes along safe path
      const noteCount = primaryValue >= 1000 ? 3 : 4;
      for (let i = 0; i < noteCount; i++) {
        collectibles.push({
          id: `c_reward_${chunkIdx}_${i}`,
          lane: preferredSafeLane,
          z: -7 - i * 3.4,
          value: primaryValue,
          isRisky: false
        });
      }

      // 20% chance of a high-value bonus note (₦1,000 or ₦5,000) on a risk lane requiring skill
      if (Math.random() < 0.22 && primaryValue < 5000) {
        const riskValue = Math.random() < 0.8 ? 1000 : 5000;
        collectibles.push({
          id: `c_risk_${chunkIdx}_${Math.random().toString(36).substring(2, 6)}`,
          lane: preferredRiskLane,
          z: -12,
          value: riskValue,
          isRisky: true
        });
      }
    }

    // Occasional Point Catalyst fetish trap (-100 PTS) in late run (> 400m)
    if (distance > 400 && Math.random() < 0.12) {
      valuables.push({
        id: `trap_${chunkIdx}_${Math.random().toString(36).substring(2, 6)}`,
        type: PICKUP_TYPE.POINT_CATALYST,
        lane: randomLane(),
        z: -22
      });
    }

    return { obstacles, collectibles, valuables };
  }
}

export const segmentEngine = new SegmentEngineManager();
