import React from 'react';

export function HowToPlayModal({ onClose }) {
  return (
    <div className="modal-overlay">
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
          <div>
            <h2
              style={{
                fontFamily: "var(--font-sf-display)",
                fontSize: '1.6rem',
                fontWeight: 900,
                color: '#202124',
                letterSpacing: '-0.5px',
              }}
            >
              HOW TO PLAY
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#5f6368', marginTop: '2px' }}>
              Master the controls and escape the enchanted rainforest.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '38px', height: '38px', fontSize: '14px', fontWeight: 800 }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Movement Controls */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#19B66B', letterSpacing: '0.8px', marginBottom: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-sf-display)' }}>
            🎮 CONTROLS
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: '#EAF8F0', border: '1px solid rgba(25, 182, 107, 0.25)', padding: '12px 14px', borderRadius: '14px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#19B66B', letterSpacing: '0.5px' }}>DESKTOP KEYS</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#202124', marginTop: '6px', lineHeight: 1.6 }}>
                <span style={{ color: '#2F6FB7', fontWeight: 800 }}>A / D</span> or <span style={{ color: '#2F6FB7', fontWeight: 800 }}>← / →</span> : Steer<br />
                <span style={{ color: '#19B66B', fontWeight: 800 }}>W / Space</span> or <span style={{ color: '#19B66B', fontWeight: 800 }}>↑</span> : Jump<br />
                <span style={{ color: '#d92550', fontWeight: 800 }}>S</span> or <span style={{ color: '#d92550', fontWeight: 800 }}>↓</span> : Slide
              </div>
            </div>

            <div style={{ background: '#EAF8F0', border: '1px solid rgba(25, 182, 107, 0.25)', padding: '12px 14px', borderRadius: '14px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#19B66B', letterSpacing: '0.5px' }}>MOBILE TOUCH</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#202124', marginTop: '6px', lineHeight: 1.6 }}>
                <span style={{ color: '#2F6FB7', fontWeight: 800 }}>Swipe Left / Right</span> : Steer<br />
                <span style={{ color: '#19B66B', fontWeight: 800 }}>Swipe Up</span> : Jump<br />
                <span style={{ color: '#d92550', fontWeight: 800 }}>Swipe Down</span> : Slide
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Obstacles */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2F6FB7', letterSpacing: '0.8px', marginBottom: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-sf-display)' }}>
            ⚠️ JUNGLE HAZARDS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FFF0F3', border: '1px solid rgba(255, 240, 243, 0.9)', padding: '10px 14px', borderRadius: '12px' }}>
              <span style={{ fontSize: '22px' }}>🪵</span>
              <div>
                <strong style={{ color: '#202124', fontSize: '0.85rem' }}>Fallen Tree Trunk: </strong>
                <span style={{ color: '#5f6368', fontSize: '0.8rem' }}>Full width arch. You MUST <strong style={{ color: '#d92550' }}>SLIDE</strong> underneath!</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FFF0F3', border: '1px solid rgba(255, 240, 243, 0.9)', padding: '10px 14px', borderRadius: '12px' }}>
              <span style={{ fontSize: '22px' }}>🚧</span>
              <div>
                <strong style={{ color: '#202124', fontSize: '0.85rem' }}>Low Spiked Barrier: </strong>
                <span style={{ color: '#5f6368', fontSize: '0.8rem' }}>Blocks lane. You MUST <strong style={{ color: '#19B66B' }}>JUMP</strong> over it!</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FFF0F3', border: '1px solid rgba(255, 240, 243, 0.9)', padding: '10px 14px', borderRadius: '12px' }}>
              <span style={{ fontSize: '22px' }}>🪨</span>
              <div>
                <strong style={{ color: '#202124', fontSize: '0.85rem' }}>Mossy Boulder & Totems: </strong>
                <span style={{ color: '#5f6368', fontSize: '0.8rem' }}><strong>DODGE</strong> to an open lane or high jump!</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#EAF8F0', border: '1px solid rgba(25, 182, 107, 0.25)', padding: '10px 14px', borderRadius: '12px' }}>
              <span style={{ fontSize: '22px' }}>💵</span>
              <div>
                <strong style={{ color: '#19B66B', fontSize: '0.85rem' }}>₦1,000 Game Notes: </strong>
                <span style={{ color: '#202124', fontSize: '0.8rem' }}>Collect notes to boost your cash and recover distance from the Guardian!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: The Forest Guardian */}
        <div style={{ marginBottom: '24px', background: '#FFF0F3', border: '1.5px solid rgba(217, 37, 80, 0.3)', padding: '14px 16px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d92550', fontWeight: 800, fontSize: '0.88rem', marginBottom: '6px', fontFamily: 'var(--font-sf-display)' }}>
            <span>👹</span> THE FOREST GUARDIAN
          </div>
          <p style={{ color: '#5f6368', fontSize: '0.82rem', lineHeight: 1.5 }}>
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
