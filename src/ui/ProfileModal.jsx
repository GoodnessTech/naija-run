import React, { useState, useEffect } from 'react';
import { userProfile, AVATAR_OPTIONS } from '../game/progression/UserProfileManager';
import { accountManager } from '../game/progression/AccountManager';
import { gameAudio } from '../game/core/GameAudio';
import { AuthModal } from './AuthModal';

export function ProfileModal({ onClose }) {
  const [profile, setProfile] = useState(userProfile.getSnapshot());
  const [session, setSession] = useState(accountManager.getSessionSnapshot());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const unsub = accountManager.subscribe((snap) => {
      setSession(snap);
      setProfile(userProfile.getSnapshot());
      setUsername(snap.isLoggedIn ? snap.username : userProfile.getSnapshot().username);
    });
    return unsub;
  }, []);

  const handleSave = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setMsg('Please enter a valid username');
      return;
    }
    userProfile.setUsername(trimmed);
    userProfile.setAvatar(selectedAvatar);
    gameAudio.playCollectCash();
    setMsg('Profile updated successfully!');
    setTimeout(() => {
      setMsg('');
      if (onClose) onClose();
    }, 900);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 50,
        background: 'rgba(3, 10, 6, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: '20px',
          border: '1px solid rgba(0, 135, 81, 0.4)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(10, 26, 16, 0.95) 0%, rgba(5, 13, 8, 0.98) 100%)',
          padding: '24px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>👤</span>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Cinzel', serif",
                fontSize: '1.3rem',
                fontWeight: 900,
                color: '#f8fafc',
              }}
            >
              RUNNER IDENTITY & STATS
            </h2>
          </div>

          <button onClick={onClose} className="btn-icon" style={{ width: '36px', height: '36px' }}>
            ✕
          </button>
        </div>

        {/* Feedback */}
        {msg && (
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: msg.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: msg.includes('success') ? '#34d399' : '#f87171',
              fontSize: '0.85rem',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            {msg}
          </div>
        )}

        {/* Username Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
            RUNNER USERNAME
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={16}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(0, 0, 0, 0.4)',
              color: '#f8fafc',
              fontSize: '1rem',
              fontWeight: 700,
              outline: 'none',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            placeholder="Enter runner name..."
          />
        </div>

        {/* Avatar Selection */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>
            SELECT AVATAR CREST
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
            {AVATAR_OPTIONS.map((av) => {
              const isSelected = selectedAvatar === av.emoji;
              return (
                <button
                  key={av.id}
                  onClick={() => setSelectedAvatar(av.emoji)}
                  style={{
                    background: isSelected ? 'rgba(0, 135, 81, 0.4)' : 'rgba(0, 0, 0, 0.3)',
                    border: isSelected ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '10px 0',
                    fontSize: '24px',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                  }}
                  title={av.name}
                >
                  {av.emoji}
                </button>
              );
            })}
          </div>
        </div>

        {/* Career Stats Grid */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            marginBottom: '22px',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', marginBottom: '12px' }}>
            CAREER ACHIEVEMENTS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>STATUS TITLE</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>{profile.title}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>TOTAL BANKED VAULT</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#10b981' }}>
                ₦{profile.wallet.toLocaleString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>LIFETIME DISTANCE</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                {(profile.lifetimeDistance / 1000).toFixed(1)} km
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>TOTAL RUNS PLAYED</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                {profile.totalRuns}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>BEST SINGLE DISTANCE</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                {profile.bestDistance.toLocaleString()} m
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>LUXURY ITEMS OWNED</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24' }}>
                {profile.ownedItems.length}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={handleSave} className="btn-primary" style={{ width: '100%', height: '46px', fontSize: '0.95rem' }}>
            SAVE PROFILE
          </button>

          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-secondary"
            style={{
              width: '100%',
              height: '42px',
              fontSize: '0.82rem',
              borderColor: session.isLoggedIn ? '#10b981' : '#fbbf24',
              color: session.isLoggedIn ? '#34d399' : '#fbbf24',
              background: session.isLoggedIn ? 'rgba(0, 135, 81, 0.2)' : 'rgba(251, 191, 36, 0.15)',
            }}
          >
            {session.isLoggedIn ? `🛡️ LOGGED IN AS @${session.username} (SWITCH)` : '🔑 SIGN UP / LOG IN RUNNER ACCOUNT'}
          </button>
        </div>
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
