import React, { useState, useEffect } from 'react';
import { gameState } from '../game/core/GameState';

export function DebugOverlay() {
  const [snap, setSnap] = useState(gameState.getSnapshot());

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const interval = setInterval(() => {
      const now = performance.now();
      const fps = Math.round((frameCount * 1000) / (now - lastTime));
      frameCount = 0;
      lastTime = now;
      gameState.fps = fps;
      setSnap(gameState.getSnapshot());
    }, 500);

    let rafId;
    const onFrame = () => {
      frameCount++;
      rafId = requestAnimationFrame(onFrame);
    };
    rafId = requestAnimationFrame(onFrame);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!snap.debugMode) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(0, 0, 0, 0.85)',
        border: '1px solid #10b981',
        borderRadius: '8px',
        padding: '10px 14px',
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#10b981',
        zIndex: 99,
        pointerEvents: 'none',
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontWeight: 'bold', color: '#fbbf24', marginBottom: '4px' }}>
        ⚙️ DEV DEBUG OVERLAY
      </div>
      <div>FPS: <span style={{ color: snap.fps > 45 ? '#10b981' : '#ef4444' }}>{snap.fps}</span></div>
      <div>SPEED: {snap.speed} m/s</div>
      <div>DISTANCE: {snap.distance} m</div>
      <div>GUARDIAN DIST: {snap.guardianDistance} m</div>
      <div>PRESSURE: {Math.round(snap.guardianPressure * 100)}%</div>
      <div>STATE: {snap.playerState}</div>
      <div>LANE: {snap.currentLane}</div>
      <div style={{ color: '#64748b', marginTop: '4px' }}>Press ~ to hide</div>
    </div>
  );
}
