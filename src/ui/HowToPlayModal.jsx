import React from 'react';

export function HowToPlayModal({ onClose }) {
  return (
    <div
      className="ui-layer ui-interactive"
      style={{
        background: 'rgba(2, 6, 3, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 60,
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px 24px',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '1.6rem',
              color: '#fef08a',
              letterSpacing: '2px',
            }}
          >
            HOW TO PLAY
          </h2>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '36px', height: '36px' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Movement Controls */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#34d399', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>
            🎮 CONTROLS
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>DESKTOP</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                <span style={{ color: '#fbbf24' }}>A / D</span> or <span style={{ color: '#fbbf24' }}>← / →</span> : Steer<br />
                <span style={{ color: '#fbbf24' }}>W / Space</span> or <span style={{ color: '#fbbf24' }}>↑</span> : Jump<br />
                <span style={{ color: '#fbbf24' }}>S</span> or <span style={{ color: '#fbbf24' }}>↓</span> : Slide
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>MOBILE TOUCH</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                <span style={{ color: '#34d399' }}>Swipe Left / Right</span> : Steer<br />
                <span style={{ color: '#34d399' }}>Swipe Up</span> : Jump<br />
                <span style={{ color: '#34d399' }}>Swipe Down</span> : Slide
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Obstacles */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#34d399', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>
            ⚠️ JUNGLE HAZARDS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '20px' }}>🪵</span>
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>Fallen Tree Trunk: </strong>
                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Full width arch. You MUST <strong>SLIDE</strong> underneath!</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '20px' }}>🚧</span>
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>Low Spiked Barrier: </strong>
                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Blocks lane. You MUST <strong>JUMP</strong> over it!</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '20px' }}>🪨</span>
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>Mossy Boulder & Totems: </strong>
                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}><strong>DODGE</strong> to an open lane or high jump!</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '20px' }}>💵</span>
              <div>
                <strong style={{ color: '#10b981', fontSize: '0.85rem' }}>₦1,000 Game Notes: </strong>
                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Collect notes to boost your cash and recover distance from the Guardian!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: The Forest Guardian */}
        <div style={{ marginBottom: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>
            <span>👹</span> THE FOREST GUARDIAN
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.5 }}>
            An ancient supernatural entity chases behind you. If you hit an obstacle or make mistakes, the Guardian surges forward. If he catches you, your run ends!
          </p>
        </div>

        <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
          GOT IT, LET'S RUN!
        </button>
      </div>
    </div>
  );
}
