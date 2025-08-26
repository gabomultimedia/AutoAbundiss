
import { LogOut, Bell, Search } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { useToast } from '../store/useToast';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      addToast({
        type: 'success',
        title: 'Sesión cerrada',
        message: 'Has cerrado sesión exitosamente',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Error al cerrar sesión',
      });
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user}</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
