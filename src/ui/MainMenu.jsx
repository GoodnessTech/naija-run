import React, { useState, useEffect } from 'react';
import { gameState } from '../game/core/GameState';
import { gameAudio } from '../game/core/GameAudio';
import { userProfile } from '../game/progression/UserProfileManager';
import { HowToPlayModal } from './HowToPlayModal';
import { ShopModal } from './ShopModal';
import { LeaderboardModal } from './LeaderboardModal';
import { ProfileModal } from './ProfileModal';
import { AuthModal } from './AuthModal';
import { accountManager } from '../game/progression/AccountManager';

export function MainMenu({ onPlay }) {
  const [profile, setProfile] = useState(userProfile.getSnapshot());
  const [session, setSession] = useState(accountManager.getSessionSnapshot());
  const [showHowTo, setShowHowTo] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMuted, setIsMuted] = useState(gameState.isMuted);

  useEffect(() => {
    const unsubProfile = userProfile.subscribe((snap) => setProfile(snap));
    const unsubSession = accountManager.subscribe((snap) => setSession(snap));
    return () => {
      unsubProfile();
      unsubSession();
    };
  }, []);

  const handlePlay = () => {
    gameAudio.resumeContext();
    gameState.startGame();
    if (onPlay) onPlay();
  };

  const handleToggleSound = () => {
    gameAudio.resumeContext();
    const muted = gameState.toggleMute();
    gameAudio.setMuted(muted);
    setIsMuted(muted);
  };

  return (
    <div
      className="ui-layer ui-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px',
        background: 'linear-gradient(180deg, rgba(6, 14, 8, 0.55) 0%, rgba(3, 8, 4, 0.88) 100%)',
      }}
    >
      {/* Top Bar: Profile Card, Sound toggle & Branding */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* User Account / Profile Card */}
        <button
          onClick={() => setShowProfile(true)}
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px',
            border: '1px solid rgba(0, 135, 81, 0.5)',
            borderRadius: '14px',
            background: 'rgba(0, 20, 10, 0.65)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'transform 0.15s ease',
          }}
          title="Edit Runner Profile & Stats"
        >
          <div
            style={{
              fontSize: '24px',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(0, 135, 81, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #10b981',
            }}
          >
            {profile.avatar}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f8fafc' }}>
                {profile.username}
              </span>
              <span style={{ fontSize: '0.6rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                {profile.title}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981', fontFamily: "'Plus Jakarta Sans', monospace" }}>
              VAULT: ₦{profile.wallet.toLocaleString()}
            </div>
          </div>
        </button>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Sign Up / Account Button */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="glass-panel"
            style={{
              padding: '8px 12px',
              border: session.isLoggedIn ? '1.5px solid #10b981' : '1.5px solid #fbbf24',
              borderRadius: '10px',
              color: session.isLoggedIn ? '#34d399' : '#fbbf24',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: session.isLoggedIn ? 'rgba(0, 135, 81, 0.25)' : 'rgba(251, 191, 36, 0.18)',
            }}
            title="Runner Account & Sync"
          >
            <span>{session.isLoggedIn ? '🛡️' : '🔑'}</span>
            {session.isLoggedIn ? `@${session.username}` : 'SIGN UP'}
          </button>

          <button
            onClick={() => setShowShop(true)}
            className="glass-panel"
            style={{
              padding: '8px 14px',
              border: '1px solid #fbbf24',
              borderRadius: '10px',
              color: '#fbbf24',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(251, 191, 36, 0.15)',
            }}
          >
            <span>🛒</span> SHOP
          </button>

          <button
            onClick={() => setShowLeaderboard(true)}
            className="glass-panel"
            style={{
              padding: '8px 14px',
              border: '1px solid #10b981',
              borderRadius: '10px',
              color: '#34d399',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 135, 81, 0.2)',
            }}
          >
            <span>🏆</span> RANKS
          </button>

          <button
            onClick={handleToggleSound}
            className="btn-icon"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Center Hero: Title & Tagline */}
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        {/* Glowing Totem Mask Crest */}
        <div
          style={{
            fontSize: '52px',
            marginBottom: '6px',
            filter: 'drop-shadow(0 0 20px rgba(0, 135, 81, 0.7))',
            animation: 'pulse-guardian-glow 3s infinite ease-in-out',
          }}
        >
          🎭
        </div>

        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(2.4rem, 6.5vw, 4rem)',
            fontWeight: 900,
            letterSpacing: '4px',
            lineHeight: 1.05,
            background: 'linear-gradient(180deg, #ffffff 0%, #fef08a 60%, #ffb703 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 8px 30px rgba(0,0,0,0.8)',
            marginBottom: '8px',
          }}
        >
          NAIJA RUN
        </h1>

        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(0.85rem, 2.2vw, 1.15rem)',
            fontWeight: 700,
            letterSpacing: '5px',
            color: '#34d399',
            textTransform: 'uppercase',
            marginBottom: '24px',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
          }}
        >
          RUN. SURVIVE. ESCAPE.
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handlePlay}
            className="btn-primary"
            style={{ width: '100%', maxWidth: '280px', fontSize: '1.1rem', padding: '14px 24px' }}
          >
            <span>▶</span> PLAY RUN
          </button>

          <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '280px' }}>
            <button
              onClick={() => setShowShop(true)}
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '12px',
                borderColor: '#fbbf24',
                color: '#fbbf24',
                background: 'rgba(251, 191, 36, 0.1)',
                fontSize: '0.85rem',
              }}
            >
              <span>🛒</span> GARAGE
            </button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '12px',
                borderColor: '#10b981',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.1)',
                fontSize: '0.85rem',
              }}
            >
              <span>🏆</span> RANKS
            </button>
          </div>

          <button
            onClick={() => setShowHowTo(true)}
            className="btn-secondary"
            style={{ width: '100%', maxWidth: '280px', fontSize: '0.85rem' }}
          >
            <span>📜</span> HOW TO PLAY
          </button>
        </div>
      </div>

      {/* Bottom Bar: High Score & High Cash */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px' }}>🏆</span>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              BEST SCORE
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fef08a' }}>
              {gameState.highScore.toLocaleString()}
            </div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px' }}>💵</span>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              MOST CASH IN 1 RUN
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399' }}>
              ₦{gameState.highCash.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showHowTo && <HowToPlayModal onClose={() => setShowHowTo(false)} />}
      {showShop && <ShopModal onClose={() => setShowShop(false)} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
