import { SHOP_ITEMS, ITEM_CATEGORIES } from './ShopItems.js';
import { accountManager } from './AccountManager.js';

const STORAGE_KEY = 'naija_run_user_profile_v2';

export const AVATAR_OPTIONS = [
  { id: 'hustler', emoji: '🦅', name: 'Lagos Eagle' },
  { id: 'chief', emoji: '👑', name: 'Royal Chief' },
  { id: 'warrior', emoji: '⚡', name: 'Thunder Sprinter' },
  { id: 'lion', emoji: '🦁', name: 'Edo Lion' },
  { id: 'speedster', emoji: '🏎️', name: 'Island Racer' },
  { id: 'queen', emoji: '🌟', name: 'Naija Queen' }
];

export const TITLES = [
  { threshold: 0, title: 'Street Hustler' },
  { threshold: 500000, title: 'Mainland Striver' },
  { threshold: 2500000, title: 'Ojuelegba Transporter' },
  { threshold: 8500000, title: 'Lagos Fleet Don' },
  { threshold: 35000000, title: 'Lekki Baller' },
  { threshold: 100000000, title: 'Victoria Island Mogul' },
  { threshold: 500000000, title: 'Ikoyi Elite' },
  { threshold: 1500000000, title: 'Banana Island Billionaire' }
];

class UserProfileManager {
  constructor() {
    this.listeners = new Set();
    this.profile = this.load();

    // Listen to account switch/login/logout events
    if (typeof accountManager !== 'undefined' && accountManager.subscribe) {
      accountManager.subscribe((session) => {
        if (session.isLoggedIn && session.accountData) {
          this.loadFromAccount(session.accountData);
        }
      });
    }
  }

