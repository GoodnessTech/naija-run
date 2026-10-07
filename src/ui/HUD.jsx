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

  // Strict enforcement: Alert banner and messages stay on screen for exactly 1.0s!
  useEffect(() => {
    if (snapshot.alertMessage) {
      const bannerTimer = setTimeout(() => {
        if (gameState.alertMessage) {
          gameState.alertMessage = '';
          gameState.notify(true);
        }
      }, 1000); // Exactly 1 second
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

  // Box alert of SAFE and danger status changes only stays for exactly 1 second on screen!
  const [showDangerBox, setShowDangerBox] = useState(true);

  useEffect(() => {
    setShowDangerBox(true);
    const boxTimer = setTimeout(() => {
      setShowDangerBox(false);
    }, 1000); // Exactly 1.0 second
    return () => clearTimeout(boxTimer);
  }, [dangerStatus, strikes]);

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
            <span style={{ fontSize: '0.65rem', color: '#5f6368', letterSpacing: '0.8px', fontWeight: 800 }}>
              DISTANCE
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', fontFamily: "var(--font-sf-display)" }}>
              {snapshot.distance} <span style={{ fontSize: '0.75rem', color: '#5f6368' }}>m</span>
            </span>
          </div>

          {/* ₦1,000 Cash Balance (with pop animation on pickup) */}
          <div
            className="glass-panel"
            style={{
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '125px',
              border: cashPop ? '2px solid #19B66B' : '1px solid rgba(25, 182, 107, 0.35)',
              background: '#EAF8F0',
              transform: cashPop ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
              boxShadow: cashPop ? '0 4px 20px rgba(25, 182, 107, 0.4)' : undefined,
            }}
          >
            <span style={{ fontSize: '0.65rem', color: '#19B66B', letterSpacing: '0.8px', fontWeight: 800 }}>
              NAIRA BALANCE
            </span>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#19B66B',
                fontFamily: "var(--font-sf-display)",
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
            <span style={{ fontSize: '0.65rem', color: '#2F6FB7', letterSpacing: '0.8px', fontWeight: 800 }}>
              SCORE
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2F6FB7', fontFamily: "var(--font-sf-display)" }}>
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
                border: '1.5px solid #2F6FB7',
                background: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(47, 111, 183, 0.25)',
              }}
            >
              <span style={{ fontSize: '0.65rem', color: '#2F6FB7', letterSpacing: '0.8px', fontWeight: 800 }}>
                SHIELD
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2F6FB7', fontFamily: "var(--font-sf-display)" }}>
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
            background: strikes >= 2 ? '#FFF0F3' : '#FFFFFF',
            border: strikes >= 2 ? '2px solid #d92550' : '2px solid #2F6FB7',
            borderRadius: '16px',
            padding: '12px 28px',
            color: strikes >= 2 ? '#d92550' : '#202124',
            fontWeight: 800,
            fontSize: '1rem',
            fontFamily: "var(--font-sf-display)",
            letterSpacing: '0.5px',
            boxShadow: '0 12px 36px rgba(87, 80, 116, 0.35)',
            textAlign: 'center',
            maxWidth: '90%',
          }}
        >
          {snapshot.alertMessage}
        </div>
      )}

      {/* Witch / Guardian Danger Gauge Box Alert - Only stays for 1 second! */}
      <div
        style={{
          alignSelf: 'center',
          maxWidth: '380px',
          width: '100%',
          marginTop: showDangerBox ? '6px' : '0px',
          opacity: showDangerBox ? 1 : 0,
          transform: showDangerBox ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease, max-height 0.3s ease, margin 0.25s ease',
          maxHeight: showDangerBox ? '80px' : '0px',
          overflow: 'hidden',
          pointerEvents: showDangerBox ? 'auto' : 'none',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '8px 14px',
            border: strikes >= 2 ? '1.5px solid #d92550' : strikes === 1 ? '1.5px solid #2F6FB7' : '1px solid rgba(0, 0, 0, 0.08)',
            background: strikes >= 2 ? '#FFF0F3' : '#FFFFFF',
            boxShadow: strikes >= 2 ? '0 8px 24px rgba(217, 37, 80, 0.2)' : '0 8px 24px rgba(32, 33, 36, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                color: strikes >= 2 ? '#d92550' : strikes === 1 ? '#2F6FB7' : '#19B66B',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: "var(--font-sf-text)",
              }}
            >
              <span>{strikes >= 2 ? '👹' : strikes === 1 ? '⚠️' : '🌲'}</span>
              <span>{dangerStatus}</span>
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                color: strikes >= 2 ? '#d92550' : strikes === 1 ? '#2F6FB7' : '#19B66B',
                fontFamily: "var(--font-sf-display)",
              }}
            >
              {snapshot.guardianDistance.toFixed(1)}m
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(0, 0, 0, 0.06)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${dangerPercent}%`,
                height: '100%',
                background: strikes >= 2 ? '#d92550' : strikes === 1 ? '#2F6FB7' : '#19B66B',
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
                background: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                color: '#202124',
                fontSize: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(32, 33, 36, 0.15)',
                cursor: 'pointer',
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
                background: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                color: '#202124',
                fontSize: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(32, 33, 36, 0.15)',
                cursor: 'pointer',
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
                background: '#FFF0F3',
                border: '1.5px solid rgba(217, 37, 80, 0.3)',
                color: '#d92550',
                fontSize: '12px',
                fontWeight: 900,
                fontFamily: "var(--font-sf-display)",
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(217, 37, 80, 0.15)',
                cursor: 'pointer',
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
                background: '#19B66B',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 900,
                fontFamily: "var(--font-sf-display)",
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(25, 182, 107, 0.4)',
                cursor: 'pointer',
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
