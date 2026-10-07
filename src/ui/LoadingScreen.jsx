import React from 'react';
import { useProgress } from '@react-three/drei';

export function LoadingScreen({ onLoaded }) {
  const { progress, active } = useProgress();

  React.useEffect(() => {
    if (!active && progress === 100) {
      const timer = setTimeout(() => {
        if (onLoaded) onLoaded();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [active, progress, onLoaded]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at center, #0f2916 0%, #060e08 100%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#f8fafc',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '420px', width: '100%' }}>
        {/* Ancient Nigerian Mask / Title Icon */}
        <div style={{ fontSize: '48px', marginBottom: '12px', filter: 'drop-shadow(0 0 16px rgba(0, 135, 81, 0.6))' }}>
          🌿
        </div>

        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '2.4rem',
            fontWeight: 900,
            letterSpacing: '3px',
            color: '#fef08a',
            textShadow: '0 4px 18px rgba(0,0,0,0.8), 0 0 25px rgba(255, 183, 3, 0.4)',
            marginBottom: '8px',
          }}
        >
          NAIJA RUN
        </h1>

        <p
          style={{
            fontSize: '0.9rem',
            color: '#94a3b8',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}
        >
          Loading the Tropical Rainforest...
        </p>

        {/* Progress Bar Container */}
        <div
          style={{
            width: '100%',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 135, 81, 0.4)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              width: `${Math.round(progress)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #008751 0%, #10b981 50%, #fbbf24 100%)',
              borderRadius: '999px',
              transition: 'width 0.25s ease-out',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.8)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#64748b',
            fontFamily: "'Plus Jakarta Sans', monospace",
          }}
        >
          <span>PREPARING 3D ASSETS</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
