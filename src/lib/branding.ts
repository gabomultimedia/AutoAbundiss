import { settingsAPI } from './api';

// Configuración por defecto del branding
export const defaultBranding = {
  appName: 'Abundiss Console',
  logoUrl: import.meta.env.VITE_APP_LOGO_URL || 'https://abundiss.com/wp-content/uploads/2021/11/LogoB.png',
  colors: {
    primary: '#0ea5e9',
    accent: '#8b5cf6',
    background: '#0b0d12',
    foreground: '#e6e7eb',
    muted: '#334155',
    border: '#475569',
  },
};

// Tipo para el branding
export interface Branding {
  appName: string;
  logoUrl: string | null;
  colors: {
    primary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
}

// Hook para obtener branding dinámico
export async function getBranding(): Promise<Branding> {
  try {
    const appName = await settingsAPI.get('app_name') || defaultBranding.appName;
    const logoUrl = await settingsAPI.get('logo_url') || defaultBranding.logoUrl;
    const brandColors = await settingsAPI.get('brand_colors') || defaultBranding.colors;

    return {
      appName,
      logoUrl,
      colors: brandColors,
    };
  } catch (error) {
    console.warn('Error loading branding, using defaults:', error);
    return defaultBranding;
  }
}

// Función para aplicar branding a CSS variables
export function applyBranding(branding: Branding): void {
  const root = document.documentElement;
  
  root.style.setProperty('--primary', branding.colors.primary);
  root.style.setProperty('--accent', branding.colors.accent);
  root.style.setProperty('--background', branding.colors.background);
  root.style.setProperty('--foreground', branding.colors.foreground);
  root.style.setProperty('--muted', branding.colors.muted);
  root.style.setProperty('--border', branding.colors.border);
}

// Función para actualizar branding
export async function updateBranding(updates: Partial<Branding>): Promise<void> {
  try {
    if (updates.appName) {
      await settingsAPI.update('app_name', updates.appName);
    }
    if (updates.logoUrl !== undefined) {
      await settingsAPI.update('logo_url', updates.logoUrl);
    }
    if (updates.colors) {
      await settingsAPI.update('brand_colors', updates.colors);
    }
  } catch (error) {
    console.error('Error updating branding:', error);
    throw error;
  }
}

// Función para refrescar branding en tiempo real
export async function refreshBranding(): Promise<Branding> {
  const branding = await getBranding();
  applyBranding(branding);
  return branding;
}

// Función para inicializar branding en la app
export async function initializeBranding(): Promise<Branding> {
  const branding = await getBranding();
  applyBranding(branding);
  return branding;
}
