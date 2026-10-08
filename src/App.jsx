import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { gameState, GAME_STATUS } from './game/core/GameState';
import { GameScene } from './game/GameScene';
import { MainMenu } from './ui/MainMenu';
import { HUD } from './ui/HUD';
import { PauseMenu } from './ui/PauseMenu';
import { GameOverModal } from './ui/GameOverModal';
import { ReviveModal } from './ui/ReviveModal';
import { LoadingScreen } from './ui/LoadingScreen';
import { CountdownOverlay } from './ui/CountdownOverlay';
import { ScreenEffects } from './game/effects/ScreenEffects';
import { DebugOverlay } from './ui/DebugOverlay';

// Error Boundary for Three.js / WebGL
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Naija Run Canvas Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#180a0a',
            color: '#f87171',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            zIndex: 100,
          }}
        >
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', marginBottom: '12px' }}>
            WebGL / Asset Loading Error
          </h2>
          <p style={{ maxWidth: '500px', fontSize: '0.9rem', color: '#fca5a5', marginBottom: '20px' }}>
            {this.state.error?.message || 'An unexpected graphics error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reload Game
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [status, setStatus] = useState(gameState.status);
  const [countdownVal, setCountdownVal] = useState(gameState.countdownValue);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = gameState.subscribe((snap) => {
      setStatus(snap.status);
      setCountdownVal(snap.countdownValue);
    });
    return unsubscribe;
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 3D WebGL Canvas */}
      <div className="game-canvas-container">
        <CanvasErrorBoundary>
          <Canvas
            shadows
            camera={{ position: [0, 4.2, 7.5], fov: 60, near: 0.1, far: 180 }}
            gl={{
              powerPreference: 'high-performance',
              antialias: true,
              alpha: false,
              stencil: false,
              depth: true,
            }}
            dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
          >
            <Suspense fallback={null}>
              <GameScene />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      </div>

      {/* Supernatural Danger Screen Vignette */}
      <ScreenEffects />

      {/* Preloading Screen */}
      {!assetsLoaded && (
        <LoadingScreen onLoaded={() => setAssetsLoaded(true)} />
      )}

      {/* UI Overlays based on Game Status */}
      {assetsLoaded && status === GAME_STATUS.MENU && (
        <MainMenu onPlay={() => {}} />
      )}

      {assetsLoaded && status === GAME_STATUS.COUNTDOWN && (
        <CountdownOverlay value={countdownVal} />
      )}

      {assetsLoaded && (status === GAME_STATUS.PLAYING || status === GAME_STATUS.PAUSED) && (
        <HUD onPause={() => gameState.pauseGame()} />
      )}

      {assetsLoaded && status === GAME_STATUS.PAUSED && (
        <PauseMenu
          onResume={() => gameState.resumeGame()}
          onRestart={() => gameState.startGame()}
          onMainMenu={() => {
            gameState.reset();
            gameState.notify(true);
          }}
        />
      )}

      {assetsLoaded && status === GAME_STATUS.REVIVE && (
        <ReviveModal
          onReviveSuccess={() => {}}
          onDecline={() => {}}
        />
      )}

      {assetsLoaded && status === GAME_STATUS.GAMEOVER && (
        <GameOverModal
          onPlayAgain={() => gameState.startGame()}
          onMainMenu={() => {
            gameState.reset();
            gameState.notify(true);
          }}
        />
      )}

      {/* Developer Debug Overlay */}
      <DebugOverlay />
    </div>
  );
}
