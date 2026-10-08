import { OBSTACLE_TYPE, PICKUP_TYPE } from '../obstacles/ObstacleConstants';

export const SEGMENT_TYPE = {
  A_OPEN_SIMPLE: 'SEGMENT_A',          // Open path + simple obstacles
  B_THREE_LANE_SHIFT: 'SEGMENT_B',     // Three-lane obstacle sequence (slalom)
  C_JUMP_FOCUS: 'SEGMENT_C',           // Jump-focused section (consecutive hurdles)
  D_FAST_SEQUENCE: 'SEGMENT_D',        // Fast obstacle sequence (rapid reactions)
  E_NARROW_SAFE_PATH: 'SEGMENT_E',     // Narrow safe-path section (2 lanes blocked)
  F_TIMED_COMBO: 'SEGMENT_F',          // Slide + Jump / varied timing combination
  G_REACTION_RUSH: 'SEGMENT_G',        // High-speed reaction section
  H_ENV_TRANSITION: 'SEGMENT_H',       // Environmental transition / vista stretch
  I_MIXED_SECTION: 'SEGMENT_I',        // Mixed asymmetric hazard section
  J_RISK_REWARD: 'SEGMENT_J',          // High-risk/high-reward section (₦100 vs ₦5,000)
};

class SegmentEngineManager {
  constructor() {
    this.recentSegments = [];
    this.historyLimit = 4; // Exclude last 4 segments to prevent repetition
  }

  reset() {
    this.recentSegments = [];
  }

