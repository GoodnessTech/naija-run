import React, { useState, useEffect } from 'react';
import { userProfile } from '../game/progression/UserProfileManager';
import { SHOP_ITEMS, ITEM_CATEGORIES } from '../game/progression/ShopItems';
import { gameAudio } from '../game/core/GameAudio';

export function ShopModal({ onClose }) {
  const [profile, setProfile] = useState(userProfile.getSnapshot());
  const [activeTab, setActiveTab] = useState(ITEM_CATEGORIES.VEHICLE);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const unsubscribe = userProfile.subscribe((snap) => {
      setProfile(snap);
    });
    return unsubscribe;
  }, []);

  const handleBuy = (item) => {
    const res = userProfile.buyItem(item.id);
    if (res.success) {
      gameAudio.playCollectCash();
      setFeedback(res.message);
      setTimeout(() => setFeedback(''), 3500);
    } else {
      setFeedback(res.message);
      setTimeout(() => setFeedback(''), 3500);
    }
  };

  const handleEquip = (item) => {
    userProfile.equipItem(item.id);
    gameAudio.playFootstep();
  };

  const itemsInTab = SHOP_ITEMS.filter((item) => item.category === activeTab);

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
          maxWidth: '680px',
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px' }}>🇳🇬</span>
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
                Naija Fleet & Asset Vault
              </h2>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#5f6368', marginTop: '2px' }}>
              Real Nigerian luxury rides, Lekki estates & ancestral regalia
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Live Wallet Balance */}
            <div
              style={{
                background: '#EAF8F0',
                border: '1px solid #d5f2e1',
                borderRadius: '12px',
                padding: '6px 14px',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '0.62rem', color: '#5f6368', fontWeight: 700, letterSpacing: '0.5px' }}>
                AVAILABLE NAIRA
              </div>
              <div
                style={{
                  fontSize: 'clamp(0.95rem, 3vw, 1.15rem)',
                  fontWeight: 800,
                  color: '#19B66B',
                  fontFamily: 'var(--font-sf-display)',
                }}
              >
                ₦{profile.wallet.toLocaleString()}
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-icon"
              style={{ width: '36px', height: '36px', fontSize: '16px', borderRadius: '50%', flexShrink: 0 }}
              title="Close"
              aria-label="Close Shop"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Feedback Alert Bar */}
        {feedback && (
          <div
            style={{
              padding: '10px 18px',
              background: feedback.includes('Successfully') ? '#EAF8F0' : '#FFF0F3',
              borderBottom: feedback.includes('Successfully') ? '1px solid #d5f2e1' : '1px solid #ffe3e8',
              color: feedback.includes('Successfully') ? '#19B66B' : '#c2185b',
              fontSize: '0.82rem',
              fontWeight: 700,
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            {feedback}
          </div>
        )}

        {/* Category Navigation Tabs */}
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
            onClick={() => setActiveTab(ITEM_CATEGORIES.VEHICLE)}
            style={{
              flex: 1,
              padding: '10px 8px',
              minHeight: '42px',
              border: activeTab === ITEM_CATEGORIES.VEHICLE ? '1.5px solid #19B66B' : '1px solid #e8eaed',
              background: activeTab === ITEM_CATEGORIES.VEHICLE ? '#EAF8F0' : '#FFFFFF',
              color: activeTab === ITEM_CATEGORIES.VEHICLE ? '#19B66B' : '#5f6368',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderRadius: '12px',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === ITEM_CATEGORIES.VEHICLE ? '0 2px 8px rgba(25, 182, 107, 0.15)' : 'none',
            }}
          >
            <span>🚗</span> RIDES & GARAGE
          </button>

          <button
            onClick={() => setActiveTab(ITEM_CATEGORIES.HOUSE)}
            style={{
              flex: 1,
              padding: '10px 8px',
              minHeight: '42px',
              border: activeTab === ITEM_CATEGORIES.HOUSE ? '1.5px solid #2F6FB7' : '1px solid #e8eaed',
              background: activeTab === ITEM_CATEGORIES.HOUSE ? '#eef4fb' : '#FFFFFF',
              color: activeTab === ITEM_CATEGORIES.HOUSE ? '#2F6FB7' : '#5f6368',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderRadius: '12px',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === ITEM_CATEGORIES.HOUSE ? '0 2px 8px rgba(47, 111, 183, 0.15)' : 'none',
            }}
          >
            <span>🏰</span> REAL ESTATE
          </button>

          <button
            onClick={() => setActiveTab(ITEM_CATEGORIES.ACCESSORY)}
            style={{
              flex: 1,
              padding: '10px 8px',
              minHeight: '42px',
              border: activeTab === ITEM_CATEGORIES.ACCESSORY ? '1.5px solid #19B66B' : '1px solid #e8eaed',
              background: activeTab === ITEM_CATEGORIES.ACCESSORY ? '#EAF8F0' : '#FFFFFF',
              color: activeTab === ITEM_CATEGORIES.ACCESSORY ? '#19B66B' : '#5f6368',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderRadius: '12px',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === ITEM_CATEGORIES.ACCESSORY ? '0 2px 8px rgba(25, 182, 107, 0.15)' : 'none',
            }}
          >
            <span>👑</span> SACRED DRIP
          </button>
        </div>

        {/* Catalog Items Scrollable Grid */}
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            flex: 1,
            background: '#FFFFFF',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {itemsInTab.map((item) => {
            const isOwned = profile.ownedItems.includes(item.id);
            const isEquipped =
              profile.activeVehicle === item.id ||
              profile.activeHouse === item.id ||
              profile.activeAccessory === item.id;
            const canAfford = profile.wallet >= item.price;

            return (
              <div
                key={item.id}
                style={{
                  background: isEquipped
                    ? '#EAF8F0'
                    : '#FFFFFF',
                  border: isEquipped
                    ? '1.5px solid #19B66B'
                    : '1px solid #e8eaed',
                  borderRadius: '18px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: isEquipped
                    ? '0 4px 16px rgba(25, 182, 107, 0.15)'
                    : '0 2px 10px rgba(32, 33, 36, 0.04)',
                }}
              >
                {/* Image + Title Row */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {/* Real Photographic Asset Showcase */}
                  <div
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid #dadce0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      position: 'relative',
                      background: '#f8f9fa',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      loading="lazy"
                    />
                    {item.tag && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(32, 33, 36, 0.85)',
                          color: '#ffffff',
                          fontSize: '0.55rem',
                          fontWeight: 800,
                          textAlign: 'center',
                          padding: '2px 0',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {item.tag}
                      </div>
                    )}
                  </div>

                  {/* Title, Category & Price */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <h3
                        style={{
                          margin: '0 0 2px',
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: '#202124',
                          lineHeight: 1.25,
                        }}
                      >
                        {item.name}
                      </h3>

                      {isOwned && (
                        <span
                          style={{
                            background: isEquipped ? '#19B66B' : '#EAF8F0',
                            color: isEquipped ? '#ffffff' : '#19B66B',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            letterSpacing: '0.4px',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            flexShrink: 0,
                          }}
                        >
                          {isEquipped ? 'EQUIPPED' : 'OWNED'}
                        </span>
                      )}
                    </div>

                    {/* Real-World Price */}
                    <div
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: isOwned ? '#5f6368' : canAfford ? '#19B66B' : '#c2185b',
                        fontFamily: 'var(--font-sf-display)',
                        marginTop: '2px',
                      }}
                    >
                      {isOwned ? (
                        <span style={{ fontSize: '0.82rem', color: '#19B66B', fontWeight: 700 }}>✓ In Your Vault</span>
                      ) : (
                        `₦${item.price.toLocaleString()}`
                      )}
                    </div>

                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '0.76rem',
                        color: '#5f6368',
                        lineHeight: 1.35,
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Gameplay Perk Badge */}
                <div
                  style={{
                    background: '#EAF8F0',
                    border: '1px solid #d5f2e1',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#19B66B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ color: '#2F6FB7' }}>⚡ PERK:</span> {item.perkText}
                </div>

                {/* Action Button */}
                <div>
                  {isEquipped ? (
                    <button
                      disabled
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#EAF8F0',
                        border: '1.5px solid #19B66B',
                        color: '#19B66B',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'default',
                      }}
                    >
                      ✓ ACTIVE IN GAMEPLAY
                    </button>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(item)}
                      className="btn-blue"
                      style={{
                        width: '100%',
                        height: '44px',
                        fontSize: '0.88rem',
                      }}
                    >
                      ⚡ EQUIP THIS ASSET
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={canAfford ? 'btn-primary' : ''}
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '12px',
                        border: canAfford ? 'none' : '1px solid #e8eaed',
                        background: canAfford ? '#19B66B' : '#f1f3f4',
                        color: canAfford ? '#ffffff' : '#80868b',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {canAfford ? `ACQUIRE FOR ₦${item.price.toLocaleString()}` : `NEED ₦${(item.price - profile.wallet).toLocaleString()} MORE`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
