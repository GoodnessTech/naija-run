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
          maxWidth: '680px',
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
              <span style={{ fontSize: '20px' }}>🇳🇬</span>
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
                NAIJA FLEET & ASSET VAULT
              </h2>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
              Real Nigerian luxury rides, Lekki estates & ancestral regalia
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Live Wallet Balance */}
            <div
              style={{
                background: 'rgba(0, 135, 81, 0.25)',
                border: '1.5px solid #10b981',
                borderRadius: '10px',
                padding: '6px 12px',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '0.6rem', color: '#34d399', fontWeight: 800, letterSpacing: '0.5px' }}>
                AVAILABLE NAIRA
              </div>
              <div
                style={{
                  fontSize: 'clamp(0.95rem, 3vw, 1.15rem)',
                  fontWeight: 900,
                  color: '#10b981',
                  fontFamily: "'Plus Jakarta Sans', monospace",
                }}
              >
                ₦{profile.wallet.toLocaleString()}
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-icon"
              style={{ width: '38px', height: '38px', fontSize: '18px', flexShrink: 0 }}
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
              padding: '8px 16px',
              background: feedback.includes('Successfully') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.25)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              color: feedback.includes('Successfully') ? '#34d399' : '#fca5a5',
              fontSize: '0.8rem',
              fontWeight: 800,
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            {feedback}
          </div>
        )}

        {/* Category Navigation Tabs (Mobile-Friendly Thumb Reach) */}
        <div
          style={{
            display: 'flex',
            padding: '8px 12px 0',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.35)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setActiveTab(ITEM_CATEGORIES.VEHICLE)}
            style={{
              flex: 1,
              padding: '10px 8px',
              minHeight: '44px',
              border: 'none',
              background: activeTab === ITEM_CATEGORIES.VEHICLE ? 'rgba(0, 135, 81, 0.35)' : 'transparent',
              borderBottom: activeTab === ITEM_CATEGORIES.VEHICLE ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === ITEM_CATEGORIES.VEHICLE ? '#f8fafc' : '#94a3b8',
              fontWeight: 800,
              fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🚗</span> RIDES & GARAGE
          </button>

          <button
            onClick={() => setActiveTab(ITEM_CATEGORIES.HOUSE)}
            style={{
              flex: 1,
              padding: '10px 8px',
              minHeight: '44px',
              border: 'none',
              background: activeTab === ITEM_CATEGORIES.HOUSE ? 'rgba(0, 135, 81, 0.35)' : 'transparent',
              borderBottom: activeTab === ITEM_CATEGORIES.HOUSE ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === ITEM_CATEGORIES.HOUSE ? '#f8fafc' : '#94a3b8',
              fontWeight: 800,
              fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🏰</span> REAL ESTATE
          </button>

          <button
            onClick={() => setActiveTab(ITEM_CATEGORIES.ACCESSORY)}
            style={{
              flex: 1,
              padding: '10px 8px',
              minHeight: '44px',
              border: 'none',
              background: activeTab === ITEM_CATEGORIES.ACCESSORY ? 'rgba(0, 135, 81, 0.35)' : 'transparent',
              borderBottom: activeTab === ITEM_CATEGORIES.ACCESSORY ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === ITEM_CATEGORIES.ACCESSORY ? '#f8fafc' : '#94a3b8',
              fontWeight: 800,
              fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.15s ease',
            }}
          >
            <span>👑</span> SACRED DRIP
          </button>
        </div>

        {/* Catalog Items Scrollable Grid */}
        <div
          style={{
            padding: '14px 16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            flex: 1,
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
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(6, 25, 15, 0.7) 100%)'
                    : isOwned
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(10, 20, 14, 0.55)',
                  border: isEquipped
                    ? '2px solid #10b981'
                    : isOwned
                    ? '1.5px solid rgba(212, 175, 55, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: isEquipped ? '0 0 20px rgba(16, 185, 129, 0.25)' : '0 4px 16px rgba(0,0,0,0.5)',
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
                      border: '1.5px solid rgba(212, 175, 55, 0.5)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.7)',
                      position: 'relative',
                      background: '#040906',
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
                          background: 'rgba(0,0,0,0.78)',
                          color: '#fef08a',
                          fontSize: '0.55rem',
                          fontWeight: 900,
                          textAlign: 'center',
                          padding: '2px 0',
                          letterSpacing: '0.5px',
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
                          fontSize: 'clamp(0.95rem, 3vw, 1.08rem)',
                          fontWeight: 800,
                          color: '#f8fafc',
                          lineHeight: 1.25,
                        }}
                      >
                        {item.name}
                      </h3>

                      {isOwned && (
                        <span
                          style={{
                            background: isEquipped ? '#10b981' : 'rgba(212, 175, 55, 0.25)',
                            color: isEquipped ? '#000' : '#fef08a',
                            fontSize: '0.62rem',
                            fontWeight: 900,
                            letterSpacing: '0.5px',
                            padding: '2px 7px',
                            borderRadius: '5px',
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
                        fontWeight: 900,
                        color: isOwned ? '#94a3b8' : canAfford ? '#fbbf24' : '#ef4444',
                        fontFamily: "'Plus Jakarta Sans', monospace",
                        marginTop: '2px',
                      }}
                    >
                      {isOwned ? (
                        <span style={{ fontSize: '0.8rem', color: '#10b981' }}>✓ In Your Vault</span>
                      ) : (
                        `₦${item.price.toLocaleString()}`
                      )}
                    </div>

                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '0.75rem',
                        color: '#94a3b8',
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
                    background: 'rgba(0, 135, 81, 0.22)',
                    border: '1px solid rgba(16, 185, 129, 0.45)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ color: '#fbbf24' }}>⚡ PERK:</span> {item.perkText}
                </div>

                {/* Action Button: Touch Target >= 48px */}
                <div>
                  {isEquipped ? (
                    <button
                      disabled
                      style={{
                        width: '100%',
                        height: '46px',
                        borderRadius: '10px',
                        background: 'rgba(16, 185, 129, 0.25)',
                        border: '1.5px solid #10b981',
                        color: '#34d399',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        letterSpacing: '1px',
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
                      style={{
                        width: '100%',
                        height: '46px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #008751 0%, #034f2f 100%)',
                        border: '1.5px solid #34d399',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 135, 81, 0.4)',
                      }}
                    >
                      ⚡ EQUIP THIS ASSET
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      style={{
                        width: '100%',
                        height: '46px',
                        borderRadius: '10px',
                        background: canAfford
                          ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: canAfford
                          ? '1.5px solid #fbbf24'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        color: canAfford ? '#ffffff' : '#64748b',
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        letterSpacing: '0.8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        boxShadow: canAfford ? '0 4px 16px rgba(217, 119, 6, 0.4)' : undefined,
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
