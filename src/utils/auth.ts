export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
  createdAt: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  picture?: string;
  createdAt: number;
}

const SESSION_COOKIE_NAME = 'satify_session';
const USER_STORAGE_KEY = 'satify_user_profile';
const REGISTERED_USERS_KEY = 'satify_registered_users';

/**
 * Hashes a user's password with SHA-256 using subtle crypto
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + '_satify_salt_2026');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('Crypto subtle unavailable, using fallback encoder:', e);
  }
  // Fallback encoding
  return btoa(unescape(encodeURIComponent(password + '_satify_salt_2026')));
};

/**
 * Gets all registered user accounts from persistent local storage
 */
export const getRegisteredUsers = (): UserAccount[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse registered users:', e);
  }
  return [];
};

/**
 * Saves registered users to persistent local storage
 */
const saveRegisteredUsers = (users: UserAccount[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Failed to save registered users:', e);
  }
};

/**
 * Generates an SVG avatar URI with user's initials
 */
export const generateInitialsAvatar = (name: string): string => {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'S';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(#g)"/><text x="50" y="58" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="40" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Decodes a Google Identity JWT token without external libraries
 */
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

/**
 * Retrieves the currently logged in user from cookie or localStorage
 */
export const getCurrentUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to retrieve user profile:', e);
  }
  return null;
};

/**
 * Stores user profile to cookie and localStorage
 */
export const setUserSession = (user: UserProfile) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    // Set cookie valid for 30 days
    const cookieVal = encodeURIComponent(JSON.stringify(user));
    document.cookie = `${SESSION_COOKIE_NAME}=${cookieVal}; path=/; max-age=2592000; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('satify_auth_changed', { detail: user }));
  } catch (e) {
    console.warn('Failed to set user session:', e);
  }
};

/**
 * Clears user session from cookie and localStorage
 */
export const clearUserSession = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('satify_auth_changed', { detail: null }));
  } catch (e) {
    console.warn('Failed to clear user session:', e);
  }
};

/**
 * Sends the CEO Welcome Email via backend route
 */
export const triggerWelcomeEmail = async (user: UserProfile): Promise<boolean> => {
  try {
    const res = await fetch('/api/auth/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log('Welcome email dispatched:', data);
      return true;
    }
  } catch (err) {
    console.info('Welcome email backend dispatch notice (running client fallback):', err);
  }
  return false;
};

/**
 * Registers a new user with Email + Password
 */
export const registerWithEmail = async (
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName) {
    return { success: false, error: 'Please enter your full name.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const users = getRegisteredUsers();
  const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
  }

  const passwordHash = await hashPassword(password);
  const avatar = generateInitialsAvatar(cleanName);
  const newAccount: UserAccount = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    picture: avatar,
    createdAt: Date.now(),
  };

  users.push(newAccount);
  saveRegisteredUsers(users);

  const profile: UserProfile = {
    id: newAccount.id,
    name: newAccount.name,
    email: newAccount.email,
    picture: newAccount.picture,
    createdAt: newAccount.createdAt,
  };

  setUserSession(profile);
  triggerWelcomeEmail(profile);

  return { success: true, user: profile };
};

/**
 * Logs in an existing user with Email + Password
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return { success: false, error: 'Please enter your email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const users = getRegisteredUsers();
  const account = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!account) {
    return {
      success: false,
      error: 'No account found with this email. Please click "Create Account" below to register.',
    };
  }

  const inputHash = await hashPassword(password);
  if (account.passwordHash !== inputHash) {
    return {
      success: false,
      error: 'Incorrect password. Please try again or click "Forgot password?".',
    };
  }

  const profile: UserProfile = {
    id: account.id,
    name: account.name,
    email: account.email,
    picture: account.picture || generateInitialsAvatar(account.name),
    createdAt: account.createdAt,
  };

  setUserSession(profile);
  return { success: true, user: profile };
};

/**
 * Resets a user's password by email
 */
export const resetPassword = async (
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return { success: false, error: 'Please enter your email address.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  const users = getRegisteredUsers();
  const userIdx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  if (userIdx === -1) {
    return {
      success: false,
      error: 'No account found with this email address.',
    };
  }

  const newHash = await hashPassword(newPassword);
  users[userIdx].passwordHash = newHash;
  saveRegisteredUsers(users);

  return { success: true };
};

/**
 * Authenticates user with Google credential or payload
 */
export const authenticateWithGoogle = async (
  credentialOrProfile: string | { name: string; email: string; picture?: string }
): Promise<UserProfile> => {
  let profile: UserProfile;

  if (typeof credentialOrProfile === 'string') {
    // Attempt backend verification first
    try {
      const resp = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialOrProfile }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.user) {
          setUserSession(data.user);
          return data.user;
        }
      }
    } catch (e) {
      // Backend not running (e.g. GitHub Pages or static deployment)
    }

    // Client-side JWT parse fallback
    const payload = parseJwt(credentialOrProfile);
    profile = {
      id: payload?.sub || `google-${Date.now()}`,
      name: payload?.name || payload?.email?.split('@')[0] || 'SAT Student',
      email: payload?.email || 'student@example.com',
      picture: payload?.picture || generateInitialsAvatar(payload?.name || 'SAT Student'),
      createdAt: Date.now(),
    };
  } else {
    // Explicit profile object
    profile = {
      id: `google-${Date.now()}`,
      name: credentialOrProfile.name,
      email: credentialOrProfile.email,
      picture: credentialOrProfile.picture || generateInitialsAvatar(credentialOrProfile.name),
      createdAt: Date.now(),
    };
  }

  // Register in user accounts list if not already registered
  const users = getRegisteredUsers();
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === profile.email.toLowerCase());
  if (existingIdx === -1) {
    users.push({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      passwordHash: 'GOOGLE_OAUTH_ACCOUNT',
      picture: profile.picture,
      createdAt: profile.createdAt,
    });
    saveRegisteredUsers(users);
  } else {
    // Update picture or name
    users[existingIdx].name = profile.name;
    if (profile.picture) users[existingIdx].picture = profile.picture;
    saveRegisteredUsers(users);
  }

  setUserSession(profile);
  // Send CEO Welcome Email asynchronously
  triggerWelcomeEmail(profile);

  return profile;
};

/**
 * Logs out the active user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {
    // Ignore offline errors
  }
  clearUserSession();
};
