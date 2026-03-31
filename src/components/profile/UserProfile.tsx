import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Building, 
  Calendar, 
  Lock, 
  Bell, 
  Eye, 
  EyeOff,
  Camera,
  Save,
  History,
  Key
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_PROFILE = {
  name: 'Usuário SIDAM',
  role: 'Servidor',
  department: 'Órgão não informado',
  joinDate: 'Não informado',
};

function toInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return 'US';
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) {
    return 'email-nao-informado@sidam.local';
  }

  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0] ?? '*'}***@${domain}`;
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}

export function UserProfile() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const { user: authenticatedUser } = useAuth();

  const user = {
    name:
      (authenticatedUser?.user_metadata?.full_name as string | undefined) ??
      (authenticatedUser?.user_metadata?.name as string | undefined) ??
      DEFAULT_PROFILE.name,
    email: maskEmail(authenticatedUser?.email),
    role:
      (authenticatedUser?.user_metadata?.role as string | undefined) ??
      DEFAULT_PROFILE.role,
    department:
      (authenticatedUser?.user_metadata?.department as string | undefined) ??
      DEFAULT_PROFILE.department,
    joinDate:
      (authenticatedUser?.user_metadata?.join_date as string | undefined) ??
      DEFAULT_PROFILE.joinDate,
    initials: toInitials(
      ((authenticatedUser?.user_metadata?.full_name as string | undefined) ??
        (authenticatedUser?.user_metadata?.name as string | undefined) ??
        DEFAULT_PROFILE.name) as string
    ),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
          <button className="absolute bottom-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white transition-all flex items-center gap-2 text-xs font-medium border border-white/20">
            <Camera size={14} />
            Alterar Capa
          </button>
        </div>
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-12 relative">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-slate-900 border-4 border-white flex items-center justify-center text-white text-4xl font-bold shadow-xl">
              {user.initials}
            </div>
            <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity text-white">
              <Camera size={24} />
            </button>
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <Shield size={16} className="text-indigo-600" />
              {user.role}
            </p>
          </div>
          <div className="flex gap-3 pb-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2">
              <Save size={16} />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Menu */}
        <div className="lg:col-span-1 space-y-1">
          <ProfileTabItem 
            icon={<User size={18} />} 
            label="Informações Pessoais" 
            active={activeSection === 'personal'} 
            onClick={() => setActiveSection('personal')} 
          />
          <ProfileTabItem 
            icon={<Lock size={18} />} 
            label="Segurança e Senha" 
            active={activeSection === 'security'} 
            onClick={() => setActiveSection('security')} 
          />
          <ProfileTabItem 
            icon={<Bell size={18} />} 
            label="Notificações" 
            active={activeSection === 'notifications'} 
            onClick={() => setActiveSection('notifications')} 
          />
          <ProfileTabItem 
            icon={<History size={18} />} 
            label="Atividade Recente" 
            active={activeSection === 'activity'} 
            onClick={() => setActiveSection('activity')} 
          />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div 
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"
          >
            {activeSection === 'personal' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Dados do Perfil</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileField label="Nome Completo" value={user.name} icon={<User size={16} />} />
                  <ProfileField label="E-mail Institucional" value={user.email} icon={<Mail size={16} />} />
                  <ProfileField label="Cargo / Função" value={user.role} icon={<Shield size={16} />} />
                  <ProfileField label="Secretaria / Departamento" value={user.department} icon={<Building size={16} />} />
                  <ProfileField label="Data de Admissão" value={user.joinDate} icon={<Calendar size={16} />} />
                </div>
                
                <div className="pt-6">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Biografia / Observações</h4>
                  <textarea 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px]"
                    placeholder="Escreva uma breve descrição sobre suas responsabilidades..."
                  ></textarea>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Segurança da Conta</h3>
                
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">Alterar Senha</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Senha Atual"
                        autoComplete="current-password"
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Nova Senha"
                        autoComplete="new-password"
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Confirmar Nova Senha"
                        autoComplete="new-password"
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button className="text-indigo-600 text-sm font-bold hover:underline">Esqueceu sua senha?</button>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <Key size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-indigo-900">Autenticação em Duas Etapas (2FA)</p>
                        <p className="text-xs text-indigo-700">Adicione uma camada extra de segurança à sua conta.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all">
                      Configurar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'activity' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Histórico de Atividade</h3>
                <div className="space-y-4">
                  <ActivityItem 
                    title="Login realizado" 
                    time="Hoje, 08:45" 
                    description="Acesso via navegador autorizado (IP mascarado: 187.45.xxx.xxx)" 
                    type="login"
                  />
                  <ActivityItem 
                    title="FDA #2024.0001-A atualizada" 
                    time="Ontem, 16:20" 
                    description="Alteração de status para 'ATIVA' e inclusão de parecer jurídico." 
                    type="update"
                  />
                  <ActivityItem 
                    title="Relatório de Arrecadação gerado" 
                    time="22 Mar, 2024" 
                    description="Exportação de dados consolidados do mês de Março." 
                    type="export"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ProfileTabItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ProfileField({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="text-slate-400">{icon}</div>
        <span className="text-sm font-medium text-slate-700">{value}</span>
      </div>
    </div>
  );
}

function ActivityItem({ title, time, description, type }: { title: string, time: string, description: string, type: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        type === 'login' ? 'bg-emerald-100 text-emerald-600' :
        type === 'update' ? 'bg-blue-100 text-blue-600' :
        'bg-amber-100 text-amber-600'
      }`}>
        <History size={18} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <span className="text-[10px] text-slate-400 font-medium">• {time}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
