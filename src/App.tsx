/**
 * SIDAM - Sistema de Dívida Ativa Municipal
 * App Principal com MetaGov Engine
 */
import React, { useState } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { MetaGovRenderer } from './components/engine/MetaGovRenderer';
import { AgentChat } from './components/ai/AgentChat';
import { DebtHeatmap } from './components/geo/DebtHeatmap';
import { CitizenPortal } from './components/portal/CitizenPortal';
import { ConfigEngine } from './components/config/ConfigEngine';
import { SecretariatManager } from './components/config/SecretariatManager';
import { UserProfile } from './components/profile/UserProfile';
import { BrandingProvider, useBranding } from './context/BrandingContext';
import { ObjectType, ObjectProperty, FDA } from './types';
import { 
  LayoutDashboard, 
  FileSearch, 
  Gavel, 
  Users, 
  Settings, 
  Bell,
  Search,
  Plus,
  Building2,
  Shield,
  Sparkles,
  Map as MapIcon,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  Brain,
  PanelLeft,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

// --- MOCK DATA (Simulando o retorno do Supabase) ---

const MOCK_CONFIG_TYPE: ObjectType = {
  slug: 'fda',
  name: 'Ficha Cadastral da Dívida Ativa',
  storage_mode: 'table',
  table_name: 'obj_fda',
  configuration: {}
};

const MOCK_CONFIG_PROPS: ObjectProperty[] = [
  { id: '1', object_type_slug: 'fda', name: 'Nº Inscrição', slug: 'numero_inscricao', data_type: 'string', ui_component: 'TextInput', is_required: false, sort_order: 1, configuration: {} },
  { id: '2', object_type_slug: 'fda', name: 'CPF/CNPJ', slug: 'documento_devedor', data_type: 'string', ui_component: 'MaskedInput', is_required: true, sort_order: 2, configuration: {} },
  { id: '3', object_type_slug: 'fda', name: 'Devedor', slug: 'devedor_nome', data_type: 'string', ui_component: 'TextInput', is_required: true, sort_order: 3, configuration: {} },
  { id: '4', object_type_slug: 'fda', name: 'Valor Principal', slug: 'valor_principal_inscrito', data_type: 'decimal', ui_component: 'CurrencyInput', is_required: true, sort_order: 4, configuration: {} },
  { id: '5', object_type_slug: 'fda', name: 'Status', slug: 'status_atual', data_type: 'string', ui_component: 'StatusBadge', is_required: true, sort_order: 5, configuration: {} },
  { id: '6', object_type_slug: 'fda', name: 'Rating', slug: 'rating_recuperabilidade', data_type: 'string', ui_component: 'RatingBadge', is_required: false, sort_order: 6, configuration: {} },
];

const MOCK_FDA_DATA: FDA[] = [
  { 
    id: '1', 
    organization_id: 'org1', 
    numero_inscricao: '2024.0001-A', 
    numero_processo_administrativo: 'SEM-2023-001',
    documento_devedor: '123.456.789-00', 
    devedor_nome: 'João da Silva Sauro', 
    valor_principal_inscrito: 15450.80, 
    natureza_debito: 'Multa Ambiental',
    ano_exercicio: 2023,
    status_atual: 'ATIVA', 
    rating_recuperabilidade: 'A', 
    gigo_score: 100,
    is_blockchain_sealed: true,
    has_attachment: true,
    is_segredo_justica: false, 
    created_at: '', 
    updated_at: '' 
  },
  { 
    id: '2', 
    organization_id: 'org1', 
    numero_inscricao: '2023.0842-B', 
    numero_processo_administrativo: 'SEM-2022-452',
    documento_devedor: '98.765.432/0001-99', 
    devedor_nome: 'Indústrias ACME Ltda', 
    valor_principal_inscrito: 1250000.00, 
    natureza_debito: 'Taxa de Lixo',
    ano_exercicio: 2022,
    status_atual: 'EM_TRIAGEM', 
    rating_recuperabilidade: 'C', 
    gigo_score: 85,
    is_blockchain_sealed: false,
    has_attachment: true,
    is_segredo_justica: false, 
    created_at: '', 
    updated_at: '' 
  },
  { 
    id: '3', 
    organization_id: 'org1', 
    numero_inscricao: undefined, 
    numero_processo_administrativo: 'SEM-2024-015',
    documento_devedor: '456.789.123-11', 
    devedor_nome: 'Maria Oliveira Santos', 
    valor_principal_inscrito: 2100.00, 
    natureza_debito: 'Infração de Obra',
    ano_exercicio: 2024,
    status_atual: 'RASCUNHO', 
    rating_recuperabilidade: 'B', 
    gigo_score: 100,
    is_blockchain_sealed: false,
    has_attachment: true,
    is_segredo_justica: false, 
    created_at: '', 
    updated_at: '' 
  },
  { 
    id: '4', 
    organization_id: 'org1', 
    numero_inscricao: undefined, 
    numero_processo_administrativo: 'SEM-2024-099',
    documento_devedor: '111.222.333-44', 
    devedor_nome: 'Empresa de Teste S.A.', 
    valor_principal_inscrito: 450.00, 
    natureza_debito: 'Multa Ambiental',
    ano_exercicio: 2024,
    status_atual: 'QUARENTENA', 
    rating_recuperabilidade: 'D', 
    gigo_score: 40,
    is_blockchain_sealed: false,
    has_attachment: false,
    is_segredo_justica: true, 
    created_at: '', 
    updated_at: '' 
  },
];

export default function App() {
  return (
    <BrandingProvider>
      <AppContent />
    </BrandingProvider>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { branding } = useBranding();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} h-full flex-none bg-slate-900 dark:bg-black text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out relative`}>
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} gap-3`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              {branding.municipality_logo_url ? (
                <img 
                  src={branding.municipality_logo_url} 
                  alt="Logo" 
                  className="w-10 h-10 rounded-lg object-cover shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 shrink-0">
                  {branding.municipality_name.charAt(0)}
                </div>
              )}
              <div className="whitespace-nowrap">
                <h1 className="text-white font-bold text-lg leading-tight truncate max-w-[140px]">{branding.municipality_name}</h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">MetaGov Platform</p>
              </div>
            </div>
          )}
          {isSidebarCollapsed && (
            branding.municipality_logo_url ? (
              <img 
                src={branding.municipality_logo_url} 
                alt="Logo" 
                className="w-10 h-10 rounded-lg object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 shrink-0">
                {branding.municipality_name.charAt(0)}
              </div>
            )
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-x-hidden overflow-y-auto">
          <NavSection label="PGM" isCollapsed={isSidebarCollapsed} defaultExpanded={true}>
            <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isCollapsed={isSidebarCollapsed} />
            <NavItem icon={<Gavel size={18} />} label="Jurídico 4.0" active={false} isCollapsed={isSidebarCollapsed} />
          </NavSection>

          <NavSection label="Secretarias" isCollapsed={isSidebarCollapsed} defaultExpanded={true}>
            <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard-secretariat'} onClick={() => setActiveTab('dashboard-secretariat')} isCollapsed={isSidebarCollapsed} />
            <NavItem icon={<FileSearch size={18} />} label="Dívida Ativa" active={activeTab === 'fda'} onClick={() => setActiveTab('fda')} isCollapsed={isSidebarCollapsed} />
            <NavItem icon={<MapIcon size={18} />} label="Inteligência Geo" active={activeTab === 'geo'} onClick={() => setActiveTab('geo')} isCollapsed={isSidebarCollapsed} />
          </NavSection>

          <NavSection label="Cidadão" isCollapsed={isSidebarCollapsed} defaultExpanded={true}>
            <NavItem icon={<UserCircle size={18} />} label="Portal do Cidadão" active={activeTab === 'portal'} onClick={() => setActiveTab('portal')} isCollapsed={isSidebarCollapsed} />
          </NavSection>

          <NavSection label="Super-Admin" isCollapsed={isSidebarCollapsed} defaultExpanded={true}>
            <NavItem icon={<Building2 size={18} />} label="Gestão de Secretarias" active={activeTab === 'secretariats'} onClick={() => setActiveTab('secretariats')} isCollapsed={isSidebarCollapsed} />
            <NavItem icon={<Settings size={18} />} label="Config Engine" active={activeTab === 'config'} onClick={() => setActiveTab('config')} isCollapsed={isSidebarCollapsed} />
          </NavSection>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-2 py-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group ${activeTab === 'profile' ? 'bg-slate-800' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 transition-all ${activeTab === 'profile' ? 'bg-indigo-600 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900' : 'bg-slate-700 group-hover:bg-slate-600'}`}>DP</div>
            {!isSidebarCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className={`text-sm font-medium truncate transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-slate-300'}`}>David Pazuello</p>
                <p className="text-xs text-slate-500 truncate">Super-Admin</p>
              </div>
            )}
          </div>
          <button 
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all`}
            title={isSidebarCollapsed ? "Sair da Sessão" : undefined}
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && <span>Sair da Sessão</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm z-10 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all"
              title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
              <PanelLeft size={20} />
            </button>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar por inscrição, CPF ou nome..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent rounded-lg text-sm focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`p-2 rounded-full transition-all relative group ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title="IA Copilot"
            >
              <Brain size={20} className={activeTab === 'chat' ? 'animate-pulse' : ''} />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-400 rounded-full border-2 border-white"></div>
            </button>

            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
              title={isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
            >
              {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <section className={`flex-1 overflow-y-auto ${activeTab === 'config' || activeTab === 'chat' ? '' : 'p-8'} bg-slate-50/50 dark:bg-slate-950/50 transition-colors duration-300`}>
          <div className={`${activeTab === 'config' || activeTab === 'chat' ? 'h-full' : 'max-w-7xl mx-auto space-y-8'}`}>
            {activeTab === 'dashboard' && (
              <Dashboard welcomeMessage={branding.welcome_message} />
            )}

            {activeTab === 'dashboard-secretariat' && (
              <Dashboard secretariat="Secretaria de Meio Ambiente" welcomeMessage={branding.welcome_message} />
            )}

            {activeTab === 'fda' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Fichas Cadastrais (FDA)</h2>
                    <p className="text-slate-500 text-sm">Gestão dinâmica de débitos inscritos.</p>
                  </div>
                  <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-500/20">
                    <Plus size={18} />
                    <span>Nova Inscrição</span>
                  </button>
                </div>
                <MetaGovRenderer 
                  objectSlug="fda" 
                  data={MOCK_FDA_DATA} 
                  config={{ type: MOCK_CONFIG_TYPE, properties: MOCK_CONFIG_PROPS }} 
                />
              </>
            )}

            {activeTab === 'geo' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Inteligência Geográfica</h2>
                  <p className="text-slate-500 text-sm">Análise espacial da inadimplência municipal.</p>
                </div>
                <div className="h-[600px]">
                  <DebtHeatmap />
                </div>
              </>
            )}

            {activeTab === 'portal' && (
              <CitizenPortal />
            )}

            {activeTab === 'config' && (
              <ConfigEngine 
                initialType={MOCK_CONFIG_TYPE} 
                initialProperties={MOCK_CONFIG_PROPS} 
              />
            )}

            {activeTab === 'secretariats' && (
              <SecretariatManager />
            )}

            {activeTab === 'profile' && (
              <UserProfile />
            )}

            {activeTab === 'chat' && (
              <div className="h-full flex flex-col p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Brain className="text-indigo-600" />
                    IA Copilot - SIDAM Intelligence
                  </h2>
                  <p className="text-sm text-slate-500">Analise processos, gere pareceres e identifique riscos com auxílio de IA.</p>
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <AgentChat />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// --- Sub-componentes Auxiliares ---

function NavSection({ 
  label, 
  children, 
  isCollapsed, 
  defaultExpanded = false 
}: { 
  label: string, 
  children: React.ReactNode, 
  isCollapsed: boolean,
  defaultExpanded?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (isCollapsed) {
    return <div className="space-y-1">{children}</div>;
  }

  return (
    <div className="space-y-1">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between pt-4 pb-2 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider hover:text-slate-400 transition-colors group"
      >
        <span>{label}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
}

function NavItem({ icon, label, active, onClick, isCollapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick?: () => void, isCollapsed?: boolean }) {
  return (
    <button 
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-600 rounded-l-none' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      <div className="shrink-0">{icon}</div>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </button>
  );
}

