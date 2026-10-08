export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  role: string; // 'SuperAdmin' | 'Biller' | custom
  permissions: string[];
  token?: string;
  hasPin?: boolean;
}

export const PRESET_USERS: Record<string, { username: string; pin: string; pass: string; role: string; name: string; permissions: string[] }> = {
  hanzala: {
    username: 'hanzala',
    pin: '1234',
    pass: 'admin123',
    role: 'SuperAdmin',
    name: 'Hanzala Mushtaq (مالک)',
    permissions: [
      'can_bill',
      'can_pisai',
      'can_discount',
      'can_manage_prices',
      'can_issue_credit',
      'can_view_reports',
      'can_void_bills',
      'can_close_day',
      'can_manage_users',
    ],
  },
  asif: {
    username: 'asif',
    pin: '0001',
    pass: 'biller123',
    role: 'Biller',
    name: 'محمد عاصف (کاؤنٹر 01)',
    permissions: ['can_bill', 'can_pisai'],
  },
};

const SESSION_KEY = 'flour_erp_user_session';
const TOKEN_KEY = 'flour_erp_token';

export function saveSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (session.token) {
      localStorage.setItem(TOKEN_KEY, session.token);
    }
  } catch (err) {
    console.error('Failed to save session to localStorage', err);
  }
}

export function getSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch (err) {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Failed to clear session', err);
  }
}

import { getApiBaseUrl } from './api';

export function isTokenExpired(token?: string | null): boolean {
  if (!token) return true;
  if (token.startsWith('local-token-')) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = typeof window !== 'undefined'
      ? decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
      : Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return Math.floor(Date.now() / 1000) >= payload.exp - 60;
  } catch {
    return true;
  }
}

export async function ensureValidToken(user?: UserSession | null, forceRefresh: boolean = false): Promise<string | null> {
  const current = user || getSession();
  if (!current) return null;

  // Local sessions are self-contained and must not be invalidated by remote refresh
  if (current.token && current.token.startsWith('local-token-')) {
    return current.token;
  }
  if (current.id && current.id.startsWith('local-')) {
    return current.token || null;
  }

  // If token is already a real 3-part JWT and not expired, and not forced, use it
  if (!forceRefresh && current.token && current.token.split('.').length === 3 && !isTokenExpired(current.token)) {
    return current.token;
  }

  // Token is expired, invalid, or forced to refresh: automatically obtain fresh JWT from backend API
  const uname = current.username?.toLowerCase();
  const preset = PRESET_USERS[uname];
  if (preset) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: preset.username,
          password: preset.pass,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.token) {
          const updated: UserSession = {
            ...current,
            id: json.data.user.id,
            token: json.data.token,
            permissions: json.data.user.permissions || current.permissions,
          };
          saveSession(updated);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('flour_erp_token_refreshed', { detail: updated }));
          }
          return json.data.token;
        }
      }
    } catch (e) {
      console.error('Failed to auto-upgrade session token', e);
    }
  }

  if (forceRefresh) {
    clearSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flour_erp_session_cleared'));
    }
    return null;
  }

  return current.token || null;
}

export function hasPermission(user: UserSession | null, permissionCode: string): boolean {
  if (!user) return false;
  // SuperAdmin has wildcard access
  if (user.role === 'SuperAdmin' || user.role === 'SuperAdmin (مالک)') return true;
  return Array.isArray(user.permissions) && user.permissions.includes(permissionCode);
}

export function isAdmin(user: UserSession | null): boolean {
  if (!user) return false;
  return (
    user.role === 'SuperAdmin' ||
    user.role === 'SuperAdmin (مالک)' ||
    hasPermission(user, 'can_manage_users')
  );
}

export function isBiller(user: UserSession | null): boolean {
  if (!user) return false;
  return user.role === 'Biller' || user.role === 'Biller (کاؤنٹر آپریٹر)';
}

export async function refreshCurrentUserProfile(): Promise<UserSession | null> {
  if (typeof window === 'undefined') return null;
  const current = getSession();
  if (!current || !current.token) return null;

  // Local/preset/offline sessions must NEVER be rejected or cleared by remote 401
  if (current.token.startsWith('local-token-') || current.id?.startsWith('local-')) {
    return current;
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${current.token}` },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.user) {
        const u = json.data.user;
        const currentPerms = Array.isArray(current.permissions) ? current.permissions : [];
        const newPerms = Array.isArray(u.permissions) ? u.permissions : [];

        const roleChanged = current.role !== u.role;
        const permsChanged =
          currentPerms.length !== newPerms.length ||
          currentPerms.some((p) => !newPerms.includes(p));

        if (roleChanged || permsChanged || current.fullName !== u.fullName) {
          const updated: UserSession = {
            ...current,
            fullName: u.fullName || current.fullName,
            role: u.role || current.role,
            permissions: newPerms,
            hasPin: u.hasPin !== undefined ? u.hasPin : current.hasPin,
          };
          saveSession(updated);
          window.dispatchEvent(new CustomEvent('flour_erp_token_refreshed', { detail: updated }));
          return updated;
        }
        return current;
      }
    } else if (res.status === 401 || res.status === 403) {
      clearSession();
      window.dispatchEvent(new CustomEvent('flour_erp_session_cleared'));
      return null;
    }
  } catch {
    // Silently ignore network hiccup
  }
  return current;
}
