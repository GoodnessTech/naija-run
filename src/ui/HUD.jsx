import React, { useState, useEffect, useRef } from 'react';
import { gameState, GAME_STATUS } from '../game/core/GameState';
import { gameAudio } from '../game/core/GameAudio';

export function HUD({ onPause }) {
  const [snapshot, setSnapshot] = useState(gameState.getSnapshot());
  const [showTouchButtons, setShowTouchButtons] = useState(false);
  const [nairaDelta, setNairaDelta] = useState(null);
  const [nairaDeltaKey, setNairaDeltaKey] = useState(0);

  // Dedicated single-notification queue system
  // Priority: 3 = HIGH (environment transition, downed), 2 = MEDIUM (speed surge, 2x, near-miss), 1 = LOW (streak, small bonus)
  const [activeNotification, setActiveNotification] = useState(null);
  const notificationQueue = useRef([]);
  const notifTimeout = useRef(null);
  const prevEnvRef = useRef(snapshot.biomeDisplayName);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setShowTouchButtons(true);
    }

    let prevCash = gameState.cash;
    const unsubscribe = gameState.subscribe((snap) => {
      setSnapshot(snap);

      // Lightweight floating Naira pickup delta indicator (+₦500)
      if (snap.cash > prevCash) {
        const diff = snap.cash - prevCash;
        prevCash = snap.cash;
        setNairaDelta(diff);
        setNairaDeltaKey((k) => k + 1);
        setTimeout(() => setNairaDelta(null), 220); // ~0.2s duration!
      }

      // Check environment transition
      if (snap.biomeDisplayName && snap.biomeDisplayName !== prevEnvRef.current && snap.distance > 15) {
        prevEnvRef.current = snap.biomeDisplayName;
        queueNotification({
          text: `🌲 ${snap.biomeDisplayName}`,
          priority: 3,
          duration: 750, // 0.75s for environment transition
          theme: 'env'
        });
      }

      // Check alert messages from GameState (speed surges, near misses, witches)
      if (snap.alertMessage) {
        const msg = snap.alertMessage;
        gameState.alertMessage = ''; // Consume immediately to prevent duplicate stacking
        const priority = msg.includes('WITCH') || msg.includes('DOWN') ? 3 : msg.includes('SPEED') || msg.includes('NEAR MISS') ? 2 : 1;
        const duration = priority === 3 ? 650 : priority === 2 ? 300 : 220; // 0.15s - 0.3s for minor events!
        queueNotification({
          text: msg,
          priority,
          duration,
          theme: priority === 3 ? 'danger' : 'accent'
        });
      }
    });
    return unsubscribe;
  }, []);

  // Queue dispatcher: ensures ONLY ONE notification appears at a time, never stacks vertically
  const queueNotification = (notif) => {
    // If higher priority than currently active, interrupt immediately
    if (activeNotification && notif.priority < activeNotification.priority) {
      return; // Drop low priority if high is playing
    }

    if (notifTimeout.current) {
      clearTimeout(notifTimeout.current);
    }

    setActiveNotification(notif);
    notifTimeout.current = setTimeout(() => {
      setActiveNotification(null);
    }, notif.duration);
  };

  const handleToggleSound = () => gameState.toggleSound();
  const handleToggleMusic = () => gameState.toggleMusic();

  // Guardian danger indicator styling
  const strikes = snapshot.strikes;
  const phase = snapshot.chaserPhase || 1;
  const gDist = snapshot.guardianDistance;

  let dangerColor = '#19B66B';
  let dangerTag = 'DISTANT';
  if (strikes >= 2 || phase >= 5) {
    dangerColor = '#d92550';
    dangerTag = 'EXTREME DANGER';
  } else if (strikes === 1 || phase === 4) {
    dangerColor = '#ea580c';
    dangerTag = 'PURSUIT';
  } else if (phase === 3) {
    dangerColor = '#d97706';
    dangerTag = 'CLOSING IN';
  } else if (phase === 2) {
    dangerColor = '#2F6FB7';
    dangerTag = 'LURKING';
  }

  return (
    <div
      className="ui-layer"
      style={{
        padding: '12px 16px',
        justifyContent: 'space-between',
        pointerEvents: 'none', // Ensure clicks pass cleanly through empty areas
      }}
    >
      {/* ==========================================
          TOP PERMANENT HUD BAR (Compact, Minimal, Unobtrusive)
          ========================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {/* ROW 1: PRIMARY STATS (Distance, Naira, Score, Audio Controls) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* Left: Essential Gameplay Numbers */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* DISTANCE */}
            <div
              className="glass-panel"
              style={{
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.88)',
              }}
            >
              <span style={{ fontSize: '0.60rem', color: '#5f6368', fontWeight: 800 }}>DIST</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#202124', fontFamily: "var(--font-sf-display)" }}>
                {snapshot.distance}<span style={{ fontSize: '0.65rem', color: '#5f6368', marginLeft: '1px' }}>m</span>
              </span>
            </div>

            {/* NAIRA WITH FLOATING DELTA INDICATOR */}
            <div
              className="glass-panel"
              style={{
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px',
                background: '#EAF8F0',
                border: '1px solid rgba(25, 182, 107, 0.4)',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '0.60rem', color: '#19B66B', fontWeight: 800 }}>NAIRA</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#19B66B', fontFamily: "var(--font-sf-display)" }}>
                ₦{snapshot.cash.toLocaleString()}
              </span>

              {/* Tiny Floating Delta (+₦100, +₦500) for ~0.18s */}
              {nairaDelta && (
                <span
                  key={nairaDeltaKey}
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    right: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    color: '#10b981',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '1px 5px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                    animation: 'floatUpFade 0.22s ease-out forwards',
                    pointerEvents: 'none',
                  }}
                >
                  +₦{nairaDelta.toLocaleString()}
                </span>
              )}
            </div>

            {/* SCORE */}
            <div
              className="glass-panel"
              style={{
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.88)',
              }}
            >
              <span style={{ fontSize: '0.60rem', color: '#2F6FB7', fontWeight: 800 }}>SCORE</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#2F6FB7', fontFamily: "var(--font-sf-display)" }}>
                {snapshot.score.toLocaleString()}
              </span>
            </div>

            {/* NAIRA STREAK INLINE BADGE (Discreet small pill) */}
            {snapshot.nairaStreak >= 3 && (
              <div
                style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: '#19B66B',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  fontFamily: "var(--font-sf-display)",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  boxShadow: '0 2px 8px rgba(25, 182, 107, 0.35)',
                }}
              >
                <span>🔥</span>
                <span>x{snapshot.nairaStreak}</span>
              </div>
            )}
          </div>

          {/* Right: Audio Toggles & Pause Button */}
          <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }} className="ui-interactive">
            <button
              onClick={handleToggleMusic}
              className="btn-icon"
              title={snapshot.isMusicOn ? 'Mute Music' : 'Enable Music'}
              aria-label="Toggle Music"
              style={{ width: '32px', height: '32px', fontSize: '14px', color: snapshot.isMusicOn ? '#19B66B' : '#5f6368' }}
            >
              {snapshot.isMusicOn ? '🎵' : '🔇'}
            </button>

            <button
              onClick={handleToggleSound}
              className="btn-icon"
              title={snapshot.isSoundOn ? 'Mute Sound FX' : 'Enable Sound FX'}
              aria-label="Toggle Sound"
              style={{ width: '32px', height: '32px', fontSize: '14px', color: snapshot.isSoundOn ? '#19B66B' : '#5f6368' }}
            >
              {snapshot.isSoundOn ? '🔊' : '🔈'}
            </button>

            <button
              onClick={onPause}
              className="btn-icon"
              title="Pause Game (P)"
              aria-label="Pause Game"
              style={{ width: '32px', height: '32px', fontSize: '14px' }}
            >
              ⏸
            </button>
          </div>
        </div>

        {/* ROW 2: SECONDARY ROW (Speed, Zone, Chaser status, Buffs) */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* SPEED */}
          <div
            className="glass-panel"
            style={{
              padding: '3px 8px',
              fontSize: '0.70rem',
              fontWeight: 800,
              color: snapshot.isSpeedBurstActive ? '#0284c7' : '#374151',
              background: snapshot.isSpeedBurstActive ? '#e0f2fe' : 'rgba(255, 255, 255, 0.75)',
            }}
          >
            ⚡ {snapshot.speed} m/s
          </div>

          {/* ZONE */}
          <div
            className="glass-panel"
            style={{
              padding: '3px 8px',
              fontSize: '0.70rem',
              fontWeight: 800,
              color: '#4b5563',
              background: 'rgba(255, 255, 255, 0.75)',
            }}
          >
            📍 {snapshot.biomeDisplayName}
          </div>

          {/* CHASER THREAT TAG (Compact 1-line tag, replaces large danger box!) */}
          <div
            style={{
              padding: '3px 8px',
              borderRadius: '8px',
              background: strikes >= 2 ? '#FFF0F3' : 'rgba(255, 255, 255, 0.75)',
              border: `1px solid ${dangerColor}`,
              color: dangerColor,
              fontSize: '0.68rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{phase >= 4 ? '👹' : phase === 3 ? '⚠️' : '🌲'}</span>
            <span>{dangerTag} ({gDist.toFixed(0)}m)</span>
          </div>

          {/* ACTIVE 2X MULTIPLIER */}
          {snapshot.pointMultiplier > 1 && (
            <div
              style={{
                padding: '3px 8px',
                borderRadius: '8px',
                background: '#EAF8F0',
                border: '1px solid #19B66B',
                color: '#19B66B',
                fontSize: '0.68rem',
                fontWeight: 900,
              }}
            >
              ⚡ 2X ({snapshot.multiplierTimer}s)
            </div>
          )}

          {/* ACTIVE SHIELD */}
          {snapshot.remainingShields > 0 && (
            <div
              style={{
                padding: '3px 8px',
                borderRadius: '8px',
                background: '#eff6ff',
                border: '1px solid #2F6FB7',
                color: '#2F6FB7',
                fontSize: '0.68rem',
                fontWeight: 900,
              }}
            >
              🛡️ {snapshot.remainingShields}
            </div>
          )}
        </div>

        {/* ==========================================
            DEDICATED COMPACT TOP NOTIFICATION PILL
            - Under permanent HUD
            - Minimal vertical space (26px height)
            - Short duration (0.15s - 0.75s)
            - Exactly ONE at a time
            - ZERO screen blocking of character or running path!
            ========================================== */}
        {activeNotification && (
          <div
            style={{
              alignSelf: 'center',
              marginTop: '4px',
              padding: '4px 14px',
              borderRadius: '20px',
              background:
                activeNotification.theme === 'danger'
                  ? 'rgba(217, 37, 80, 0.94)'
                  : activeNotification.theme === 'env'
                  ? 'rgba(15, 23, 42, 0.92)'
                  : 'rgba(25, 182, 107, 0.94)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 800,
              fontFamily: 'var(--font-sf-display)',
              letterSpacing: '0.3px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
              pointerEvents: 'none',
              animation: 'quickFadePop 0.15s ease-out',
              maxWidth: '85%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activeNotification.text}
          </div>
        )}
      </div>

      {/* ==========================================
          BOTTOM MOBILE TOUCH CONTROLS
          ========================================== */}
      {showTouchButtons && (
        <div
          className="ui-interactive"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            paddingBottom: '8px',
            pointerEvents: 'auto',
          }}
        >
          {/* Steering Controls (Left & Right) */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => window.__naija_lane && window.__naija_lane(-1)}
              style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.92)',
                border: '1px solid rgba(0, 0, 0, 0.10)',
                color: '#202124',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(32, 33, 36, 0.15)',
                cursor: 'pointer',
              }}
              aria-label="Steer Left"
            >
              ◀
            </button>
            <button
              onClick={() => window.__naija_lane && window.__naija_lane(1)}
              style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.92)',
                border: '1px solid rgba(0, 0, 0, 0.10)',
                color: '#202124',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(32, 33, 36, 0.15)',
                cursor: 'pointer',
              }}
              aria-label="Steer Right"
            >
              ▶
            </button>
          </div>

          {/* Action Controls (Slide & Jump) */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => window.__naija_slide && window.__naija_slide()}
              style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                background: '#FFF0F3',
                border: '1.5px solid rgba(217, 37, 80, 0.35)',
                color: '#d92550',
                fontSize: '11px',
                fontWeight: 900,
                fontFamily: "var(--font-sf-display)",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(217, 37, 80, 0.15)',
                cursor: 'pointer',
              }}
              aria-label="Slide"
            >
              SLIDE
            </button>
            <button
              onClick={() => window.__naija_jump && window.__naija_jump()}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#19B66B',
                border: 'none',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 900,
                fontFamily: "var(--font-sf-display)",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(25, 182, 107, 0.4)',
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
