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
