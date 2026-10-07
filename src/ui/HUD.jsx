import React, { useState, useEffect } from 'react';
import { gameState, GAME_STATUS } from '../game/core/GameState';
import { gameAudio } from '../game/core/GameAudio';

export function HUD({ onPause }) {
  const [snapshot, setSnapshot] = useState(gameState.getSnapshot());
  const [showTouchButtons, setShowTouchButtons] = useState(false);
  const [cashPop, setCashPop] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setShowTouchButtons(true);
    }

    let prevCash = gameState.cash;
    const unsubscribe = gameState.subscribe((snap) => {
      setSnapshot(snap);
      if (snap.cash > prevCash) {
        prevCash = snap.cash;
        setCashPop(true);
        setTimeout(() => setCashPop(false), 280);
      }
    });
    return unsubscribe;
  }, []);

  // Strict enforcement: Alert banner MUST NOT stay on screen for more than 0.5s!
  useEffect(() => {
    if (snapshot.alertMessage) {
      const bannerTimer = setTimeout(() => {
        if (gameState.alertMessage) {
          gameState.alertMessage = '';
          gameState.notify(true);
        }
      }, 500);
      return () => clearTimeout(bannerTimer);
    }
  }, [snapshot.alertMessage]);

  const handleToggleSound = () => {
    const muted = gameState.toggleMute();
    gameAudio.setMuted(muted);
  };

  // Guardian danger indicator styling
  const gDist = snapshot.guardianDistance;
  const strikes = snapshot.strikes;
  let dangerColor = '#10b981';
  let dangerStatus = 'SAFE';

  if (strikes >= 2 || gDist < 5.0) {
    dangerColor = '#ef4444';
    dangerStatus = 'WITCH ON YOUR HEELS! (2/3)';
  } else if (strikes === 1 || gDist < 11.0) {
    dangerColor = '#f59e0b';
    dangerStatus = 'WITCH ALERTED! (1/3)';
  }

  const dangerPercent = Math.max(0, Math.min(100, Math.round(((18.0 - gDist) / 16.0) * 100)));

  return (
    <div className="ui-layer" style={{ padding: '16px 20px', justifyContent: 'space-between' }}>
      {/* Top Header: Distance, Cash, Score & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        {/* Left: Distance & Cash stats */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Distance */}
          <div
            className="glass-panel"
            style={{
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '95px',
            }}
          >
            <span style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '1px', fontWeight: 700 }}>
              DISTANCE
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', fontFamily: "'Plus Jakarta Sans', monospace" }}>
              {snapshot.distance} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>m</span>
            </span>
          </div>

          {/* ₦1,000 Cash Balance (with pop animation on pickup) */}
          <div
            className="glass-panel"
            style={{
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '120px',
              border: cashPop ? '2px solid #34d399' : '1px solid rgba(16, 185, 129, 0.4)',
              transform: cashPop ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
              boxShadow: cashPop ? '0 0 20px rgba(16, 185, 129, 0.7)' : undefined,
            }}
          >
            <span style={{ fontSize: '0.65rem', color: '#34d399', letterSpacing: '1px', fontWeight: 700 }}>
              NAIRA BALANCE
            </span>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#10b981',
                fontFamily: "'Plus Jakarta Sans', monospace",
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>₦</span>{snapshot.cash.toLocaleString()}
            </span>
          </div>

          {/* Total Score */}
          <div
            className="glass-panel"
            style={{
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '100px',
            }}
          >
            <span style={{ fontSize: '0.65rem', color: '#fbbf24', letterSpacing: '1px', fontWeight: 700 }}>
              SCORE
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fbbf24', fontFamily: "'Plus Jakarta Sans', monospace" }}>
              {snapshot.score.toLocaleString()}
            </span>
          </div>

          {/* Active Vehicle Shield (Danfo Bus Perk) */}
          {snapshot.remainingShields > 0 && (
            <div
              className="glass-panel"
              style={{
                padding: '8px 14px',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #38bdf8',
                background: 'rgba(56, 189, 248, 0.15)',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
              }}
            >
              <span style={{ fontSize: '0.65rem', color: '#38bdf8', letterSpacing: '1px', fontWeight: 800 }}>
                SHIELD
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8', fontFamily: "'Plus Jakarta Sans', monospace" }}>
                🛡️ {snapshot.remainingShields}
              </span>
            </div>
          )}
        </div>

        {/* Right: Sound & Pause */}
        <div style={{ display: 'flex', gap: '8px' }} className="ui-interactive">
          <button
            onClick={handleToggleSound}
            className="btn-icon"
            title={snapshot.isMuted ? 'Unmute' : 'Mute'}
            aria-label="Sound"
          >
            {snapshot.isMuted ? '🔇' : '🔊'}
          </button>

          <button
            onClick={onPause}
            className="btn-icon"
            title="Pause Game (P)"
            aria-label="Pause Game"
          >
            ⏸
          </button>
        </div>
      </div>

      {/* Center Strike Alert Banner (When Hit / Witch Attention) */}
      {snapshot.alertMessage && (
        <div
          style={{
            alignSelf: 'center',
            background: strikes >= 2 ? 'rgba(185, 28, 28, 0.9)' : 'rgba(217, 119, 6, 0.9)',
            border: '2px solid #ffffff',
            borderRadius: '12px',
            padding: '10px 24px',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '1rem',
            letterSpacing: '1px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
            animation: 'pulse-guardian-glow 1s infinite ease-in-out',
            textAlign: 'center',
            maxWidth: '90%',
          }}
        >
          {snapshot.alertMessage}
        </div>
      )}

      {/* Witch / Guardian Danger Gauge Bar */}
      <div
        style={{
          alignSelf: 'center',
          maxWidth: '380px',
          width: '100%',
          marginTop: '6px',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '8px 14px',
            borderColor: strikes >= 2 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(0, 135, 81, 0.35)',
            boxShadow: strikes >= 2 ? '0 0 20px rgba(239, 68, 68, 0.6)' : undefined,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '1px',
                color: dangerColor,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{strikes >= 2 ? '👹' : '🌲'}</span>
              <span>{dangerStatus}</span>
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: dangerColor,
                fontFamily: "'Plus Jakarta Sans', monospace",
              }}
            >
              {snapshot.guardianDistance.toFixed(1)}m
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${dangerPercent}%`,
                height: '100%',
                background: dangerColor,
                borderRadius: '999px',
                transition: 'width 0.2s ease, background 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar: Touch screen control buttons */}
      {showTouchButtons && (
        <div
          className="ui-interactive"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            paddingBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.__naija_lane && window.__naija_lane(-1)}
              style={{
                width: '62px',
                height: '62px',
                borderRadius: '50%',
                background: 'rgba(15, 35, 22, 0.8)',
                border: '2px solid rgba(0, 135, 81, 0.6)',
                color: '#fff',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
              }}
              aria-label="Steer Left"
            >
              ◀
            </button>
            <button
              onClick={() => window.__naija_lane && window.__naija_lane(1)}
              style={{
                width: '62px',
                height: '62px',
                borderRadius: '50%',
                background: 'rgba(15, 35, 22, 0.8)',
                border: '2px solid rgba(0, 135, 81, 0.6)',
                color: '#fff',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
              }}
              aria-label="Steer Right"
            >
              ▶
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.__naija_slide && window.__naija_slide()}
              style={{
                width: '62px',
                height: '62px',
                borderRadius: '50%',
                background: 'rgba(40, 20, 15, 0.8)',
                border: '2px solid rgba(200, 75, 49, 0.6)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
              }}
              aria-label="Slide"
            >
              SLIDE
            </button>
            <button
              onClick={() => window.__naija_jump && window.__naija_jump()}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #008751 0%, #065f38 100%)',
                border: '2px solid #34d399',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(0, 135, 81, 0.6)',
              }}
              aria-label="Jump"
            >
              JUMP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
