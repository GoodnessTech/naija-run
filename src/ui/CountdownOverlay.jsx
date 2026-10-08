import React from 'react';
import { gameState } from '../game/core/GameState';

export function CountdownOverlay({ value }) {
  const isGo = value === 'GO!';

  return (
    <div
      className="ui-layer"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(32, 33, 36, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 40,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'countdown-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-sf-display)',
            fontSize: isGo ? 'clamp(4.5rem, 15vw, 8.5rem)' : 'clamp(5.5rem, 18vw, 10rem)',
            fontWeight: 900,
            color: isGo ? '#19B66B' : '#FFFFFF',
            textShadow: isGo
              ? '0 0 35px rgba(25, 182, 107, 0.8), 0 8px 32px rgba(0,0,0,0.6)'
              : '0 0 35px rgba(255, 255, 255, 0.6), 0 8px 32px rgba(0,0,0,0.6)',
            letterSpacing: isGo ? '4px' : '0px',
            transform: 'scale(1)',
            transition: 'transform 0.15s ease',
          }}
        >
          {value}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-sf-text)',
            fontSize: '1rem',
            fontWeight: 800,
            letterSpacing: '2px',
            color: '#FFFFFF',
            background: isGo ? '#19B66B' : 'rgba(255, 255, 255, 0.25)',
            padding: '6px 20px',
            borderRadius: '999px',
            marginTop: '12px',
            textTransform: 'uppercase',
          }}
        >
          {isGo ? 'SPRINT!' : 'GET READY'}
        </div>
      </div>
    </div>
  );
}
