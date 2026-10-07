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
      ? 'The Forest Witch has caught you!'
      : 'Struck by road hazard!';

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
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
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
        }}
      >
        {/* Skull Icon in Soft Pink Bubble */}
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
            margin: '0 auto 12px',
          }}
        >
          💀
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-sf-display)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#202124',
            letterSpacing: '-0.5px',
            marginBottom: '4px',
          }}
        >
          Game Over
        </h2>

        <p
          style={{
            fontSize: '0.85rem',
            color: '#5f6368',
            marginBottom: '20px',
            fontWeight: 600,
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
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e8eaed',
              borderRadius: '16px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '0.68rem', color: '#5f6368', letterSpacing: '0.5px', fontWeight: 700 }}>
              DISTANCE RUN
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#202124', fontFamily: 'var(--font-sf-display)', marginTop: '2px' }}>
              {Math.floor(gameState.distance)} <span style={{ fontSize: '0.75rem', color: '#5f6368' }}>m</span>
            </div>
          </div>

          <div
            style={{
              background: '#EAF8F0',
              border: '1px solid #d5f2e1',
              borderRadius: '16px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '0.68rem', color: '#19B66B', letterSpacing: '0.5px', fontWeight: 700 }}>
              CASH THIS RUN
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#19B66B', fontFamily: 'var(--font-sf-display)', marginTop: '2px' }}>
              +₦{gameState.cash.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              gridColumn: '1 / -1',
              background: '#EAF8F0',
              border: '1px solid #d5f2e1',
              borderRadius: '16px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.68rem', color: '#19B66B', fontWeight: 800 }}>BANKED TO VAULT</div>
              <div style={{ fontSize: '0.76rem', color: '#5f6368' }}>Lifetime Total Wealth</div>
            </div>
            <div
              style={{
                fontSize: '1.3rem',
                fontWeight: 900,
                color: '#19B66B',
                fontFamily: 'var(--font-sf-display)',
              }}
            >
              ₦{profile.wallet.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              gridColumn: '1 / -1',
              background: isNewHighScore ? '#eef4fb' : '#f8f9fa',
              border: isNewHighScore ? '1.5px solid #2F6FB7' : '1px solid #e8eaed',
              borderRadius: '16px',
              padding: '14px',
            }}
          >
            {isNewHighScore && (
              <span
                style={{
                  display: 'inline-block',
                  background: '#2F6FB7',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  marginBottom: '6px',
                }}
              >
                ★ NEW HIGH SCORE! ★
              </span>
            )}
            <div style={{ fontSize: '0.72rem', color: isNewHighScore ? '#2F6FB7' : '#5f6368', letterSpacing: '0.5px', fontWeight: 700 }}>
              FINAL SCORE
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: isNewHighScore ? '#2F6FB7' : '#202124', fontFamily: 'var(--font-sf-display)', marginTop: '2px' }}>
              {Math.floor(gameState.score).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={onPlayAgain} className="btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '14px' }}>
            <span>↺</span> PLAY AGAIN
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowShop(true)}
              className="btn-blue"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '0.88rem',
              }}
            >
              <span>🛒</span> BUY GEAR
            </button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '0.88rem',
              }}
            >
              <span>🏆</span> RANKS
            </button>
          </div>

          <button
            onClick={onMainMenu}
            style={{
              width: '100%',
              fontSize: '0.88rem',
              padding: '12px',
              background: '#f8f9fa',
              color: '#5f6368',
              border: '1px solid #dadce0',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            MAIN MENU
          </button>
        </div>
      </div>

      {showShop && <ShopModal onClose={() => setShowShop(false)} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
