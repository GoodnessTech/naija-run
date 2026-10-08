import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { gameState, GAME_STATUS, LANE, LANE_WIDTH, PLAYER_STATE } from '../core/GameState';
import { gameAudio } from '../core/GameAudio';

export function Runner({ onRunnerUpdate }) {
  const groupRef = useRef();
  const innerRef = useRef();
  
  // Load real runner GLB
  const { scene } = useGLTF('/assets/characters/runner.glb');

  // Shader uniforms for GPU running limb animation
  const runUniforms = useRef({
    uRunTime: { value: 0 },
    uIsRunning: { value: 0 },
  });

  // Clone scene & inject GPU running deformation shader for legs AND full arm swings
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

          child.material.customProgramCacheKey = () => 'naija_runner_shader_v6';

          // Inject procedural running stride vertex shader:
          // Full articulated athletic sprint: alternating leg kicks with high knee bends,
          // and vigorous arm pumps from shoulder down through fists in natural opposition
          child.material.onBeforeCompile = (shader) => {
            shader.uniforms.uRunTime = runUniforms.current.uRunTime;
            shader.uniforms.uIsRunning = runUniforms.current.uIsRunning;

            shader.vertexShader = `
              uniform float uRunTime;
              uniform float uIsRunning;
            ` + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              `
              #include <begin_vertex>
              if (uIsRunning > 0.5) {
                // Model Space Coordinates:
                // Height along Y (-0.50 to +0.50)
                // Forward/Backward along X (+X is chest/forward, -X is back)
                // Left/Right along Z (-Z is left, +Z is right)

                // 1. Full Athletic Legs Alternating Sprint Stride (y < 0.0)
                if (position.y < 0.0) {
                  float d = clamp((-position.y) / 0.50, 0.0, 1.0);
                  if (position.z < -0.005) {
                    // Left Leg: powerful forward kick and high trailing knee bend
                    transformed.x += sin(uRunTime) * d * 0.44;
                    transformed.y += max(0.0, -sin(uRunTime)) * pow(d, 1.4) * 0.32;
                    transformed.y += max(0.0, sin(uRunTime)) * d * 0.16;
                  } else if (position.z > 0.005) {
                    // Right Leg: opposite cycle
                    transformed.x -= sin(uRunTime) * d * 0.44;
                    transformed.y += max(0.0, sin(uRunTime)) * pow(d, 1.4) * 0.32;
                    transformed.y += max(0.0, -sin(uRunTime)) * d * 0.16;
                  }
                }

                // 2. Full Arm Pumps from Shoulder through Hands (y > -0.28, abs(z) > 0.07)
                if (abs(position.z) > 0.07 && position.y > -0.28) {
                  float armFactor = clamp((0.34 - position.y) / 0.52, 0.0, 1.0);
                  if (position.z < -0.07) {
                    // Left Arm: pumps forward in opposition to left leg
                    transformed.x -= sin(uRunTime) * armFactor * 0.40;
                    transformed.y += max(0.0, -sin(uRunTime)) * armFactor * 0.22;
                    transformed.z += max(0.0, -sin(uRunTime)) * armFactor * 0.08;
                  } else if (position.z > 0.07) {
                    // Right Arm: pumps forward in opposition to right leg
                    transformed.x += sin(uRunTime) * armFactor * 0.40;
                    transformed.y += max(0.0, sin(uRunTime)) * armFactor * 0.22;
                    transformed.z -= max(0.0, sin(uRunTime)) * armFactor * 0.08;
                  }
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

  // Motion state
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
    footstepTriggered: false,
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
      m.slideTimer = 0.7;
      if (m.isJumping) {
        m.velocityY = -20.0;
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
      m.bankAngle = -dir * 0.45;
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
      }
    });
    return unsubscribe;
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const m = motion.current;
    if (!groupRef.current) return;

    if (gameState.status === GAME_STATUS.PLAYING) {
      // 1. Forward movement along negative Z
      const forwardDist = gameState.speed * dt;
      m.z -= forwardDist;
      gameState.distance += forwardDist;
      gameState.playerZ = m.z;
      // Multiply score by 2X pointMultiplier if active!
      const effectiveMultiplier = (gameState.pointMultiplier || 1) * (gameState.scoreMultiplier || 1.0);
      gameState.score += forwardDist * effectiveMultiplier;

      // Clean run recovery: run cleanly for 120m to recover a strike!
      if (!gameState.isDowned) {
        gameState.cleanRunDistance += forwardDist;
        if (gameState.cleanRunDistance > 120 && gameState.strikes > 0) {
          gameState.strikes = Math.max(0, gameState.strikes - 1);
          gameState.cleanRunDistance = 0;
          gameState.alertMessage = '✨ DISTANCE RECOVERED! (1/3)';
          gameState.alertTimer = 1.0; // Strictly 1.0s!
        }
      }

      // Handle Downed Timer (when hitting obstacle)
      if (gameState.isDowned) {
        gameState.downedTimer -= dt;
        if (gameState.downedTimer <= 0) {
          gameState.isDowned = false;
          gameState.playerState = PLAYER_STATE.RUNNING;
        }
      }

      // 2. Horizontal Lane Interpolation
      const targetX = m.currentLane * LANE_WIDTH;
      m.x = THREE.MathUtils.lerp(m.x, targetX, dt * 15.0);
      gameState.playerX = m.x; // Save exact world X for 100% accurate collision!
      m.bankAngle = THREE.MathUtils.lerp(m.bankAngle, 0, dt * 8.0);

      // 3. Jump physics
      if (m.isJumping) {
        m.velocityY -= 40.0 * dt;
        m.y += m.velocityY * dt;
        if (m.y <= 0) {
          m.y = 0;
          m.isJumping = false;
          m.velocityY = 0;
          if (!m.isSliding && !gameState.isDowned) {
            gameState.playerState = PLAYER_STATE.RUNNING;
            gameAudio.playFootstep();
          }
        }
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

      // 5. GPU Running Limb Animation Update
      const isAirborne = m.isJumping;
      const isSlide = m.isSliding;
      const isDown = gameState.isDowned;
      const isRunning = !isAirborne && !isSlide && !isDown;

      // High-cadence athletic stride frequency: eliminates ANY sliding feeling!
      const strideFreq = Math.max(22.0, gameState.speed * 1.55);
      m.runTime += dt * strideFreq;
      runUniforms.current.uRunTime.value = m.runTime;
      runUniforms.current.uIsRunning.value = isRunning ? 1.0 : 0.0;

      const baseYaw = Math.PI / 2;

      // High-energy athletic torso bobbing & roll
      const strideBob = isRunning ? Math.abs(Math.sin(m.runTime)) * 0.08 : 0;
      const torsoRoll = isRunning ? Math.sin(m.runTime) * 0.06 : 0;

      // Alternating footstep audio on every step (left & right)
      if (isRunning) {
        if (Math.sin(m.runTime) < -0.85 && !m.leftFootstep) {
          gameAudio.playFootstep();
          m.leftFootstep = true;
          m.rightFootstep = false;
        } else if (Math.sin(m.runTime) > 0.85 && !m.rightFootstep) {
          gameAudio.playFootstep();
          m.rightFootstep = true;
          m.leftFootstep = false;
        }
      }

      groupRef.current.position.set(m.x, m.y + strideBob, m.z);
      gameState.playerY = m.y;

      if (innerRef.current) {
        if (isDown) {
          // DOWNED ANIMATION: Tripped forward onto belly/dirt!
          innerRef.current.rotation.set(0.2, baseYaw, -1.35); // Pitched hard forward!
          innerRef.current.scale.set(1.9, 0.8, 1.9);
          innerRef.current.position.y = 0.28; // Down near ground
        } else if (isSlide) {
          // Slide ducking pose
          innerRef.current.rotation.set(0.6, baseYaw + m.bankAngle, -0.9);
          innerRef.current.scale.set(1.9, 0.9, 1.9);
          innerRef.current.position.y = 0.45;
        } else if (isAirborne) {
          // Jump leap pose
          innerRef.current.rotation.set(0, baseYaw + m.bankAngle, -0.25);
          innerRef.current.scale.set(1.9, 1.9, 1.9);
          innerRef.current.position.y = 0.95;
        } else {
          // Athletic forward running posture with aggressive sprint forward lean
          innerRef.current.rotation.set(
            torsoRoll,
            baseYaw + m.bankAngle,
            -0.22 // Aggressive sprint forward lean!
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
        Runner 3D Model:
        - GPU Vertex Stride: Full natural arm swings from shoulders to hands!
        - Alternating leg strides with knee bending!
        - Downed tripping state when hitting obstacles!
      */}
      <group ref={innerRef} rotation={[0, Math.PI / 2, 0]} position={[0, 0.95, 0]} scale={[1.9, 1.9, 1.9]}>
        <primitive object={clonedScene} />
      </group>

      {/* Running Footstep / Downed Dirt Dust Puffs */}
      <mesh position={[0, 0.05, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.65, 12]} />
        <meshBasicMaterial color="#b9381e" transparent opacity={gameState.isDowned ? 0.75 : 0.35} />
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
