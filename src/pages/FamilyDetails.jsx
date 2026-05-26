import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, 
  Users, 
  CalendarDays, 
  MapPin, 
  Send, 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  Phone, 
  MapPinHouse, 
  CreditCard, 
  CircleDollarSign,
  AlertCircle
} from 'lucide-react';

const FamilyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados principais
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'appointments' | 'visits' | 'referrals' | 'reports'

  // Modal de Membro (Integrante)
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberModalMode, setMemberModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  
  // Campos do Formulário de Membro
  const [memberName, setMemberName] = useState('');
  const [memberAge, setMemberAge] = useState('');
  const [memberSchooling, setMemberSchooling] = useState('');
  const [memberEmployment, setMemberEmployment] = useState('');
  const [memberDocs, setMemberDocs] = useState('');
  const [memberSpecialNeeds, setMemberSpecialNeeds] = useState('');

  // Status de Submissão do Membro
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [memberError, setMemberError] = useState('');

  const fetchFamilyDetails = async () => {
    try {
      const response = await api.get(`/families/${id}`);
      setFamily(response.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar detalhes da família.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyDetails();
  }, [id]);

  // Handler para Adicionar / Editar Membro
  const handleOpenMemberCreate = () => {
    setMemberModalMode('create');
    setSelectedMemberId(null);
    setMemberName('');
    setMemberAge('');
    setMemberSchooling('Ensino Fundamental I (Incompleto)');
    setMemberEmployment('Estudante');
    setMemberDocs('');
    setMemberSpecialNeeds('Nenhuma');
    setMemberError('');
    setShowMemberModal(true);
  };

  const handleOpenMemberEdit = (member) => {
    setMemberModalMode('edit');
    setSelectedMemberId(member.id);
    setMemberName(member.name);
    setMemberAge(member.age);
    setMemberSchooling(member.schooling);
    setMemberEmployment(member.employmentStatus);
    setMemberDocs(member.documents);
    setMemberSpecialNeeds(member.specialNeeds);
    setMemberError('');
    setShowMemberModal(true);
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    setMemberError('');
    setMemberSubmitting(true);

    const payload = {
      familyId: parseInt(id),
      name: memberName,
      age: parseInt(memberAge),
      schooling: memberSchooling,
      employmentStatus: memberEmployment,
      documents: memberDocs,
      specialNeeds: memberSpecialNeeds,
    };

    try {
      if (memberModalMode === 'create') {
        await api.post('/people', payload);
      } else {
        await api.put(`/people/${selectedMemberId}`, payload);
      }
      setShowMemberModal(false);
      fetchFamilyDetails();
    } catch (err) {
      console.error(err);
      setMemberError(err.response?.data?.error || 'Erro ao registrar membro.');
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleMemberDelete = async (memberId) => {
    if (!window.confirm('Tem certeza que deseja remover este integrante?')) return;
    try {
      await api.delete(`/people/${memberId}`);
      fetchFamilyDetails();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir integrante.');
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[80vh]">
        <Loader2 size={36} className="text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error || !family) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl flex gap-2 items-center">
          <AlertCircle size={20} />
          <span>{error || 'Família não encontrada.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/families')}
        className="flex items-center gap-2 text-primary-500 hover:text-brand-500 font-semibold text-xs transition-colors"
      >
        <ArrowLeft size={14} /> Voltar para Famílias
      </button>

      {/* Cartão de Identificação da Família */}
      <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
        
        {/* Coluna 1: Nome e Status */}
        <div className="space-y-4">
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide mb-2 ${
              family.socialSituation === 'CRITICAL' 
                ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30' 
                : family.socialSituation === 'VULNERABLE'
                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                  : 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30'
            }`}>
              {family.socialSituation === 'CRITICAL' ? 'Crítico' : 
               family.socialSituation === 'VULNERABLE' ? 'Vulnerável' : 'Estável'}
            </span>
            <h2 className="text-xl font-extrabold text-primary-900 dark:text-white leading-tight">{family.nameResponsible}</h2>
            <p className="text-xs text-primary-400 mt-1">Cadastro em: {new Date(family.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>

          <div className="space-y-2 text-xs">
            <p className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <CreditCard size={14} className="text-primary-400" />
              <span><strong>CPF:</strong> {family.cpf}</span>
            </p>
            <p className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <Phone size={14} className="text-primary-400" />
              <span><strong>Telefone:</strong> {family.phone}</span>
            </p>
          </div>
        </div>

        {/* Coluna 2: Endereço e Renda */}
        <div className="space-y-4">
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-[10px] text-primary-400 uppercase tracking-wider">Localização & Orçamento</h4>
            <p className="flex gap-2 text-primary-600 dark:text-primary-400 leading-normal">
              <MapPinHouse size={18} className="text-primary-400 shrink-0" />
              <span><strong>Endereço:</strong> {family.address}</span>
            </p>
            <p className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <CircleDollarSign size={16} className="text-primary-400" />
              <span>
                <strong>Renda Familiar:</strong> R$ {family.familyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
        </div>

        {/* Coluna 3: Observações Técnicas */}
        <div className="space-y-2">
          <h4 className="font-bold text-[10px] text-primary-400 uppercase tracking-wider">Parecer / Notas do Assistente</h4>
          <div className="p-4 bg-primary-50 dark:bg-primary-950/40 rounded-2xl border border-primary-100 dark:border-primary-900/50 text-xs text-primary-600 dark:text-primary-350 leading-relaxed max-h-28 overflow-y-auto">
            {family.notes || 'Nenhuma observação cadastrada.'}
          </div>
        </div>

      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-primary-100 dark:border-primary-800 text-xs font-bold gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'members' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-primary-400 hover:text-primary-600 dark:hover:text-white'
          }`}
        >
          <Users size={14} /> Integrantes ({family.members.length})
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'appointments' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-primary-400 hover:text-primary-600 dark:hover:text-white'
          }`}
        >
          <CalendarDays size={14} /> Atendimentos ({family.appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'visits' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-primary-400 hover:text-primary-600 dark:hover:text-white'
          }`}
        >
          <MapPin size={14} /> Visitas Domiciliares ({family.visits.length})
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'referrals' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-primary-400 hover:text-primary-600 dark:hover:text-white'
          }`}
        >
          <Send size={14} /> Encaminhamentos ({family.referrals.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'reports' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-primary-400 hover:text-primary-600 dark:hover:text-white'
          }`}
        >
          <FileText size={14} /> Relatórios ({family.reports.length})
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl min-h-[40vh] shadow-sm">
        
        {/* TAB 1: INTEGRANTES */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-primary-900 dark:text-white">Membros da Unidade Familiar</h3>
                <p className="text-xs text-primary-400">Todos os integrantes cadastrados nesta residência.</p>
              </div>
              <button
                onClick={handleOpenMemberCreate}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus size={12} /> Adicionar Integrante
              </button>
            </div>

            {family.members.length === 0 ? (
              <div className="p-8 text-center text-xs text-primary-400 bg-primary-50 dark:bg-primary-950/20 rounded-2xl">
                Nenhum membro cadastrado. Cadastre o responsável primeiro!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {family.members.map((member) => (
                  <div 
                    key={member.id} 
                    className="p-5 border border-primary-100 dark:border-primary-800 bg-primary-50/20 dark:bg-primary-950/30 rounded-2xl relative space-y-3"
                  >
                    {/* Botões de Ação */}
                    <div className="absolute top-4 right-4 flex gap-1.5">
                      <button
                        onClick={() => handleOpenMemberEdit(member)}
                        className="p-1 text-primary-500 hover:text-blue-500 hover:bg-white dark:hover:bg-primary-850 border border-transparent hover:border-primary-100 dark:hover:border-primary-800 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleMemberDelete(member.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-white dark:hover:bg-primary-850 border border-transparent hover:border-primary-100 dark:hover:border-primary-800 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-primary-900 dark:text-white pr-14">{member.name}</h4>
                      <p className="text-[10px] text-primary-400 mt-0.5">{member.age} anos • {member.schooling}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] pt-2 border-t border-primary-100/50 dark:border-primary-800/50">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-primary-400">Emprego</span>
                        <span className="text-primary-700 dark:text-primary-300 font-semibold">{member.employmentStatus}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-primary-400">Doc / Registro</span>
                        <span className="text-primary-700 dark:text-primary-300 truncate block font-semibold" title={member.documents}>
                          {member.documents || 'Nenhum'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[9px] uppercase font-bold text-primary-400">Nec. Especiais / Saúde</span>
                        <span className="text-primary-700 dark:text-primary-300 font-semibold">{member.specialNeeds}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ATENDIMENTOS */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-primary-900 dark:text-white">Histórico de Atendimentos</h3>
                <p className="text-xs text-primary-400">Evolução do caso e acolhimentos registrados.</p>
              </div>
              <button
                onClick={() => navigate('/appointments', { state: { familyId: family.id } })}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus size={12} /> Registrar Atendimento
              </button>
            </div>

            {family.appointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-primary-400 bg-primary-50 dark:bg-primary-950/20 rounded-2xl">
                Nenhum atendimento registrado para esta família.
              </div>
            ) : (
              <div className="relative border-l border-primary-150 dark:border-primary-800 ml-3 pl-6 space-y-6">
                {family.appointments.map((app) => (
                  <div key={app.id} className="relative text-xs">
                    {/* Indicador de linha do tempo */}
                    <div className="absolute -left-9 top-1 w-5 h-5 rounded-full border-4 border-white dark:border-primary-900 bg-brand-500 flex items-center justify-center"></div>
                    
                    <div className="bg-primary-50/30 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-850 p-4 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary-800 dark:text-white text-xs">{app.type}</span>
                        <span className="text-[10px] text-primary-400 font-bold">
                          {new Date(app.date).toLocaleDateString('pt-BR')} às {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-primary-600 dark:text-primary-350 leading-relaxed">{app.description}</p>
                      {app.notes && (
                        <div className="pt-2 border-t border-primary-100/50 dark:border-primary-800/50 text-[10px] text-primary-500">
                          <strong>Encaminhamento interno / Notas:</strong> {app.notes}
                        </div>
                      )}
                      <p className="text-[9px] font-bold text-primary-400 uppercase pt-1">
                        Assistente: {app.user.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VISITAS DOMICILIARES */}
        {activeTab === 'visits' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-primary-900 dark:text-white">Visitas Domiciliares</h3>
                <p className="text-xs text-primary-400">Agendamentos e registros de visitas em loco.</p>
              </div>
              <button
                onClick={() => navigate('/visits', { state: { familyId: family.id } })}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus size={12} /> Agendar Visita
              </button>
            </div>

            {family.visits.length === 0 ? (
              <div className="p-8 text-center text-xs text-primary-400 bg-primary-50 dark:bg-primary-950/20 rounded-2xl">
                Nenhuma visita domiciliar programada ou realizada.
              </div>
            ) : (
              <div className="space-y-3">
                {family.visits.map((visit) => (
                  <div key={visit.id} className="p-4 border border-primary-100 dark:border-primary-800 rounded-2xl text-xs space-y-3 bg-primary-50/10 dark:bg-primary-950/10">
                    <div className="flex justify-between items-center border-b border-primary-100/50 dark:border-b-primary-800/50 pb-2">
                      <span className="font-bold text-primary-900 dark:text-white">
                        Data: {new Date(visit.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        visit.status === 'COMPLETED' 
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400' 
                          : visit.status === 'SCHEDULED'
                            ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                            : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                      }`}>
                        {visit.status === 'COMPLETED' ? 'Realizada' : visit.status === 'SCHEDULED' ? 'Agendada' : 'Cancelada'}
                      </span>
                    </div>

                    {visit.status === 'COMPLETED' && (
                      <div className="space-y-2">
                        <p className="text-primary-600 dark:text-primary-350">
                          <strong>Situação Domiciliar:</strong> {visit.situationFound || 'Sem observações registradas.'}
                        </p>
                      </div>
                    )}

                    {visit.notes && (
                      <p className="text-primary-500 text-[10px]">
                        <strong>Notas do Agendamento:</strong> {visit.notes}
                      </p>
                    )}

                    <p className="text-[9px] font-bold text-primary-400 uppercase">
                      Agendado por: {visit.user.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ENCAMINHAMENTOS */}
        {activeTab === 'referrals' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-primary-900 dark:text-white">Encaminhamentos Emitidos</h3>
                <p className="text-xs text-primary-400">Controle de articulações com a rede socioassistencial externa.</p>
              </div>
              <button
                onClick={() => navigate('/referrals', { state: { familyId: family.id } })}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus size={12} /> Novo Encaminhamento
              </button>
            </div>

            {family.referrals.length === 0 ? (
              <div className="p-8 text-center text-xs text-primary-400 bg-primary-50 dark:bg-primary-950/20 rounded-2xl">
                Nenhum encaminhamento registrado.
              </div>
            ) : (
              <div className="space-y-3">
                {family.referrals.map((ref) => (
                  <div key={ref.id} className="p-4 border border-primary-100 dark:border-primary-800 rounded-2xl text-xs space-y-2 bg-primary-50/10 dark:bg-primary-950/10">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary-800 dark:text-white">{ref.destination}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        ref.status === 'RESOLVED' 
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400' 
                          : ref.status === 'PENDING'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                            : ref.status === 'ACTIVE'
                              ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                              : 'bg-primary-50 dark:bg-primary-950/20 text-primary-500'
                      }`}>
                        {ref.status === 'RESOLVED' ? 'Resolvido' : ref.status === 'PENDING' ? 'Pendente' : ref.status === 'ACTIVE' ? 'Ativo' : 'Arquivado'}
                      </span>
                    </div>
                    <p className="text-primary-600 dark:text-primary-350">{ref.description}</p>
                    {ref.feedbackNotes && (
                      <div className="text-[10px] text-primary-500 pt-1 border-t border-primary-100/50 dark:border-primary-800/50">
                        <strong>Retorno / Feedback:</strong> {ref.feedbackNotes}
                      </div>
                    )}
                    <div className="flex justify-between text-[9px] text-primary-400 uppercase pt-1 font-semibold">
                      <span>Emitido por: {ref.user.name}</span>
                      <span>{new Date(ref.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: RELATÓRIOS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-primary-900 dark:text-white">Pareceres e Relatórios Sociais</h3>
                <p className="text-xs text-primary-400">Documentos emitidos para instrução de processos e estudos de caso.</p>
              </div>
              <button
                onClick={() => navigate('/reports', { state: { familyId: family.id } })}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus size={12} /> Criar Relatório
              </button>
            </div>

            {family.reports.length === 0 ? (
              <div className="p-8 text-center text-xs text-primary-400 bg-primary-50 dark:bg-primary-950/20 rounded-2xl">
                Nenhum parecer técnico registrado para esta família.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {family.reports.map((rep) => (
                  <div key={rep.id} className="p-5 border border-primary-100 dark:border-primary-800 rounded-2xl text-xs space-y-3 bg-primary-50/10 dark:bg-primary-950/10 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-extrabold text-primary-900 dark:text-white text-xs">{rep.title}</h4>
                        <span className="bg-primary-50 dark:bg-primary-900 border border-primary-150 dark:border-primary-800 text-primary-500 font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-wide">
                          {rep.type === 'SOCIAL_REPORT' ? 'Relatório Social' : rep.type === 'FAMILY_REPORT' ? 'Laudo Familiar' : 'Resumo Mensal'}
                        </span>
                      </div>
                      <p className="text-primary-600 dark:text-primary-350 line-clamp-3 leading-relaxed">{rep.content}</p>
                    </div>

                    <div className="pt-2 border-t border-primary-100/50 dark:border-primary-800/50 flex justify-between items-center text-[9px] text-primary-400 uppercase font-semibold">
                      <span>Por: {rep.user.name}</span>
                      <button
                        onClick={() => navigate('/reports', { state: { selectedReportId: rep.id } })}
                        className="text-brand-500 hover:text-brand-600 hover:underline font-bold"
                      >
                        Visualizar PDF / Imprimir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL: ADICIONAR / EDITAR INTEGRANTE (MEMBRO) */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-primary-950/40 dark:bg-primary-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Cabeçalho */}
            <div className="p-6 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-primary-900 dark:text-white uppercase tracking-wider">
                {memberModalMode === 'create' ? 'Adicionar Integrante' : 'Editar Integrante'}
              </h3>
              <button 
                onClick={() => setShowMemberModal(false)}
                className="p-1 text-primary-400 hover:text-primary-600 dark:hover:text-white rounded-lg hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleMemberSubmit}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {memberError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100 dark:border-red-900/50">
                    <AlertCircle size={14} />
                    <span>{memberError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome do integrante"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Idade */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Idade *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="120"
                      placeholder="Anos de idade"
                      value={memberAge}
                      onChange={(e) => setMemberAge(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Escolaridade */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Escolaridade *</label>
                    <select
                      value={memberSchooling}
                      onChange={(e) => setMemberSchooling(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
                    >
                      <option value="Educação Infantil">Educação Infantil</option>
                      <option value="Ensino Fundamental I (Incompleto)">Ensino Fundamental I (Incompleto)</option>
                      <option value="Ensino Fundamental I (Completo)">Ensino Fundamental I (Completo)</option>
                      <option value="Ensino Fundamental II (Incompleto)">Ensino Fundamental II (Incompleto)</option>
                      <option value="Ensino Fundamental II (Completo)">Ensino Fundamental II (Completo)</option>
                      <option value="Ensino Médio (Incompleto)">Ensino Médio (Incompleto)</option>
                      <option value="Ensino Médio (Completo)">Ensino Médio (Completo)</option>
                      <option value="Ensino Superior (Completo)">Ensino Superior (Completo)</option>
                    </select>
                  </div>

                  {/* Situação de Emprego */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Situação de Emprego *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Desempregado, Autônomo, Estudante, CLT..."
                      value={memberEmployment}
                      onChange={(e) => setMemberEmployment(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Documentos */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Documentos (RG/CPF) *</label>
                    <input
                      type="text"
                      required
                      placeholder="RG ou CPF do membro"
                      value={memberDocs}
                      onChange={(e) => setMemberDocs(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Necessidades especiais */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Necessidades Especiais / Saúde *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Nenhuma, Cadeirante, Diabetes Crônico, etc."
                      value={memberSpecialNeeds}
                      onChange={(e) => setMemberSpecialNeeds(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="p-6 border-t border-primary-100 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 text-primary-500 hover:text-primary-750 font-bold rounded-xl text-xs border border-primary-100 dark:border-primary-800 bg-white dark:bg-primary-900 hover:bg-primary-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={memberSubmitting}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  {memberSubmitting && <Loader2 size={12} className="animate-spin" />}
                  <span>Salvar Integrante</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FamilyDetails;
