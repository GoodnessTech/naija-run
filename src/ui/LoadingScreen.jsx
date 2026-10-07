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
        background: 'radial-gradient(circle at center, #575074 0%, #121019 100%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#FFFFFF',
        fontFamily: "var(--font-sf-text)",
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '420px', width: '100%' }}>
        {/* Ancient Nigerian Mask / Title Icon */}
        <div style={{ fontSize: '48px', marginBottom: '12px', filter: 'drop-shadow(0 4px 16px rgba(25, 182, 107, 0.4))' }}>
          🌿
        </div>

        <h1
          style={{
            fontFamily: "var(--font-sf-display)",
            fontSize: '2.5rem',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            color: '#FFFFFF',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            marginBottom: '8px',
          }}
        >
          NAIJA RUN
        </h1>

        <p
          style={{
            fontSize: '0.85rem',
            color: '#EAF8F0',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}
        >
          Entering the Tropical Rainforest...
        </p>

        {/* Progress Bar Container */}
        <div
          style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '999px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              width: `${Math.round(progress)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #19B66B 0%, #2F6FB7 100%)',
              borderRadius: '999px',
              transition: 'width 0.25s ease-out',
              boxShadow: '0 0 14px rgba(25, 182, 107, 0.6)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: '#EAF8F0',
            fontFamily: "var(--font-sf-text)",
            fontWeight: 700,
          }}
        >
          <span>PREPARING 3D ASSETS</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
