import React, { useState, useEffect } from 'react';
import { accountManager } from '../game/progression/AccountManager';
import { userProfile } from '../game/progression/UserProfileManager';
import { gameAudio } from '../game/core/GameAudio';

export function AuthModal({ onClose }) {
  const [session, setSession] = useState(accountManager.getSessionSnapshot());
  const [isSignUpTab, setIsSignUpTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', isError: false });

  useEffect(() => {
    const unsub = accountManager.subscribe((snap) => {
      setSession(snap);
    });
    return unsub;
  }, []);

  const handleSignUp = (e) => {
    e.preventDefault();
    const res = accountManager.signUp(username, password);
    if (res.success) {
      gameAudio.playCollectCash();
      setFeedback({ text: res.message, isError: false });
      setUsername('');
      setPassword('');
      setTimeout(() => {
        setFeedback({ text: '', isError: false });
        if (onClose) onClose();
      }, 1200);
    } else {
      setFeedback({ text: res.error, isError: true });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const res = accountManager.login(username, password);
    if (res.success) {
      gameAudio.playCollectCash();
      setFeedback({ text: res.message, isError: false });
      setUsername('');
      setPassword('');
      setTimeout(() => {
        setFeedback({ text: '', isError: false });
        if (onClose) onClose();
      }, 1200);
    } else {
      setFeedback({ text: res.error, isError: true });
    }
  };

  const handleLogout = () => {
    accountManager.logout();
    setFeedback({ text: 'Logged out. Switched to guest runner session.', isError: false });
    setTimeout(() => setFeedback({ text: '', isError: false }), 2000);
  };

  const profile = userProfile.getSnapshot();

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 65,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 12, 8, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '94dvh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #0e1e14 0%, #08110b 100%)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(6, 14, 9, 0.92)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🛡️</span>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Cinzel', serif",
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  color: '#fef08a',
                }}
              >
                RUNNER ACCOUNT & SYNC
              </h2>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Save your career vault & sync to global leaderboard
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '38px', height: '38px', fontSize: '18px' }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Feedback message banner */}
        {feedback.text && (
          <div
            style={{
              padding: '10px 16px',
              background: feedback.isError ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              color: feedback.isError ? '#fca5a5' : '#34d399',
              fontSize: '0.82rem',
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            {feedback.text}
          </div>
        )}

        {/* Logged in state card */}
        {session.isLoggedIn ? (
          <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(0, 135, 81, 0.25) 0%, rgba(5, 25, 15, 0.7) 100%)',
                border: '1.5px solid #10b981',
                borderRadius: '14px',
                padding: '18px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '38px', marginBottom: '6px' }}>{profile.avatar}</div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: '#f8fafc', fontWeight: 900 }}>
                @{session.username}
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800, marginBottom: '12px' }}>
                ● SYNCED RUNNER ACCOUNT
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '12px',
                  borderRadius: '10px',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>BANKED VAULT</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#10b981' }}>
                    ₦{profile.wallet.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>BEST DISTANCE</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fef08a' }}>
                    {profile.bestDistance.toLocaleString()}m
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{
                width: '100%',
                height: '46px',
                borderColor: '#ef4444',
                color: '#fca5a5',
                background: 'rgba(239, 68, 68, 0.15)',
                fontWeight: 800,
                fontSize: '0.88rem',
              }}
            >
              SWITCH ACCOUNT / LOG OUT
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            {/* Toggle Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(0, 0, 0, 0.35)',
              }}
            >
              <button
                onClick={() => {
                  setIsSignUpTab(true);
                  setFeedback({ text: '', isError: false });
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  background: isSignUpTab ? 'rgba(0, 135, 81, 0.35)' : 'transparent',
                  borderBottom: isSignUpTab ? '3px solid #10b981' : '3px solid transparent',
                  color: isSignUpTab ? '#f8fafc' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>✨</span> SIGN UP (NEW RUNNER)
              </button>

              <button
                onClick={() => {
                  setIsSignUpTab(false);
                  setFeedback({ text: '', isError: false });
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  background: !isSignUpTab ? 'rgba(0, 135, 81, 0.35)' : 'transparent',
                  borderBottom: !isSignUpTab ? '3px solid #10b981' : '3px solid transparent',
                  color: !isSignUpTab ? '#f8fafc' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>🔑</span> LOG IN (EXISTING)
              </button>
            </div>

            {/* Auth Form with Just Username and Password */}
            <form
              onSubmit={isSignUpTab ? handleSignUp : handleLogin}
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Username Input */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#cbd5e1',
                    marginBottom: '6px',
                    letterSpacing: '0.5px',
                  }}
                >
                  RUNNER USERNAME
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. LagosSpeedster"
                    autoComplete="username"
                    required
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 14px',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(212, 175, 55, 0.35)',
                      background: 'rgba(0, 0, 0, 0.45)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#cbd5e1',
                      letterSpacing: '0.5px',
                    }}
                  >
                    RUNNER PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    {showPassword ? 'Hide 👁️' : 'Show 👁️'}
                  </button>
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secret password"
                  autoComplete={isSignUpTab ? 'new-password' : 'current-password'}
                  required
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1.5px solid rgba(212, 175, 55, 0.35)',
                    background: 'rgba(0, 0, 0, 0.45)',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Benefits badge */}
              {isSignUpTab && (
                <div
                  style={{
                    background: 'rgba(0, 135, 81, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '0.75rem',
                    color: '#34d399',
                    lineHeight: 1.4,
                  }}
                >
                  🎉 <strong>Federal Grant Included:</strong> Signing up grants your account an initial ₦250,000 vault starter balance and activates instant sync to the Global Leaderboard!
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '0.95rem',
                  letterSpacing: '1px',
                  marginTop: '4px',
                }}
              >
                {isSignUpTab ? 'REGISTER & SYNC RUNS' : 'LOG IN & LOAD PROFILE'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
