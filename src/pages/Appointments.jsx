import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Loader2, 
  X, 
  AlertCircle
} from 'lucide-react';

const Appointments = () => {
  const location = useLocation();
  const preselectedFamilyId = location.state?.familyId || '';

  // Estados principais
  const [appointments, setAppointments] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [familyFilter, setFamilyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal Cadastro
  const [showModal, setShowModal] = useState(false);
  const [familyId, setFamilyId] = useState(preselectedFamilyId);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('Presencial');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let query = `?`;
      if (familyFilter) query += `familyId=${familyFilter}&`;
      if (typeFilter) query += `type=${typeFilter}&`;
      if (startDate) query += `startDate=${startDate}&`;
      if (endDate) query += `endDate=${endDate}&`;
      
      const response = await api.get(`/appointments${query}`);
      setAppointments(response.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar atendimentos.');
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
    fetchAppointments();
    fetchFamilies();
  }, [familyFilter, typeFilter, startDate, endDate]);

  useEffect(() => {
    if (preselectedFamilyId) {
      setFamilyId(preselectedFamilyId);
      setShowModal(true);
    }
  }, [preselectedFamilyId]);

  const handleOpenCreateModal = () => {
    setFamilyId(preselectedFamilyId);
    // Configurar data e hora atual como padrão
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().substring(0, 5));
    setType('Presencial');
    setDescription('');
    setNotes('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    const fullDateTime = `${date}T${time}:00`;

    try {
      await api.post('/appointments', {
        familyId: parseInt(familyId),
        date: new Date(fullDateTime),
        type,
        description,
        notes,
      });
      setShowModal(false);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.error || 'Erro ao registrar atendimento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-950 dark:text-white tracking-tight">Atendimentos Sociais</h1>
          <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">Registre e consulte o histórico de evolução socioassistencial.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-brand-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Plus size={16} />
          <span>Registrar Atendimento</span>
        </button>
      </div>

      {/* Seção Filtros */}
      <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-5 rounded-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Tipo */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Tipo de Atendimento</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2 px-3 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
          >
            <option value="">Todos</option>
            <option value="Presencial">Presencial</option>
            <option value="Remoto">Remoto</option>
            <option value="Emergencial">Emergencial</option>
          </select>
        </div>

        {/* Data Início */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">A partir de</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2 px-3 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
          />
        </div>

        {/* Data Fim */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Até dia</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2 px-3 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
          />
        </div>
      </div>

      {/* Histórico de Atendimentos */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-12 flex justify-center items-center rounded-3xl">
            <Loader2 size={24} className="text-brand-500 animate-spin" />
            <span className="ml-2 text-xs text-primary-500">Buscando atendimentos...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600 bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/50">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-12 text-center text-xs text-primary-400 rounded-3xl">
            Nenhum atendimento registrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {appointments.map((app) => (
              <div 
                key={app.id} 
                className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl space-y-4 shadow-sm hover:border-primary-200 dark:hover:border-primary-750 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-primary-100/50 dark:border-primary-850/50 pb-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Família Assistida</span>
                    <h3 className="font-extrabold text-sm text-primary-900 dark:text-white mt-0.5">{app.family.nameResponsible}</h3>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                      app.type === 'Emergencial' 
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30' 
                        : app.type === 'Presencial'
                          ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30'
                          : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30'
                    }`}>
                      {app.type}
                    </span>
                    <div className="text-right text-primary-500">
                      <p className="flex items-center gap-1 font-semibold">
                        <Calendar size={12} /> {new Date(app.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="flex items-center justify-end gap-1 text-[10px] mt-0.5">
                        <Clock size={10} /> {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-primary-700 dark:text-primary-300 font-semibold flex items-center gap-1.5"><BookOpen size={14} className="text-primary-400" /> Relato do Atendimento</p>
                  <p className="text-primary-600 dark:text-primary-350 leading-relaxed pl-5 bg-primary-50/20 dark:bg-primary-950/20 p-3 rounded-2xl border border-primary-100/50 dark:border-primary-900/50">{app.description}</p>
                </div>

                {app.notes && (
                  <div className="p-3 bg-primary-50 dark:bg-primary-950/40 rounded-2xl text-[10px] text-primary-500 border border-primary-100/30 dark:border-primary-900/30">
                    <strong>Encaminhamentos / Providências:</strong> {app.notes}
                  </div>
                )}

                <div className="flex justify-between items-center text-[10px] text-primary-400 font-bold uppercase pt-1 border-t border-primary-100/50 dark:border-primary-850/50">
                  <span className="flex items-center gap-1"><User size={12} /> Assistente Responsável: {app.user.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: REGISTRAR ATENDIMENTO */}
      {showModal && (
        <div className="fixed inset-0 bg-primary-950/40 dark:bg-primary-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho */}
            <div className="p-6 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-primary-900 dark:text-white uppercase tracking-wider">Registrar Atendimento</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 text-primary-400 hover:text-primary-600 dark:hover:text-white rounded-lg hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                {submitError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100 dark:border-red-900/50">
                    <AlertCircle size={14} />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Seleção de Família */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Família Assistida *</label>
                    <select
                      required
                      value={familyId}
                      onChange={(e) => setFamilyId(e.target.value)}
                      disabled={!!preselectedFamilyId}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
                    >
                      <option value="">Selecione a família...</option>
                      {families.map((fam) => (
                        <option key={fam.id} value={fam.id}>{fam.nameResponsible} - CPF: {fam.cpf}</option>
                      ))}
                    </select>
                  </div>

                  {/* Data */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Data do Atendimento *</label>
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
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Horário *</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Tipo */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Tipo de Atendimento *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
                    >
                      <option value="Presencial">Presencial</option>
                      <option value="Remoto">Remoto</option>
                      <option value="Emergencial">Emergencial</option>
                    </select>
                  </div>

                  {/* Descrição */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Descrição Detalhada *</label>
                    <textarea
                      required
                      placeholder="Relate os detalhes levantados no acolhimento, as vulnerabilidades relatadas e a análise técnica..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Observações / Notas */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Providências / Notas Internas</label>
                    <textarea
                      placeholder="Anote encaminhamentos internos, concessão de benefícios, agendamentos recomendados..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="p-6 border-t border-primary-100 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-primary-500 hover:text-primary-750 font-bold rounded-xl text-xs border border-primary-100 dark:border-primary-800 bg-white dark:bg-primary-900 hover:bg-primary-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  {submitting && <Loader2 size={12} className="animate-spin" />}
                  <span>Salvar Atendimento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
