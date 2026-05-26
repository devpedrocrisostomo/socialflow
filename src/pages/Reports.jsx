import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Printer, 
  User, 
  Calendar, 
  Loader2, 
  X, 
  AlertCircle,
  Users
} from 'lucide-react';

const Reports = () => {
  const location = useLocation();
  const preselectedFamilyId = location.state?.familyId || '';
  const preselectedReportId = location.state?.selectedReportId || '';

  // Estados
  const [reports, setReports] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal Novo Relatório
  const [showModal, setShowModal] = useState(false);
  const [familyId, setFamilyId] = useState(preselectedFamilyId);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('SOCIAL_REPORT');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Modal Detalhes e Visualizador PDF
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingReportDetails, setLoadingReportDetails] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let query = `?search=${encodeURIComponent(search)}`;
      if (typeFilter) query += `&type=${typeFilter}`;
      
      const response = await api.get(`/reports${query}`);
      setReports(response.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar relatórios.');
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
    fetchReports();
    fetchFamilies();
  }, [typeFilter, search]);

  // Se veio pré-selecionado para abrir visualizador de relatório
  useEffect(() => {
    if (preselectedReportId) {
      handleOpenViewer(preselectedReportId);
    }
  }, [preselectedReportId]);

  const handleOpenCreateModal = () => {
    setFamilyId(preselectedFamilyId);
    setTitle('');
    setType('SOCIAL_REPORT');
    setContent('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      await api.post('/reports', {
        familyId: parseInt(familyId),
        title,
        type,
        content,
      });
      setShowModal(false);
      fetchReports();
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.error || 'Erro ao registrar relatório.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenViewer = async (reportId) => {
    setLoadingReportDetails(true);
    setShowViewerModal(true);
    try {
      const response = await api.get(`/reports/${reportId}`);
      setSelectedReport(response.data);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar detalhes do relatório.');
      setShowViewerModal(false);
    } finally {
      setLoadingReportDetails(false);
    }
  };

  // Gerar PDF vetorizado de verdade usando jsPDF
  const generatePDF = (report) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configurações de layout
    const margin = 20;
    const pageWidth = 210;
    const contentWidth = pageWidth - (margin * 2);
    let y = 25;

    // Cabeçalho Oficial
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text("REPUBLICA FEDERATIVA DO BRASIL", pageWidth / 2, y, { align: "center" });
    y += 6;
    
    doc.setFontSize(12);
    doc.text("SECRETARIA DE ASSISTÊNCIA SOCIAL E DIREITOS HUMANOS", pageWidth / 2, y, { align: "center" });
    y += 5;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Sistema de Apoio e Gestão Social - SocialFlow", pageWidth / 2, y, { align: "center" });
    y += 4;
    
    // Linha divisória
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Título do Relatório
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(21, 128, 61); // Verde brand
    doc.text(report.title.toUpperCase(), pageWidth / 2, y, { align: "center" });
    y += 10;

    // Dados da Família / Triagem
    doc.setFillColor(245, 247, 250);
    doc.rect(margin, y, contentWidth, 38, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 38, "S");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    
    y += 6;
    doc.text("INFORMAÇÕES DE CADASTRO DO ASSISTIDO", margin + 5, y);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    
    y += 6;
    doc.text(`Responsável: ${report.family.nameResponsible}`, margin + 5, y);
    doc.text(`CPF: ${report.family.cpf}`, margin + 110, y);
    
    y += 5;
    doc.text(`Endereço: ${report.family.address}`, margin + 5, y);
    
    y += 5;
    doc.text(`Telefone: ${report.family.phone}`, margin + 5, y);
    doc.text(`Membros na Família: ${report.family.memberCount}`, margin + 110, y);
    
    y += 5;
    doc.text(`Renda Mensal: R$ ${report.family.familyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin + 5, y);
    doc.text(`Situação Social: ${report.family.socialSituation === 'CRITICAL' ? 'CRÍTICO' : report.family.socialSituation === 'VULNERABLE' ? 'VULNERÁVEL' : 'ESTÁVEL'}`, margin + 110, y);
    
    y += 12;

    // Parecer Técnico / Conteúdo do Relatório
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text("PARECER E CONTEXTO SOCIAL DA EVOLUÇÃO", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    
    // Tratamento de quebras de linha automáticas para o texto do relatório
    const textLines = doc.splitTextToSize(report.content, contentWidth);
    doc.text(textLines, margin, y, { align: "justify" });
    
    // Calcular altura estimada do texto para posicionar rodapé de assinaturas
    y += (textLines.length * 5) + 20;

    // Se y ficar muito baixo, criar nova página para a assinatura
    if (y > 250) {
      doc.addPage();
      y = 30;
    }

    // Assinaturas e Rodapé
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin + 15, y, margin + 75, y);
    doc.line(pageWidth - margin - 75, y, pageWidth - margin - 15, y);
    
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(report.user.name, margin + 45, y, { align: "center" });
    doc.text(report.family.nameResponsible, pageWidth - margin - 45, y, { align: "center" });
    
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(report.user.role === 'ADMIN' ? 'Coordenador Técnico' : 'Assistente Social Responsável', margin + 45, y, { align: "center" });
    doc.text("Representante Familiar", pageWidth - margin - 45, y, { align: "center" });

    y += 12;
    doc.setFontSize(8);
    doc.text(`Documento emitido digitalmente em ${new Date(report.createdAt).toLocaleDateString('pt-BR')} às ${new Date(report.createdAt).toLocaleTimeString('pt-BR')}`, pageWidth / 2, y, { align: "center" });

    // Salvar PDF
    doc.save(`Relatorio_Social_${report.family.nameResponsible.replace(/ /g, '_')}.pdf`);
  };

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-950 dark:text-white tracking-tight">Relatórios Sociais</h1>
          <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">Elabore pareceres técnicos, relatórios e emita PDFs formais com assinaturas.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-brand-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Plus size={16} />
          <span>Escrever Relatório</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-5 rounded-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pesquisa */}
        <div className="relative">
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Buscar no Conteúdo</label>
          <input
            type="text"
            placeholder="Buscar por palavras-chave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 pl-9 pr-3 py-2 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
          />
          <div className="absolute left-3 bottom-2.5 text-primary-400">
            <Search size={14} />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Tipo de Parecer</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2 px-3 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
          >
            <option value="">Todos</option>
            <option value="SOCIAL_REPORT">Relatório Social</option>
            <option value="FAMILY_REPORT">Parecer Familiar</option>
            <option value="MONTHLY_SUMMARY">Resumo Mensal</option>
          </select>
        </div>
      </div>

      {/* Grid de Relatórios */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-12 flex justify-center items-center rounded-3xl">
            <Loader2 size={24} className="text-brand-500 animate-spin" />
            <span className="ml-2 text-xs text-primary-500">Buscando pareceres...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600 bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/50">{error}</div>
        ) : reports.length === 0 ? (
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-12 text-center text-xs text-primary-400 rounded-3xl">
            Nenhum relatório ou parecer técnico registrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((rep) => (
              <div 
                key={rep.id} 
                className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 p-6 rounded-3xl space-y-4 shadow-sm hover:border-primary-200 dark:hover:border-primary-750 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2 border-b border-primary-100/50 dark:border-primary-850/50 pb-3">
                    <div>
                      <span className="bg-primary-50 dark:bg-primary-900 border border-primary-150 dark:border-primary-800 text-primary-500 font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-wide">
                        {rep.type === 'SOCIAL_REPORT' ? 'Relatório Social' : rep.type === 'FAMILY_REPORT' ? 'Laudo Familiar' : 'Resumo Mensal'}
                      </span>
                      <h3 className="font-extrabold text-sm text-primary-900 dark:text-white mt-2">{rep.title}</h3>
                      <p className="text-[10px] text-primary-400 mt-1">Família: {rep.family.nameResponsible}</p>
                    </div>
                  </div>

                  <p className="text-xs text-primary-600 dark:text-primary-350 line-clamp-4 leading-relaxed">
                    {rep.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-primary-100/50 dark:border-primary-850/50 flex justify-between items-center text-[10px] text-primary-400 font-bold uppercase">
                  <span className="flex items-center gap-1"><User size={12} /> Assistente: {rep.user.name.split(' ')[0]}</span>
                  <button
                    onClick={() => handleOpenViewer(rep.id)}
                    className="text-brand-500 hover:text-brand-600 hover:underline flex items-center gap-1"
                  >
                    Visualizar PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: NOVO RELATÓRIO */}
      {showModal && (
        <div className="fixed inset-0 bg-primary-950/40 dark:bg-primary-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho */}
            <div className="p-6 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-primary-900 dark:text-white uppercase tracking-wider">Escrever Parecer Social / Relatório</h3>
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
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Família Vinculada *</label>
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

                  {/* Título do Documento */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Título do Documento *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Relatório Social de Estudo de Caso de Família Silva"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all"
                    />
                  </div>

                  {/* Tipo de Relatório */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Tipo de Documento *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all cursor-pointer"
                    >
                      <option value="SOCIAL_REPORT">Relatório Social</option>
                      <option value="FAMILY_REPORT">Parecer / Laudo Familiar</option>
                      <option value="MONTHLY_SUMMARY">Resumo de Acompanhamento Mensal</option>
                    </select>
                  </div>

                  {/* Conteúdo Técnico */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-400 mb-1.5">Conteúdo Técnico do Relatório *</label>
                    <textarea
                      required
                      placeholder="Desenvolva o relatório de estudo socioeconômico, histórico familiar, vulnerabilidades habitacionais ou de saúde, e finalize com as orientações ou intervenções sugeridas de acordo com as diretrizes do SUAS..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      className="w-full bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-white placeholder-primary-400 py-2.5 px-3.5 rounded-xl text-xs border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-primary-950 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
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
                  <span>Salvar Documento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZADOR DE RELATÓRIO & GERAÇÃO DE PDF */}
      {showViewerModal && (
        <div className="fixed inset-0 bg-primary-950/40 dark:bg-primary-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-primary-900 border border-primary-100 dark:border-primary-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            
            {/* Cabeçalho */}
            <div className="p-6 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-primary-900 dark:text-white uppercase tracking-wider">Visualizar Parecer Oficial</h3>
              <button 
                onClick={() => setShowViewerModal(false)}
                className="p-1 text-primary-400 hover:text-primary-600 dark:hover:text-white rounded-lg hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Corpo / Conteúdo da Pré-visualização */}
            <div className="flex-1 overflow-y-auto p-8 bg-primary-50/40 dark:bg-primary-950/20">
              {loadingReportDetails ? (
                <div className="py-24 flex flex-col items-center justify-center">
                  <Loader2 size={36} className="text-brand-500 animate-spin" />
                  <span className="text-xs text-primary-400 mt-2">Construindo visualização oficial...</span>
                </div>
              ) : selectedReport ? (
                <div className="bg-white dark:bg-primary-900 border border-primary-150 dark:border-primary-800 p-8 md:p-12 rounded-2xl shadow-md max-w-2xl mx-auto space-y-8 font-serif text-primary-800 dark:text-primary-200">
                  {/* Cabeçalho Oficial Papel Timbrado */}
                  <div className="text-center border-b border-primary-100 dark:border-primary-800 pb-4 space-y-1">
                    <p className="font-bold text-xs uppercase tracking-wider text-primary-900 dark:text-white">República Federativa do Brasil</p>
                    <p className="font-bold text-xs uppercase text-primary-750 dark:text-primary-300">Secretaria Municipal de Assistência Social</p>
                    <p className="text-[10px] text-primary-400 uppercase">Sistema de Estudo e Diagnóstico Social - SocialFlow</p>
                  </div>

                  {/* Título do Documento */}
                  <div className="text-center">
                    <h2 className="text-sm font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wide font-sans">{selectedReport.title}</h2>
                    <p className="text-[10px] text-primary-400 font-sans mt-1">
                      Emitido em: {new Date(selectedReport.createdAt).toLocaleDateString('pt-BR')} às {new Date(selectedReport.createdAt).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>

                  {/* Dados Assistido Box */}
                  <div className="bg-primary-50/50 dark:bg-primary-950/50 border border-primary-100 dark:border-primary-800 p-4 rounded-xl font-sans text-xs grid grid-cols-2 gap-3 leading-relaxed">
                    <div className="col-span-2">
                      <strong className="text-primary-500 uppercase text-[9px] block">Responsável Familiar</strong>
                      <span className="font-bold text-primary-900 dark:text-white">{selectedReport.family.nameResponsible}</span>
                    </div>
                    <div>
                      <strong className="text-primary-500 uppercase text-[9px] block">CPF</strong>
                      <span>{selectedReport.family.cpf}</span>
                    </div>
                    <div>
                      <strong className="text-primary-500 uppercase text-[9px] block">Telefone</strong>
                      <span>{selectedReport.family.phone}</span>
                    </div>
                    <div className="col-span-2">
                      <strong className="text-primary-500 uppercase text-[9px] block">Endereço</strong>
                      <span>{selectedReport.family.address}</span>
                    </div>
                    <div>
                      <strong className="text-primary-500 uppercase text-[9px] block">Renda Familiar</strong>
                      <span>R$ {selectedReport.family.familyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div>
                      <strong className="text-primary-500 uppercase text-[9px] block">Integrantes</strong>
                      <span>{selectedReport.family.memberCount} membros</span>
                    </div>
                  </div>

                  {/* Conteúdo Técnico */}
                  <div className="space-y-3 leading-relaxed">
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-primary-900 dark:text-white">Parecer e Contexto Social:</h4>
                    <p className="text-xs whitespace-pre-wrap text-justify leading-normal">{selectedReport.content}</p>
                  </div>

                  {/* Assinaturas */}
                  <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs font-sans">
                    <div className="space-y-1">
                      <div className="border-t border-primary-200 dark:border-primary-800 pt-2 font-bold text-primary-900 dark:text-white">
                        {selectedReport.user.name}
                      </div>
                      <p className="text-[10px] text-primary-400 uppercase tracking-wide">
                        {selectedReport.user.role === 'ADMIN' ? 'Coordenador Técnico' : 'Assistente Social Responsável'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="border-t border-primary-200 dark:border-primary-800 pt-2 font-bold text-primary-900 dark:text-white">
                        {selectedReport.family.nameResponsible}
                      </div>
                      <p className="text-[10px] text-primary-400 uppercase tracking-wide">Representante Familiar</p>
                    </div>
                  </div>

                </div>
              ) : null}
            </div>

            {/* Footer com Ações */}
            <div className="p-6 border-t border-primary-100 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/50 flex justify-end gap-3 z-10">
              <button
                onClick={() => setShowViewerModal(false)}
                className="px-4 py-2 text-primary-500 hover:text-primary-750 font-bold rounded-xl text-xs border border-primary-100 dark:border-primary-800 bg-white dark:bg-primary-900 hover:bg-primary-50 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => generatePDF(selectedReport)}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download size={14} />
                <span>Baixar Relatório PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
