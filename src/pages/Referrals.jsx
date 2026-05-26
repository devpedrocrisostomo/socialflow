import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  Plus, 
  Send, 
  Search, 
  CheckCircle, 
  Clock, 
  HelpCircle, 
  AlertCircle, 
  Loader2, 
  X,
  MessageSquareShare
} from 'lucide-react';

const Referrals = () => {
  const location = useLocation();
  const preselectedFamilyId = location.state?.familyId || '';

  // Estados principais
  const [referrals, setReferrals] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [statusFilter, setStatusFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');

  // Modal Novo Encaminhamento
  const [showModal, setShowModal] = useState(false);
  const [familyId, setFamilyId] = useState(preselectedFamilyId);
  const [destination, setDestination] = useState('CRAS - Centro de Referência de Assistência Social');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Modal Alterar Status / Retorno (Feedback)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [status, setStatus] = useState('PENDING');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      let query = '?';
      if (statusFilter) query += `status=${statusFilter}&`;
      if (destinationFilter) query += `destination=${destinationFilter}&`;
      
      const response = await api.get(`/referrals${query}`);
      setReferrals(response.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar encaminhamentos.');
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
    fetchReferrals();
    fetchFamilies();
  }, [statusFilter, destinationFilter]);

  useEffect(() => {
    if (preselectedFamilyId) {
      setFamilyId(preselectedFamilyId);
      setShowModal(true);
    }
  }, [preselectedFamilyId]);

  const handleOpenCreateModal = () => {
    setFamilyId(preselectedFamilyId);
    setDestination('CRAS - Centro de Referência de Assistência Social');
    setDescription('');
    setNotes('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      await api.post('/referrals', {
        familyId: parseInt(familyId),
        destination,
        description,
        feedbackNotes: notes,
      });
      setShowModal(false);
      fetchReferrals();
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.error || 'Erro ao emitir encaminhamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenStatusModal = (ref) => {
    setSelectedReferral(ref);
    setStatus(ref.status);
    setFeedbackNotes(ref.feedbackNotes || '');
    setStatusError('');
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setStatusError('');
    setUpdatingStatus(true);

    try {
      await api.put(`/referrals/${selectedReferral.id}`, {
        status,
        feedbackNotes,
      });
      setShowStatusModal(false);
      fetchReferrals();
    } catch (err) {
      console.error(err);
      setStatusError(err.response?.data?.error || 'Erro ao atualizar encaminhamento.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-950 dark:text-white tracking-tight">Encaminhamentos</h1>
          <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">Conecte famílias com a rede de saúde, educação, habitação e assistência social.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-brand-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Plus size={16} />
          <span>Novo Encaminhamento</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-5 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Destino */}
        <div className="relative">
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Buscar por Destino</label>
          <input
            type="text"
            placeholder="Ex: CRAS, CREAS, Hospital..."
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 pl-9 pr-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
          />
          <div className="absolute left-3 bottom-2.5 text-primary-400">
            <Search size={14} />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Status de Retorno</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2 px-3 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="ACTIVE">Ativo / Em análise</option>
            <option value="RESOLVED">Resolvido / Matrícula ou Vaga confirmada</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
        </div>
      </div>

      {/* Histórico/Lista de Encaminhamentos */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-12 flex justify-center items-center rounded-3xl">
            <Loader2 size={24} className="text-brand-500 animate-spin" />
            <span className="ml-2 text-xs text-primary-500">Buscando encaminhamentos...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600 bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/50">{error}</div>
        ) : referrals.length === 0 ? (
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-12 text-center text-xs text-primary-400 rounded-3xl">
            Nenhum encaminhamento emitido.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {referrals.map((ref) => (
              <div 
                key={ref.id} 
                className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl space-y-4 shadow-sm hover:border-primary-200 dark:hover:border-primary-750 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-primary-100/50 dark:border-primary-850/50 pb-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">Família Assistida</span>
                    <h3 className="font-extrabold text-sm text-primary-900 dark:text-white mt-0.5">{ref.family.nameResponsible}</h3>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border ${
                      ref.status === 'RESOLVED' 
                        ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30' 
                        : ref.status === 'PENDING'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                          : ref.status === 'ACTIVE'
                            ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                            : 'bg-primary-50 dark:bg-primary-950/30 text-primary-500'
                    }`}>
                      {ref.status === 'RESOLVED' ? 'Resolvido' : ref.status === 'PENDING' ? 'Pendente' : ref.status === 'ACTIVE' ? 'Ativo' : 'Arquivado'}
                    </span>
                    <div className="text-right text-primary-500">
                      <p className="font-semibold">{new Date(ref.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-2">
                    <p className="text-primary-700 dark:text-primary-300 font-semibold flex items-center gap-1.5"><Send size={14} className="text-primary-400" /> Órgão de Destino</p>
                    <p className="text-primary-900 dark:text-white font-bold bg-primary-50 dark:bg-primary-950/20 p-2.5 rounded-xl border border-primary-100/50 dark:border-primary-900/50">{ref.destination}</p>
                    
                    <p className="text-primary-700 dark:text-primary-300 font-semibold pt-2">Descrição da Demanda</p>
                    <p className="text-primary-600 dark:text-primary-350 leading-relaxed">{ref.description}</p>
                  </div>

                  <div className="space-y-2 flex flex-col justify-between">
                    <div>
                      <p className="text-primary-700 dark:text-primary-300 font-semibold flex items-center gap-1.5"><MessageSquareShare size={14} className="text-primary-400" /> Retorno e Feedback da Rede</p>
                      <p className="text-primary-600 dark:text-primary-350 leading-relaxed bg-primary-50/20 dark:bg-primary-950/20 p-3 rounded-2xl border border-primary-100/50 dark:border-primary-900/50 min-h-20">
                        {ref.feedbackNotes || 'Nenhum parecer técnico ou retorno cadastrado ainda.'}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[9px] font-bold text-primary-400 uppercase">Por: {ref.user.name}</span>
                      <button
                        onClick={() => handleOpenStatusModal(ref)}
                        className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md shadow-brand-500/10 transition-colors cursor-pointer"
                      >
                        Atualizar Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: NOVO ENCAMINHAMENTO */}
      {showModal && (
        <div className="fixed inset-0 bg-primary-950/40 dark:bg-primary-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho */}
            <div className="p-6 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-primary-900 dark:text-white uppercase tracking-wider">Novo Encaminhamento</h3>
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

                  {/* Destino */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Órgão de Destino *</label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
                    >
                      <option value="CRAS - Centro de Referência de Assistência Social">CRAS</option>
                      <option value="CREAS - Centro de Referência Especializado de Assistência Social">CREAS</option>
                      <option value="Hospital Municipal / Rede de Saúde">Saúde / Hospital</option>
                      <option value="Escola Municipal / Secretaria de Educação">Educação / Escola</option>
                      <option value="Conselho Tutelar">Conselho Tutelar</option>
                      <option value="Secretaria de Habitação">Habitação</option>
                      <option value="Outro órgão público">Outro</option>
                    </select>
                  </div>

                  {/* Descrição */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Motivo / Descrição da Solicitação *</label>
                    <textarea
                      required
                      placeholder="Relate os motivos do encaminhamento, pedidos de relatórios ou matrículas prioritárias, necessidades identificadas..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Notas de Feedback Inicial */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Anotações Internas (Opcional)</label>
                    <textarea
                      placeholder="Anote detalhes de prazos, números de protocolo, contatos dos parceiros..."
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
                  <span>Emitir Encaminhamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ATUALIZAR STATUS / RETORNO */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-primary-950/40 dark:bg-primary-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho */}
            <div className="p-6 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-primary-900 dark:text-white uppercase tracking-wider">Atualizar Retorno do Encaminhamento</h3>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="p-1 text-primary-400 hover:text-primary-600 dark:hover:text-white rounded-lg hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleStatusSubmit}>
              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                {statusError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100 dark:border-red-900/50">
                    <AlertCircle size={14} />
                    <span>{statusError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-xs text-primary-500 leading-normal">
                    Registrando retorno do encaminhamento de <strong>{selectedReferral?.family.nameResponsible}</strong> para <strong>{selectedReferral?.destination}</strong>.
                  </p>

                  {/* Status */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Status de Retorno *</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
                    >
                      <option value="PENDING">Pendente</option>
                      <option value="ACTIVE">Ativo / Em análise</option>
                      <option value="RESOLVED">Resolvido com sucesso</option>
                      <option value="ARCHIVED">Arquivado</option>
                    </select>
                  </div>

                  {/* Feedback Notes */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Respostas / Parecer Recebido do Órgão Parceiro *</label>
                    <textarea
                      required
                      placeholder="Relate o feedback oficial obtido, ex: data de concessão do benefício, número de matrícula da criança, etc..."
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      rows={4}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="p-6 border-t border-primary-100 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-primary-500 hover:text-primary-750 font-bold rounded-xl text-xs border border-primary-100 dark:border-primary-800 bg-white dark:bg-primary-900 hover:bg-primary-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  {updatingStatus && <Loader2 size={12} className="animate-spin" />}
                  <span>Atualizar Encaminhamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referrals;
