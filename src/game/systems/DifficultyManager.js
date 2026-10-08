import { gameState, GAME_STATUS } from '../core/GameState';

export class DifficultyManager {
  constructor() {
    this.cleanRunDistance = 0;
  }

  update(delta) {
    if (gameState.status !== GAME_STATUS.PLAYING) return;

    // 1. Continuous smooth speed progression
    gameState.targetSpeed = gameState.calculateTargetSpeed();

    if (gameState.isDowned) {
      gameState.speed = 6.0; // Stumbled speed
    } else {
      // Smooth continuous acceleration towards target speed
      const accelRate = gameState.isSpeedBurstActive ? 4.5 : (gameState.strikes > 0 ? 1.2 : 2.0);
      gameState.speed += (gameState.targetSpeed - gameState.speed) * Math.min(delta * accelRate, 0.12);
    }

    // 2. Check 100m speed surge alert & audio milestones
    gameState.checkSpeedProgression();

    // 3. Check rare Chaos Events
    gameState.checkChaosEvents();

    // 4. Check 500m Front Witch Ambush
    gameState.check500mAmbush();

    // 5. Guardian distance equilibrium & tension
    if (gameState.status === GAME_STATUS.PLAYING) {
      if (gameState.isDowned) {
        // When downed, guardian rapidly closes in
        gameState.guardianDistance = Math.max(0.5, gameState.guardianDistance - 5.5 * delta);
      } else {
        // Natural recovery / tension based on distance & strikes
        if (gameState.strikes === 0) {
          // In late run (1500m+), the witch naturally stalks slightly closer for increased tension
          const baseSafeDist = gameState.distance > 3000 ? 15.0 : (gameState.distance > 1500 ? 18.0 : 22.0);
          if (gameState.guardianDistance < baseSafeDist) {
            gameState.guardianDistance = Math.min(baseSafeDist, gameState.guardianDistance + 0.55 * delta);
          }
        } else {
          // Strike 1: Witch stays aggressively close (between 4.5m and 6.5m)
          if (gameState.guardianDistance < 5.8) {
            gameState.guardianDistance = Math.min(5.8, gameState.guardianDistance + 0.2 * delta);
          } else if (gameState.guardianDistance > 6.5) {
            gameState.guardianDistance = Math.max(6.5, gameState.guardianDistance - 0.4 * delta);
          }
        }
      }

      // Calculate guardian pressure (0.0 to 1.0)
      gameState.guardianPressure = Math.max(0, Math.min(1.0, (22.0 - gameState.guardianDistance) / 18.0));
    }

    // 6. Clean run recovery (run cleanly for 130m to recover Strike 1)
    if (!gameState.isDowned && gameState.strikes > 0) {
      this.cleanRunDistance += gameState.speed * delta;
      if (this.cleanRunDistance > 130) {
        gameState.strikes = 0;
        this.cleanRunDistance = 0;
        gameState.alertMessage = '✨ DISTANCE RECOVERED! SAFE AGAIN!';
        gameState.alertTimer = 1.0;
        gameState.notify(true);
      }
    } else if (gameState.strikes === 0) {
      this.cleanRunDistance = 0;
    }

    // Emit throttled update to UI
    gameState.notify(false);
  }
}

export const difficultyManager = new DifficultyManager();
