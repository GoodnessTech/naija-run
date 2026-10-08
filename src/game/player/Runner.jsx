import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { gameState, GAME_STATUS, LANE, LANE_WIDTH, PLAYER_STATE } from '../core/GameState';
import { gameAudio } from '../core/GameAudio';

export function Runner({ onRunnerUpdate }) {
  const groupRef = useRef();
  const innerRef = useRef();
  
  // Load official runner GLB (preserves character design, textures, face, clothing, proportions)
  const { scene } = useGLTF('/assets/characters/runner.glb');

  // Shader uniforms for anatomical human running kinematics & biomechanics
  const runUniforms = useRef({
    uRunTime: { value: 0 },
    uIsRunning: { value: 0 },
    uJumpBlend: { value: 0 },
    uSlideBlend: { value: 0 },
    uLandingCompression: { value: 0 },
    uLeanBank: { value: 0 },
  });

  // Biomechanical sprint deformation vertex shader:
  // - True Human Running Cycle: coordinated legs, knees, ankles, feet, pelvis, hips, torso, shoulders, arms, elbows, head.
  // - Proper Foot Planting: foot plants ahead of hips, moves backward along ground matching forward speed (ZERO SKATING), lifts into high knee swing.
  // - Counter-Rotation: hips rotate forward with swing leg; shoulders rotate in opposite direction.
  // - Arms: bent at elbow (~85°), pumping forward and back in opposition to legs.
  // - Head: stabilized looking forward down the track.
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = false;
        if (child.material) {
          child.material = child.material.clone();
          child.material.roughness = 0.65;
          child.material.metalness = 0.1;

          child.material.customProgramCacheKey = () => 'naija_human_sprint_biomechanics_v7';

          child.material.onBeforeCompile = (shader) => {
            shader.uniforms.uRunTime = runUniforms.current.uRunTime;
            shader.uniforms.uIsRunning = runUniforms.current.uIsRunning;
            shader.uniforms.uJumpBlend = runUniforms.current.uJumpBlend;
            shader.uniforms.uSlideBlend = runUniforms.current.uSlideBlend;
            shader.uniforms.uLandingCompression = runUniforms.current.uLandingCompression;
            shader.uniforms.uLeanBank = runUniforms.current.uLeanBank;

            shader.vertexShader = `
              uniform float uRunTime;
              uniform float uIsRunning;
              uniform float uJumpBlend;
              uniform float uSlideBlend;
              uniform float uLandingCompression;
              uniform float uLeanBank;

              #define M_PI 3.14159265358979323846
              #define M_TWO_PI 6.28318530717958647692

              // Mathematical human sprint leg kinematics (stance planting + swing recovery)
              vec3 calculateSprintLeg(float phase, float heightNorm, float isLeft) {
                // heightNorm: 0.0 at hip/pelvis (y ~ -0.06), 1.0 at foot sole (y ~ -0.50)
                // phase: 0.0 to 1.0
                // Stance Phase (0.0 to 0.40): Foot is planted, moves backward relative to pelvis
                // Swing Phase (0.40 to 1.0): High knee drive, heel tucks under glute, unfolds to plant
                
                float stanceLimit = 0.40;
                float strideAmp = 0.235; // Maximum forward/backward stride extension
                float dX = 0.0;
                float dY = 0.0;
                float dZ = 0.0;

                if (phase < stanceLimit) {
                  // STANCE PHASE (GROUND CONTACT & POWER DRIVE)
                  float t = phase / stanceLimit; // 0.0 to 1.0
                  // Linear backward sweep: exact match to world ground translation = ZERO SKATING!
                  dX = strideAmp * (1.0 - 2.0 * t);

                  // Midstance shock absorption (knee flexes slightly at 30-50% of stance)
                  float kneeFlex = sin(t * M_PI);
                  dY = -kneeFlex * 0.025 * (1.0 - heightNorm);
                } else {
                  // SWING PHASE (HIGH KNEE LIFT, HEEL TUCK & FORWARD EXTENSION)
                  float t = (phase - stanceLimit) / (1.0 - stanceLimit); // 0.0 to 1.0
                  
                  // Smooth forward acceleration using smoothstep curve
                  float forwardT = smoothstep(0.0, 1.0, t);
                  dX = -strideAmp + (2.0 * strideAmp) * forwardT;

                  // High heel lift in early swing (t: 0.0 - 0.5)
                  float heelLift = sin(clamp(t * 2.0, 0.0, 1.0) * M_PI);
                  // High knee drive in mid-swing (t: 0.2 - 0.8)
                  float kneeDrive = sin(clamp((t - 0.2) / 0.7, 0.0, 1.0) * M_PI);

                  // Lower leg and foot lift high off ground
                  dY = (heelLift * 0.27 + kneeDrive * 0.16) * heightNorm;

                  // Foot extension ready to strike ground at end of swing
                  if (t > 0.85) {
                    float reach = (t - 0.85) / 0.15;
                    dY -= reach * 0.035;
                  }
                }

                // Displacements are weighted along the leg chain (0 at hip, full at foot)
                float weight = pow(heightNorm, 1.25);
                dX *= weight;
                dY *= weight;

                // Subtle lateral hip adduction to keep center of gravity balanced
                dZ = sin(phase * M_TWO_PI) * 0.012 * (1.0 - heightNorm);

                return vec3(dX, dY, dZ);
              }

              // Mathematical human sprint arm kinematics (opposing counter-balance)
              vec3 calculateSprintArm(float phase, float armHeightNorm, float isLeft) {
                // Arm swing is in antiphase: Left arm swings with Right leg, Right arm with Left leg
                // armHeightNorm: 0.0 at shoulder, 1.0 at fist/hand
                float p = isLeft > 0.5 ? fract(phase + 0.5) : fract(phase);

                // Sprinting arms are bent at the elbow (~85 degrees)
                float swingAngle = sin(p * M_TWO_PI);

                // Forward and backward drive from shoulder through hands
                float dX = swingAngle * 0.36 * armHeightNorm;

                // Hand lifts towards mid-chest on forward swing, drops towards hip on back swing
                float dY = (max(0.0, swingAngle) * 0.20 - max(0.0, -swingAngle) * 0.07) * armHeightNorm;

                // Natural inward adduction on forward swing
                float adduction = max(0.0, swingAngle) * 0.055 * armHeightNorm;
                float dZ = isLeft > 0.5 ? adduction : -adduction;

                return vec3(dX, dY, dZ);
              }
            ` + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              `
              #include <begin_vertex>

              if (uIsRunning > 0.01) {
                // Coordinate Frame inside Model:
                // Height along Y: -0.50 (feet) to +0.50 (head)
                // Forward along X: +X is chest/forward drive, -X is back
                // Width along Z: -Z is Left, +Z is Right

                float runPhase = fract(uRunTime / M_TWO_PI);
                float leftLegPhase = runPhase;
                float rightLegPhase = fract(runPhase + 0.5);

                // ==========================================
                // 1. LEGS, KNEES, ANKLES, AND FEET KINEMATICS
                // ==========================================
                if (position.y < -0.05) {
                  float legHeightNorm = clamp((-position.y - 0.05) / 0.45, 0.0, 1.0);

                  if (position.z < -0.005) {
                    // LEFT LEG
                    vec3 legDef = calculateSprintLeg(leftLegPhase, legHeightNorm, 1.0);
                    transformed.x += legDef.x * uIsRunning;
                    transformed.y += legDef.y * uIsRunning;
                    transformed.z += legDef.z * uIsRunning;
                  } else if (position.z > 0.005) {
                    // RIGHT LEG
                    vec3 legDef = calculateSprintLeg(rightLegPhase, legHeightNorm, 0.0);
                    transformed.x += legDef.x * uIsRunning;
                    transformed.y += legDef.y * uIsRunning;
                    transformed.z += legDef.z * uIsRunning;
                  }
                }

                // ==========================================
                // 2. ARMS, ELBOWS, AND HANDS COUNTER-BALANCE
                // ==========================================
                if (abs(position.z) > 0.065 && position.y > -0.28 && position.y < 0.35) {
                  float armHeightNorm = clamp((0.32 - position.y) / 0.52, 0.0, 1.0);

                  if (position.z < -0.065) {
                    // LEFT ARM (Counterbalances right leg)
                    vec3 armDef = calculateSprintArm(runPhase, armHeightNorm, 1.0);
                    transformed.x += armDef.x * uIsRunning;
                    transformed.y += armDef.y * uIsRunning;
                    transformed.z += armDef.z * uIsRunning;
                  } else if (position.z > 0.065) {
                    // RIGHT ARM (Counterbalances left leg)
                    vec3 armDef = calculateSprintArm(runPhase, armHeightNorm, 0.0);
                    transformed.x += armDef.x * uIsRunning;
                    transformed.y += armDef.y * uIsRunning;
                    transformed.z += armDef.z * uIsRunning;
                  }
                }

                // ==========================================
                // 3. HIP & SHOULDER BIOMECHANICAL COUNTER-ROTATION
                // ==========================================
                // Hips rotate forward with the swinging leg
                float hipYaw = sin(uRunTime) * 0.095 * uIsRunning;
                // Shoulders rotate in the OPPOSITE direction to neutralize angular momentum
                float shoulderYaw = -sin(uRunTime) * 0.115 * uIsRunning;

                // Smooth torsional spine twist across torso (y: -0.05 to +0.35)
                if (position.y > -0.06 && position.y < 0.35) {
                  float spineFactor = clamp((position.y + 0.06) / 0.40, 0.0, 1.0);
                  float currentYaw = mix(hipYaw, shoulderYaw, spineFactor);

                  float cosY = cos(currentYaw);
                  float sinY = sin(currentYaw);
                  float curX = transformed.x;
                  float curZ = transformed.z;
                  transformed.x = curX * cosY - curZ * sinY;
                  transformed.z = curX * sinY + curZ * cosY;
                }

                // ==========================================
                // 4. HEAD AND GAZE STABILIZATION
                // ==========================================
                // Neck counteracts shoulder rotation so head stays aligned with the running path
                if (position.y >= 0.35) {
                  float headCounterYaw = -shoulderYaw * 0.90;
                  float cosH = cos(headCounterYaw);
                  float sinH = sin(headCounterYaw);
                  float headX = transformed.x;
                  float headZ = transformed.z;
                  transformed.x = headX * cosH - headZ * sinH;
                  transformed.z = headX * sinH + headZ * cosH;
                }
              }

              // ==========================================
              // 5. JUMPING TUCK & AIRBORNE BALANCE
              // ==========================================
              if (uJumpBlend > 0.01) {
                // Legs tuck up toward body
                if (position.y < 0.0) {
                  float tuck = clamp((-position.y) / 0.50, 0.0, 1.0);
                  transformed.y += 0.28 * tuck * uJumpBlend;
                  transformed.x += 0.12 * tuck * uJumpBlend;
                }
                // Arms flare slightly for aerodynamic balance
                if (abs(position.z) > 0.07 && position.y > -0.2) {
                  transformed.z += (position.z > 0.0 ? 0.08 : -0.08) * uJumpBlend;
                  transformed.y += 0.12 * uJumpBlend;
                }
              }

              // ==========================================
              // 6. POST-JUMP LANDING SHOCK ABSORPTION
              // ==========================================
              if (uLandingCompression > 0.01) {
                // Knees compress to absorb landing impact
                if (position.y < 0.1) {
                  transformed.y -= uLandingCompression * 0.08;
                }
              }
              `
            );
          };
          child.material.needsUpdate = true;
        }
      }
    });
    return clone;
  }, [scene]);

  // Motion state & kinematic controllers
  const motion = useRef({
    currentLane: LANE.CENTER,
    x: 0,
    y: 0,
    z: 0,
    velocityY: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    runTime: 0,
    bankAngle: 0,
    landingCompression: 0,
    jumpBlend: 0,
    slideBlend: 0,
    runBlend: 1.0,
    leftFootstep: false,
    rightFootstep: false,
  });

  const jump = () => {
    if (gameState.status !== GAME_STATUS.PLAYING || gameState.isDowned) return;
    const m = motion.current;
    if (!m.isJumping) {
      m.isJumping = true;
      m.velocityY = 14.2;
      m.isSliding = false;
      gameState.playerState = PLAYER_STATE.JUMPING;
      gameAudio.playJump();
    }
  };

  const slide = () => {
    if (gameState.status !== GAME_STATUS.PLAYING || gameState.isDowned) return;
    const m = motion.current;
    if (!m.isSliding) {
      m.isSliding = true;
      m.slideTimer = 0.65;
      if (m.isJumping) {
        m.velocityY = -22.0;
      }
      gameState.playerState = PLAYER_STATE.SLIDING;
      gameAudio.playSlide();
    }
  };

  const changeLane = (dir) => {
    if (gameState.status !== GAME_STATUS.PLAYING || gameState.isDowned) return;
    const m = motion.current;
    const newLane = THREE.MathUtils.clamp(m.currentLane + dir, LANE.LEFT, LANE.RIGHT);
    if (newLane !== m.currentLane) {
      m.currentLane = newLane;
      gameState.currentLane = newLane;
      // Realistic body lean into the turn (-lean for right, +lean for left)
      m.bankAngle = -dir * 0.32;
      gameAudio.playTurn(dir);
    }
  };

  useEffect(() => {
    window.__naija_jump = jump;
    window.__naija_slide = slide;
    window.__naija_lane = changeLane;
    return () => {
      delete window.__naija_jump;
      delete window.__naija_slide;
      delete window.__naija_lane;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = gameState.subscribe((snap) => {
      if ((snap.status === GAME_STATUS.COUNTDOWN || snap.status === GAME_STATUS.PLAYING) && motion.current.z !== 0 && snap.distance < 2) {
        motion.current.x = 0;
        motion.current.y = 0;
        motion.current.z = 0;
        motion.current.currentLane = LANE.CENTER;
        motion.current.velocityY = 0;
        motion.current.isJumping = false;
        motion.current.isSliding = false;
        motion.current.landingCompression = 0;
        motion.current.jumpBlend = 0;
        motion.current.slideBlend = 0;
        motion.current.runBlend = 1.0;
      }
    });
    return unsubscribe;
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const m = motion.current;
    if (!groupRef.current) return;

    if (gameState.status === GAME_STATUS.PLAYING) {
      // 1. Forward progression along negative Z
      const forwardDist = gameState.speed * dt;
      m.z -= forwardDist;
      gameState.distance += forwardDist;
      gameState.playerZ = m.z;

      const effectiveMultiplier = (gameState.pointMultiplier || 1) * (gameState.scoreMultiplier || 1.0);
      gameState.score += forwardDist * effectiveMultiplier;

      // Clean run recovery: run cleanly for 120m to recover a strike
      if (!gameState.isDowned) {
        gameState.cleanRunDistance += forwardDist;
        if (gameState.cleanRunDistance > 120 && gameState.strikes > 0) {
          gameState.strikes = Math.max(0, gameState.strikes - 1);
          gameState.cleanRunDistance = 0;
          gameState.alertMessage = '✨ DISTANCE RECOVERED! (1/3)';
          gameState.alertTimer = 1.0;
        }
      }

      // Handle Downed Timer
      if (gameState.isDowned) {
        gameState.downedTimer -= dt;
        if (gameState.downedTimer <= 0) {
          gameState.isDowned = false;
          gameState.playerState = PLAYER_STATE.RUNNING;
        }
      }

      // 2. Horizontal Lane Interpolation with Dynamic Banking
      const targetX = m.currentLane * LANE_WIDTH;
      m.x = THREE.MathUtils.lerp(m.x, targetX, dt * 15.0);
      gameState.playerX = m.x;
      m.bankAngle = THREE.MathUtils.lerp(m.bankAngle, 0, dt * 9.0);

      // 3. Jump physics with Landing Impact Absorption
      if (m.isJumping) {
        m.velocityY -= 40.0 * dt;
        m.y += m.velocityY * dt;
        if (m.y <= 0) {
          m.y = 0;
          m.isJumping = false;
          m.velocityY = 0;
          m.landingCompression = 1.0; // Trigger knee landing shock absorption!
          if (!m.isSliding && !gameState.isDowned) {
            gameState.playerState = PLAYER_STATE.RUNNING;
            gameAudio.playLanding();
          }
        }
      }

      // Smooth decay of landing compression
      if (m.landingCompression > 0) {
        m.landingCompression = Math.max(0, m.landingCompression - dt * 6.5);
      }

      // 4. Slide timing
      if (m.isSliding) {
        m.slideTimer -= dt;
        if (m.slideTimer <= 0) {
          m.isSliding = false;
          if (!m.isJumping && !gameState.isDowned) {
            gameState.playerState = PLAYER_STATE.RUNNING;
          }
        }
      }

      // 5. Blending transitions between Run, Jump, Slide
      const targetJump = m.isJumping ? 1.0 : 0.0;
      const targetSlide = m.isSliding ? 1.0 : 0.0;
      m.jumpBlend = THREE.MathUtils.lerp(m.jumpBlend, targetJump, dt * 16.0);
      m.slideBlend = THREE.MathUtils.lerp(m.slideBlend, targetSlide, dt * 16.0);
      const isDown = gameState.isDowned;
      const isRunning = !m.isJumping && !m.isSliding && !isDown;
      m.runBlend = THREE.MathUtils.lerp(m.runBlend, isRunning ? 1.0 : 0.0, dt * 14.0);

      // 6. Running Cadence & Stride Frequency Synchronization
      // At base speed (23.5 m/s): cadence is ~4.0 Hz (cycles/sec).
      // Stride length scales naturally with speed to preserve human biomechanics.
      const speedRatio = gameState.speed / 23.5;
      const strideCadence = (23.5 * 1.08) * Math.pow(speedRatio, 0.65);
      m.runTime += dt * strideCadence;

      // Update shader uniforms
      runUniforms.current.uRunTime.value = m.runTime;
      runUniforms.current.uIsRunning.value = m.runBlend;
      runUniforms.current.uJumpBlend.value = m.jumpBlend;
      runUniforms.current.uSlideBlend.value = m.slideBlend;
      runUniforms.current.uLandingCompression.value = m.landingCompression;
      runUniforms.current.uLeanBank.value = m.bankAngle;

      // 7. Human Running Physics: Center of Mass Vertical Oscillation (Two Peaks per Stride)
      // Body rises during flight phase, compresses upon foot strike
      const strideBob = isRunning ? Math.cos(2.0 * m.runTime) * 0.048 : 0;
      const landingShock = m.landingCompression * 0.08;

      // Weight transfer roll
      const weightTransferRoll = isRunning ? Math.sin(m.runTime) * 0.038 : 0;

      // Alternating Footstep Audio precisely synchronized with foot strikes (phase 0.0 and 0.5)
      if (isRunning) {
        const cycleFraction = (m.runTime / (2.0 * Math.PI)) % 1.0;
        if (cycleFraction > 0.05 && cycleFraction < 0.25 && !m.leftFootstep) {
          gameAudio.playFootstep();
          m.leftFootstep = true;
          m.rightFootstep = false;
        } else if (cycleFraction > 0.55 && cycleFraction < 0.75 && !m.rightFootstep) {
          gameAudio.playFootstep();
          m.rightFootstep = true;
          m.leftFootstep = false;
        }
      }

      // Position root group with realistic vertical motion
      groupRef.current.position.set(m.x, m.y + strideBob - landingShock, m.z);
      gameState.playerY = m.y;

      // Inner orientation & posture
      const baseYaw = Math.PI / 2;

      if (innerRef.current) {
        if (isDown) {
          // DOWNED: Tripped forward onto belly
          innerRef.current.rotation.set(0.2, baseYaw, -1.35);
          innerRef.current.scale.set(1.9, 0.8, 1.9);
          innerRef.current.position.y = 0.28;
        } else if (m.slideBlend > 0.2) {
          // SLIDE: Lower center of gravity smoothly
          const s = m.slideBlend;
          innerRef.current.rotation.set(0.55 * s, baseYaw + m.bankAngle, -0.85 * s);
          innerRef.current.scale.set(1.9, THREE.MathUtils.lerp(1.9, 0.95, s), 1.9);
          innerRef.current.position.y = THREE.MathUtils.lerp(0.95, 0.42, s);
        } else if (m.jumpBlend > 0.2) {
          // JUMP: Aerodynamic leap posture
          const j = m.jumpBlend;
          innerRef.current.rotation.set(0, baseYaw + m.bankAngle, -0.22);
          innerRef.current.scale.set(1.9, 1.9, 1.9);
          innerRef.current.position.y = 0.95;
        } else {
          // ATHLETIC HUMAN HIGH-SPEED SPRINT POSTURE:
          // - Sprint lean forward (-0.24 rad / ~14 degrees)
          // - Dynamic lateral roll with alternating weight shift
          // - Smooth banking into lane turns
          innerRef.current.rotation.set(
            weightTransferRoll,
            baseYaw + m.bankAngle,
            -0.24 // Powerful forward sprint drive
          );
          innerRef.current.scale.set(1.9, 1.9, 1.9);
          innerRef.current.position.y = 0.95;
        }
      }

      if (onRunnerUpdate) {
        onRunnerUpdate({ x: m.x, y: m.y, z: m.z, isJumping: m.isJumping, isSliding: m.isSliding });
      }
    } else {
      // Menu / Idle state
      runUniforms.current.uIsRunning.value = 0.0;
      if (groupRef.current) groupRef.current.position.set(0, 0, 0);
      if (innerRef.current) {
        innerRef.current.rotation.set(0, Math.PI / 2, 0);
        innerRef.current.scale.set(1.9, 1.9, 1.9);
        innerRef.current.position.y = 0.95;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 
        Official Runner 3D Model:
        - Full biomechanical human running cycle with articulated legs, knees, ankles, feet, pelvis, hips, torso, shoulders, arms, elbows, head.
        - True stance planting with zero foot sliding/skating.
        - Counter-rotational hips and shoulders with stabilized gaze.
      */}
      <group ref={innerRef} rotation={[0, Math.PI / 2, 0]} position={[0, 0.95, 0]} scale={[1.9, 1.9, 1.9]}>
        <primitive object={clonedScene} />
      </group>

      {/* Running Footstep Dust Puffs */}
      <mesh position={[0, 0.05, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.65, 12]} />
        <meshBasicMaterial color="#b9381e" transparent opacity={gameState.isDowned ? 0.75 : 0.3} />
      </mesh>

      {/* Golden Invincibility / Shield Protective Aura */}
      {(gameState.isInvincible || gameState.remainingShields > 0 || gameState.isSpeedBurstActive) && (
        <mesh position={[0, 1.0, 0]}>
          <sphereGeometry args={[1.35, 16, 16]} />
          <meshBasicMaterial
            color={gameState.isSpeedBurstActive ? "#38bdf8" : "#fbbf24"}
            transparent
            opacity={0.35}
            wireframe
          />
        </mesh>
      )}

      {/* Sango Shades Magnet Electric Aura */}
      {gameState.magnetTimer > 0 && (
        <mesh position={[0, 1.0, 0]}>
          <torusGeometry args={[1.1, 0.06, 8, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      )}
    </group>
  );
}

useGLTF.preload('/assets/characters/runner.glb');
