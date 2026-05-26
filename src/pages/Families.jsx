import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Loader2, 
  X, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const Families = () => {
  const navigate = useNavigate();
  
  // Lista de Famílias e Estados de Carregamento
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [search, setSearch] = useState('');
  const [socialSituation, setSocialSituation] = useState('');
  const [minIncome, setMinIncome] = useState('');
  const [maxIncome, setMaxIncome] = useState('');

  // Modais de Criação / Edição
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  
  // Campos do Formulário
  const [nameResponsible, setNameResponsible] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [familyIncome, setFamilyIncome] = useState('');
  const [memberCount, setMemberCount] = useState(1);
  const [situationField, setSituationField] = useState('VULNERABLE');
  const [notes, setNotes] = useState('');

  // Modal de Confirmação de Exclusão
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState(null);

  // Status de Submissão
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchFamilies = async () => {
    setLoading(true);
    setError('');
    try {
      let query = `?search=${encodeURIComponent(search)}`;
      if (socialSituation) query += `&socialSituation=${socialSituation}`;
      if (minIncome) query += `&minIncome=${minIncome}`;
      if (maxIncome) query += `&maxIncome=${maxIncome}`;
      
      const response = await api.get(`/families${query}`);
      setFamilies(response.data);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao carregar as famílias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(fetchFamilies, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, socialSituation, minIncome, maxIncome]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedFamilyId(null);
    setNameResponsible('');
    setCpf('');
    setPhone('');
    setAddress('');
    setFamilyIncome('');
    setMemberCount(1);
    setSituationField('VULNERABLE');
    setNotes('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (fam) => {
    setModalMode('edit');
    setSelectedFamilyId(fam.id);
    setNameResponsible(fam.nameResponsible);
    setCpf(fam.cpf);
    setPhone(fam.phone);
    setAddress(fam.address);
    setFamilyIncome(fam.familyIncome);
    setMemberCount(fam.memberCount);
    setSituationField(fam.socialSituation);
    setNotes(fam.notes || '');
    setSubmitError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    const payload = {
      nameResponsible,
      cpf,
      phone,
      address,
      familyIncome: parseFloat(familyIncome),
      memberCount: parseInt(memberCount),
      socialSituation: situationField,
      notes,
    };

    try {
      if (modalMode === 'create') {
        await api.post('/families', payload);
      } else {
        await api.put(`/families/${selectedFamilyId}`, payload);
      }
      setShowModal(false);
      fetchFamilies();
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.error || 'Erro ao salvar os dados da família.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteConfirm = (fam) => {
    setFamilyToDelete(fam);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!familyToDelete) return;
    try {
      await api.delete(`/families/${familyToDelete.id}`);
      setShowDeleteConfirm(false);
      setFamilyToDelete(null);
      fetchFamilies();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir família.');
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Cabeçalho da Tela */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-950 dark:text-white tracking-tight">Cadastro de Famílias</h1>
          <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">Gerencie, busque e acompanhe as famílias cadastradas.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-brand-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
        >
          <Plus size={16} />
          <span>Cadastrar Família</span>
        </button>
      </div>

      {/* Seção de Filtros */}
      <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-5 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pesquisa */}
        <div className="relative">
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Buscar por Nome / CPF</label>
          <input
            type="text"
            placeholder="Digite nome, CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 pl-9 pr-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
          />
          <div className="absolute left-3 bottom-2.5 text-primary-400">
            <Search size={14} />
          </div>
        </div>

        {/* Situação Social */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Situação Social</label>
          <select
            value={socialSituation}
            onChange={(e) => setSocialSituation(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2 px-3 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
          >
            <option value="">Todas</option>
            <option value="CRITICAL">Crítico</option>
            <option value="VULNERABLE">Vulnerável</option>
            <option value="STABLE">Estável</option>
          </select>
        </div>

        {/* Renda Mínima */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Renda Mínima (R$)</label>
          <input
            type="number"
            placeholder="Ex: 500"
            value={minIncome}
            onChange={(e) => setMinIncome(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2 px-3 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
          />
        </div>

        {/* Renda Máxima */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Renda Máxima (R$)</label>
          <input
            type="number"
            placeholder="Ex: 2000"
            value={maxIncome}
            onChange={(e) => setMaxIncome(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2 px-3 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid / Tabela de Famílias */}
      <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 size={24} className="text-brand-500 animate-spin" />
            <span className="ml-2 text-xs text-primary-500">Buscando famílias...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600 bg-red-50/50 dark:bg-red-950/20">{error}</div>
        ) : families.length === 0 ? (
          <div className="p-12 text-center text-xs text-primary-400">Nenhuma família cadastrada ou encontrada com os filtros atuais.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-primary-50/50 dark:bg-primary-950/50 border-b border-primary-100 dark:border-primary-800 text-primary-400 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Responsável</th>
                  <th className="p-4">CPF</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4 text-right">Renda Familiar</th>
                  <th className="p-4 text-center">Integrantes</th>
                  <th className="p-4 text-center">Situação</th>
                  <th className="p-4 pr-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50 dark:divide-primary-800">
                {families.map((fam) => (
                  <tr key={fam.id} className="hover:bg-primary-50/30 dark:hover:bg-primary-900/30 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-primary-900 dark:text-white">{fam.nameResponsible}</td>
                    <td className="p-4 text-primary-500 dark:text-primary-400">{fam.cpf}</td>
                    <td className="p-4 text-primary-500 dark:text-primary-400">{fam.phone}</td>
                    <td className="p-4 text-right font-semibold text-primary-900 dark:text-white">
                      R$ {fam.familyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center font-semibold text-primary-900 dark:text-white">{fam.memberCount}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        fam.socialSituation === 'CRITICAL' 
                          ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30' 
                          : fam.socialSituation === 'VULNERABLE'
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                            : 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30'
                      }`}>
                        {fam.socialSituation === 'CRITICAL' ? 'Crítico' : 
                         fam.socialSituation === 'VULNERABLE' ? 'Vulnerável' : 'Estável'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/families/${fam.id}`)}
                          className="p-1.5 text-primary-600 dark:text-primary-400 hover:text-brand-500 dark:hover:text-brand-400 bg-primary-50 dark:bg-primary-900/50 hover:bg-white dark:hover:bg-primary-850 rounded-lg transition-colors border border-transparent hover:border-primary-100 dark:hover:border-primary-800"
                          title="Ver Detalhes"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(fam)}
                          className="p-1.5 text-primary-600 dark:text-primary-400 hover:text-blue-500 dark:hover:text-blue-400 bg-primary-50 dark:bg-primary-900/50 hover:bg-white dark:hover:bg-primary-850 rounded-lg transition-colors border border-transparent hover:border-primary-100 dark:hover:border-primary-800"
                          title="Editar Família"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteConfirm(fam)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900"
                          title="Excluir Família"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CADASTRAR / EDITAR FAMÍLIA */}
      {showModal && (
        <div className="fixed inset-0 bg-primary-950/40 dark:bg-primary-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho do Modal */}
            <div className="p-6 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-primary-900 dark:text-white uppercase tracking-wider">
                {modalMode === 'create' ? 'Cadastrar Nova Família' : 'Editar Dados da Família'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 text-primary-400 hover:text-primary-600 dark:hover:text-white rounded-lg hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulário do Modal */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                {submitError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100 dark:border-red-900/50">
                    <AlertCircle size={14} />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Responsável */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Nome do Responsável *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome completo do principal responsável"
                      value={nameResponsible}
                      onChange={(e) => setNameResponsible(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">CPF *</label>
                    <input
                      type="text"
                      required
                      placeholder="123.456.789-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Telefone de Contato *</label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 98888-7777"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Endereço */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Endereço Residencial *</label>
                    <input
                      type="text"
                      required
                      placeholder="Rua, número, bairro, cidade - UF"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Renda Familiar */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Renda Mensal Familiar (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={familyIncome}
                      onChange={(e) => setFamilyIncome(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Qtd Integrantes */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Qtd Membros Inicial *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={memberCount}
                      onChange={(e) => setMemberCount(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Situação Social */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Situação Social *</label>
                    <select
                      value={situationField}
                      onChange={(e) => setSituationField(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
                    >
                      <option value="STABLE">Estável</option>
                      <option value="VULNERABLE">Vulnerável</option>
                      <option value="CRITICAL">Crítico / Extrema Vulnerabilidade</option>
                    </select>
                  </div>

                  {/* Observações */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Observações Gerais</label>
                    <textarea
                      placeholder="Anote detalhes de moradia, saúde, alimentação..."
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
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-primary-500 hover:text-primary-700 font-bold rounded-xl text-xs border border-primary-100 dark:border-primary-800 bg-white dark:bg-primary-900 hover:bg-primary-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  {submitting && <Loader2 size={12} className="animate-spin" />}
                  <span>{modalMode === 'create' ? 'Salvar Cadastro' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-primary-950/40 dark:bg-primary-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-red-500 flex justify-center">
              <Trash2 size={40} className="p-2 bg-red-50 dark:bg-red-950/40 rounded-full" />
            </div>
            <div className="text-center space-y-2">
              <h4 className="font-extrabold text-sm text-primary-900 dark:text-white uppercase tracking-wider">Confirmar Exclusão?</h4>
              <p className="text-xs text-primary-500 dark:text-primary-400 leading-normal">
                Você está prestes a excluir o cadastro da família de <strong className="text-primary-800 dark:text-white">{familyToDelete?.nameResponsible}</strong>.
                Esta ação excluirá permanentemente todos os integrantes, atendimentos, visitas e históricos vinculados!
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-primary-500 hover:text-primary-750 border border-primary-100 dark:border-primary-800 bg-white dark:bg-primary-900 hover:bg-primary-50 rounded-xl text-xs font-bold transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Sim, Excluir Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Families;
