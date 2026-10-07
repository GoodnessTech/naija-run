import React, { useState, useEffect } from 'react';
import { leaderboardManager, LEADERBOARD_MODES } from '../game/progression/LeaderboardManager';
import { accountManager } from '../game/progression/AccountManager';
import { AuthModal } from './AuthModal';

export function LeaderboardModal({ onClose }) {
  const [mode, setMode] = useState(LEADERBOARD_MODES.DISTANCE);
  const [viewScope, setViewScope] = useState('TOP_RUNNERS');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState(accountManager.getSessionSnapshot());
  const data = leaderboardManager.getLeaderboard(mode, { viewMode: viewScope });

  useEffect(() => {
    const unsub = accountManager.subscribe((snap) => setSession(snap));
    return unsub;
  }, []);

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 60,
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
          maxWidth: '640px',
          height: '100%',
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
        {/* Sticky Mobile Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(6, 14, 9, 0.92)',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🏆</span>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)',
                  fontWeight: 900,
                  letterSpacing: '1.5px',
                  color: '#fef08a',
                }}
              >
                VERIFIED RUNNERS LEDGER
              </h2>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
              Authentic record board • Zero simulated competitors
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '38px', height: '38px', fontSize: '18px', flexShrink: 0 }}
            title="Close"
            aria-label="Close Leaderboard"
          >
            ✕
          </button>
        </div>

        {/* Runner Account Sync CTA if not logged in */}
        {!session.isLoggedIn && (
          <div
            style={{
              padding: '8px 16px',
              background: 'rgba(251, 191, 36, 0.16)',
              borderBottom: '1px solid rgba(251, 191, 36, 0.35)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '0.74rem', color: '#fef08a', lineHeight: 1.3 }}>
              💡 <strong>Runner Sync:</strong> Sign up with just username & password to register your official runner handle!
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #fbbf24',
                background: '#d97706',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 900,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              SIGN UP
            </button>
          </div>
        )}

        {/* Mode Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '8px 12px',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.35)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setMode(LEADERBOARD_MODES.DISTANCE)}
            style={{
              flex: 1,
              padding: '10px 8px',
              minHeight: '44px',
              borderRadius: '10px',
              border: mode === LEADERBOARD_MODES.DISTANCE ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
              background: mode === LEADERBOARD_MODES.DISTANCE ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: mode === LEADERBOARD_MODES.DISTANCE ? '#34d399' : '#94a3b8',
              fontWeight: 800,
              fontSize: 'clamp(0.75rem, 2.5vw, 0.82rem)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🏃</span> SPRINT DISTANCE
          </button>

          <button
            onClick={() => setMode(LEADERBOARD_MODES.CASH)}
            style={{
              flex: 1,
              padding: '10px 8px',
              minHeight: '44px',
              borderRadius: '10px',
              border: mode === LEADERBOARD_MODES.CASH ? '1.5px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
              background: mode === LEADERBOARD_MODES.CASH ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
              color: mode === LEADERBOARD_MODES.CASH ? '#fbbf24' : '#94a3b8',
              fontWeight: 800,
              fontSize: 'clamp(0.75rem, 2.5vw, 0.82rem)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>💰</span> SINGLE NAIRA HAUL
          </button>
        </div>

        {/* View Scope Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '6px 12px',
            background: 'rgba(0, 0, 0, 0.45)',
            gap: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setViewScope('TOP_RUNNERS')}
            style={{
              flex: 1,
              maxWidth: '220px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: viewScope === 'TOP_RUNNERS' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
              background: viewScope === 'TOP_RUNNERS' ? 'rgba(16, 185, 129, 0.22)' : 'transparent',
              color: viewScope === 'TOP_RUNNERS' ? '#34d399' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.12s ease',
            }}
          >
            <span>👑</span> TOP RUNNERS (PEAK)
          </button>

          <button
            onClick={() => setViewScope('ALL_RUNS')}
            style={{
              flex: 1,
              maxWidth: '220px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: viewScope === 'ALL_RUNS' ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
              background: viewScope === 'ALL_RUNS' ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
              color: viewScope === 'ALL_RUNS' ? '#fef08a' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.12s ease',
            }}
          >
            <span>📜</span> ALL RUNS LEDGER ({data.totalRunsRecorded})
          </button>
        </div>

        {/* Player Standing Card */}
        <div
          style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(0, 135, 81, 0.25) 0%, rgba(5, 25, 15, 0.6) 100%)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>{data.currentProfile.avatar}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                  {data.currentProfile.username}
                </span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    color: '#34d399',
                    background: 'rgba(16, 185, 129, 0.2)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 800,
                  }}
                >
                  {data.currentProfile.title}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>
                Career Runs: {data.currentProfile.totalRuns} • Best: {data.currentProfile.bestDistance}m
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.62rem', color: '#fbbf24', fontWeight: 800, letterSpacing: '0.5px' }}>
              CURRENT RANK
            </div>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 900,
                color: data.playerRank ? '#fef08a' : '#94a3b8',
                fontFamily: "'Plus Jakarta Sans', monospace",
              }}
            >
              {data.playerRank ? `#${data.playerRank}` : 'NO RUNS YET'}
            </div>
          </div>
        </div>

        {/* Rankings Table / List */}
        <div
          style={{
            padding: '14px 16px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {data.entries.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#94a3b8',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '42px' }}>📜</div>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 800 }}>
                HALL OF FAME IS READY
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', maxWidth: '380px', lineHeight: 1.5 }}>
                No fake bots or mock rankings. Every score here is verified from real gameplay. Start a run and survive to claim Rank #1!
              </p>
            </div>
          ) : (
            data.entries.map((entry) => {
              const isGold = entry.rank === 1;
              const isSilver = entry.rank === 2;
              const isBronze = entry.rank === 3;
              const isCurrent = entry.isCurrentProfile;

              let rankBadge = `#${entry.rank}`;
              let rankColor = '#94a3b8';
              if (isGold) {
                rankBadge = '🥇 #1';
                rankColor = '#fbbf24';
              } else if (isSilver) {
                rankBadge = '🥈 #2';
                rankColor = '#e2e8f0';
              } else if (isBronze) {
                rankBadge = '🥉 #3';
                rankColor = '#f97316';
              }

              const formattedDate = entry.date
                ? new Date(entry.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent';

              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: isCurrent
                      ? 'linear-gradient(135deg, rgba(0, 135, 81, 0.28) 0%, rgba(5, 25, 15, 0.7) 100%)'
                      : isGold
                      ? 'rgba(251, 191, 36, 0.12)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isCurrent
                      ? '1.5px solid #10b981'
                      : isGold
                      ? '1.5px solid rgba(251, 191, 36, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isCurrent ? '0 0 15px rgba(16, 185, 129, 0.25)' : undefined,
                  }}
                >
                  {/* Left: Rank & Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        minWidth: '40px',
                        fontWeight: 900,
                        fontSize: isGold || isSilver || isBronze ? '0.95rem' : '0.85rem',
                        color: rankColor,
                        fontFamily: "'Plus Jakarta Sans', monospace",
                      }}
                    >
                      {rankBadge}
                    </div>

                    <div style={{ fontSize: '24px', flexShrink: 0 }}>{entry.avatar}</div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            color: isCurrent ? '#34d399' : '#f8fafc',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {entry.username}
                        </span>
                        {isCurrent && (
                          <span
                            style={{
                              background: '#10b981',
                              color: '#000',
                              fontSize: '0.58rem',
                              fontWeight: 900,
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {formattedDate} • {entry.title}
                      </div>
                    </div>
                  </div>

                  {/* Right: Primary Stat */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {mode === LEADERBOARD_MODES.DISTANCE ? (
                      <div>
                        <div
                          style={{
                            fontSize: '1rem',
                            fontWeight: 900,
                            color: '#34d399',
                            fontFamily: "'Plus Jakarta Sans', monospace",
                          }}
                        >
                          {entry.distance.toLocaleString()}m
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          ₦{entry.cash.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{
                            fontSize: '1rem',
                            fontWeight: 900,
                            color: '#fbbf24',
                            fontFamily: "'Plus Jakarta Sans', monospace",
                          }}
                        >
                          ₦{entry.cash.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          {entry.distance.toLocaleString()}m
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
