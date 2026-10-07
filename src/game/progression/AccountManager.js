// Account Management & Persistence System for Naija Web Run
// Allows runners to register with Username & Password, sync their vault, and populate the global leaderboard.

const ACCOUNTS_STORAGE_KEY = 'naija_run_accounts_registry_v1';
const ACTIVE_SESSION_KEY = 'naija_run_active_session_v1';

class AccountManager {
  constructor() {
    this.listeners = new Set();
    this.accounts = this.loadAccounts();
    this.activeUsername = this.loadActiveSession();
  }

  loadAccounts() {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load accounts registry', e);
    }
    return {};
  }

  saveAccounts() {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(this.accounts));
      }
    } catch (e) {
      console.error('Failed to save accounts registry', e);
    }
    this.notify();
  }

  loadActiveSession() {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(ACTIVE_SESSION_KEY) || null;
      }
    } catch (e) {
      console.error('Failed to load active session', e);
    }
    return null;
  }

  saveActiveSession(username) {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        if (username) {
          localStorage.setItem(ACTIVE_SESSION_KEY, username);
        } else {
          localStorage.removeItem(ACTIVE_SESSION_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to save active session', e);
    }
    this.activeUsername = username;
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const session = this.getSessionSnapshot();
    for (const listener of this.listeners) {
      listener(session);
    }
  }

  getSessionSnapshot() {
    const isLogged = Boolean(this.activeUsername && this.accounts[this.activeUsername.toLowerCase()]);
    const account = isLogged ? this.accounts[this.activeUsername.toLowerCase()] : null;

    return {
      isLoggedIn: isLogged,
      username: isLogged ? account.username : null,
      accountData: account ? account.profile : null
    };
  }

  /**
   * Registers a brand-new runner account with just username and password
   */
  signUp(username, password) {
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanUser || cleanUser.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }
    if (cleanUser.length > 16) {
      return { success: false, error: 'Username must not exceed 16 characters.' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
      return { success: false, error: 'Username can only contain letters, numbers, and underscores.' };
    }
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    const key = cleanUser.toLowerCase();
    if (this.accounts[key]) {
      return { success: false, error: `Runner @${cleanUser} already exists! Please log in instead.` };
    }

    // Initialize clean runner profile with Federal Starter Grant
    const newAccount = {
      username: cleanUser,
      password: cleanPass, // Persisted for runner login verification
      createdAt: new Date().toISOString(),
      profile: {
        username: cleanUser,
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
        hasCustomizedName: true
      },
      runs: []
    };

    this.accounts[key] = newAccount;
    this.saveAccounts();
    this.saveActiveSession(cleanUser);

    return { success: true, message: `Account created! Welcome, @${cleanUser}!`, account: newAccount };
  }

  /**
   * Authenticates an existing runner with username and password
   */
  login(username, password) {
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    const key = cleanUser.toLowerCase();
    const account = this.accounts[key];

    if (!account) {
      return { success: false, error: `No runner account found for @${cleanUser}. Please sign up.` };
    }

    if (account.password !== cleanPass) {
      return { success: false, error: 'Incorrect password for this runner account.' };
    }

    this.saveActiveSession(account.username);
    return { success: true, message: `Welcome back, @${account.username}! Vault synced.`, account };
  }

  /**
   * Logs out active runner
   */
  logout() {
    this.saveActiveSession(null);
    return { success: true, message: 'Logged out successfully.' };
  }

  /**
   * Syncs active runner's profile and latest run to their permanent account record
   */
  syncActiveProfile(profileData, newRun = null) {
    if (!this.activeUsername) return;
    const key = this.activeUsername.toLowerCase();
    if (!this.accounts[key]) return;

    this.accounts[key].profile = {
      ...this.accounts[key].profile,
      ...profileData,
      username: this.accounts[key].username
    };

    if (newRun) {
      if (!Array.isArray(this.accounts[key].runs)) {
        this.accounts[key].runs = [];
      }
      this.accounts[key].runs.unshift(newRun);
      if (this.accounts[key].runs.length > 50) {
        this.accounts[key].runs = this.accounts[key].runs.slice(0, 50);
      }
    }

    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(this.accounts));
      }
    } catch (e) {
      console.error('Failed to sync accounts', e);
    }
  }

  /**
   * Returns all registered runner profiles and their best runs for the global synced leaderboard
   */
  getAllRegisteredRunners() {
    const list = [];
    for (const key of Object.keys(this.accounts)) {
      const acc = this.accounts[key];
      if (acc && acc.profile) {
        list.push({
          username: acc.username,
          avatar: acc.profile.avatar || '🦅',
          bestDistance: acc.profile.bestDistance || 0,
          bestScore: acc.profile.bestScore || 0,
          wallet: acc.profile.wallet || 0,
          lifetimeNaira: acc.profile.lifetimeNaira || 0,
          lifetimeDistance: acc.profile.lifetimeDistance || 0,
          totalRuns: acc.profile.totalRuns || 0,
          title: acc.profile.title || 'Street Hustler',
          runs: Array.isArray(acc.runs) ? acc.runs : []
        });
      }
    }
    return list;
  }
}

export const accountManager = new AccountManager();
