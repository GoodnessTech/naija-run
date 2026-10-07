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
          maxWidth: '620px',
          height: '100%',
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
        {/* Sticky Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #f1f3f4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#FFFFFF',
            flexShrink: 0,
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
              🏆
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-sf-display)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '-0.3px',
                  color: '#202124',
                }}
              >
                Verified Runners Ledger
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#5f6368', marginTop: '2px' }}>
                Authentic record board • Zero simulated competitors
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '36px', height: '36px', fontSize: '16px', borderRadius: '50%', flexShrink: 0 }}
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
              padding: '10px 18px',
              background: '#EAF8F0',
              borderBottom: '1px solid #d5f2e1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#19B66B', lineHeight: 1.35, fontWeight: 600 }}>
              💡 <strong>Runner Sync:</strong> Sign up with just username & password to register your handle!
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                border: 'none',
                background: '#19B66B',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(25, 182, 107, 0.3)',
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
            padding: '10px 16px',
            gap: '8px',
            background: '#f8f9fa',
            borderBottom: '1px solid #f1f3f4',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setMode(LEADERBOARD_MODES.DISTANCE)}
            style={{
              flex: 1,
              padding: '10px 8px',
              minHeight: '42px',
              borderRadius: '12px',
              border: mode === LEADERBOARD_MODES.DISTANCE ? '1.5px solid #19B66B' : '1px solid #e8eaed',
              background: mode === LEADERBOARD_MODES.DISTANCE ? '#EAF8F0' : '#FFFFFF',
              color: mode === LEADERBOARD_MODES.DISTANCE ? '#19B66B' : '#5f6368',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              boxShadow: mode === LEADERBOARD_MODES.DISTANCE ? '0 2px 8px rgba(25, 182, 107, 0.15)' : 'none',
            }}
          >
            <span>🏃</span> SPRINT DISTANCE
          </button>

          <button
            onClick={() => setMode(LEADERBOARD_MODES.CASH)}
            style={{
              flex: 1,
              padding: '10px 8px',
              minHeight: '42px',
              borderRadius: '12px',
              border: mode === LEADERBOARD_MODES.CASH ? '1.5px solid #2F6FB7' : '1px solid #e8eaed',
              background: mode === LEADERBOARD_MODES.CASH ? '#eef4fb' : '#FFFFFF',
              color: mode === LEADERBOARD_MODES.CASH ? '#2F6FB7' : '#5f6368',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              boxShadow: mode === LEADERBOARD_MODES.CASH ? '0 2px 8px rgba(47, 111, 183, 0.15)' : 'none',
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
            padding: '8px 16px',
            background: '#FFFFFF',
            gap: '8px',
            borderBottom: '1px solid #f1f3f4',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setViewScope('TOP_RUNNERS')}
            style={{
              flex: 1,
              maxWidth: '220px',
              padding: '7px 12px',
              borderRadius: '10px',
              border: viewScope === 'TOP_RUNNERS' ? '1.5px solid #19B66B' : '1px solid #dadce0',
              background: viewScope === 'TOP_RUNNERS' ? '#EAF8F0' : '#f8f9fa',
              color: viewScope === 'TOP_RUNNERS' ? '#19B66B' : '#5f6368',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
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
              padding: '7px 12px',
              borderRadius: '10px',
              border: viewScope === 'ALL_RUNS' ? '1.5px solid #2F6FB7' : '1px solid #dadce0',
              background: viewScope === 'ALL_RUNS' ? '#eef4fb' : '#f8f9fa',
              color: viewScope === 'ALL_RUNS' ? '#2F6FB7' : '#5f6368',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.12s ease',
            }}
          >
            <span>📜</span> ALL RUNS ({data.totalRunsRecorded})
          </button>
        </div>

        {/* Player Standing Card */}
        <div
          style={{
            padding: '12px 18px',
            background: '#EAF8F0',
            borderBottom: '1px solid #d5f2e1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>{data.currentProfile.avatar}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#202124' }}>
                  {data.currentProfile.username}
                </span>
                <span
                  style={{
                    fontSize: '0.64rem',
                    color: '#19B66B',
                    background: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    border: '1px solid rgba(25, 182, 107, 0.2)',
                  }}
                >
                  {data.currentProfile.title}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '1px' }}>
                Career Runs: {data.currentProfile.totalRuns} • Best: {data.currentProfile.bestDistance}m
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.64rem', color: '#5f6368', fontWeight: 700, letterSpacing: '0.5px' }}>
              YOUR RANK
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                color: data.playerRank ? '#19B66B' : '#5f6368',
                fontFamily: 'var(--font-sf-display)',
              }}
            >
              {data.playerRank ? `#${data.playerRank}` : 'NO RUNS'}
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
            background: '#FFFFFF',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {data.entries.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#5f6368',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '42px' }}>📜</div>
              <h3 style={{ margin: 0, color: '#202124', fontSize: '1.1rem', fontWeight: 800 }}>
                Hall of Fame is Ready
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', maxWidth: '380px', lineHeight: 1.5 }}>
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
              let rankColor = '#5f6368';
              if (isGold) {
                rankBadge = '🥇 #1';
                rankColor = '#d97706';
              } else if (isSilver) {
                rankBadge = '🥈 #2';
                rankColor = '#475569';
              } else if (isBronze) {
                rankBadge = '🥉 #3';
                rankColor = '#b45309';
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
                    borderRadius: '14px',
                    background: isCurrent
                      ? '#EAF8F0'
                      : isGold
                      ? '#fffbeb'
                      : '#f8f9fa',
                    border: isCurrent
                      ? '1.5px solid #19B66B'
                      : isGold
                      ? '1px solid #fde68a'
                      : '1px solid #f1f3f4',
                    boxShadow: isCurrent ? '0 2px 10px rgba(25, 182, 107, 0.15)' : undefined,
                  }}
                >
                  {/* Left: Rank & Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        minWidth: '42px',
                        fontWeight: 800,
                        fontSize: isGold || isSilver || isBronze ? '0.92rem' : '0.84rem',
                        color: rankColor,
                        fontFamily: 'var(--font-sf-display)',
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
                            color: isCurrent ? '#19B66B' : '#202124',
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
                              background: '#19B66B',
                              color: '#ffffff',
                              fontSize: '0.58rem',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#5f6368', marginTop: '1px' }}>
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
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: '#19B66B',
                            fontFamily: 'var(--font-sf-display)',
                          }}
                        >
                          {entry.distance.toLocaleString()}m
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#5f6368' }}>
                          ₦{entry.cash.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: '#2F6FB7',
                            fontFamily: 'var(--font-sf-display)',
                          }}
                        >
                          ₦{entry.cash.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#5f6368' }}>
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
