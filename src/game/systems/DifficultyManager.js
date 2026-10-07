import { gameState, GAME_STATUS } from '../core/GameState';

export class DifficultyManager {
  constructor() {
    this.cleanRunDistance = 0;
  }

  update(delta) {
    if (gameState.status !== GAME_STATUS.PLAYING) return;

    // Check for speed progression every 100m
    gameState.checkSpeedProgression();

    // Check for Front Witch ambush every 500m
    gameState.check500mAmbush();

    // If downed, keep speed strictly reduced!
    if (gameState.isDowned) {
      gameState.speed = 4.5;
    } else {
      // Gradually recover speed after being downed towards target speed
      const accelRate = gameState.strikes > 0 ? 0.35 : 0.6;
      gameState.speed += (gameState.targetSpeed - gameState.speed) * Math.min(delta * accelRate, 0.08);
    }

    // Guardian distance natural equilibrium
    // If player runs smoothly and not downed, Guardian slowly backs off towards safety
    if (gameState.guardianDistance < 22.0 && !gameState.isDowned) {
      if (gameState.strikes === 0) {
        // Safe: witch backs off to 22m
        gameState.guardianDistance = Math.min(22.0, gameState.guardianDistance + 0.45 * delta);
      } else {
        // Strike 1: Witch stays alerted right on back (4.5m to 6.5m)
        gameState.guardianDistance = Math.min(6.5, gameState.guardianDistance + 0.15 * delta);
      }
    }

    // Clean run recovery: run cleanly for 120m to recover a strike!
    if (!gameState.isDowned && gameState.strikes > 0) {
      this.cleanRunDistance += gameState.speed * delta;
      if (this.cleanRunDistance > 140) {
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
