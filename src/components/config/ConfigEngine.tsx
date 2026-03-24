import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Database, 
  List, 
  Plus, 
  Save, 
  Edit3, 
  ChevronRight, 
  Layout,
  Link as LinkIcon,
  ShieldCheck,
  Palette,
  Lock,
  Globe,
  Zap,
  Key,
  Eye,
  Smartphone,
  UserCheck,
  CreditCard,
  Gavel,
  Building2,
  MessageSquare,
  BarChart3,
  ShieldAlert,
  Image as ImageIcon,
  Type
} from 'lucide-react';
import { ObjectType, ObjectProperty } from '../../types';
import { MatrizAcesso } from '../metagov/MatrizAcesso';
import { useBranding } from '../../context/BrandingContext';

interface ConfigEngineProps {
  initialType: ObjectType;
  initialProperties: ObjectProperty[];
}

type SubTab = 'dynamic_properties' | 'integrations' | 'permissions' | 'customization' | 'security';

export const ConfigEngine: React.FC<ConfigEngineProps> = ({ initialType, initialProperties }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('dynamic_properties');
  const [selectedProp, setSelectedProp] = useState<ObjectProperty | null>(null);
  const [selectedObjectGroup, setSelectedObjectGroup] = useState('');
  const [selectedObjectName, setSelectedObjectName] = useState('');
  const { branding, updateBranding } = useBranding();
  const [brandingForm, setBrandingForm] = useState(branding);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const objectCatalog = [
    {
      name: initialType.name,
      group: 'Núcleo da Dívida Ativa',
      properties: initialProperties
    },
    {
      name: 'Certidão de Dívida Ativa',
      group: 'Núcleo da Dívida Ativa',
      properties: [
      {
        id: 'cda-1',
        object_type_slug: 'cda',
        name: 'Número CDA',
        slug: 'numero_cda',
        data_type: 'string',
        ui_component: 'TextInput',
        is_required: true,
        sort_order: 1,
        configuration: {}
      },
      {
        id: 'cda-2',
        object_type_slug: 'cda',
        name: 'Status da Emissão',
        slug: 'status_emissao',
        data_type: 'string',
        ui_component: 'StatusBadge',
        is_required: true,
        sort_order: 2,
        configuration: {}
      }
    ]
    },
    {
      name: 'Pagamento da Dívida Ativa',
      group: 'Núcleo da Dívida Ativa',
      properties: [
      {
        id: 'pag-1',
        object_type_slug: 'pagamento_da',
        name: 'Valor Pago',
        slug: 'valor_pago',
        data_type: 'decimal',
        ui_component: 'CurrencyInput',
        is_required: true,
        sort_order: 1,
        configuration: {}
      },
      {
        id: 'pag-2',
        object_type_slug: 'pagamento_da',
        name: 'Meio de Pagamento',
        slug: 'meio_pagamento',
        data_type: 'string',
        ui_component: 'TextInput',
        is_required: true,
        sort_order: 2,
        configuration: {}
      }
    ]
    },
    {
      name: 'CADIM Municipal',
      group: 'Núcleo da Dívida Ativa',
      properties: [
      {
        id: 'cadim-1',
        object_type_slug: 'cadim',
        name: 'Status Restrição',
        slug: 'status_restricao',
        data_type: 'string',
        ui_component: 'StatusBadge',
        is_required: true,
        sort_order: 1,
        configuration: {}
      },
      {
        id: 'cadim-2',
        object_type_slug: 'cadim',
        name: 'Data de Inscrição',
        slug: 'data_inscricao',
        data_type: 'date',
        ui_component: 'DatePicker',
        is_required: true,
        sort_order: 2,
        configuration: {}
      }
    ]
    },
    {
      name: 'Fila de Integrações',
      group: 'Integrações e Resiliência',
      properties: [
      {
        id: 'fila-1',
        object_type_slug: 'integration_queue',
        name: 'Serviço Alvo',
        slug: 'servico_alvo',
        data_type: 'string',
        ui_component: 'TextInput',
        is_required: true,
        sort_order: 1,
        configuration: {}
      },
      {
        id: 'fila-2',
        object_type_slug: 'integration_queue',
        name: 'Tentativas',
        slug: 'tentativas',
        data_type: 'number',
        ui_component: 'TextInput',
        is_required: true,
        sort_order: 2,
        configuration: {}
      }
    ]
    }
  ];
  const availableObjectGroups = Array.from(new Set(objectCatalog.map((objectItem) => objectItem.group)));
  const normalizedSelectedGroup = selectedObjectGroup.trim().toLowerCase();
  const isAllGroupsSelected = !normalizedSelectedGroup || normalizedSelectedGroup === 'todos';
  const availableObjectNames = objectCatalog
    .filter((objectItem) => isAllGroupsSelected || objectItem.group.toLowerCase() === normalizedSelectedGroup)
    .map((objectItem) => objectItem.name);
  const objectPropertyCatalog: Record<string, ObjectProperty[]> = Object.fromEntries(
    objectCatalog.map((objectItem) => [objectItem.name, objectItem.properties])
  );
  const activeObjectName = selectedObjectName || initialType.name;
  const displayedProperties = objectPropertyCatalog[activeObjectName] ?? [];

  useEffect(() => {
    setSelectedProp(null);
  }, [activeObjectName]);

  const renderDynamicProperties = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Propriedades Dinâmicas</h2>
          <p className="text-slate-500 text-sm">Defina os campos e comportamentos do objeto <strong>{initialType.name}</strong>.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
          <Plus size={18} />
          Novo Campo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Object Definition */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Definição do Objeto</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Grupo de Objetos</label>
                <div className="space-y-1">
                  <input
                  type="text"
                  list="object-group-options"
                  value={selectedObjectGroup}
                  onChange={(e) => {
                    setSelectedObjectGroup(e.target.value);
                    setSelectedObjectName('');
                  }}
                  placeholder="Todos"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                  <datalist id="object-group-options">
                    <option value="Todos" />
                  {availableObjectGroups.map((group) => (
                    <option key={group} value={group} />
                  ))}
                  </datalist>
                  <p className="text-[10px] text-slate-400">Padrão: Todos.</p>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome do Objeto</label>
                <div className="space-y-1">
                  <input
                    type="text"
                    list="object-name-options"
                    value={selectedObjectName}
                    onChange={(e) => setSelectedObjectName(e.target.value)}
                    placeholder={initialType.name}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <datalist id="object-name-options">
                    {availableObjectNames.map((objectName) => (
                      <option key={objectName} value={objectName} />
                    ))}
                  </datalist>
                  <p className="text-[10px] text-slate-400">
                    Campo com busca: selecione um grupo (opcional) e digite para filtrar.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Main: Properties Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Lista de Propriedades</h3>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {displayedProperties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => setSelectedProp(prop)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedProp?.id === prop.id
                      ? 'border-indigo-300 bg-indigo-50/60'
                      : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="text-xs font-mono text-slate-400 mt-1">#{prop.sort_order}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{prop.name}</p>
                        <p className="text-[11px] font-mono text-slate-500">{prop.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-mono">
                        {prop.data_type}
                      </span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 font-bold">
                        {prop.ui_component}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </button>
              ))}
              {displayedProperties.length === 0 && (
                <div className="p-6 text-sm text-slate-500 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  Nenhuma propriedade encontrada para o objeto selecionado.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popup de Detalhes da Propriedade */}
      {selectedProp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Detalhes do Objeto</h3>
              </div>
              <button onClick={() => setSelectedProp(null)} className="text-white/80 hover:text-white">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <DetailField label="ID" value={selectedProp.id} mono />
              <DetailField label="Ordem" value={`#${selectedProp.sort_order}`} mono />
              <DetailField label="Nome de Exibição" value={selectedProp.name} />
              <DetailField label="Slug" value={selectedProp.slug} mono />
              <DetailField label="Tipo de Dado" value={selectedProp.data_type} mono />
              <DetailField label="Componente UI" value={selectedProp.ui_component} />
              <DetailField label="Objeto (slug)" value={selectedProp.object_type_slug} mono />
              <DetailField label="Campo Obrigatório" value={selectedProp.is_required ? 'Sim' : 'Não'} />
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setSelectedProp(null)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all">
                Fechar
              </button>
              <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
                <Save size={16} />
                Editar Metadados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Integrações Estratégicas</h2>
        <p className="text-slate-500 text-sm">Conecte o motor MetaGov com serviços externos para automação total.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 1. Identidade e Base Cadastral */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest font-bold text-[10px]">
            <UserCheck size={14} />
            <span>Identidade e Base Cadastral</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <IntegrationCard 
              icon={<Globe className="text-blue-500" />} 
              title="Gov.br (Login Único)" 
              description="Autenticação segura para o cidadão no Portal do Contribuinte."
              status="Inativo"
            />
            <IntegrationCard 
              icon={<ShieldCheck className="text-emerald-500" />} 
              title="Receita Federal (CPF/CNPJ)" 
              description="Validação cadastral via API para evitar inscrições falsas."
              status="Inativo"
            />
          </div>
        </div>

        {/* 2. Arrecadação e Tesouro */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest font-bold text-[10px]">
            <CreditCard size={14} />
            <span>Arrecadação e Tesouro</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <IntegrationCard 
              icon={<Zap className="text-amber-500" />} 
              title="PSP / Bancos (PIX Dinâmico)" 
              description="Geração de QR Codes e confirmação instantânea de pagamento."
              status="Configurado"
              onSimulate={() => {
                fetch('/api/webhooks/pix', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    txid: 'SIDAM_TEST_' + Date.now(),
                    status: 'CONCLUIDO',
                    valor: 150.00,
                    pago_em: new Date().toISOString()
                  })
                })
                .then(r => r.json())
                .then(data => alert('Webhook Simulado com Sucesso!\nTXID: ' + data.txid))
                .catch(err => alert('Erro ao simular webhook: ' + err.message));
              }}
            />
            <IntegrationCard 
              icon={<BarChart3 className="text-indigo-500" />} 
              title="AFIM / SIAFIC (Contábil)" 
              description="Sincronização de receita e rubricas com o Tesouro Municipal."
              status="Inativo"
            />
          </div>
        </div>

        {/* 3. Jurídicas e Extrajudiciais */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest font-bold text-[10px]">
            <Gavel size={14} />
            <span>Jurídicas e Extrajudiciais</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <IntegrationCard 
              icon={<ShieldAlert className="text-rose-500" />} 
              title="CRA (Protesto em Cartório)" 
              description="Envio automático de títulos para o IEPTB/CRA."
              status="Inativo"
            />
            <IntegrationCard 
              icon={<Gavel className="text-slate-600" />} 
              title="TJAM (MNI / SAJ)" 
              description="Integração com o Tribunal para ajuizamento de Execuções."
              status="Inativo"
              onSimulate={() => {
                const batchId = 'BATCH_' + Date.now();
                fetch('/api/integrations/tjam/batch-file', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    batch_id: batchId,
                    cdas: [
                      { id: 'cda_001', valor: 1250.40 },
                      { id: 'cda_002', valor: 890.15 },
                      { id: 'cda_003', valor: 4500.00 }
                    ]
                  })
                })
                .then(r => r.json())
                .then(data => alert(`Ajuizamento em Lote Simulado!\nID Lote: ${data.batch_id}\nProcessados: ${data.processed_count}\nPrimeiro Processo: ${data.results[0].process_number}`))
                .catch(err => alert('Erro ao simular ajuizamento: ' + err.message));
              }}
            />
          </div>
        </div>

        {/* 4. Administração Indireta */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest font-bold text-[10px]">
            <Building2 size={14} />
            <span>Administração Indireta (Silo de Multas)</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <IntegrationCard 
              icon={<ShieldAlert className="text-amber-600" />} 
              title="SIGM (Sistemas de Multas)" 
              description="Conexão com SEMMAS, IMPLURB, VISA e IMMU."
              status="Inativo"
            />
            <IntegrationCard 
              icon={<Layout className="text-indigo-600" />} 
              title="Cadastro Imobiliário" 
              description="Sincronização com a base do IPTU para Inspector Vision."
              status="Configurado"
            />
          </div>
        </div>

        {/* 5. Comunicação */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest font-bold text-[10px]">
            <MessageSquare size={14} />
            <span>Comunicação</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <IntegrationCard 
              icon={<MessageSquare className="text-emerald-500" />} 
              title="WhatsApp Business API" 
              description="Notificações amigáveis e NegocioBot de parcelamento."
              status="Ativo"
            />
            <IntegrationCard 
              icon={<Globe className="text-sky-500" />} 
              title="Gateway de SMS/E-mail" 
              description="Réguas de cobrança amigável automáticas."
              status="Configurado"
            />
          </div>
        </div>

        {/* 6. Controle e Governança */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest font-bold text-[10px]">
            <ShieldCheck size={14} />
            <span>Controle e Governança</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <IntegrationCard 
              icon={<BarChart3 className="text-rose-600" />} 
              title="TCE (Tribunal de Contas)" 
              description="Envio automático de relatórios e balanços anuais."
              status="Inativo"
            />
            <IntegrationCard 
              icon={<Eye className="text-emerald-600" />} 
              title="Portal da Transparência" 
              description="Alimentação automática da página pública de consulta."
              status="Ativo"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Permissões por Cargo</h2>
        <p className="text-slate-500 text-sm">Controle quem pode visualizar, editar ou excluir propriedades dinâmicas.</p>
      </div>
      <MatrizAcesso />
    </div>
  );

  const renderCustomization = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Personalização (White Label)</h2>
          <p className="text-slate-500 text-sm">Configure a identidade visual da prefeitura contratante.</p>
        </div>
        <button 
          onClick={async () => {
            setIsSavingBranding(true);
            try {
              await updateBranding(brandingForm);
              alert('Identidade visual atualizada com sucesso!');
            } catch (err) {
              alert('Erro ao salvar personalização.');
            } finally {
              setIsSavingBranding(false);
            }
          }}
          disabled={isSavingBranding}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          <Save size={18} />
          {isSavingBranding ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Identidade Básica</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome da Prefeitura</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      value={brandingForm.municipality_name}
                      onChange={(e) => setBrandingForm({...brandingForm, municipality_name: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Ex: Prefeitura de Manaus"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mensagem de Boas-vindas</label>
                  <div className="relative">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      value={brandingForm.welcome_message}
                      onChange={(e) => setBrandingForm({...brandingForm, welcome_message: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">URL da Logo (PNG/SVG)</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      value={brandingForm.municipality_logo_url}
                      onChange={(e) => setBrandingForm({...brandingForm, municipality_logo_url: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cor Primária</label>
                    <input 
                      type="color" 
                      value={brandingForm.primary_color}
                      onChange={(e) => setBrandingForm({...brandingForm, primary_color: e.target.value})}
                      className="w-full h-10 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cor Secundária</label>
                    <input 
                      type="color" 
                      value={brandingForm.secondary_color}
                      onChange={(e) => setBrandingForm({...brandingForm, secondary_color: e.target.value})}
                      className="w-full h-10 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <Smartphone className="w-8 h-8 text-indigo-600 mb-4" />
              <h4 className="font-bold text-slate-800 mb-2">Layout Mobile</h4>
              <p className="text-xs text-slate-500">Otimize a exibição de campos em dispositivos móveis.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <Palette className="w-8 h-8 text-pink-600 mb-4" />
              <h4 className="font-bold text-slate-800 mb-2">Temas Avançados</h4>
              <p className="text-xs text-slate-500">Altere fontes e estilos globais dos componentes.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <Eye className="w-8 h-8 text-emerald-600 mb-4" />
              <h4 className="font-bold text-slate-800 mb-2">Visibilidade</h4>
              <p className="text-xs text-slate-500">Regras condicionais para exibição de campos.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl sticky top-8">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              Preview da Marca
            </h4>
            <div className="space-y-6">
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">Sidebar Preview</p>
                <div className="flex items-center gap-3">
                  {brandingForm.municipality_logo_url ? (
                    <img src={brandingForm.municipality_logo_url} className="w-8 h-8 rounded object-cover" alt="Logo" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-sm">
                      {brandingForm.municipality_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold truncate max-w-[120px]">{brandingForm.municipality_name}</p>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest">MetaGov Platform</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">Dashboard Preview</p>
                <h5 className="text-sm font-bold mb-1">{brandingForm.welcome_message}</h5>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-1/3"></div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 h-8 rounded border border-slate-700 flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandingForm.primary_color }}></div>
                  <span className="text-[10px] font-mono uppercase">{brandingForm.primary_color}</span>
                </div>
                <div className="flex-1 h-8 rounded border border-slate-700 flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandingForm.secondary_color }}></div>
                  <span className="text-[10px] font-mono uppercase">{brandingForm.secondary_color}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Segurança & Imutabilidade</h2>
        <p className="text-slate-500 text-sm">Proteja a integridade dos metadados e audite alterações via Blockchain Fiscal.</p>
      </div>
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Blockchain Fiscal (Imutabilidade)</h4>
              <p className="text-xs text-slate-500">Monitor de integridade de hashes SHA-256 encadeados.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></div>
              INTEGRIDADE OK
            </div>
            <button className="text-xs font-bold text-indigo-600 hover:underline">Monitorar</button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
              <Lock size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Criptografia de Campos</h4>
              <p className="text-xs text-slate-500">Habilite criptografia em repouso para campos sensíveis.</p>
            </div>
          </div>
          <button className="text-xs font-bold text-indigo-600 hover:underline">Configurar</button>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Key size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Logs de Auditoria</h4>
              <p className="text-xs text-slate-500">Rastreie quem alterou metadados e quando.</p>
            </div>
          </div>
          <button className="text-xs font-bold text-indigo-600 hover:underline">Visualizar Logs</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-slate-50/50 overflow-hidden">
      {/* Sub-Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-none">
        <div className="p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Config Engine</h3>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Orquestração de Metadados</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SubNavItem 
            icon={<List size={18} />} 
            label="Propriedades Dinâmicas" 
            active={activeSubTab === 'dynamic_properties'} 
            onClick={() => setActiveSubTab('dynamic_properties')} 
          />
          <SubNavItem 
            icon={<LinkIcon size={18} />} 
            label="Integrações" 
            active={activeSubTab === 'integrations'} 
            onClick={() => setActiveSubTab('integrations')} 
          />
          <SubNavItem 
            icon={<ShieldCheck size={18} />} 
            label="Permissões por Cargo" 
            active={activeSubTab === 'permissions'} 
            onClick={() => setActiveSubTab('permissions')} 
          />
          <SubNavItem 
            icon={<Palette size={18} />} 
            label="Personalização" 
            active={activeSubTab === 'customization'} 
            onClick={() => setActiveSubTab('customization')} 
          />
          <SubNavItem 
            icon={<Lock size={18} />} 
            label="Segurança" 
            active={activeSubTab === 'security'} 
            onClick={() => setActiveSubTab('security')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Objeto Ativo</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-[10px] font-bold">
                {initialType.name.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-700 truncate">{initialType.name}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-8 min-w-0">
        <div className="max-w-5xl mx-auto">
          {activeSubTab === 'dynamic_properties' && renderDynamicProperties()}
          {activeSubTab === 'integrations' && renderIntegrations()}
          {activeSubTab === 'permissions' && renderPermissions()}
          {activeSubTab === 'customization' && renderCustomization()}
          {activeSubTab === 'security' && renderSecurity()}
        </div>
      </main>
    </div>
  );
};

function SubNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      <div className={`${active ? 'text-indigo-600' : 'text-slate-400'}`}>{icon}</div>
      <span>{label}</span>
      {active && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
    </button>
  );
}

function DetailField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</label>
      <div className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 ${mono ? 'font-mono' : 'font-medium'}`}>
        {value}
      </div>
    </div>
  );
}

function IntegrationCard({ icon, title, description, status, onSimulate }: { icon: React.ReactNode, title: string, description: string, status: string, onSimulate?: () => void }) {
  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'ativo': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'configurado': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'erro': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-widest ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
      <h4 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      
      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-3">
          <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider hover:underline">Configurar</button>
          {onSimulate && (
            <button 
              onClick={onSimulate}
              className="text-[10px] font-bold text-amber-600 uppercase tracking-wider hover:underline"
            >
              Simular Webhook
            </button>
          )}
        </div>
        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600">Logs</button>
      </div>
    </div>
  );
}