  load() {
    // 1. If an active authenticated runner session exists, load from their account vault
    const session = accountManager.getSessionSnapshot();
    if (session.isLoggedIn && session.accountData) {
      return {
        username: session.username,
        avatar: session.accountData.avatar || '🦅',
        wallet: typeof session.accountData.wallet === 'number' ? session.accountData.wallet : 250000,
        lifetimeNaira: typeof session.accountData.lifetimeNaira === 'number' ? session.accountData.lifetimeNaira : 250000,
        lifetimeDistance: session.accountData.lifetimeDistance || 0,
        totalRuns: session.accountData.totalRuns || 0,
        bestDistance: session.accountData.bestDistance || 0,
        bestScore: session.accountData.bestScore || 0,
        ownedItems: Array.isArray(session.accountData.ownedItems) ? session.accountData.ownedItems : [],
        activeVehicle: session.accountData.activeVehicle || null,
        activeHouse: session.accountData.activeHouse || null,
        activeAccessory: session.accountData.activeAccessory || null,
        hasCustomizedName: true
      };
    }

    // 2. Otherwise load from local storage
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            username: parsed.username || 'OluwaRunner',
            avatar: parsed.avatar || '🦅',
            wallet: typeof parsed.wallet === 'number' ? Math.max(parsed.wallet, 250000) : 250000,
            lifetimeNaira: typeof parsed.lifetimeNaira === 'number' ? Math.max(parsed.lifetimeNaira, 250000) : 250000,
            lifetimeDistance: typeof parsed.lifetimeDistance === 'number' ? parsed.lifetimeDistance : 0,
            totalRuns: typeof parsed.totalRuns === 'number' ? parsed.totalRuns : 0,
            bestDistance: typeof parsed.bestDistance === 'number' ? parsed.bestDistance : 0,
            bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
            ownedItems: Array.isArray(parsed.ownedItems) ? parsed.ownedItems : [],
            activeVehicle: parsed.activeVehicle || null,
            activeHouse: parsed.activeHouse || null,
            activeAccessory: parsed.activeAccessory || null,
            hasCustomizedName: Boolean(parsed.hasCustomizedName)
          };
        }
      }
    } catch (e) {
      console.error('Failed to load user profile from storage', e);
    }

    return {
      username: 'OluwaRunner',
      avatar: '🦅',
      wallet: 250000, // ₦250,000 Federal Starter Grant
      lifetimeNaira: 250000,
      lifetimeDistance: 0,
      totalRuns: 0,
      bestDistance: 0,
      bestScore: 0,
      ownedItems: [],
      activeVehicle: null,
      activeHouse: null,
      activeAccessory: null,
      hasCustomizedName: false
    };
  }

  loadFromAccount(accountProfile) {
    if (!accountProfile) return;
    this.profile = {
      username: accountProfile.username || this.profile.username,
      avatar: accountProfile.avatar || this.profile.avatar || '🦅',
      wallet: typeof accountProfile.wallet === 'number' ? accountProfile.wallet : this.profile.wallet,
      lifetimeNaira: typeof accountProfile.lifetimeNaira === 'number' ? accountProfile.lifetimeNaira : this.profile.lifetimeNaira,
      lifetimeDistance: accountProfile.lifetimeDistance || 0,
      totalRuns: accountProfile.totalRuns || 0,
      bestDistance: accountProfile.bestDistance || 0,
      bestScore: accountProfile.bestScore || 0,
      ownedItems: Array.isArray(accountProfile.ownedItems) ? accountProfile.ownedItems : [],
      activeVehicle: accountProfile.activeVehicle || null,
      activeHouse: accountProfile.activeHouse || null,
      activeAccessory: accountProfile.activeAccessory || null,
      hasCustomizedName: true
    };
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
      }
    } catch (e) {
      console.error('Failed to save profile cache', e);
    }
    this.notify();
  }

  save() {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
      }
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }

    // Sync to active account registry if logged in
    accountManager.syncActiveProfile(this.profile);
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snap = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snap);
    }
  }

  getSnapshot() {
    const netWorth = this.profile.lifetimeNaira;
    let rankTitle = TITLES[0].title;
    for (let i = TITLES.length - 1; i >= 0; i--) {
      if (netWorth >= TITLES[i].threshold) {
        rankTitle = TITLES[i].title;
        break;
      }
    }

    return {
      ...this.profile,
      title: rankTitle,
      perks: this.getActivePerks()
    };
  }

  setUsername(name) {
    const clean = (name || '').trim().slice(0, 16);
    if (!clean) return false;
    this.profile.username = clean;
    this.profile.hasCustomizedName = true;
    this.save();
    return true;
  }

  setAvatar(emoji) {
    this.profile.avatar = emoji;
    this.save();
  }

  // Banks cash earned from a run into persistent wallet & updates career statistics
  recordRun({ id = null, date = null, cash = 0, distance = 0, score = 0 }) {
    this.profile.wallet += cash;
    this.profile.lifetimeNaira += cash;
    this.profile.lifetimeDistance += Math.floor(distance);
    this.profile.totalRuns += 1;

    if (distance > this.profile.bestDistance) {
      this.profile.bestDistance = Math.floor(distance);
    }
    if (score > this.profile.bestScore) {
      this.profile.bestScore = Math.floor(score);
    }

    const runRecord = {
      id: id || `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      cash: Math.floor(cash),
      distance: Math.floor(distance),
      score: Math.floor(score),
      date: date || new Date().toISOString()
    };

    // Sync directly to runner account
    accountManager.syncActiveProfile(this.profile, runRecord);

    this.save();
    return {
      bankedCash: cash,
      newWallet: this.profile.wallet,
      isNewBestDistance: distance === this.profile.bestDistance,
      isNewBestScore: score === this.profile.bestScore
    };
  }

  // Buy item from shop
  buyItem(itemId) {
    const item = SHOP_ITEMS.find((it) => it.id === itemId);
    if (!item) return { success: false, message: 'Item not found' };

    if (this.profile.ownedItems.includes(itemId)) {
      return { success: false, message: 'Item already owned' };
    }

    if (this.profile.wallet < item.price) {
      return {
        success: false,
        message: `Insufficient Naira. Need ₦${(item.price - this.profile.wallet).toLocaleString()} more!`
      };
    }

    this.profile.wallet -= item.price;
    this.profile.ownedItems.push(itemId);

    // Auto-equip if slot is empty
    if (item.category === ITEM_CATEGORIES.VEHICLE && !this.profile.activeVehicle) {
      this.profile.activeVehicle = itemId;
    } else if (item.category === ITEM_CATEGORIES.HOUSE && !this.profile.activeHouse) {
      this.profile.activeHouse = itemId;
    } else if (item.category === ITEM_CATEGORIES.ACCESSORY && !this.profile.activeAccessory) {
      this.profile.activeAccessory = itemId;
    }

    this.save();
    return { success: true, message: `Successfully acquired ${item.name}!` };
  }

  // Equip an owned item
  equipItem(itemId) {
    const item = SHOP_ITEMS.find((it) => it.id === itemId);
    if (!item || !this.profile.ownedItems.includes(itemId)) {
      return false;
    }

    if (item.category === ITEM_CATEGORIES.VEHICLE) {
      this.profile.activeVehicle = itemId;
    } else if (item.category === ITEM_CATEGORIES.HOUSE) {
      this.profile.activeHouse = itemId;
    } else if (item.category === ITEM_CATEGORIES.ACCESSORY) {
      this.profile.activeAccessory = itemId;
    }

    this.save();
    return true;
  }

  // Unequip item category
  unequipCategory(category) {
    if (category === ITEM_CATEGORIES.VEHICLE) {
      this.profile.activeVehicle = null;
    } else if (category === ITEM_CATEGORIES.HOUSE) {
      this.profile.activeHouse = null;
    } else if (category === ITEM_CATEGORIES.ACCESSORY) {
      this.profile.activeAccessory = null;
    }
    this.save();
  }

  // Calculate active perks from all equipped items
  getActivePerks() {
    const perks = {
      cashBonusPercent: 0,
      scoreMultiplier: 1.0,
      shieldCount: 0,
      speedBonus: 0,
      laneSpeedMultiplier: 1.0,
      magnetBonus: 1.0,
      guardianStartDistanceBonus: 0,
      recoveryInvulnBonus: 0,
      jumpPowerBonus: 0,
      thunderAura: false
    };

    const activeIds = [
      this.profile.activeVehicle,
      this.profile.activeHouse,
      this.profile.activeAccessory
    ].filter(Boolean);

    for (const id of activeIds) {
      const item = SHOP_ITEMS.find((it) => it.id === id);
      if (item && item.perk) {
        if (item.perk.cashBonusPercent) perks.cashBonusPercent += item.perk.cashBonusPercent;
        if (item.perk.scoreMultiplier) perks.scoreMultiplier *= item.perk.scoreMultiplier;
        if (item.perk.shieldCount) perks.shieldCount += item.perk.shieldCount;
        if (item.perk.speedBonus) perks.speedBonus += item.perk.speedBonus;
        if (item.perk.laneSpeedMultiplier) perks.laneSpeedMultiplier = Math.max(perks.laneSpeedMultiplier, item.perk.laneSpeedMultiplier);
        if (item.perk.magnetBonus) perks.magnetBonus = Math.max(perks.magnetBonus, item.perk.magnetBonus);
        if (item.perk.guardianStartDistanceBonus) perks.guardianStartDistanceBonus += item.perk.guardianStartDistanceBonus;
        if (item.perk.recoveryInvulnBonus) perks.recoveryInvulnBonus += item.perk.recoveryInvulnBonus;
        if (item.perk.jumpPowerBonus) perks.jumpPowerBonus += item.perk.jumpPowerBonus;
        if (item.perk.thunderAura) perks.thunderAura = true;
      }
    }

    return perks;
  }
}

export const userProfile = new UserProfileManager();
