import React, { useState, useEffect } from 'react';
import { gameState } from '../core/GameState';

export function ScreenEffects() {
  const [pressure, setPressure] = useState(0);

  useEffect(() => {
    const unsubscribe = gameState.subscribe((snap) => {
      setPressure(snap.guardianPressure);
    });
    return unsubscribe;
  }, []);

  if (pressure <= 0.05) return null;

  // Opacity scales with pressure (0 to 0.75)
  const opacity = Math.min(0.8, pressure * 0.85);

  return (
    <div
      className="guardian-vignette"
      style={{
        opacity,
        boxShadow: `inset 0 0 ${40 + pressure * 60}px ${15 + pressure * 25}px rgba(220, 38, 38, ${0.4 + pressure * 0.5})`,
      }}
    />
  );
}
