import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // Aquí puedes guardar los tokens en localStorage o enviarlos a tu backend
      localStorage.setItem('kommo_access_token', accessToken);
      localStorage.setItem('kommo_refresh_token', refreshToken);
      
      setStatus('success');
      setMessage('¡Autenticación exitosa con Kommo!');
      
      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } else {
      setStatus('error');
      setMessage('Error en la autenticación. No se recibieron los tokens necesarios.');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        )}
        
        {status === 'success' && (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        )}
        
        {status === 'error' && (
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        )}

        <h1 className="text-2xl font-bold text-foreground mb-4">
          {status === 'loading' && 'Procesando autenticación...'}
          {status === 'success' && '¡Autenticación Exitosa!'}
          {status === 'error' && 'Error de Autenticación'}
        </h1>

        <p className="text-muted-foreground mb-6">
          {message}
        </p>

        {status === 'success' && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm text-green-400">
                Tu cuenta de Kommo ha sido conectada exitosamente.
                Serás redirigido al dashboard en unos segundos.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Ir al Dashboard
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm text-red-400">
                Hubo un problema con la autenticación. 
                Por favor, intenta nuevamente.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/settings')}
              className="w-full bg-muted hover:bg-muted/80 text-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Ir a Configuración
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
