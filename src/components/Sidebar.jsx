import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  MapPin, 
  Send, 
  FileText, 
  Settings, 
  LogOut,
  HeartHandshake
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Famílias', path: '/families', icon: Users },
    { name: 'Atendimentos', path: '/appointments', icon: CalendarDays },
    { name: 'Visitas Domiciliares', path: '/visits', icon: MapPin },
    { name: 'Encaminhamentos', path: '/referrals', icon: Send },
    { name: 'Relatórios Sociais', path: '/reports', icon: FileText },
    { name: 'Configurações', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-primary-950 border-r border-primary-100 dark:border-primary-900 flex flex-col h-screen transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Area */}
        <div className="p-6 border-b border-primary-100 dark:border-primary-900 flex items-center gap-3">
          <div className="p-2 bg-brand-500 rounded-xl text-white shadow-md shadow-brand-500/20">
            <HeartHandshake size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-primary-950 dark:text-white flex items-center">
              Social<span className="text-brand-500">Flow</span>
            </h1>
            <span className="text-[10px] uppercase font-semibold text-primary-400 tracking-wider">Gestão Social</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/50 hover:text-brand-600 dark:hover:text-brand-400'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-current'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-primary-100 dark:border-primary-900">
        <div className="flex items-center gap-3 p-2 bg-primary-50 dark:bg-primary-900/40 rounded-2xl mb-2">
          <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
            {user?.name?.substring(0, 2) || 'AS'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary-900 dark:text-white truncate">
              {user?.name || 'Assistente Social'}
            </p>
            <p className="text-[10px] text-primary-400 dark:text-primary-500 uppercase font-bold tracking-wider">
              {user?.role === 'ADMIN' ? 'Administrador' : 'Assistente Social'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-sm font-medium transition-colors"
        >
          <LogOut size={18} />
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>
  </>
  );
};

export default Sidebar;
