export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
  createdAt: number;
}

const SESSION_COOKIE_NAME = 'satify_session';
const USER_STORAGE_KEY = 'satify_user_profile';

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
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
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
      // Backend not running (e.g. GitHub Pages static deployment)
    }

    // Client-side JWT parse fallback
    const payload = parseJwt(credentialOrProfile);
    profile = {
      id: payload?.sub || `google-${Date.now()}`,
      name: payload?.name || payload?.email?.split('@')[0] || 'SAT Student',
      email: payload?.email || 'student@example.com',
      picture: payload?.picture,
      createdAt: Date.now(),
    };
  } else {
    // Explicit profile object
    profile = {
      id: `user-${Date.now()}`,
      name: credentialOrProfile.name,
      email: credentialOrProfile.email,
      picture: credentialOrProfile.picture,
      createdAt: Date.now(),
    };
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
