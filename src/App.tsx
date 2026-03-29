/**
 * SIDAM - Sistema de Dívida Ativa Municipal
 * App Principal com MetaGov Engine
 */
import React, { useEffect, useRef, useState } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { MetaGovRenderer } from './components/engine/MetaGovRenderer';
import { AgentChat } from './components/ai/AgentChat';
import { DebtHeatmap } from './components/geo/DebtHeatmap';
import { CitizenPortal } from './components/portal/CitizenPortal';
import { ConfigEngine } from './components/config/ConfigEngine';
import { SecretariatManager } from './components/config/SecretariatManager';
import { UserProfile } from './components/profile/UserProfile';
import { BrandingProvider, useBranding } from './context/BrandingContext';
import { useAuth } from './context/AuthContext';
import { ObjectType, ObjectProperty, FDA } from './types';
import { useObjectConfig } from './hooks/useObjectConfig';
import { useFDAList } from './hooks/useFDAList';
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
  Moon,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function App() {
  return (
    <BrandingProvider>
      <AppContent />
    </BrandingProvider>
  );
}

function AppContent() {
  const { signOut, user } = useAuth();
  const secretariatOrganizationId = 'org1';
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;

    const savedTheme = window.localStorage.getItem('sidam-theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const { branding } = useBranding();
  const {
    objectType: loadedObjectType,
    properties: loadedProperties,
    isLoading: isConfigLoading,
    error: configError,
  } = useObjectConfig('fda', 'slug');
  const {
    data: debtList,
    isLoading: isDebtLoading,
    error: debtError,
  } = useFDAList();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem('sidam-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!notificationsRef.current) return;
      if (!notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const allDebts = debtList as FDA[];
  const secretariatDebts = allDebts.filter(
    (debt) => debt.organization_id === secretariatOrganizationId
  );

  const metaGovConfig = React.useMemo<{ type: ObjectType; properties: ObjectProperty[] } | null>(() => {
    if (!loadedObjectType) return null;

    const normalizedType: ObjectType = {
      slug: loadedObjectType.slug,
      name: loadedObjectType.name,
      storage_mode: loadedObjectType.table_name ? 'table' : 'view',
      table_name: loadedObjectType.table_name ?? loadedObjectType.slug,
      configuration: {},
    };

    const normalizedProperties: ObjectProperty[] = loadedProperties.map((property) => ({
      id: property.id,
      object_type_slug: loadedObjectType.slug,
      name: property.name,
      slug: property.slug,
      data_type: property.data_type ?? 'string',
      ui_component: 'TextInput',
      is_required: property.is_required ?? false,
      sort_order: property.sort_order ?? 0,
      configuration: {},
    }));

    return { type: normalizedType, properties: normalizedProperties };
  }, [loadedObjectType, loadedProperties]);

  const renderConfigFeedback = () => {
    if (isConfigLoading) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm font-medium text-slate-600">Carregando configuração MetaGov...</p>
        </div>
      );
    }

    if (configError || !metaGovConfig) {
      return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Falha ao carregar configuração do objeto FDA
          </div>
          <p className="mt-2 text-xs">{configError ?? 'Configuração indisponível no momento.'}</p>
        </div>
      );
    }

    return null;
  };

  const renderDebtFeedback = () => {
    if (isDebtLoading) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm font-medium text-slate-600">Carregando débitos da dívida ativa...</p>
        </div>
      );
    }

    if (debtError) {
      return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Falha ao carregar débitos (obj_fda)
          </div>
          <p className="mt-2 text-xs">{debtError}</p>
        </div>
      );
    }

    return null;
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
            <NavItem icon={<FileSearch size={18} />} label="Dívida Ativa (Geral)" active={activeTab === 'fda-pgm'} onClick={() => setActiveTab('fda-pgm')} isCollapsed={isSidebarCollapsed} />
            <NavItem icon={<MapIcon size={18} />} label="Inteligência Geo" active={activeTab === 'geo'} onClick={() => setActiveTab('geo')} isCollapsed={isSidebarCollapsed} />
            <NavItem icon={<Gavel size={18} />} label="Jurídico 4.0" active={false} isCollapsed={isSidebarCollapsed} />
          </NavSection>

          <NavSection label="Secretarias" isCollapsed={isSidebarCollapsed} defaultExpanded={true}>
            <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard-secretariat'} onClick={() => setActiveTab('dashboard-secretariat')} isCollapsed={isSidebarCollapsed} />
            <NavItem icon={<FileSearch size={18} />} label="Dívida Ativa (Minha Secretaria)" active={activeTab === 'fda-secretariat'} onClick={() => setActiveTab('fda-secretariat')} isCollapsed={isSidebarCollapsed} />
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
                <p className={`text-sm font-medium truncate transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-slate-300'}`}>
                  {user?.email ?? 'Usuário autenticado'}
                </p>
                <p className="text-xs text-slate-500 truncate">Sessão Supabase</p>
              </div>
            )}
          </div>
          <button 
            onClick={signOut}
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

            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notificações</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold">
                      3 NOVAS
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      {
                        title: 'Novo pagamento conciliado',
                        description: 'FDA 2024.0108-C conciliada com sucesso via PIX.',
                        time: 'agora',
                      },
                      {
                        title: 'Lote jurídico pronto para envio',
                        description: '12 CDAs elegíveis para ajuizamento no lote do dia.',
                        time: 'há 8 min',
                      },
                      {
                        title: 'Alerta de integração',
                        description: 'Integração CADIM retornou 2 pendências de validação.',
                        time: 'há 21 min',
                      },
                    ].map((notification) => (
                      <div key={notification.title} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{notification.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notification.description}</p>
                        <p className="text-[10px] text-slate-400 mt-2">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                    <button className="text-xs font-bold text-indigo-600 hover:underline">Ver todas as notificações</button>
                  </div>
                </div>
              )}
            </div>

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
        <section className={`stable-scrollbar flex-1 overflow-y-auto ${activeTab === 'config' || activeTab === 'chat' ? '' : 'p-8'} bg-slate-50/50 dark:bg-slate-950/50 transition-colors duration-300`}>
          <div className={`${activeTab === 'config' || activeTab === 'chat' ? 'h-full' : 'max-w-7xl mx-auto space-y-8'}`}>
            {activeTab === 'dashboard' && (
              <Dashboard welcomeMessage={branding.welcome_message} />
            )}

            {activeTab === 'dashboard-secretariat' && (
              <Dashboard secretariat="Secretaria de Meio Ambiente" welcomeMessage={branding.welcome_message} />
            )}

            {activeTab === 'fda-pgm' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Dívida Ativa Geral (PGM)</h2>
                    <p className="text-slate-500 text-sm">Visão consolidada de todas as secretarias.</p>
                  </div>
                  <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-500/20">
                    <Plus size={18} />
                    <span>Nova Inscrição</span>
                  </button>
                </div>
                {metaGovConfig && !isDebtLoading && !debtError ? (
                  <MetaGovRenderer 
                    objectSlug="fda" 
                    data={allDebts} 
                    config={metaGovConfig} 
                  />
                ) : (
                  renderConfigFeedback() ?? renderDebtFeedback()
                )}
              </>
            )}

            {activeTab === 'fda-secretariat' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Dívida Ativa da Secretaria</h2>
                    <p className="text-slate-500 text-sm">Exibe apenas débitos da sua secretaria.</p>
                  </div>
                  <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-500/20">
                    <Plus size={18} />
                    <span>Nova Inscrição</span>
                  </button>
                </div>
                {metaGovConfig && !isDebtLoading && !debtError ? (
                  <MetaGovRenderer 
                    objectSlug="fda" 
                    data={secretariatDebts} 
                    config={metaGovConfig} 
                  />
                ) : (
                  renderConfigFeedback() ?? renderDebtFeedback()
                )}
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
              metaGovConfig ? (
                <ConfigEngine 
                  initialType={metaGovConfig.type} 
                  initialProperties={metaGovConfig.properties} 
                />
              ) : (
                renderConfigFeedback()
              )
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
