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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(87, 80, 116, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
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
          maxWidth: '500px',
          borderRadius: '24px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 24px 60px rgba(87, 80, 116, 0.35)',
          overflow: 'hidden',
          background: '#FFFFFF',
          color: '#202124',
          padding: '24px',
          fontFamily: 'var(--font-sf-text)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: '#EAF8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              👤
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-sf-display)',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  letterSpacing: '-0.3px',
                  color: '#202124',
                }}
              >
                Runner Profile
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#5f6368', marginTop: '2px' }}>
                Identity, avatar crest, and career statistics
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" style={{ width: '36px', height: '36px', borderRadius: '50%' }}>
            ✕
          </button>
        </div>

        {/* Feedback */}
        {msg && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              background: msg.includes('success') ? '#EAF8F0' : '#FFF0F3',
              color: msg.includes('success') ? '#19B66B' : '#c2185b',
              fontSize: '0.84rem',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            {msg}
          </div>
        )}

        {/* Username Input */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#202124', marginBottom: '6px' }}>
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
              borderRadius: '12px',
              border: '1.5px solid #dadce0',
              background: '#f8f9fa',
              color: '#202124',
              fontSize: '0.98rem',
              fontWeight: 600,
              outline: 'none',
              fontFamily: 'var(--font-sf-text)',
              boxSizing: 'border-box',
            }}
            placeholder="Enter runner name..."
          />
        </div>

        {/* Avatar Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#202124', marginBottom: '8px' }}>
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
                    background: isSelected ? '#EAF8F0' : '#f8f9fa',
                    border: isSelected ? '2px solid #19B66B' : '1px solid #e8eaed',
                    borderRadius: '14px',
                    padding: '10px 0',
                    fontSize: '24px',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.06)' : 'scale(1)',
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
            background: '#f8f9fa',
            borderRadius: '16px',
            border: '1px solid #e8eaed',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#202124', marginBottom: '12px' }}>
            CAREER ACHIEVEMENTS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#5f6368', fontWeight: 600 }}>STATUS TITLE</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#19B66B' }}>{profile.title}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#5f6368', fontWeight: 600 }}>TOTAL BANKED VAULT</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#19B66B' }}>
                ₦{profile.wallet.toLocaleString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#5f6368', fontWeight: 600 }}>LIFETIME DISTANCE</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#202124' }}>
                {(profile.lifetimeDistance / 1000).toFixed(1)} km
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#5f6368', fontWeight: 600 }}>TOTAL RUNS PLAYED</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#202124' }}>
                {profile.totalRuns}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#5f6368', fontWeight: 600 }}>BEST SINGLE DISTANCE</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2F6FB7' }}>
                {profile.bestDistance.toLocaleString()} m
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#5f6368', fontWeight: 600 }}>LUXURY ASSETS OWNED</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#202124' }}>
                {profile.ownedItems.length}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={handleSave} className="btn-primary" style={{ width: '100%', height: '46px', fontSize: '0.95rem' }}>
            SAVE PROFILE
          </button>

          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              width: '100%',
              height: '44px',
              fontSize: '0.84rem',
              border: '1.5px solid #d5f2e1',
              borderRadius: '12px',
              color: '#19B66B',
              background: '#EAF8F0',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {session.isLoggedIn ? `🛡️ Logged In as @${session.username} (Switch)` : '🔑 Runner Account Sign Up / Log In'}
          </button>
        </div>
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
