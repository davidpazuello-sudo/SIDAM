import React, { useState, useMemo } from 'react';
import { ObjectProperty, ObjectType, FDA } from '@/src/types';
import { Shield, FileText, Search, Filter, ChevronDown, CheckCircle2, AlertCircle, FileCheck, Database, Info, X, Calendar, DollarSign, Tag, Fingerprint, Paperclip, ShieldCheck, MessageCircle, MapPin, ExternalLink, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FilterConfig {
  slug: string;
  label: string;
  type: 'text' | 'mask' | 'select' | 'multi-select' | 'range' | 'currency_min' | 'boolean' | 'smart';
  options?: string[] | { label: string, value: any }[];
  props?: any;
}

interface MetaGovRendererProps {
  objectSlug: string;
  data: any[];
  config: {
    type: ObjectType;
    properties: ObjectProperty[];
    filters?: FilterConfig[];
  };
}

/**
 * MetaGovRenderer
 * O motor dinâmico que renderiza a interface baseada em metadados.
 */
export const MetaGovRenderer: React.FC<MetaGovRendererProps> = ({ objectSlug, data, config }) => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [selectedRow, setSelectedRow] = useState<FDA | null>(null);
  const [activeTab, setActiveTab] = useState<'financeiro' | 'processo' | 'garantias' | 'eventos'>('financeiro');
  const [discount, setDiscount] = useState(0);
  const [showWhatsAppMock, setShowWhatsAppMock] = useState(false);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      for (const [key, value] of Object.entries(filterValues)) {
        if (!value) continue;

        // Filtro Especial: Aptos para Envio
        if (key === 'aptos_envio' && value === true) {
          const isApto = item.valor_principal_inscrito > 1000 && 
                         item.gigo_score === 100 && 
                         item.has_attachment === true &&
                         item.status_atual === 'RASCUNHO';
          if (!isApto) return false;
          continue;
        }

        const itemValue = item[key];
        
        if (typeof value === 'string' && value.trim() !== '') {
          if (!itemValue?.toString().toLowerCase().includes(value.toLowerCase())) return false;
        } else if (key === 'status_atual' && Array.isArray(value) && value.length > 0) {
          if (!value.includes(itemValue)) return false;
        } else if (key === 'valor_min' && typeof value === 'number') {
          if (item.valor_principal_inscrito < value) return false;
        } else if (key === 'gigo_min' && typeof value === 'number') {
          if (item.gigo_score < value) return false;
        }
      }
      return true;
    });
  }, [data, filterValues]);

  if (!config) return <div className="p-4">Carregando configurações do motor...</div>;

  return (
    <div className="w-full space-y-4">
      {/* Strategic Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div 
          className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Filtros Estratégicos de Gestão</h3>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isFilterExpanded ? 'rotate-180' : ''}`} />
        </div>

        {isFilterExpanded && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Identificação */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identificação</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="CPF/CNPJ ou Nome..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  onChange={(e) => setFilterValues(prev => ({ ...prev, documento_devedor: e.target.value }))}
                />
              </div>
              <input 
                type="text" 
                placeholder="Nº Processo Administrativo"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                onChange={(e) => setFilterValues(prev => ({ ...prev, numero_processo_administrativo: e.target.value }))}
              />
            </div>

            {/* Workflow */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status e Workflow</p>
              <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                onChange={(e) => setFilterValues(prev => ({ ...prev, status_atual: e.target.value ? [e.target.value] : [] }))}
              >
                <option value="">Todos os Status</option>
                <option value="RASCUNHO">Rascunho</option>
                <option value="EM_TRIAGEM">Em Triagem</option>
                <option value="ATIVA">Inscrito (Ativa)</option>
                <option value="QUARENTENA">Quarentena (GIGO)</option>
                <option value="PENDENTE">Pendente (Procurador)</option>
              </select>
              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                <input 
                  type="checkbox" 
                  id="aptos_envio"
                  className="w-4 h-4 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500"
                  onChange={(e) => setFilterValues(prev => ({ ...prev, aptos_envio: e.target.checked }))}
                />
                <label htmlFor="aptos_envio" className="text-xs font-bold text-indigo-700 cursor-pointer flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  Aptos para Envio (GIGO 100)
                </label>
              </div>
            </div>

            {/* Financeiro */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financeiro e Rating</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Valor {'>'}</span>
                <input 
                  type="number" 
                  placeholder="R$ 0,00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  onChange={(e) => setFilterValues(prev => ({ ...prev, valor_min: parseFloat(e.target.value) }))}
                />
              </div>
              <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                onChange={(e) => setFilterValues(prev => ({ ...prev, rating_recuperabilidade: e.target.value }))}
              >
                <option value="">Todos os Ratings</option>
                <option value="A">Rating A (Alta)</option>
                <option value="B">Rating B (Média)</option>
                <option value="C">Rating C (Baixa)</option>
                <option value="D">Rating D (Irrecuperável)</option>
              </select>
            </div>

            {/* Inteligência GIGO */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qualidade do Dado (GIGO)</p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>SCORE MÍNIMO</span>
                  <span>{filterValues.gigo_min || 0}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="10"
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  onChange={(e) => setFilterValues(prev => ({ ...prev, gigo_min: parseInt(e.target.value) }))}
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <input 
                  type="checkbox" 
                  id="blockchain_sealed"
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  onChange={(e) => setFilterValues(prev => ({ ...prev, is_blockchain_sealed: e.target.checked }))}
                />
                <label htmlFor="blockchain_sealed" className="text-xs font-medium text-slate-600 cursor-pointer flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Selado em Blockchain
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-800">{config.type.name}</h2>
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
              {filteredData.length} REGISTROS
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>RLS Ativo</span>
            </div>
            {filterValues.aptos_envio && (
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2">
                <FileCheck size={14} />
                Enviar Lote para PGM
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                {config.properties.sort((a, b) => a.sort_order - b.sort_order).map((prop) => (
                  <th key={prop.slug} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    {prop.name}
                  </th>
                ))}
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">GIGO Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={config.properties.length + 1} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhum registro encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr 
                    key={row.id || idx} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedRow(row)}
                  >
                    {config.properties.map((prop) => (
                      <td key={prop.slug} className="px-6 py-4 text-sm text-slate-600">
                        {renderCell(row[prop.slug], prop)}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${row.gigo_score === 100 ? 'bg-emerald-500' : row.gigo_score > 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
                            style={{ width: `${row.gigo_score}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{row.gigo_score}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Ficha Detalhada do Débito</h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                      {selectedRow.numero_inscricao || 'INSCRIÇÃO PENDENTE'} • {selectedRow.numero_processo_administrativo}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRow(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-0 flex flex-col h-[75vh]">
                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-100 px-8 bg-slate-50/50">
                  {[
                    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
                    { id: 'processo', label: 'Processo & Devedor', icon: Fingerprint },
                    { id: 'garantias', label: 'Garantias', icon: ShieldCheck },
                    { id: 'eventos', label: 'Eventos & Auditoria', icon: Calendar },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${
                        activeTab === tab.id 
                          ? 'border-indigo-600 text-indigo-600 bg-white' 
                          : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {activeTab === 'financeiro' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {/* Status & Value Banner */}
                      <div className="flex flex-wrap gap-4 items-center justify-between p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Status Atual</p>
                          {renderCell(selectedRow.status_atual, { ui_component: 'StatusBadge' } as any)}
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Valor Consolidado</p>
                          <p className="text-3xl font-mono font-bold text-indigo-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedRow.valor_principal_inscrito)}
                          </p>
                        </div>
                      </div>

                      {/* Memory Calculation */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Database className="w-4 h-4" />
                          Memória de Cálculo (Auditada)
                        </h3>
                        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                          <table className="w-full text-sm">
                            <tbody className="divide-y divide-slate-100">
                              <tr className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-3 text-slate-500 font-medium">Valor Principal Original</td>
                                <td className="px-6 py-3 text-right font-mono font-bold text-slate-700">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedRow.financeiro?.principal || selectedRow.valor_principal_inscrito * 0.7)}
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-3 text-slate-500 font-medium">Multa de Mora (10%)</td>
                                <td className="px-6 py-3 text-right font-mono font-bold text-slate-700">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedRow.financeiro?.multa_mora || selectedRow.valor_principal_inscrito * 0.1)}
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-3 text-slate-500 font-medium">Juros Acumulados (1% a.m.)</td>
                                <td className="px-6 py-3 text-right font-mono font-bold text-slate-700">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedRow.financeiro?.juros || selectedRow.valor_principal_inscrito * 0.12)}
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-3 text-slate-500 font-medium">Atualização Monetária (IPCA)</td>
                                <td className="px-6 py-3 text-right font-mono font-bold text-slate-700">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedRow.financeiro?.atualizacao_monetaria || selectedRow.valor_principal_inscrito * 0.05)}
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-3 text-slate-500 font-medium">Custas e Honorários</td>
                                <td className="px-6 py-3 text-right font-mono font-bold text-slate-700">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedRow.financeiro?.custas_honorarios || 0)}
                                </td>
                              </tr>
                              <tr className="bg-slate-50 font-bold">
                                <td className="px-6 py-4 text-slate-800">TOTAL ATUALIZADO</td>
                                <td className="px-6 py-4 text-right font-mono text-indigo-600 text-lg">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedRow.valor_principal_inscrito)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
                          <AlertCircle className="w-3 h-3" />
                          VENCIMENTO ORIGINAL: {selectedRow.financeiro?.data_vencimento_original || '15/01/2023'} • PRESCRIÇÃO EM: 15/01/2028
                        </div>
                      </div>

                      {/* Discount Simulator */}
                      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Simulador de Desconto (Negociação)
                          </h3>
                          <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-full">FASE 8: ACORDO LEGAL</span>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between text-[10px] font-bold text-emerald-600">
                            <span>DESCONTO SOBRE JUROS/MULTA</span>
                            <span>{discount}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="5"
                            value={discount}
                            onChange={(e) => setDiscount(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                          
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-3 bg-white rounded-xl border border-emerald-100">
                              <p className="text-[9px] font-bold text-emerald-500 uppercase">Valor do Desconto</p>
                              <p className="text-sm font-mono font-bold text-emerald-700">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedRow.valor_principal_inscrito * 0.22 * (discount / 100))}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-emerald-100">
                              <p className="text-[9px] font-bold text-emerald-500 uppercase">Novo Total</p>
                              <p className="text-sm font-mono font-bold text-emerald-700">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedRow.valor_principal_inscrito - (selectedRow.valor_principal_inscrito * 0.22 * (discount / 100)))}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'processo' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                            <Fingerprint className="w-4 h-4" />
                            Dados do Devedor
                          </h3>
                          <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Nome / Razão Social</p>
                              <p className="text-sm font-semibold text-slate-700">{selectedRow.devedor_nome}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Documento (CPF/CNPJ)</p>
                              <p className="text-sm font-mono font-medium text-slate-600">{selectedRow.documento_devedor}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Endereço Validado</p>
                              <p className="text-sm text-slate-600">
                                {selectedRow.contato?.endereco || 'Rua das Flores, 123'} - {selectedRow.contato?.bairro || 'Centro'}
                              </p>
                              <p className="text-xs text-slate-400">CEP: {selectedRow.contato?.cep || '69000-000'} • Manaus/AM</p>
                            </div>
                            <div className="flex gap-4">
                              <button className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                <MapPin className="w-3 h-3 text-indigo-500" /> Ver no Mapa
                              </button>
                              <button 
                                onClick={() => setShowWhatsAppMock(true)}
                                className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-500" /> WhatsApp
                              </button>
                            </div>
                            {showWhatsAppMock && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] text-emerald-700 font-bold flex items-center justify-between"
                              >
                                <span>Canal de Negociação Aberto via NegocioBot</span>
                                <button onClick={() => setShowWhatsAppMock(false)} className="text-emerald-900">X</button>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Co-responsáveis (JUCEA)
                          </h3>
                          <div className="space-y-3">
                            {(selectedRow.co_responsaveis || [
                              { nome: 'Sócio Majoritário A', documento: '***.456.***-00', vinculo: 'Sócio-Administrador' },
                              { nome: 'Sócio B', documento: '***.123.***-11', vinculo: 'Sócio Cotista' }
                            ]).map((socio, i) => (
                              <div key={i} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-bold text-slate-700">{socio.nome}</p>
                                  <p className="text-[10px] text-slate-400 font-medium uppercase">{socio.vinculo} • {socio.documento}</p>
                                </div>
                                <Info className="w-4 h-4 text-slate-300" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'garantias' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="p-12 text-center space-y-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                          <Shield className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="max-w-xs mx-auto">
                          <h3 className="text-sm font-bold text-slate-700">Nenhuma Garantia Vinculada</h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Este débito ainda não possui bens penhorados, seguro-garantia ou fiança bancária registrada.
                          </p>
                        </div>
                        <button className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all">
                          Vincular Garantia (Fase 5)
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'eventos' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {/* Intelligence Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">GIGO Score</p>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-emerald-700">{selectedRow.gigo_score}%</span>
                            <div className="flex-1 h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${selectedRow.gigo_score}%` }}></div>
                            </div>
                          </div>
                          <p className="text-[9px] font-bold text-emerald-600 uppercase">Selo: Dados Sanitizados (RFB/ViaCEP)</p>
                        </div>

                        <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Blockchain</p>
                            <Database className="w-4 h-4 text-indigo-500" />
                          </div>
                          <p className="text-xs font-bold text-indigo-700">REGISTRO IMUTÁVEL SELADO</p>
                          <p className="text-[9px] font-mono text-indigo-400 break-all">
                            Hash: {selectedRow.blockchain_hash || '0x7a2d8e...f31b4'}
                          </p>
                        </div>

                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Documentação</p>
                            <Paperclip className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="space-y-2">
                            <button className="w-full text-left text-[10px] font-bold text-blue-700 hover:underline flex items-center justify-between">
                              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> AUTO_INFRACAO_ORIGINAL.PDF</span>
                              <Download className="w-3 h-3" />
                            </button>
                            <button className="w-full text-left text-[10px] font-bold text-blue-700 hover:underline flex items-center justify-between">
                              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> NOTIFICACAO_AR_ENTREGUE.PDF</span>
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Linha do Tempo de Auditoria
                        </h3>
                        <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                          {(selectedRow.eventos || [
                            { data: '12/01/2023', descricao: 'Inscrição em Dívida Ativa (Livro 001/24)', origem: 'PGM' },
                            { data: '15/02/2023', descricao: 'Envio para Protesto (CRA)', origem: 'Sistema Automático' },
                            { data: '20/03/2023', descricao: 'Tentativa de Negociação via NegocioBot (Fracassada)', origem: 'AI Engine' },
                            { data: '10/05/2023', descricao: 'Ajuizamento de Execução Fiscal (TJAM)', origem: 'Procuradoria' }
                          ]).map((evento, i) => (
                            <div key={i} className="relative">
                              <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-white border-2 border-indigo-500 z-10"></div>
                              <div>
                                <p className="text-[10px] font-bold text-indigo-600">{evento.data}</p>
                                <p className="text-sm font-semibold text-slate-700">{evento.descricao}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase">Origem: {evento.origem}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedRow(null)}
                  className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Fechar
                </button>
                {selectedRow.status_atual === 'RASCUNHO' && selectedRow.gigo_score === 100 && (
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <FileCheck size={16} />
                    Enviar para PGM
                  </button>
                )}
                {selectedRow.status_atual === 'QUARENTENA' && (
                  <button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Sanitizar Dados
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Função auxiliar para renderizar células baseada no componente de UI definido no banco
function renderCell(value: any, prop: ObjectProperty) {
  switch (prop.ui_component) {
    case 'StatusBadge':
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(value)}`}>
          {value}
        </span>
      );
    case 'RatingBadge':
      return (
        <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-white shadow-sm ${getRatingColor(value)}`}>
          {value || '-'}
        </span>
      );
    case 'CurrencyInput':
      return (
        <span className="font-mono font-semibold text-slate-700">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)}
        </span>
      );
    default:
      return value?.toString() || '-';
  }
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    'RASCUNHO': 'bg-slate-100 text-slate-600 border border-slate-200',
    'EM_TRIAGEM': 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    'ATIVA': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'EXTINTA': 'bg-blue-100 text-blue-700 border border-blue-200',
    'SUSPENSA': 'bg-amber-100 text-amber-700 border border-amber-200',
    'QUARENTENA': 'bg-rose-100 text-rose-700 border border-rose-200',
    'PENDENTE': 'bg-orange-100 text-orange-700 border border-orange-200',
  };
  return colors[status] || 'bg-slate-100 text-slate-700';
}

function getRatingColor(rating: string) {
  const colors: Record<string, string> = {
    'A': 'bg-emerald-500 shadow-emerald-500/20',
    'B': 'bg-blue-500 shadow-blue-500/20',
    'C': 'bg-amber-500 shadow-amber-500/20',
    'D': 'bg-rose-500 shadow-rose-500/20',
  };
  return colors[rating] || 'bg-slate-400';
}
