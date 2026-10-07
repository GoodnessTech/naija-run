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
        background: 'linear-gradient(180deg, rgba(87, 80, 116, 0.4) 0%, rgba(32, 33, 36, 0.78) 100%)',
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
            gap: '12px',
            padding: '8px 16px',
            borderRadius: '16px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            border: '1px solid rgba(0, 0, 0, 0.08)',
          }}
          title="Edit Runner Profile & Stats"
        >
          <div
            style={{
              fontSize: '22px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#EAF8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #19B66B',
            }}
          >
            {profile.avatar}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#202124', fontFamily: 'var(--font-sf-display)' }}>
                {profile.username}
              </span>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#19B66B', background: '#EAF8F0', padding: '2px 6px', borderRadius: '6px' }}>
                {profile.title}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#19B66B', fontFamily: 'var(--font-sf-text)' }}>
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
              padding: '10px 14px',
              borderRadius: '12px',
              color: session.isLoggedIn ? '#19B66B' : '#2F6FB7',
              fontWeight: 800,
              fontSize: '0.8rem',
              fontFamily: 'var(--font-sf-display)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: session.isLoggedIn ? '1.5px solid #19B66B' : '1.5px solid #2F6FB7',
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
              padding: '10px 14px',
              borderRadius: '12px',
              color: '#202124',
              fontWeight: 800,
              fontSize: '0.8rem',
              fontFamily: 'var(--font-sf-display)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <span>🛒</span> SHOP
          </button>

          <button
            onClick={() => setShowLeaderboard(true)}
            className="glass-panel"
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              color: '#19B66B',
              fontWeight: 800,
              fontSize: '0.8rem',
              fontFamily: 'var(--font-sf-display)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#EAF8F0',
              border: '1px solid rgba(25, 182, 107, 0.3)',
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
            fontSize: '54px',
            marginBottom: '8px',
            filter: 'drop-shadow(0 4px 16px rgba(25, 182, 107, 0.4))',
          }}
        >
          🎭
        </div>

        <h1
          style={{
            fontFamily: "var(--font-sf-display)",
            fontSize: 'clamp(2.8rem, 7vw, 4.4rem)',
            fontWeight: 900,
            letterSpacing: '-1px',
            lineHeight: 1.05,
            color: '#FFFFFF',
            textShadow: '0 8px 32px rgba(32, 33, 36, 0.6), 0 2px 4px rgba(0,0,0,0.4)',
            marginBottom: '8px',
          }}
        >
          NAIJA RUN
        </h1>

        <div
          style={{
            fontFamily: "var(--font-sf-text)",
            fontSize: 'clamp(0.75rem, 2vw, 0.95rem)',
            fontWeight: 800,
            letterSpacing: '3px',
            color: '#19B66B',
            background: '#FFFFFF',
            padding: '5px 16px',
            borderRadius: '999px',
            display: 'inline-block',
            textTransform: 'uppercase',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            marginBottom: '26px',
          }}
        >
          RUN • SURVIVE • ESCAPE
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handlePlay}
            className="btn-primary"
            style={{ width: '100%', maxWidth: '280px', fontSize: '1.15rem', padding: '16px 28px' }}
          >
            <span>▶</span> PLAY RUN
          </button>

          <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '280px' }}>
            <button
              onClick={() => setShowShop(true)}
              className="btn-blue"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '0.88rem',
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
                fontSize: '0.88rem',
              }}
            >
              <span>🏆</span> RANKS
            </button>
          </div>

          <button
            onClick={() => setShowHowTo(true)}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '280px',
              fontSize: '0.88rem',
              fontWeight: 800,
              padding: '12px',
              cursor: 'pointer',
              color: '#202124',
              fontFamily: 'var(--font-sf-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
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
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '20px' }}>🏆</span>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              BEST SCORE
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#2F6FB7', fontFamily: 'var(--font-sf-display)' }}>
              {gameState.highScore.toLocaleString()}
            </div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '20px' }}>💵</span>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              MOST CASH IN 1 RUN
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#19B66B', fontFamily: 'var(--font-sf-display)' }}>
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
