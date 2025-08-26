import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Tag, 
  FolderOpen, 
  Calendar, 
  FileText, 
  Settings 
} from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { BrandLogo } from './BrandLogo';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Conversaciones', icon: MessageSquare, path: '/conversations' },
  { name: 'Promociones', icon: Tag, path: '/promotions' },
  { name: 'Base de Conocimiento', icon: FileText, path: '/knowledge' },
  { name: 'Calendario', icon: Calendar, path: '/calendar' },
  { name: 'Archivos', icon: FolderOpen, path: '/files' },
  { name: 'Configuración', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0">
      <div className="p-6">
        <BrandLogo className="h-8 w-auto" />
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {user && (
        <div className="mt-auto p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                {user.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user}
              </p>
              <p className="text-xs text-muted-foreground">
                Administrador
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
