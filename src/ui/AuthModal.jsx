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
        background: 'rgba(87, 80, 116, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '94dvh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 24px 60px rgba(87, 80, 116, 0.35)',
          overflow: 'hidden',
          background: '#FFFFFF',
          color: '#202124',
          fontFamily: 'var(--font-sf-text)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #f1f3f4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#FFFFFF',
          }}
        >
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
              🛡️
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
                Runner Account
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#5f6368', marginTop: '2px' }}>
                Save your career vault & sync to global leaderboard
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '36px', height: '36px', fontSize: '16px', borderRadius: '50%' }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Feedback message banner */}
        {feedback.text && (
          <div
            style={{
              padding: '12px 18px',
              background: feedback.isError ? '#FFF0F3' : '#EAF8F0',
              borderBottom: feedback.isError ? '1px solid #ffe3e8' : '1px solid #d5f2e1',
              color: feedback.isError ? '#c2185b' : '#19B66B',
              fontSize: '0.82rem',
              fontWeight: 700,
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
                background: '#EAF8F0',
                border: '1.5px solid #19B66B',
                borderRadius: '18px',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>{profile.avatar}</div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#202124', fontWeight: 800 }}>
                @{session.username}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#19B66B', fontWeight: 800, marginBottom: '14px' }}>
                ● SYNCED OFFICIAL RUNNER
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  background: '#FFFFFF',
                  padding: '14px',
                  borderRadius: '14px',
                  textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(32, 33, 36, 0.04)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#5f6368', fontWeight: 700 }}>VAULT BALANCE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#19B66B' }}>
                    ₦{profile.wallet.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#5f6368', fontWeight: 700 }}>PEAK DISTANCE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2F6FB7' }}>
                    {profile.bestDistance.toLocaleString()}m
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                height: '46px',
                border: '1px solid #ffd1dc',
                borderRadius: '12px',
                color: '#c2185b',
                background: '#FFF0F3',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Switch Account / Log Out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            {/* Toggle Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #f1f3f4',
                background: '#f8f9fa',
                padding: '6px',
                gap: '6px',
              }}
            >
              <button
                onClick={() => {
                  setIsSignUpTab(true);
                  setFeedback({ text: '', isError: false });
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  background: isSignUpTab ? '#FFFFFF' : 'transparent',
                  color: isSignUpTab ? '#202124' : '#5f6368',
                  boxShadow: isSignUpTab ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>✨</span> New Runner (Sign Up)
              </button>

              <button
                onClick={() => {
                  setIsSignUpTab(false);
                  setFeedback({ text: '', isError: false });
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  background: !isSignUpTab ? '#FFFFFF' : 'transparent',
                  color: !isSignUpTab ? '#202124' : '#5f6368',
                  boxShadow: !isSignUpTab ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>🔑</span> Existing Runner (Log In)
              </button>
            </div>

            {/* Auth Form with Just Username and Password */}
            <form
              onSubmit={isSignUpTab ? handleSignUp : handleLogin}
              style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Username Input */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#202124',
                    marginBottom: '6px',
                  }}
                >
                  RUNNER USERNAME
                </label>
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
                    padding: '0 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #dadce0',
                    background: '#f8f9fa',
                    color: '#202124',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-sf-text)',
                  }}
                />
              </div>

              {/* Password Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#202124',
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
                      color: '#2F6FB7',
                      fontSize: '0.75rem',
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
                    padding: '0 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #dadce0',
                    background: '#f8f9fa',
                    color: '#202124',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-sf-text)',
                  }}
                />
              </div>

              {/* Benefits badge */}
              {isSignUpTab && (
                <div
                  style={{
                    background: '#EAF8F0',
                    border: '1px solid #d5f2e1',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    fontSize: '0.78rem',
                    color: '#19B66B',
                    lineHeight: 1.45,
                    fontWeight: 600,
                  }}
                >
                  🎉 <strong>₦250,000 Starter Grant Included:</strong> Registering activates an immediate ₦250k vault credit and synchronizes your runs to the Verified Leaderboard!
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '0.98rem',
                  marginTop: '4px',
                  background: '#19B66B',
                }}
              >
                {isSignUpTab ? 'Register & Sync Runs' : 'Log In & Load Vault'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
