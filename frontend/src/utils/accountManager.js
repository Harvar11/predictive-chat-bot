// Unified device account manager for Spotify-style multi-account switching

const STORAGE_KEY = 'clairvoyant_device_accounts';

/**
 * Normalizes an account object to a standard schema
 */
export function normalizeAccount(acc, fallbackAuthType = 'password') {
  if (!acc) return null;
  const email = acc.email?.trim().toLowerCase() || '';
  const username = acc.username?.trim().toLowerCase() || (email ? email.split('@')[0] : '');
  const name = acc.name?.trim() || username || 'User';
  const userId = acc.user_id || (acc.auth_type === 'google' || fallbackAuthType === 'google'
    ? `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`
    : `user_${username.replace(/[^a-zA-Z0-9]/g, '_')}`);
  const authType = acc.auth_type || (userId.startsWith('google_') ? 'google' : fallbackAuthType);
  const avatarUrl = acc.avatar_url || acc.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username || email || 'user')}`;

  return {
    user_id: userId,
    email,
    username,
    name,
    avatar_url: avatarUrl,
    auth_type: authType,
    last_used: acc.last_used || Date.now(),
    total_trials: Number(acc.total_trials || 0),
    accuracy_percent: Number(acc.accuracy_percent || 0),
    master_persona: acc.master_persona || null
  };
}

/**
 * Retrieves all saved accounts on this device, automatically migrating legacy storage if needed.
 */
export function getDeviceAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let accounts = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(accounts)) {
      accounts = [];
    }

    // Auto-migrate from legacy clairvoyant_user / clairvoyant_google_accounts if empty or missing
    if (accounts.length === 0) {
      const legacyUserRaw = localStorage.getItem('clairvoyant_user');
      if (legacyUserRaw) {
        try {
          const legacyUser = JSON.parse(legacyUserRaw);
          const normalized = normalizeAccount(legacyUser);
          if (normalized) accounts.push(normalized);
        } catch {}
      }

      const legacyGoogleRaw = localStorage.getItem('clairvoyant_google_accounts');
      if (legacyGoogleRaw) {
        try {
          const legacyGoogleList = JSON.parse(legacyGoogleRaw);
          if (Array.isArray(legacyGoogleList)) {
            for (const gAcc of legacyGoogleList) {
              const normalized = normalizeAccount(gAcc, 'google');
              if (normalized && !accounts.some((a) => a.email === normalized.email)) {
                accounts.push(normalized);
              }
            }
          }
        } catch {}
      }

      if (accounts.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      }
    }

    return accounts;
  } catch (err) {
    console.error('Failed to load device accounts:', err);
    return [];
  }
}

/**
 * Saves or updates an account in the device list and brings it to the top.
 */
export function saveDeviceAccount(account) {
  if (!account) return getDeviceAccounts();
  const normalized = normalizeAccount(account);
  if (!normalized) return getDeviceAccounts();

  try {
    const current = getDeviceAccounts();
    // Filter out existing account by user_id or email
    const filtered = current.filter((a) => {
      if (a.user_id && normalized.user_id && a.user_id === normalized.user_id) return false;
      if (a.email && normalized.email && a.email.toLowerCase() === normalized.email.toLowerCase()) return false;
      if (a.username && normalized.username && a.username.toLowerCase() === normalized.username.toLowerCase()) return false;
      return true;
    });

    const updated = [{ ...normalized, last_used: Date.now() }, ...filtered].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Also maintain backwards compatibility for Google accounts
    if (normalized.auth_type === 'google' && normalized.email) {
      try {
        const googleAccounts = JSON.parse(localStorage.getItem('clairvoyant_google_accounts') || '[]');
        const filteredG = googleAccounts.filter((g) => g.email?.toLowerCase() !== normalized.email.toLowerCase());
        localStorage.setItem('clairvoyant_google_accounts', JSON.stringify([normalized, ...filteredG].slice(0, 6)));
      } catch {}
    }

    return updated;
  } catch (err) {
    console.error('Failed to save device account:', err);
    return getDeviceAccounts();
  }
}

/**
 * Removes an account from this device.
 */
export function removeDeviceAccount(userIdOrEmail) {
  if (!userIdOrEmail) return getDeviceAccounts();
  const target = userIdOrEmail.toLowerCase();
  try {
    const current = getDeviceAccounts();
    const updated = current.filter((a) => a.user_id?.toLowerCase() !== target && a.email?.toLowerCase() !== target && a.username?.toLowerCase() !== target);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Also remove from legacy google accounts list
    try {
      const googleAccounts = JSON.parse(localStorage.getItem('clairvoyant_google_accounts') || '[]');
      const filteredG = googleAccounts.filter((g) => g.email?.toLowerCase() !== target && g.user_id?.toLowerCase() !== target);
      localStorage.setItem('clairvoyant_google_accounts', JSON.stringify(filteredG));
    } catch {}

    return updated;
  } catch (err) {
    console.error('Failed to remove device account:', err);
    return getDeviceAccounts();
  }
}

/**
 * Clears all accounts from device.
 */
export function clearAllDeviceAccounts() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('clairvoyant_google_accounts');
    localStorage.removeItem('clairvoyant_user');
    localStorage.removeItem('aura_user');
  } catch {}
}
