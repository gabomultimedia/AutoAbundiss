import { authAPI } from './api';

// Helper para obtener cookies
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper para verificar si existe la sesión
export function hasSession(): boolean {
  return !!getCookie('ab_session');
}

// Helper para limpiar cookies
export function clearCookies(): void {
  document.cookie = 'ab_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Helper para verificar autenticación
export async function checkAuth(): Promise<boolean> {
  try {
    if (!hasSession()) return false;
    return await authAPI.checkSession();
  } catch {
    clearCookies();
    return false;
  }
}

// Helper para login
export async function login(username: string, password: string): Promise<boolean> {
  try {
    const result = await authAPI.login({ username, password });
    return result.success;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

// Helper para logout
export async function logout(): Promise<void> {
  try {
    await authAPI.logout();
  } finally {
    clearCookies();
  }
}
