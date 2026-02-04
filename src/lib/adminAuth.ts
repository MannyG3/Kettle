// Simple admin authentication
// In production, use a proper authentication system

const ADMIN_CREDENTIALS = {
  username: 'Admin',
  password: 'Admin@123'
};

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
}

export function getAdminSessionKey(): string {
  // Simple session key for demo - in production use proper JWT/session tokens
  return 'tea-admin-authenticated';
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(getAdminSessionKey()) === 'true';
}

export function setAdminAuthenticated(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  if (authenticated) {
    sessionStorage.setItem(getAdminSessionKey(), 'true');
  } else {
    sessionStorage.removeItem(getAdminSessionKey());
  }
}

export function logoutAdmin(): void {
  setAdminAuthenticated(false);
}
