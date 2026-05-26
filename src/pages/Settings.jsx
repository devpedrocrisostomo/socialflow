import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  User, 
  KeyRound, 
  UserPlus, 
  Users, 
  Loader2, 
  Check, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  
  // Perfil do Usuário Logado
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePassword, setProfilePassword] = useState('');
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Cadastro de Novo Usuário (Apenas Admin)
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('SOCIAL_ASSISTANT');
  
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  // Lista de Usuários do Sistema
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    if (user?.role !== 'ADMIN') return;
    setLoadingUsers(true);
    try {
      const response = await api.get('/auth/users');
      setUsersList(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    const payload = {
      name: profileName,
      email: profileEmail,
    };
    if (profilePassword) {
      payload.password = profilePassword;
    }

    const res = await updateProfile(payload);
    setProfileLoading(false);
    if (res.success) {
      setProfileSuccess('Perfil atualizado com sucesso!');
      setProfilePassword('');
    } else {
      setProfileError(res.error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');
    setUserLoading(true);

    try {
      await api.post('/auth/register', {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });

      setUserSuccess(`Usuário ${newUserName} cadastrado com sucesso!`);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('SOCIAL_ASSISTANT');
      
      // Atualizar lista
      fetchUsers();
    } catch (err) {
      console.error(err);
      setUserError(err.response?.data?.error || 'Erro ao cadastrar novo usuário.');
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-extrabold text-primary-950 dark:text-white tracking-tight">Configurações do Sistema</h1>
        <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">Gerencie seu perfil de acesso e controle contas de assistentes sociais do município.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Coluna 1: Edição de Perfil Pessoal */}
        <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl space-y-5">
          <div className="border-b border-primary-100 dark:border-primary-850 pb-3 flex items-center gap-2 text-primary-900 dark:text-white">
            <User size={18} className="text-brand-500" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide">Meu Perfil de Acesso</h3>
          </div>

          {profileError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100 dark:border-red-900/50">
              <AlertCircle size={14} />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="p-3 bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-brand-100 dark:border-brand-900/50">
              <Check size={14} />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            {/* Nome */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Nome Completo</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
              />
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">E-mail Corporativo</label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Alterar Senha (Deixe em branco para manter)</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Nova senha de segurança"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                />
                <div className="absolute left-3.5 top-3 text-primary-400">
                  <KeyRound size={14} />
                </div>
              </div>
            </div>

            {/* Cargo / Permissão (Leitura) */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Nível de Permissão</label>
              <div className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-500 py-2.5 px-3.5 rounded-xl border border-primary-100 dark:border-primary-850 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                <ShieldCheck size={14} className="text-brand-500" />
                <span>{user?.role === 'ADMIN' ? 'Administrador do Sistema' : 'Assistente Social Corporativo'}</span>
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-brand-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-75 transition-colors"
              >
                {profileLoading && <Loader2 size={12} className="animate-spin" />}
                <span>Salvar Meu Perfil</span>
              </button>
            </div>
          </form>
        </div>

        {/* Coluna 2: Seção do Administrador (Cadastrar novo assistente social) */}
        {user?.role === 'ADMIN' ? (
          <div className="space-y-6">
            
            {/* Form de Cadastro */}
            <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl space-y-5">
              <div className="border-b border-primary-100 dark:border-primary-850 pb-3 flex items-center gap-2 text-primary-900 dark:text-white">
                <UserPlus size={18} className="text-brand-500" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">Cadastrar Novo Assistente / Usuário</h3>
              </div>

              {userError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100 dark:border-red-900/50">
                  <AlertCircle size={14} />
                  <span>{userError}</span>
                </div>
              )}

              {userSuccess && (
                <div className="p-3 bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-brand-100 dark:border-brand-900/50">
                  <Check size={14} />
                  <span>{userSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome do assistente social"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* E-mail */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">E-mail Corporativo *</label>
                    <input
                      type="email"
                      required
                      placeholder="ex: assistente@socialflow.com.br"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Senha */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Senha de Acesso *</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Tipo / Nível de Acesso */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Cargo / Papel no Sistema *</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
                    >
                      <option value="SOCIAL_ASSISTANT">Assistente Social (Operador)</option>
                      <option value="ADMIN">Administrador (Coordenador Técnico)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={userLoading}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-brand-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-75 transition-colors"
                  >
                    {userLoading && <Loader2 size={12} className="animate-spin" />}
                    <span>Cadastrar Usuário</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Listagem de Usuários Cadastrados */}
            <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl space-y-4">
              <div className="border-b border-primary-100 dark:border-primary-850 pb-3 flex items-center gap-2 text-primary-900 dark:text-white">
                <Users size={18} className="text-brand-500" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">Equipe Social Cadastrada</h3>
              </div>

              {loadingUsers ? (
                <div className="py-8 flex justify-center items-center">
                  <Loader2 size={18} className="text-brand-500 animate-spin" />
                </div>
              ) : (
                <div className="divide-y divide-primary-50 dark:divide-primary-850 max-h-56 overflow-y-auto space-y-3 pr-2">
                  {usersList.map((usr) => (
                    <div key={usr.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-primary-900 dark:text-white">{usr.name}</p>
                        <p className="text-[10px] text-primary-400 mt-0.5">{usr.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        usr.role === 'ADMIN' 
                          ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-400' 
                          : 'bg-primary-50 dark:bg-primary-950 text-primary-500'
                      }`}>
                        {usr.role === 'ADMIN' ? 'Coordenador' : 'Assistente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
            <Users size={32} className="text-primary-300" />
            <h4 className="font-bold text-xs text-primary-800 dark:text-white">Painel da Equipe Restrito</h4>
            <p className="text-[11px] text-primary-400 leading-relaxed max-w-xs">
              Apenas usuários com privilégios de **Coordenador Técnico (Administrador)** podem cadastrar novos assistentes sociais e ver a lista completa da equipe.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
