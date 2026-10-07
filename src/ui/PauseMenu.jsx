import React from 'react';
import { gameState } from '../game/core/GameState';

export function PauseMenu({ onResume, onRestart, onMainMenu }) {
  return (
    <div
      className="ui-layer ui-interactive"
      style={{
        background: 'rgba(4, 10, 6, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '360px',
          width: '100%',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '1.8rem',
            color: '#fef08a',
            letterSpacing: '2px',
            marginBottom: '24px',
          }}
        >
          GAME PAUSED
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={onResume} className="btn-primary" style={{ width: '100%' }}>
            RESUME
          </button>
          <button onClick={onRestart} className="btn-secondary" style={{ width: '100%' }}>
            RESTART
          </button>
          <button onClick={onMainMenu} className="btn-secondary" style={{ width: '100%' }}>
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
