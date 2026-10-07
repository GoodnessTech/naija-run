import { gameState, GAME_STATUS } from '../core/GameState';

export class DifficultyManager {
  constructor() {
    this.cleanRunDistance = 0;
  }

  update(delta) {
    if (gameState.status !== GAME_STATUS.PLAYING) return;

    const dist = gameState.distance;

    // 1. Progressive speed curve (16 m/s -> 28 m/s)
    // Smooth logarithmic-style acceleration
    const speedBonus = Math.min(12.0, Math.pow(dist / 1200, 0.75) * 12.0);
    const targetSpeed = 16.0 + speedBonus;

    // If downed, keep speed strictly reduced!
    if (gameState.isDowned) {
      gameState.speed = 4.5;
    } else {
      // Gradually recover speed after being downed towards target speed
      const accelRate = gameState.strikes > 0 ? 0.35 : 0.6;
      gameState.speed += (targetSpeed - gameState.speed) * Math.min(delta * accelRate, 0.08);
    }

    // 2. Guardian distance natural equilibrium
    // If player runs smoothly and not downed, Guardian slowly backs off towards safety
    if (gameState.guardianDistance < 18.0 && !gameState.isDowned) {
      if (gameState.strikes === 0) {
        const recoveryRate = Math.max(0.1, 0.45 - (dist / 3000) * 0.25);
        gameState.guardianDistance = Math.min(18.0, gameState.guardianDistance + recoveryRate * delta);
      } else if (gameState.strikes === 1) {
        // Recover up to 11m maximum when alerted
        gameState.guardianDistance = Math.min(11.0, gameState.guardianDistance + 0.25 * delta);
      } else {
        // Strike 2: Witch stays right on heels (2.8m to 4.2m)
        gameState.guardianDistance = Math.min(4.2, gameState.guardianDistance + 0.1 * delta);
      }
    }

    // 3. Score Multiplier based on clean run
    if (!gameState.isDowned) {
      this.cleanRunDistance += gameState.speed * delta;
      if (this.cleanRunDistance > 300) {
        gameState.multiplier = 3;
      } else if (this.cleanRunDistance > 120) {
        gameState.multiplier = 2;
      } else {
        gameState.multiplier = 1;
      }
    } else {
      this.cleanRunDistance = 0;
      gameState.multiplier = 1;
    }

    // Emit throttled update to UI
    gameState.notify(false);
  }
}

export const difficultyManager = new DifficultyManager();
