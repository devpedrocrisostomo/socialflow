import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, 
  CalendarDays, 
  MapPin, 
  Send, 
  Loader2, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[80vh]">
        <Loader2 size={36} className="text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/50 flex gap-2 items-center">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const { stats, charts, upcoming } = data;

  // Cores dos Gráficos
  const COLORS_PIE = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];
  const COLORS_BAR = {
    CRITICAL: '#ef4444',
    VULNERABLE: '#f59e0b',
    STABLE: '#22c55e'
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-primary-900 p-3 border border-primary-100 dark:border-primary-800 rounded-xl shadow-lg text-xs">
          <p className="font-bold text-primary-900 dark:text-white">{payload[0].name}</p>
          <p className="text-brand-600 dark:text-brand-400 mt-1 font-semibold">Total: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-950 dark:text-white tracking-tight">Painel de Acompanhamento</h1>
          <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">Estatísticas gerais e próximos atendimentos agendados.</p>
        </div>
        <div className="text-xs font-bold text-primary-400 uppercase tracking-wider bg-white dark:bg-primary-950 px-3 py-1.5 rounded-xl border border-primary-100 dark:border-primary-900">
          Dados em tempo real
        </div>
      </div>

      {/* Cartões Estatísticos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Famílias */}
        <div 
          onClick={() => navigate('/families')}
          className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800/80 p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-lg hover:shadow-primary-100/50 dark:hover:shadow-none hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">Famílias Atendidas</span>
            <p className="text-3xl font-extrabold text-primary-900 dark:text-white">{stats.totalFamilies}</p>
          </div>
          <div className="p-4 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 rounded-2xl group-hover:bg-brand-500 group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
        </div>

        {/* Atendimentos do Mês */}
        <div 
          onClick={() => navigate('/appointments')}
          className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800/80 p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-lg hover:shadow-primary-100/50 dark:hover:shadow-none hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">Atendimentos no Mês</span>
            <p className="text-3xl font-extrabold text-primary-900 dark:text-white">{stats.appointmentsThisMonth}</p>
          </div>
          <div className="p-4 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 rounded-2xl group-hover:bg-brand-500 group-hover:text-white transition-colors">
            <CalendarDays size={24} />
          </div>
        </div>

        {/* Casos Críticos */}
        <div 
          onClick={() => navigate('/families?socialSituation=CRITICAL')}
          className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800/80 p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:border-red-500 dark:hover:border-red-500 hover:shadow-lg hover:shadow-primary-100/50 dark:hover:shadow-none hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">Acompanhamento Crítico</span>
            <p className="text-3xl font-extrabold text-red-600 dark:text-red-400">{stats.criticalCases}</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-colors">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Encaminhamentos Pendentes */}
        <div 
          onClick={() => navigate('/referrals')}
          className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800/80 p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-lg hover:shadow-primary-100/50 dark:hover:shadow-none hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">Encaminhamentos Pendentes</span>
            <p className="text-3xl font-extrabold text-primary-900 dark:text-white">{stats.pendingReferrals}</p>
          </div>
          <div className="p-4 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 rounded-2xl group-hover:bg-brand-500 group-hover:text-white transition-colors">
            <Send size={24} />
          </div>
        </div>

      </div>

      {/* Gráficos em Duas Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Situação Social das Famílias */}
        <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-primary-900 dark:text-white">Famílias por Situação Social</h3>
            <p className="text-xs text-primary-400">Classificação atualizada do nível de vulnerabilidade.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.socialSituationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-primary-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {charts.socialSituationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_BAR[entry.key] || '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Atendimentos por Tipo */}
        <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-primary-900 dark:text-white">Tipologia de Atendimentos</h3>
            <p className="text-xs text-primary-400">Distribuição por canal de contato / gravidade.</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {charts.appointmentTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.appointmentTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.appointmentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-primary-400">Nenhum atendimento registrado ainda.</p>
            )}
          </div>
        </div>

      </div>

      {/* Próximos Atendimentos e Visitas Domiciliares */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Agenda de Atendimentos */}
        <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-primary-900 dark:text-white">Próximos Atendimentos</h3>
              <button 
                onClick={() => navigate('/appointments')}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                Ver tudo <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {upcoming.appointments.length > 0 ? (
                upcoming.appointments.map((app) => (
                  <div key={app.id} className="p-4 bg-primary-50 dark:bg-primary-900/50 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-primary-800 dark:text-white">{app.family}</p>
                      <p className="text-primary-400 mt-1">Responsável: {app.assistant}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-800 dark:text-white">
                        {new Date(app.date).toLocaleDateString('pt-BR')} às {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-1.5 uppercase ${
                        app.type === 'Emergencial' 
                          ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' 
                          : app.type === 'Presencial'
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400'
                            : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {app.type}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-2xl">
                  Nenhum atendimento agendado para os próximos dias.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visitas Agendadas */}
        <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-primary-900 dark:text-white">Visitas Domiciliares Pendentes</h3>
              <button 
                onClick={() => navigate('/visits')}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                Ver tudo <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {upcoming.visits.length > 0 ? (
                upcoming.visits.map((visit) => (
                  <div key={visit.id} className="p-4 bg-primary-50 dark:bg-primary-900/50 rounded-2xl flex justify-between items-center text-xs">
                    <div className="flex-1 pr-4">
                      <p className="font-bold text-primary-800 dark:text-white">{visit.family}</p>
                      <p className="text-primary-400 mt-1 truncate max-w-xs">{visit.address}</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-semibold text-primary-800 dark:text-white">
                        {new Date(visit.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-[10px] text-brand-500 font-bold mt-1">Resp: {visit.assistant.split(' ')[0]}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-2xl">
                  Nenhuma visita domiciliar pendente.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
