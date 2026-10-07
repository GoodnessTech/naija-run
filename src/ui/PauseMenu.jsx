import React from 'react';
import { gameState } from '../game/core/GameState';

export function PauseMenu({ onResume, onRestart, onMainMenu }) {
  return (
    <div className="modal-overlay">
      <div
        className="glass-panel"
        style={{
          maxWidth: '360px',
          width: '100%',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>⏸️</div>

        <h2
          style={{
            fontFamily: "var(--font-sf-display)",
            fontSize: '1.75rem',
            fontWeight: 900,
            color: '#202124',
            letterSpacing: '-0.5px',
            marginBottom: '6px',
          }}
        >
          GAME PAUSED
        </h2>

        <p
          style={{
            fontFamily: "var(--font-sf-text)",
            fontSize: '0.82rem',
            color: '#5f6368',
            marginBottom: '24px',
          }}
        >
          Catch your breath before entering the heat again.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={onResume} className="btn-primary" style={{ width: '100%' }}>
            <span>▶</span> RESUME
          </button>
          <button onClick={onRestart} className="btn-blue" style={{ width: '100%' }}>
            <span>🔄</span> RESTART
          </button>
          <button onClick={onMainMenu} className="btn-secondary" style={{ width: '100%' }}>
            <span>🏠</span> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
