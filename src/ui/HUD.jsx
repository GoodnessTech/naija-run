import React, { useState, useEffect } from 'react';
import { gameState, GAME_STATUS } from '../game/core/GameState';
import { gameAudio } from '../game/core/GameAudio';

export function HUD({ onPause }) {
  const [snapshot, setSnapshot] = useState(gameState.getSnapshot());
  const [showTouchButtons, setShowTouchButtons] = useState(false);
  const [nairaPop, setNairaPop] = useState(false);
  const [currentEnvName, setCurrentEnvName] = useState(snapshot.biomeDisplayName);
  const [envBanner, setEnvBanner] = useState('');

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setShowTouchButtons(true);
    }

    let prevCash = gameState.cash;
    const unsubscribe = gameState.subscribe((snap) => {
      setSnapshot(snap);
      if (snap.cash > prevCash) {
        prevCash = snap.cash;
        setNairaPop(true);
        setTimeout(() => setNairaPop(false), 260);
      }
    });
    return unsubscribe;
  }, []);

  // Environment transition announcement banner
  useEffect(() => {
    if (snapshot.biomeDisplayName && snapshot.biomeDisplayName !== currentEnvName && snapshot.distance > 10) {
      setCurrentEnvName(snapshot.biomeDisplayName);
      setEnvBanner(`📍 ENTERING: ${snapshot.biomeDisplayName}`);
      const t = setTimeout(() => setEnvBanner(''), 2200);
      return () => clearTimeout(t);
    }
  }, [snapshot.biomeDisplayName, currentEnvName, snapshot.distance]);

  // Strict enforcement: Alert banner and messages stay on screen for exactly 1.0s!
  useEffect(() => {
    if (snapshot.alertMessage) {
      const bannerTimer = setTimeout(() => {
        if (gameState.alertMessage) {
          gameState.alertMessage = '';
          gameState.notify(true);
        }
      }, 1000);
      return () => clearTimeout(bannerTimer);
    }
  }, [snapshot.alertMessage]);

  const handleToggleSound = () => {
    gameState.toggleSound();
  };

  const handleToggleMusic = () => {
    gameState.toggleMusic();
  };

  // Guardian danger styling based on 5 phases and strikes
  const gDist = snapshot.guardianDistance;
  const strikes = snapshot.strikes;
  const phase = snapshot.chaserPhase || 1;
  
  let dangerColor = '#19B66B';
  let dangerStatus = snapshot.chaserPhaseTitle || 'DISTANT THREAT';

  if (strikes >= 2 || phase >= 5) {
    dangerColor = '#d92550';
    dangerStatus = 'PHASE 5: EXTREME DANGER!';
  } else if (strikes === 1 || phase === 4) {
    dangerColor = '#ea580c';
    dangerStatus = 'PHASE 4: AGGRESSIVE PURSUIT (1/2 HIT)';
  } else if (phase === 3) {
    dangerColor = '#d97706';
    dangerStatus = 'PHASE 3: CLOSING IN';
  } else if (phase === 2) {
    dangerColor = '#2F6FB7';
    dangerStatus = 'PHASE 2: LURKING IN SHADOWS';
  }

  const dangerPercent = Math.max(0, Math.min(100, Math.round(((22.0 - gDist) / 18.0) * 100)));

  // Box alert stays for 1 second on status change
  const [showDangerBox, setShowDangerBox] = useState(true);

  useEffect(() => {
    setShowDangerBox(true);
    const boxTimer = setTimeout(() => {
      setShowDangerBox(false);
    }, 1000);
    return () => clearTimeout(boxTimer);
  }, [dangerStatus, strikes]);

  return (
    <div className="ui-layer" style={{ padding: '16px 20px', justifyContent: 'space-between' }}>
      {/* Top Header: Distance, Naira, Score & Audio Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        {/* Left: Core Gameplay Stats */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* DISTANCE */}
          <div
            className="glass-panel"
            style={{
              padding: '8px 14px',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '90px',
            }}
          >
            <span style={{ fontSize: '0.62rem', color: '#5f6368', letterSpacing: '0.8px', fontWeight: 800 }}>
              DISTANCE
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', fontFamily: "var(--font-sf-display)" }}>
              {snapshot.distance} <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>m</span>
            </span>
          </div>

          {/* NAIRA (Strictly no coins label!) */}
          <div
            className="glass-panel"
            style={{
              padding: '8px 14px',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '115px',
              border: nairaPop ? '2px solid #19B66B' : '1px solid rgba(25, 182, 107, 0.35)',
              background: '#EAF8F0',
              transform: nairaPop ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
              boxShadow: nairaPop ? '0 4px 20px rgba(25, 182, 107, 0.4)' : undefined,
            }}
          >
            <span style={{ fontSize: '0.62rem', color: '#19B66B', letterSpacing: '0.8px', fontWeight: 800 }}>
              NAIRA
            </span>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#19B66B',
                fontFamily: "var(--font-sf-display)",
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span>₦</span>{snapshot.cash.toLocaleString()}
            </span>
          </div>

          {/* SCORE */}
          <div
            className="glass-panel"
            style={{
              padding: '8px 14px',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '95px',
            }}
          >
            <span style={{ fontSize: '0.62rem', color: '#2F6FB7', letterSpacing: '0.8px', fontWeight: 800 }}>
              SCORE
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2F6FB7', fontFamily: "var(--font-sf-display)" }}>
              {snapshot.score.toLocaleString()}
            </span>
          </div>

          {/* NAIRA STREAK BADGE */}
          {snapshot.nairaStreak >= 3 && (
            <div
              className="glass-panel"
              style={{
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                border: '1.5px solid #19B66B',
                background: '#EAF8F0',
                boxShadow: '0 4px 16px rgba(25, 182, 107, 0.35)',
                animation: 'pulse-naira-glow 0.8s infinite ease-in-out',
              }}
            >
              <span style={{ fontSize: '0.62rem', color: '#19B66B', letterSpacing: '0.8px', fontWeight: 800 }}>
                STREAK
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#19B66B', fontFamily: "var(--font-sf-display)" }}>
                🔥 x{snapshot.nairaStreak}
              </span>
            </div>
          )}

          {/* SPEED */}
          <div
            className="glass-panel"
            style={{
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              background: '#FFFFFF',
            }}
          >
            <span style={{ fontSize: '0.62rem', color: '#5f6368', letterSpacing: '0.8px', fontWeight: 800 }}>
              SPEED
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: snapshot.isSpeedBurstActive ? '#38bdf8' : '#202124', fontFamily: "var(--font-sf-display)" }}>
              {snapshot.speed} <span style={{ fontSize: '0.68rem', color: '#5f6368' }}>m/s</span>
            </span>
          </div>

          {/* ZONE / BIOME BADGE */}
          <div
            className="glass-panel"
            style={{
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              background: snapshot.isTransition ? '#FFF0F3' : '#FFFFFF',
              border: snapshot.isTransition ? '1px solid #ea580c' : undefined,
              transition: 'background 0.3s ease, border-color 0.3s ease',
            }}
          >
            <span style={{ fontSize: '0.62rem', color: snapshot.isTransition ? '#ea580c' : '#5f6368', letterSpacing: '0.8px', fontWeight: 800 }}>
              {snapshot.isTransition ? 'APPROACHING' : 'ZONE'}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 900, color: snapshot.isTransition ? '#ea580c' : '#575074', fontFamily: "var(--font-sf-display)" }}>
              {snapshot.isTransition && snapshot.nextBiomeDisplayName ? snapshot.nextBiomeDisplayName : snapshot.biomeDisplayName}
            </span>
          </div>

          {/* 2X MULTIPLIER ACTIVE */}
          {snapshot.pointMultiplier > 1 && (
            <div
              className="glass-panel"
              style={{
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                border: '1.5px solid #19B66B',
                background: '#EAF8F0',
              }}
            >
              <span style={{ fontSize: '0.62rem', color: '#19B66B', letterSpacing: '0.8px', fontWeight: 800 }}>
                MULTIPLIER
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#19B66B', fontFamily: "var(--font-sf-display)" }}>
                ⚡ {snapshot.pointMultiplier}X ({snapshot.multiplierTimer}s)
              </span>
            </div>
          )}

          {/* ACTIVE SHIELD */}
          {snapshot.remainingShields > 0 && (
            <div
              className="glass-panel"
              style={{
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                border: '1.5px solid #2F6FB7',
                background: '#FFFFFF',
              }}
            >
              <span style={{ fontSize: '0.62rem', color: '#2F6FB7', letterSpacing: '0.8px', fontWeight: 800 }}>
                SHIELD
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#2F6FB7', fontFamily: "var(--font-sf-display)" }}>
                🛡️ {snapshot.remainingShields}
              </span>
            </div>
          )}
        </div>

        {/* Right: Audio Toggles & Pause Button */}
        <div style={{ display: 'flex', gap: '8px' }} className="ui-interactive">
          <button
            onClick={handleToggleMusic}
            className="btn-icon"
            title={snapshot.isMusicOn ? 'Mute Music' : 'Enable Music'}
            aria-label="Toggle Music"
            style={{ color: snapshot.isMusicOn ? '#19B66B' : '#5f6368' }}
          >
            {snapshot.isMusicOn ? '🎵' : '🔇'}
          </button>

          <button
            onClick={handleToggleSound}
            className="btn-icon"
            title={snapshot.isSoundOn ? 'Mute Sound FX' : 'Enable Sound FX'}
            aria-label="Toggle Sound"
            style={{ color: snapshot.isSoundOn ? '#19B66B' : '#5f6368' }}
          >
            {snapshot.isSoundOn ? '🔊' : '🔈'}
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

      {/* Environment Transition Announcement Banner */}
      {envBanner && (
        <div
          style={{
            alignSelf: 'center',
            background: 'linear-gradient(135deg, rgba(32, 33, 36, 0.95), rgba(87, 80, 116, 0.95))',
            border: '2px solid #19B66B',
            borderRadius: '16px',
            padding: '10px 24px',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '1.05rem',
            fontFamily: 'var(--font-sf-display)',
            letterSpacing: '0.8px',
            boxShadow: '0 12px 36px rgba(25, 182, 107, 0.4)',
            textAlign: 'center',
            maxWidth: '90%',
            animation: 'countdown-pop 0.35s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          <span>{envBanner}</span>
          {snapshot.biomeSubtitle && (
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#a7f3d0' }}>
              {snapshot.biomeSubtitle}
            </span>
          )}
        </div>
      )}

      {/* Center Alert Banner (Near Miss, Streaks, Speed Surges, Chaos Events) */}
      {snapshot.alertMessage && (
        <div
          style={{
            alignSelf: 'center',
            background: strikes >= 2 ? '#FFF0F3' : '#FFFFFF',
            border: strikes >= 2 ? '2px solid #d92550' : '2px solid #19B66B',
            borderRadius: '16px',
            padding: '12px 28px',
            color: strikes >= 2 ? '#d92550' : '#202124',
            fontWeight: 800,
            fontSize: '1.05rem',
            fontFamily: "var(--font-sf-display)",
            letterSpacing: '0.5px',
            boxShadow: '0 12px 36px rgba(87, 80, 116, 0.35)',
            textAlign: 'center',
            maxWidth: '90%',
            animation: 'countdown-pop 0.3s ease',
          }}
        >
          {snapshot.alertMessage}
        </div>
      )}

      {/* Chaser Danger Box Gauge - Stays for 1 second on status change */}
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
            border: `1.5px solid ${dangerColor}`,
            background: strikes >= 2 ? '#FFF0F3' : '#FFFFFF',
            boxShadow: '0 8px 24px rgba(32, 33, 36, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                color: dangerColor,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: "var(--font-sf-text)",
              }}
            >
              <span>{phase >= 4 ? '👹' : phase === 3 ? '⚠️' : '🌲'}</span>
              <span>{dangerStatus}</span>
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                color: dangerColor,
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
                background: dangerColor,
                borderRadius: '999px',
                transition: 'width 0.2s ease, background 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
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
