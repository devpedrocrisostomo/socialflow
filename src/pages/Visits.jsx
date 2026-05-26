import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  X, 
  AlertCircle,
  FileText
} from 'lucide-react';

const Visits = () => {
  const location = useLocation();
  const preselectedFamilyId = location.state?.familyId || '';

  // Estados
  const [visits, setVisits] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [statusFilter, setStatusFilter] = useState('');
  const [familyFilter, setFamilyFilter] = useState('');

  // Modal Agendamento (Novo)
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [familyId, setFamilyId] = useState(preselectedFamilyId);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  // Modal Registro de Conclusão (Preencher Relato da Visita)
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [situationFound, setSituationFound] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState('');

  const fetchVisits = async () => {
    setLoading(true);
    try {
      let query = '?';
      if (statusFilter) query += `status=${statusFilter}&`;
      if (familyFilter) query += `familyId=${familyFilter}&`;
      
      const response = await api.get(`/visits${query}`);
      setVisits(response.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar visitas domiciliares.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilies = async () => {
    try {
      const response = await api.get('/families');
      setFamilies(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVisits();
    fetchFamilies();
  }, [statusFilter, familyFilter]);

  useEffect(() => {
    if (preselectedFamilyId) {
      setFamilyId(preselectedFamilyId);
      setShowScheduleModal(true);
    }
  }, [preselectedFamilyId]);

  const handleOpenScheduleModal = () => {
    setFamilyId(preselectedFamilyId);
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime('09:00');
    setNotes('');
    setScheduleError('');
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduleError('');
    setScheduling(true);

    const fullDateTime = `${date}T${time}:00`;

    try {
      await api.post('/visits', {
        familyId: parseInt(familyId),
        date: new Date(fullDateTime),
        notes,
      });
      setShowScheduleModal(false);
      fetchVisits();
    } catch (err) {
      console.error(err);
      setScheduleError(err.response?.data?.error || 'Erro ao agendar visita.');
    } finally {
      setScheduling(false);
    }
  };

  const handleOpenCompleteModal = (visit) => {
    setSelectedVisit(visit);
    setSituationFound(visit.situationFound || '');
    setCompleteNotes(visit.notes || '');
    setCompleteError('');
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setCompleteError('');
    setCompleting(true);

    try {
      await api.put(`/visits/${selectedVisit.id}`, {
        status: 'COMPLETED',
        situationFound,
        notes: completeNotes,
      });
      setShowCompleteModal(false);
      fetchVisits();
    } catch (err) {
      console.error(err);
      setCompleteError(err.response?.data?.error || 'Erro ao registrar parecer da visita.');
    } finally {
      setCompleting(false);
    }
  };

  const handleCancelVisit = async (visitId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta visita?')) return;
    try {
      await api.put(`/visits/${visitId}`, { status: 'CANCELED' });
      fetchVisits();
    } catch (err) {
      console.error(err);
      alert('Erro ao cancelar visita.');
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-950 dark:text-white tracking-tight">Visitas Domiciliares</h1>
          <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">Planeje e registre vistorias de habitação e acompanhamento presencial.</p>
        </div>
        <button
          onClick={handleOpenScheduleModal}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-brand-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Plus size={16} />
          <span>Agendar Visita</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-5 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Família */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Filtrar por Família</label>
          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2 px-3 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
          >
            <option value="">Todas</option>
            {families.map((fam) => (
              <option key={fam.id} value={fam.id}>{fam.nameResponsible}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Status da Visita</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2 px-3 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
          >
            <option value="">Todos</option>
            <option value="SCHEDULED">Agendada</option>
            <option value="COMPLETED">Realizada</option>
            <option value="CANCELED">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Histórico/Lista de Visitas */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-12 flex justify-center items-center rounded-3xl">
            <Loader2 size={24} className="text-brand-500 animate-spin" />
            <span className="ml-2 text-xs text-primary-500">Carregando visitas...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600 bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/50">{error}</div>
        ) : visits.length === 0 ? (
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-12 text-center text-xs text-primary-400 rounded-3xl">
            Nenhuma visita domiciliar agendada ou registrada.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visits.map((visit) => (
              <div 
                key={visit.id} 
                className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl space-y-4 shadow-sm hover:border-primary-200 dark:hover:border-primary-750 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2 border-b border-primary-100/50 dark:border-primary-850/50 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">Família Visitada</span>
                      <h3 className="font-extrabold text-sm text-primary-900 dark:text-white mt-0.5">{visit.family.nameResponsible}</h3>
                      <p className="text-[10px] text-primary-400 mt-1 max-w-xs">{visit.family.address}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border ${
                      visit.status === 'COMPLETED' 
                        ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30' 
                        : visit.status === 'SCHEDULED'
                          ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                          : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
                    }`}>
                      {visit.status === 'COMPLETED' ? 'Realizada' : visit.status === 'SCHEDULED' ? 'Agendada' : 'Cancelada'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <p className="flex items-center gap-1.5 text-primary-500"><Calendar size={14} /> {new Date(visit.date).toLocaleDateString('pt-BR')}</p>
                    <p className="flex items-center gap-1.5 text-primary-500"><Clock size={14} /> {new Date(visit.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>

                  {visit.status === 'COMPLETED' ? (
                    <div className="space-y-2 text-xs">
                      <p className="text-primary-700 dark:text-primary-300 font-semibold flex items-center gap-1.5"><FileText size={14} className="text-primary-400" /> Situação Encontrada</p>
                      <p className="text-primary-600 dark:text-primary-350 leading-relaxed bg-primary-50/20 dark:bg-primary-950/20 p-3 rounded-2xl border border-primary-100/50 dark:border-primary-900/50">{visit.situationFound || 'Nenhum parecer cadastrado.'}</p>
                    </div>
                  ) : visit.status === 'SCHEDULED' && visit.notes ? (
                    <div className="p-3 bg-primary-50 dark:bg-primary-950/40 rounded-2xl text-[10px] text-primary-500 border border-primary-100/30 dark:border-primary-900/30">
                      <strong>Orientações / Notas do Agendamento:</strong> {visit.notes}
                    </div>
                  ) : null}
                </div>

                <div className="pt-4 border-t border-primary-100/50 dark:border-primary-850/50 flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold text-primary-400 uppercase">Por: {visit.user.name.split(' ')[0]}</span>
                  
                  {visit.status === 'SCHEDULED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCancelVisit(visit.id)}
                        className="px-2.5 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-[10px] font-bold border border-transparent hover:border-red-100 dark:hover:border-red-900 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleOpenCompleteModal(visit)}
                        className="px-2.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md shadow-brand-500/10 transition-colors cursor-pointer"
                      >
                        <CheckCircle size={10} /> Registrar Relato
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: AGENDAR VISITA */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-primary-950/40 dark:bg-primary-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho */}
            <div className="p-6 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-primary-900 dark:text-white uppercase tracking-wider">Agendar Visita Domiciliar</h3>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="p-1 text-primary-400 hover:text-primary-600 dark:hover:text-white rounded-lg hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleScheduleSubmit}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {scheduleError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100 dark:border-red-900/50">
                    <AlertCircle size={14} />
                    <span>{scheduleError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Seleção de Família */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Família a ser Visitada *</label>
                    <select
                      required
                      value={familyId}
                      onChange={(e) => setFamilyId(e.target.value)}
                      disabled={!!preselectedFamilyId}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
                    >
                      <option value="">Selecione a família...</option>
                      {families.map((fam) => (
                        <option key={fam.id} value={fam.id}>{fam.nameResponsible} - Endereço: {fam.address}</option>
                      ))}
                    </select>
                  </div>

                  {/* Data */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Data Proposta *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Horário */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Horário Proposto *</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Observações / Notas */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Objetivos / Notas do Agendamento</label>
                    <textarea
                      placeholder="Anote o foco da visita, ex: verificar documentação, avaliar infraestrutura da moradia, etc..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="p-6 border-t border-primary-100 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-primary-500 hover:text-primary-750 font-bold rounded-xl text-xs border border-primary-100 dark:border-primary-800 bg-white dark:bg-primary-900 hover:bg-primary-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  {scheduling && <Loader2 size={12} className="animate-spin" />}
                  <span>Confirmar Agendamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONCLUIR VISITA (REGISTRAR RELATO) */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-primary-950/40 dark:bg-primary-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho */}
            <div className="p-6 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-primary-900 dark:text-white uppercase tracking-wider">Registrar Resultados da Visita</h3>
              <button 
                onClick={() => setShowCompleteModal(false)}
                className="p-1 text-primary-400 hover:text-primary-600 dark:hover:text-white rounded-lg hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleCompleteSubmit}>
              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                {completeError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100 dark:border-red-900/50">
                    <AlertCircle size={14} />
                    <span>{completeError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-primary-500">
                      Registrando relatório para a visita realizada na família de: <strong>{selectedVisit?.family.nameResponsible}</strong>.
                    </p>
                  </div>

                  {/* Situação Encontrada */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Situação Domiciliar Encontrada *</label>
                    <textarea
                      required
                      placeholder="Relate as condições físicas da casa, higiene, alimentação, relacionamento familiar, vulnerabilidades detectadas..."
                      value={situationFound}
                      onChange={(e) => setSituationFound(e.target.value)}
                      rows={5}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Observações / Notas */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Providências Recomendadas</label>
                    <textarea
                      placeholder="Indique ações futuras, providências de encaminhamentos, etc..."
                      value={completeNotes}
                      onChange={(e) => setCompleteNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="p-6 border-t border-primary-100 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-primary-500 hover:text-primary-750 font-bold rounded-xl text-xs border border-primary-100 dark:border-primary-800 bg-white dark:bg-primary-900 hover:bg-primary-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={completing}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  {completing && <Loader2 size={12} className="animate-spin" />}
                  <span>Gravar Parecer e Concluir</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visits;
