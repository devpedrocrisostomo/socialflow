import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  Check, 
  CheckCheck,
  Loader2,
  Users,
  Calendar,
  FileText,
  AlertCircle,
  Menu
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  // Estados de Notificações
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Estados de Busca Global
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Buscar notificações do backend
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Erro ao buscar notificações', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fechar menus flutuantes ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler de Busca Global
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setShowSearchDropdown(true);
        try {
          const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
          setSearchResults(response.data);
        } catch (error) {
          console.error('Erro ao realizar busca global', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Erro ao ler notificação', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Erro ao ler todas notificações', error);
    }
  };

  const handleResultClick = (path) => {
    setSearchQuery('');
    setSearchResults(null);
    setShowSearchDropdown(false);
    navigate(path);
  };

  return (
    <header className="h-16 bg-white dark:bg-primary-950 border-b border-primary-100 dark:border-primary-900 px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300">
      {/* Welcome Message */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/50 rounded-xl lg:hidden flex items-center justify-center transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <p className="text-[11px] text-primary-400 dark:text-primary-500 font-bold uppercase tracking-wider">Bem-vindo de volta</p>
          <h2 className="text-sm font-bold text-primary-800 dark:text-white">Olá, {user?.name?.split(' ')[0] || 'Assistente'}</h2>
        </div>
      </div>

      {/* Global Search Bar */}
      <div ref={searchRef} className="relative w-96 max-w-md hidden md:block">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar famílias, atendimentos, relatórios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim().length >= 2 && setShowSearchDropdown(true)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 pl-10 pr-4 py-2 rounded-xl text-sm border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all duration-200"
          />
          <div className="absolute left-3.5 top-2.5 text-primary-400">
            <Search size={16} />
          </div>
          {isSearching && (
            <div className="absolute right-3.5 top-2.5 text-brand-500 animate-spin">
              <Loader2 size={16} />
            </div>
          )}
        </div>

        {/* Dropdown de Busca */}
        {showSearchDropdown && searchResults && (
          <div className="absolute top-12 left-0 right-0 bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-2xl shadow-xl z-50 p-4 max-h-96 overflow-y-auto">
            {/* Seções de Resultados */}
            <div className="space-y-4">
              {/* Famílias */}
              {searchResults.families.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-primary-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Users size={12} /> Famílias
                  </h4>
                  <ul className="space-y-1">
                    {searchResults.families.map((fam) => (
                      <li key={fam.id}>
                        <button
                          onClick={() => handleResultClick(`/families/${fam.id}`)}
                          className="w-full text-left text-xs text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800 px-2 py-1.5 rounded-lg transition-colors"
                        >
                          <p className="font-semibold">{fam.nameResponsible}</p>
                          <p className="text-[10px] text-primary-400">CPF: {fam.cpf}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Integrantes */}
              {searchResults.people.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-primary-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Users size={12} /> Membros da Família
                  </h4>
                  <ul className="space-y-1">
                    {searchResults.people.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => handleResultClick(`/families/${p.familyId}`)}
                          className="w-full text-left text-xs text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800 px-2 py-1.5 rounded-lg transition-colors"
                        >
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-[10px] text-primary-400">Família de: {p.family.nameResponsible}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Atendimentos */}
              {searchResults.appointments.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-primary-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Calendar size={12} /> Atendimentos
                  </h4>
                  <ul className="space-y-1">
                    {searchResults.appointments.map((app) => (
                      <li key={app.id}>
                        <button
                          onClick={() => handleResultClick(`/appointments`)}
                          className="w-full text-left text-xs text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800 px-2 py-1.5 rounded-lg transition-colors truncate"
                        >
                          <p className="font-semibold">{app.type} - {new Date(app.date).toLocaleDateString('pt-BR')}</p>
                          <p className="text-[10px] text-primary-400 truncate">Resp: {app.family.nameResponsible}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Relatórios */}
              {searchResults.reports.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-primary-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <FileText size={12} /> Relatórios
                  </h4>
                  <ul className="space-y-1">
                    {searchResults.reports.map((rep) => (
                      <li key={rep.id}>
                        <button
                          onClick={() => handleResultClick(`/reports`)}
                          className="w-full text-left text-xs text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800 px-2 py-1.5 rounded-lg transition-colors"
                        >
                          <p className="font-semibold">{rep.title}</p>
                          <p className="text-[10px] text-primary-400">Família: {rep.family.nameResponsible}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {searchResults.families.length === 0 &&
               searchResults.people.length === 0 &&
               searchResults.appointments.length === 0 &&
               searchResults.reports.length === 0 && (
                <div className="text-center py-4 text-xs text-primary-400">
                  Nenhum resultado encontrado para "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toolbar Options (Theme Toggle, Notifications) */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-brand-500 rounded-xl transition-all duration-200"
          title="Alternar Modo Escuro"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Icon and Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-brand-500 rounded-xl relative transition-all duration-200"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-primary-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-4 border-b border-primary-100 dark:border-primary-800 flex items-center justify-between">
                <span className="font-bold text-xs text-primary-800 dark:text-white">Alertas e Notificações</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <CheckCheck size={12} /> Ler Tudo
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-primary-50 dark:divide-primary-800">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 text-xs transition-colors flex gap-2 ${
                        notif.isRead ? 'bg-white dark:bg-primary-900 opacity-70' : 'bg-brand-50/40 dark:bg-brand-950/20'
                      }`}
                    >
                      <div className="text-brand-500 shrink-0 mt-0.5">
                        <AlertCircle size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-bold text-primary-800 dark:text-white truncate">{notif.title}</p>
                          <span className="text-[9px] text-primary-400 whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-primary-600 dark:text-primary-300 mt-1 line-clamp-2">{notif.message}</p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-brand-500 hover:text-brand-600 self-center"
                          title="Marcar como lida"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-primary-400">
                    Nenhuma notificação por aqui.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
