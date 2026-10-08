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
      ? 'The Supernatural Forest Witch caught up!'
      : 'Struck down by highway obstacle!';

  return (
    <div
      className="ui-layer ui-interactive"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(87, 80, 116, 0.88)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 50,
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '28px 24px',
          textAlign: 'center',
          borderRadius: '24px',
          maxHeight: '94vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          color: '#202124',
          boxShadow: '0 24px 60px rgba(87, 80, 116, 0.35)',
          fontFamily: 'var(--font-sf-text)',
          animation: 'countdown-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        {/* Skull Emblem */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: '#FFF0F3',
            color: '#c2185b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 10px',
          }}
        >
          💀
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-sf-display)',
            fontSize: '1.9rem',
            fontWeight: 900,
            color: '#202124',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          RUN OVER
        </h2>

        <p
          style={{
            fontSize: '0.85rem',
            color: '#5f6368',
            marginBottom: '18px',
            fontWeight: 600,
          }}
        >
          {reasonText}
        </p>

        {/* Stats Grid: SCORE, DISTANCE, NAIRA, BEST SCORE */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '18px',
          }}
        >
          {/* SCORE */}
          <div
            style={{
              background: '#f8f9fa',
              border: isNewHighScore ? '1.5px solid #2F6FB7' : '1px solid #e8eaed',
              borderRadius: '16px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '0.68rem', color: isNewHighScore ? '#2F6FB7' : '#5f6368', letterSpacing: '0.8px', fontWeight: 800 }}>
              {isNewHighScore ? '★ NEW BEST SCORE ★' : 'SCORE'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isNewHighScore ? '#2F6FB7' : '#202124', fontFamily: 'var(--font-sf-display)', marginTop: '2px' }}>
              {Math.floor(gameState.score).toLocaleString()}
            </div>
          </div>

          {/* DISTANCE */}
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e8eaed',
              borderRadius: '16px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '0.68rem', color: '#5f6368', letterSpacing: '0.8px', fontWeight: 800 }}>
              DISTANCE
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#202124', fontFamily: 'var(--font-sf-display)', marginTop: '2px' }}>
              {Math.floor(gameState.distance).toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#5f6368' }}>m</span>
            </div>
          </div>

          {/* NAIRA */}
          <div
            style={{
              background: '#EAF8F0',
              border: '1px solid #d5f2e1',
              borderRadius: '16px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '0.68rem', color: '#19B66B', letterSpacing: '0.8px', fontWeight: 800 }}>
              NAIRA
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#19B66B', fontFamily: 'var(--font-sf-display)', marginTop: '2px' }}>
              ₦{gameState.cash.toLocaleString()}
            </div>
          </div>

          {/* BEST SCORE */}
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e8eaed',
              borderRadius: '16px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '0.68rem', color: '#5f6368', letterSpacing: '0.8px', fontWeight: 800 }}>
              BEST SCORE
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2F6FB7', fontFamily: 'var(--font-sf-display)', marginTop: '2px' }}>
              {gameState.highScore.toLocaleString()}
            </div>
          </div>

          {/* Lifetime Vault Total */}
          <div
            style={{
              gridColumn: '1 / -1',
              background: '#EAF8F0',
              border: '1px solid #d5f2e1',
              borderRadius: '16px',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.66rem', color: '#19B66B', fontWeight: 800 }}>BANKED TO VAULT</div>
              <div style={{ fontSize: '0.72rem', color: '#5f6368' }}>Total Career Wealth</div>
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#19B66B',
                fontFamily: 'var(--font-sf-display)',
              }}
            >
              ₦{profile.wallet.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(gameState.cash >= 1000 || profile.wallet >= 1000 || gameState.score >= 1500) && (
            <button
              onClick={() => {
                if (gameState.cash >= 1000 || profile.wallet >= 1000) {
                  gameState.reviveWithNaira();
                } else {
                  gameState.reviveWithPoints();
                }
              }}
              className="btn-primary"
              style={{
                width: '100%',
                fontSize: '1rem',
                padding: '14px',
                background: '#19B66B',
                boxShadow: '0 6px 20px rgba(25, 182, 107, 0.4)',
              }}
            >
              <span>✨</span> REVIVE & RESUME (₦1k / 1.5k pts)
            </button>
          )}

          {/* RUN AGAIN */}
          <button
            onClick={onPlayAgain}
            className="btn-blue"
            style={{
              width: '100%',
              fontSize: '1.05rem',
              padding: '14px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            <span>↺</span> RUN AGAIN
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowShop(true)}
              className="glass-panel"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                color: '#202124',
              }}
            >
              <span>🛒</span> GARAGE
            </button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="glass-panel"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                color: '#19B66B',
                background: '#EAF8F0',
                border: '1px solid rgba(25, 182, 107, 0.3)',
              }}
            >
              <span>🏆</span> RANKS
            </button>
          </div>

          {/* MENU */}
          <button
            onClick={onMainMenu}
            style={{
              width: '100%',
              fontSize: '0.9rem',
              padding: '12px',
              background: '#f8f9fa',
              color: '#5f6368',
              border: '1px solid #dadce0',
              borderRadius: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.5px'
            }}
          >
            MENU
          </button>
        </div>
      </div>

      {showShop && <ShopModal onClose={() => setShowShop(false)} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
