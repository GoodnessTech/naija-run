import React, { useState } from 'react';
import { gameState } from '../game/core/GameState';
import { userProfile } from '../game/progression/UserProfileManager';
import { ShopModal } from './ShopModal';
import { LeaderboardModal } from './LeaderboardModal';

export function GameOverModal({ onPlayAgain, onMainMenu }) {
  const [showShop, setShowShop] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const profile = userProfile.getSnapshot();
  const isNewHighScore = gameState.score >= gameState.highScore && gameState.score > 0;
  const reasonText =
    gameState.reason === 'GUARDIAN_CAUGHT'
      ? 'THE FOREST WITCH HAS CAUGHT YOU!'
      : 'STRUCK BY JUNGLE HAZARD!';

  return (
    <div
      className="ui-layer ui-interactive"
      style={{
        background: 'radial-gradient(circle at center, rgba(30, 8, 8, 0.9) 0%, rgba(5, 2, 2, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 40,
      }}
    >
      <div
        className="glass-panel-danger"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '28px 24px',
          textAlign: 'center',
          borderRadius: '20px',
          maxHeight: '94vh',
          overflowY: 'auto',
        }}
      >
        {/* Skull / Beast Icon */}
        <div style={{ fontSize: '42px', marginBottom: '4px' }}>
          💀
        </div>

        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '2.2rem',
            fontWeight: 900,
            color: '#ef4444',
            letterSpacing: '3px',
            textShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
            marginBottom: '4px',
          }}
        >
          GAME OVER
        </h2>

        <p
          style={{
            fontSize: '0.8rem',
            color: '#cbd5e1',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '18px',
            fontWeight: 700,
          }}
        >
          {reasonText}
        </p>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '10px',
            }}
          >
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '1px', fontWeight: 700 }}>
              DISTANCE RUN
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', fontFamily: "'Plus Jakarta Sans', monospace" }}>
              {Math.floor(gameState.distance)} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>m</span>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '10px',
            }}
          >
            <div style={{ fontSize: '0.65rem', color: '#34d399', letterSpacing: '1px', fontWeight: 700 }}>
              CASH THIS RUN
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', fontFamily: "'Plus Jakarta Sans', monospace" }}>
              +₦{gameState.cash.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              gridColumn: '1 / -1',
              background: 'rgba(0, 135, 81, 0.2)',
              border: '1px solid #10b981',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 800 }}>BANKED TO VAULT</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lifetime Total Wealth</div>
            </div>
            <div
              style={{
                fontSize: '1.3rem',
                fontWeight: 900,
                color: '#34d399',
                fontFamily: "'Plus Jakarta Sans', monospace",
              }}
            >
              ₦{profile.wallet.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              gridColumn: '1 / -1',
              background: 'rgba(0, 0, 0, 0.5)',
              border: isNewHighScore ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: isNewHighScore ? '0 0 16px rgba(251, 191, 36, 0.3)' : undefined,
            }}
          >
            {isNewHighScore && (
              <span
                style={{
                  display: 'inline-block',
                  background: '#fbbf24',
                  color: '#000',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  letterSpacing: '1.5px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  marginBottom: '4px',
                }}
              >
                ★ NEW BEST SCORE! ★
              </span>
            )}
            <div style={{ fontSize: '0.7rem', color: '#fbbf24', letterSpacing: '1px', fontWeight: 700 }}>
              FINAL SCORE
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fbbf24', fontFamily: "'Plus Jakarta Sans', monospace" }}>
              {Math.floor(gameState.score).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={onPlayAgain} className="btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '12px' }}>
            <span>↺</span> PLAY AGAIN
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowShop(true)}
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '10px',
                borderColor: '#fbbf24',
                color: '#fbbf24',
                background: 'rgba(251, 191, 36, 0.1)',
                fontSize: '0.85rem',
              }}
            >
              <span>🛒</span> BUY GEAR
            </button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '10px',
                borderColor: '#10b981',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.1)',
                fontSize: '0.85rem',
              }}
            >
              <span>🏆</span> RANKS
            </button>
          </div>

          <button onClick={onMainMenu} className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }}>
            MAIN MENU
          </button>
        </div>
      </div>

      {showShop && <ShopModal onClose={() => setShowShop(false)} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
