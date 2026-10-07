import React, { useState, useEffect } from 'react';
import { gameState } from '../game/core/GameState';
import { userProfile } from '../game/progression/UserProfileManager';

export function ReviveModal({ onReviveSuccess, onDecline }) {
  const [snapshot, setSnapshot] = useState(gameState.getSnapshot());
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    const unsub = gameState.subscribe((snap) => setSnapshot(snap));
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onDecline) onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [onDecline]);

  const profile = userProfile.getSnapshot();
  const totalNairaAvailable = snapshot.cash + profile.wallet;
  const canNaira = totalNairaAvailable >= 1000;
  const canPoints = snapshot.score >= 1500;

  const handleReviveNaira = () => {
    const success = gameState.reviveWithNaira();
    if (success && onReviveSuccess) {
      onReviveSuccess();
    }
  };

  const handleRevivePoints = () => {
    const success = gameState.reviveWithPoints();
    if (success && onReviveSuccess) {
      onReviveSuccess();
    }
  };

  const handleDecline = () => {
    gameState.declineRevive();
    if (onDecline) onDecline();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 75 }}>
      <div
        className="glass-panel"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '30px 24px',
          textAlign: 'center',
          borderRadius: '24px',
          background: '#FFFFFF',
          boxShadow: '0 24px 60px rgba(87, 80, 116, 0.4)',
        }}
      >
        {/* Pulsing Witch Danger Crest */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: '#FFF0F3',
            color: '#d92550',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 12px',
          }}
        >
          👹
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-sf-display)',
            fontSize: '1.8rem',
            fontWeight: 900,
            color: '#202124',
            letterSpacing: '-0.5px',
            marginBottom: '4px',
          }}
        >
          RUNNER DOWN!
        </h2>

        <p
          style={{
            fontSize: '0.84rem',
            color: '#5f6368',
            marginBottom: '16px',
            lineHeight: 1.5,
          }}
        >
          The Forest Witch struck! Revive now with a <strong>3-second Golden Shield</strong> to continue your run!
        </p>

        {/* Countdown Bar */}
        <div
          style={{
            background: '#FFF0F3',
            border: '1.5px solid rgba(217, 37, 80, 0.3)',
            borderRadius: '14px',
            padding: '10px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d92550' }}>
            DECISION WINDOW:
          </span>
          <span
            style={{
              fontSize: '1.3rem',
              fontWeight: 900,
              color: '#d92550',
              fontFamily: 'var(--font-sf-display)',
            }}
          >
            {countdown}s
          </span>
        </div>

        {/* Action Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Option 1: Revive with Naira */}
          <button
            onClick={handleReviveNaira}
            disabled={!canNaira}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.95rem',
              opacity: canNaira ? 1 : 0.45,
              cursor: canNaira ? 'pointer' : 'not-allowed',
            }}
          >
            <span>💚</span> REVIVE FOR ₦1,000
          </button>
          <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '-6px', marginBottom: '4px' }}>
            Available Naira: ₦{totalNairaAvailable.toLocaleString()}
          </div>

          {/* Option 2: Revive with Points */}
          <button
            onClick={handleRevivePoints}
            disabled={!canPoints}
            className="btn-blue"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.95rem',
              opacity: canPoints ? 1 : 0.45,
              cursor: canPoints ? 'pointer' : 'not-allowed',
            }}
          >
            <span>💎</span> REVIVE FOR 1,500 POINTS
          </button>
          <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '-6px', marginBottom: '8px' }}>
            Current Run Score: {Math.floor(snapshot.score).toLocaleString()} PTS
          </div>

          {/* Option 3: Decline / Give Up */}
          <button
            onClick={handleDecline}
            style={{
              background: '#f8f9fa',
              color: '#5f6368',
              border: '1px solid #dadce0',
              padding: '12px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              marginTop: '4px',
            }}
          >
            Accept Fate & End Run
          </button>
        </div>
      </div>
    </div>
  );
}
