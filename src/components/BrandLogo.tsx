
import { useState, useEffect } from 'react';
import { defaultBranding } from '../lib/branding';
import { settingsAPI } from '../lib/api';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
  };

  const loadLogo = async () => {
    try {
      const logo = await settingsAPI.get('logo_url');
      setLogoUrl(logo);
    } catch (error) {
      console.warn('Error loading logo:', error);
      setLogoUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogo();
    
    // Escuchar cambios en el branding
    const handleBrandingUpdate = () => {
      loadLogo();
    };
    
    window.addEventListener('branding-updated', handleBrandingUpdate);
    
    return () => {
      window.removeEventListener('branding-updated', handleBrandingUpdate);
    };
  }, []);

  // Si hay una URL de logo configurada y cargada, usarla
  if (logoUrl && !isLoading) {
    return (
      <img
        src={logoUrl}
        alt={defaultBranding.appName}
        className={`${sizeClasses[size]} w-auto ${className}`}
        onError={() => setLogoUrl(null)} // Fallback si la imagen falla
      />
    );
  }

  // Fallback SVG con el nombre de la marca
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} w-auto`}>
        <svg
          viewBox="0 0 100 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Círculo estilizado como "A" */}
          <circle cx="15" cy="15" r="12" fill="currentColor" className="text-primary" />
          <path
            d="M15 5 L25 25 L5 25 Z"
            fill="currentColor"
            className="text-primary-foreground"
          />
          
          {/* Texto "Abundiss" */}
          <text
            x="35"
            y="20"
            fill="currentColor"
            className="text-foreground"
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Abundiss
          </text>
        </svg>
      </div>
    </div>
  );
}
