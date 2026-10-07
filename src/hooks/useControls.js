import { useEffect, useRef } from 'react';
import { gameState, GAME_STATUS, LANE } from '../game/core/GameState';
import { gameAudio } from '../game/core/GameAudio';

export function useControls(onJump, onSlide, onLaneChange) {
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Audio resume on first user interaction
      gameAudio.resumeContext();

      if (gameState.status === GAME_STATUS.MENU) {
        if (e.code === 'Space' || e.key === 'Enter') {
          gameState.startGame();
          return;
        }
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameState.status === GAME_STATUS.PLAYING) {
          gameState.pauseGame();
        } else if (gameState.status === GAME_STATUS.PAUSED) {
          gameState.resumeGame();
        }
        return;
      }

      if (e.key === '`' || e.key === '~') {
        gameState.toggleDebug();
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        const muted = gameState.toggleMute();
        gameAudio.setMuted(muted);
        return;
      }

      if (gameState.status !== GAME_STATUS.PLAYING) return;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          onLaneChange(-1);
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          onLaneChange(1);
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          e.preventDefault();
          onJump();
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          onSlide();
          break;
        default:
          break;
      }
    };

    // Mobile touch handling
    const handleTouchStart = (e) => {
      gameAudio.resumeContext();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
      }
    };

    const handleTouchMove = (e) => {
      // Prevent browser default pull-to-refresh and swipe navigation
      if (gameState.status === GAME_STATUS.PLAYING) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;
        const dt = Date.now() - touchStartRef.current.time;

        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const minSwipeDist = 25; // minimum px for gesture

        if (dt < 600 && (absDx > minSwipeDist || absDy > minSwipeDist)) {
          if (gameState.status === GAME_STATUS.MENU) {
            gameState.startGame();
            return;
          }

          if (gameState.status !== GAME_STATUS.PLAYING) return;

          if (absDx > absDy) {
            // Horizontal swipe
            if (dx < 0) {
              onLaneChange(-1); // Swipe left
            } else {
              onLaneChange(1); // Swipe right
            }
          } else {
            // Vertical swipe
            if (dy < 0) {
              onJump(); // Swipe up -> Jump
            } else {
              onSlide(); // Swipe down -> Slide
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onJump, onSlide, onLaneChange]);
}