  // Pick a varied segment ensuring no recent repetition
  pickSegment(distance = 0) {
    const allSegments = Object.values(SEGMENT_TYPE);

    // Filter out recently used segments
    let available = allSegments.filter((seg) => !this.recentSegments.includes(seg));
    if (available.length === 0) {
      available = allSegments;
    }

    // Weighting based on distance
    let pool = [];
    if (distance < 350) {
      // Early game: simpler telegraphing
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
      // Late game: fast reaction, narrow paths, mixed hazards
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
  generateSegmentContent(segmentType, chunkIdx, baseZ, distance) {
    const obstacles = [];
    const collectibles = [];
    const valuables = [];

    // Random safe lane picker (-1, 0, 1)
    const randomLane = () => Math.floor(Math.random() * 3) - 1;
    const oppositeLanes = (safeLane) => [-1, 0, 1].filter((l) => l !== safeLane);

    switch (segmentType) {
      case SEGMENT_TYPE.A_OPEN_SIMPLE: {
        // SEGMENT A: Open path + simple single hazard
        const safe = randomLane();
        const blocked = oppositeLanes(safe)[Math.floor(Math.random() * 2)];
        const types = [OBSTACLE_TYPE.ROCK, OBSTACLE_TYPE.MUD_POTHOLE, OBSTACLE_TYPE.FIRE_BRAZIER, OBSTACLE_TYPE.OIL_DRUM_BARRICADE];
        const chosenType = types[Math.floor(Math.random() * types.length)];

        obstacles.push({
          id: `obs_${chunkIdx}_a_${Math.random()}`,
          type: chosenType,
          lane: blocked,
          z: -18,
          width: 1
        });

        // ₦100 trail along safe lane
        for (let i = 0; i < 7; i++) {
          collectibles.push({
            id: `c_${chunkIdx}_${i}_${Math.random()}`,
            lane: safe,
            z: -6 - i * 3.2,
            value: 100,
            isRisky: false
          });
        }

        // Risky ₦1,000 note near hazard
        collectibles.push({
          id: `c_risk_${chunkIdx}_${Math.random()}`,
          lane: blocked,
          z: -8,
          value: 1000,
          isRisky: true
        });
        break;
      }

      case SEGMENT_TYPE.B_THREE_LANE_SHIFT: {
        // SEGMENT B: Three-lane obstacle sequence (Slalom weave: Left -> Center -> Right or reverse)
        const sequence = Math.random() < 0.5 ? [-1, 0, 1] : [1, 0, -1];
        const zOffsets = [-10, -19, -28];

        for (let i = 0; i < 3; i++) {
          const obsLane = sequence[i];
          const obsType = [OBSTACLE_TYPE.ROCK, OBSTACLE_TYPE.OIL_DRUM_BARRICADE, OBSTACLE_TYPE.SACRED_TOTEM][i];
          obstacles.push({
            id: `obs_${chunkIdx}_b_${i}_${Math.random()}`,
            type: obsType,
            lane: obsLane,
            z: zOffsets[i],
            width: 1
          });

          // Weave Naira pickups along the open lanes
          const safeLane = obsLane === -1 ? 1 : (obsLane === 1 ? -1 : (Math.random() < 0.5 ? -1 : 1));
          collectibles.push({
            id: `c_${chunkIdx}_b_${i}_${Math.random()}`,
            lane: safeLane,
            z: zOffsets[i] - 1.5,
            value: 500,
            isRisky: false
          });
        }
        break;
      }

      case SEGMENT_TYPE.C_JUMP_FOCUS: {
        // SEGMENT C: Jump-focused section (consecutive hurdles with mid-air Naira!)
        const jumpLane = randomLane();
        const otherLane = oppositeLanes(jumpLane)[0];

        // 2 consecutive jump hurdles
        obstacles.push({
          id: `obs_${chunkIdx}_c1_${Math.random()}`,
          type: OBSTACLE_TYPE.WOODEN_BARRIER,
          lane: jumpLane,
          z: -12,
          width: 1
        });
        obstacles.push({
          id: `obs_${chunkIdx}_c2_${Math.random()}`,
          type: OBSTACLE_TYPE.SNAKE_PIT,
          lane: otherLane,
          z: -24,
          width: 1
        });

        // Floating Naira above hurdles (mid-air jump rewards)
        collectibles.push({
          id: `c_air_${chunkIdx}_1_${Math.random()}`,
          lane: jumpLane,
          z: -12,
          value: 1000,
          isHighJump: true,
          isRisky: true
        });
        collectibles.push({
          id: `c_air_${chunkIdx}_2_${Math.random()}`,
          lane: otherLane,
          z: -24,
          value: 1000,
          isHighJump: true,
          isRisky: true
        });

        // Safe ground trail on remaining open lane
        const thirdLane = [-1, 0, 1].find((l) => l !== jumpLane && l !== otherLane);
        for (let i = 0; i < 5; i++) {
          collectibles.push({
            id: `c_${chunkIdx}_c_${i}_${Math.random()}`,
            lane: thirdLane,
            z: -8 - i * 3.8,
            value: 100,
            isRisky: false
          });
        }
        break;
      }

      case SEGMENT_TYPE.D_FAST_SEQUENCE: {
        // SEGMENT D: Fast obstacle sequence (quick lateral snap reaction)
        const laneA = Math.random() < 0.5 ? -1 : 1;
        const laneB = -laneA;

        obstacles.push({
          id: `obs_${chunkIdx}_d1_${Math.random()}`,
          type: OBSTACLE_TYPE.FIRE_BRAZIER,
          lane: laneA,
          z: -11,
          width: 1
        });
        obstacles.push({
          id: `obs_${chunkIdx}_d2_${Math.random()}`,
          type: OBSTACLE_TYPE.ROCK,
          lane: 0,
          z: -19,
          width: 1
        });
        obstacles.push({
          id: `obs_${chunkIdx}_d3_${Math.random()}`,
          type: OBSTACLE_TYPE.OIL_DRUM_BARRICADE,
          lane: laneB,
          z: -27,
          width: 1
        });

        // Fast rhythm cash line through safe gaps
        collectibles.push({ id: `c_d_${chunkIdx}_1`, lane: laneB, z: -11, value: 500, isRisky: false });
        collectibles.push({ id: `c_d_${chunkIdx}_2`, lane: laneA, z: -19, value: 500, isRisky: false });
        collectibles.push({ id: `c_d_${chunkIdx}_3`, lane: 0, z: -27, value: 1000, isRisky: true });
        break;
      }

      case SEGMENT_TYPE.E_NARROW_SAFE_PATH: {
        // SEGMENT E: Narrow safe-path section (2 lanes blocked simultaneously, 1 tight safe corridor)
        const safeCorridor = randomLane();
        const blocked1 = oppositeLanes(safeCorridor)[0];
        const blocked2 = oppositeLanes(safeCorridor)[1];

        obstacles.push({
          id: `obs_${chunkIdx}_e1_${Math.random()}`,
          type: OBSTACLE_TYPE.DANFO_WRECK,
          lane: blocked1,
          z: -17,
          width: 1
        });
        obstacles.push({
          id: `obs_${chunkIdx}_e2_${Math.random()}`,
          type: OBSTACLE_TYPE.SACRED_TOTEM,
          lane: blocked2,
          z: -17,
          width: 1
        });

        // Safe corridor holds continuous ₦100 trail
        for (let i = 0; i < 7; i++) {
          collectibles.push({
            id: `c_corridor_${chunkIdx}_${i}`,
            lane: safeCorridor,
            z: -6 - i * 3.0,
            value: 100,
            isRisky: false
          });
        }

        // Tempting mega ₦5,000 note in front of blocked Danfo lane!
        collectibles.push({
          id: `c_tempt_${chunkIdx}_${Math.random()}`,
          lane: blocked1,
          z: -9,
          value: 5000,
          isRisky: true
        });
        break;
      }

      case SEGMENT_TYPE.F_TIMED_COMBO: {
        // SEGMENT F: Slide + Jump combination (spans lanes, requires varied mechanics)
        const archType = Math.random() < 0.5 ? OBSTACLE_TYPE.FALLEN_TREE : OBSTACLE_TYPE.BENIN_STAFF_GATE;
        
        // Full width arch (MUST SLIDE!)
        obstacles.push({
          id: `obs_${chunkIdx}_f_slide_${Math.random()}`,
          type: archType,
          lane: 0,
          z: -13,
          width: 3
        });

        // Immediate follow up: hurdle in a lane requiring jump or shift
        const hurdleLane = randomLane();
        obstacles.push({
          id: `obs_${chunkIdx}_f_jump_${Math.random()}`,
          type: OBSTACLE_TYPE.WOODEN_BARRIER,
          lane: hurdleLane,
          z: -25,
          width: 1
        });

        // Low sliding cash notes beneath the arch!
        for (let i = 0; i < 4; i++) {
          collectibles.push({
            id: `c_slide_${chunkIdx}_${i}`,
            lane: 0,
            z: -11 - i * 2.5,
            value: 500,
            isSlideBonus: true,
            isRisky: false
          });
        }
        break;
      }

      case SEGMENT_TYPE.G_REACTION_RUSH: {
        // SEGMENT G: High-speed reaction section
        const pattern = Math.random() < 0.5 ? [0, -1, 1] : [0, 1, -1];
        for (let i = 0; i < 3; i++) {
          obstacles.push({
            id: `obs_${chunkIdx}_g_${i}_${Math.random()}`,
            type: [OBSTACLE_TYPE.MUD_POTHOLE, OBSTACLE_TYPE.FIRE_BRAZIER, OBSTACLE_TYPE.ROCK][i],
            lane: pattern[i],
            z: -10 - i * 8,
            width: 1
          });
        }

        for (let i = 0; i < 6; i++) {
          collectibles.push({
            id: `c_g_${chunkIdx}_${i}`,
            lane: (i % 2 === 0) ? -1 : 1,
            z: -6 - i * 4.2,
            value: 500,
            isRisky: false
          });
        }
        break;
      }

      case SEGMENT_TYPE.H_ENV_TRANSITION: {
        // SEGMENT H: Environmental transition / scenic sprint with dense cash arc
        // Minimal hazard, pure high-speed thrill and reward
        const sideLane = Math.random() < 0.5 ? -1 : 1;
        obstacles.push({
          id: `obs_${chunkIdx}_h_${Math.random()}`,
          type: OBSTACLE_TYPE.SACRED_TOTEM,
          lane: sideLane,
          z: -20,
          width: 1
        });

        // Abundant double-lane cash trail
        for (let i = 0; i < 8; i++) {
          collectibles.push({
            id: `c_h1_${chunkIdx}_${i}`,
            lane: 0,
            z: -4 - i * 3.4,
            value: 500,
            isRisky: false
          });
          if (i % 2 === 0) {
            collectibles.push({
              id: `c_h2_${chunkIdx}_${i}`,
              lane: -sideLane,
              z: -4 - i * 3.4,
              value: 1000,
              isRisky: false
            });
          }
        }

        // High chance of cultural pickup
        if (Math.random() < 0.75) {
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
        obstacles.push({
          id: `obs_${chunkIdx}_i_bus_${Math.random()}`,
          type: OBSTACLE_TYPE.DANFO_WRECK,
          lane: busLane,
          z: -14,
          width: 1
        });
        obstacles.push({
          id: `obs_${chunkIdx}_i_rock_${Math.random()}`,
          type: OBSTACLE_TYPE.ROCK,
          lane: 0,
          z: -24,
          width: 1
        });

        // Safe weave along opposite lane
        const openLane = -busLane;
        for (let i = 0; i < 6; i++) {
          collectibles.push({
            id: `c_i_${chunkIdx}_${i}`,
            lane: openLane,
            z: -8 - i * 3.6,
            value: 500,
            isRisky: false
          });
        }
        break;
      }

      case SEGMENT_TYPE.J_RISK_REWARD: {
        // SEGMENT J: High-risk / high-reward decision section!
        // SAFE LANE: open path, ₦100 notes
        // RISKY LANE: blocked by hazard, but guarded with ₦5,000 note and 2X Multiplier right in front!
        const safeLane = -1;
        const riskyLane = 1;

        obstacles.push({
          id: `obs_${chunkIdx}_j_${Math.random()}`,
          type: OBSTACLE_TYPE.OIL_DRUM_BARRICADE,
          lane: riskyLane,
          z: -20,
          width: 1
        });

        // Safe path: continuous ₦100 notes
        for (let i = 0; i < 6; i++) {
          collectibles.push({
            id: `c_safe_${chunkIdx}_${i}`,
            lane: safeLane,
            z: -6 - i * 3.5,
            value: 100,
            isRisky: false
          });
        }

        // Risky path: High roller ₦5,000 note right before the hazard!
        collectibles.push({
          id: `c_jackpot_${chunkIdx}_${Math.random()}`,
          lane: riskyLane,
          z: -12,
          value: 5000,
          isRisky: true
        });

        // Valuable 2X multiplier on center lane
        valuables.push({
          id: `val_j_${chunkIdx}_${Math.random()}`,
          type: PICKUP_TYPE.MULTIPLIER_2X,
          lane: 0,
          z: -16
        });
        break;
      }

      default:
        break;
    }

    // Occasional Point Catalyst trap (-100 PTS) in late run
    if (distance > 300 && Math.random() < 0.18) {
      const trapLane = randomLane();
      valuables.push({
        id: `trap_${chunkIdx}_${Math.random()}`,
        type: PICKUP_TYPE.POINT_CATALYST,
        lane: trapLane,
        z: -22
      });
    }

    return { obstacles, collectibles, valuables };
  }
}

export const segmentEngine = new SegmentEngineManager();
