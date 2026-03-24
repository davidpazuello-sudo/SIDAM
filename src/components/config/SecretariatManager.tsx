import React, { useState, useMemo } from 'react';
import { Secretariat } from '../../types';
import { 
  Building2, 
  Users, 
  ChevronRight, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  Clock,
  Mail,
  Briefcase,
  Search,
  X,
  Fingerprint,
  Plus
} from 'lucide-react';

const MOCK_SECRETARIATS: Secretariat[] = [
  {
    id: '1',
    name: 'Secretaria Municipal de Fazenda',
    acronym: 'SEMFAZ',
    description: 'Responsável pela gestão tributária e financeira do município.',
    users: [
      {
        id: 'u1',
        name: 'Carlos Alberto',
        email: 'carlos.alberto@fazenda.gov.br',
        registration_number: '2024001',
        sector: 'Arrecadação',
        role_in_secretariat: 'Diretor de Tributos',
        role_in_system: 'admin',
        is_active: true,
        has_vulnerability: false,
        last_access: '2026-03-24 10:15:00'
      },
      {
        id: 'u2',
        name: 'Ana Paula',
        email: 'ana.paula@fazenda.gov.br',
        registration_number: '2024002',
        sector: 'Fiscalização',
        role_in_secretariat: 'Auditora Fiscal',
        role_in_system: 'user',
        is_active: true,
        has_vulnerability: true,
        last_access: '2026-03-23 16:45:00'
      }
    ]
  },
  {
    id: '2',
    name: 'Procuradoria Geral do Município',
    acronym: 'PGM',
    description: 'Representação judicial e consultoria jurídica do município.',
    users: [
      {
        id: 'u3',
        name: 'David Pazuello',
        email: 'david.pazuello@pgm.gov.br',
        registration_number: '2024003',
        sector: 'Dívida Ativa',
        role_in_secretariat: 'Procurador Chefe',
        role_in_system: 'admin',
        is_active: true,
        has_vulnerability: false,
        last_access: '2026-03-24 13:30:00'
      }
    ]
  },
  {
    id: '3',
    name: 'Secretaria de Planejamento',
    acronym: 'SEPLAN',
    description: 'Planejamento estratégico e gestão de projetos municipais.',
    users: []
  }
];

export function SecretariatManager() {
  const [secretariats, setSecretariats] = useState<Secretariat[]>(MOCK_SECRETARIATS);
  const [selectedSecretariat, setSelectedSecretariat] = useState<Secretariat | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    description: ''
  });

  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    registration_number: '',
    sector: '',
    role_in_secretariat: '',
    role_in_system: 'user' as 'admin' | 'user' | 'viewer'
  });

  const filteredSecretariats = useMemo(() => {
    if (!searchQuery.trim()) return secretariats;

    const query = searchQuery.toLowerCase();
    return secretariats.filter(sec => {
      const matchSecretariat = 
        sec.name.toLowerCase().includes(query) || 
        sec.acronym.toLowerCase().includes(query);
      
      const matchUser = sec.users.some(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.registration_number.toLowerCase().includes(query)
      );

      return matchSecretariat || matchUser;
    });
  }, [searchQuery, secretariats]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newSecretariat: Secretariat = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      acronym: formData.acronym,
      description: formData.description,
      users: []
    };
    setSecretariats([...secretariats, newSecretariat]);
    setIsCreating(false);
    setFormData({ name: '', acronym: '', description: '' });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSecretariat) return;

    const updatedSecretariats = secretariats.map(sec => 
      sec.id === selectedSecretariat.id 
        ? { ...sec, ...formData } 
        : sec
    );

    setSecretariats(updatedSecretariats);
    setSelectedSecretariat({ ...selectedSecretariat, ...formData });
    setIsEditing(false);
    setFormData({ name: '', acronym: '', description: '' });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSecretariat) return;

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      ...userFormData,
      is_active: true,
      has_vulnerability: false,
      last_access: new Date().toISOString().replace('T', ' ').split('.')[0]
    };

    const updatedSecretariats = secretariats.map(sec => 
      sec.id === selectedSecretariat.id 
        ? { ...sec, users: [...sec.users, newUser] } 
        : sec
    );

    setSecretariats(updatedSecretariats);
    setSelectedSecretariat({ 
      ...selectedSecretariat, 
      users: [...selectedSecretariat.users, newUser] 
    });
    setIsUserModalOpen(false);
    setUserFormData({
      name: '',
      email: '',
      registration_number: '',
      sector: '',
      role_in_secretariat: '',
      role_in_system: 'user'
    });
  };

  if (isCreating || isEditing) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              setIsCreating(false);
              setIsEditing(false);
              setFormData({ name: '', acronym: '', description: '' });
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {isCreating ? 'Nova Secretaria' : 'Editar Secretaria'}
            </h2>
            <p className="text-slate-500">
              {isCreating 
                ? 'Cadastre um novo órgão municipal no sistema SIDAM.' 
                : 'Atualize as informações do órgão municipal.'}
            </p>
          </div>

          <form onSubmit={isCreating ? handleCreate : handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-3 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Secretaria</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Secretaria Municipal de Saúde"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="md:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sigla</label>
                <input 
                  required
                  type="text" 
                  value={formData.acronym}
                  onChange={(e) => setFormData({...formData, acronym: e.target.value.toUpperCase()})}
                  placeholder="Ex: SEMSA"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição / Competências</label>
              <textarea 
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descreva brevemente as responsabilidades deste órgão..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button 
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setFormData({ name: '', acronym: '', description: '' });
                }}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
              >
                {isCreating ? 'Criar Secretaria' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (selectedSecretariat) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedSecretariat(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar para a lista</span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
            <Building2 size={14} />
            {selectedSecretariat.acronym}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{selectedSecretariat.name}</h2>
                <button 
                  onClick={() => {
                    setFormData({
                      name: selectedSecretariat.name,
                      acronym: selectedSecretariat.acronym,
                      description: selectedSecretariat.description
                    });
                    setIsEditing(true);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 px-3 py-1 bg-indigo-50 rounded-lg transition-colors"
                >
                  Editar Informações
                </button>
              </div>
              <p className="text-slate-500 max-w-2xl">{selectedSecretariat.description}</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-xl shrink-0">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total de Acessos</div>
              <div className="text-3xl font-bold text-slate-900">{selectedSecretariat.users.length}</div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-indigo-600" />
                Permissões e Acessos
              </h3>
              <button 
                onClick={() => setIsUserModalOpen(true)}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus size={16} />
                Adicionar Usuário
              </button>
            </div>

            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Matrícula</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Setor / Cargo</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sistema</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSecretariat.users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Mail size={12} />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
                          <Fingerprint size={14} className="text-slate-400" />
                          {user.registration_number}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 font-medium">{user.sector}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Briefcase size={12} />
                          {user.role_in_secretariat}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            user.role_in_system === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role_in_system}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {user.is_active ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                                <CheckCircle2 size={12} /> Ativo
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                Inativo
                              </span>
                            )}
                          </div>
                          {user.has_vulnerability && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase bg-rose-50 px-2 py-0.5 rounded border border-rose-100 w-fit">
                              <ShieldAlert size={12} /> Vulnerabilidade
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {selectedSecretariat.users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                        Nenhum usuário cadastrado para esta secretaria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* User Creation Modal */}
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Adicionar Novo Usuário</h3>
                <button 
                  onClick={() => setIsUserModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
                  <input 
                    required
                    type="text" 
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                    placeholder="Ex: João Silva"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail Institucional</label>
                    <input 
                      required
                      type="email" 
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                      placeholder="joao.silva@prefeitura.gov.br"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Matrícula</label>
                    <input 
                      required
                      type="text" 
                      value={userFormData.registration_number}
                      onChange={(e) => setUserFormData({...userFormData, registration_number: e.target.value})}
                      placeholder="Ex: 2024005"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Setor</label>
                    <input 
                      required
                      type="text" 
                      value={userFormData.sector}
                      onChange={(e) => setUserFormData({...userFormData, sector: e.target.value})}
                      placeholder="Ex: Arrecadação"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cargo</label>
                    <input 
                      required
                      type="text" 
                      value={userFormData.role_in_secretariat}
                      onChange={(e) => setUserFormData({...userFormData, role_in_secretariat: e.target.value})}
                      placeholder="Ex: Analista Fiscal"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nível de Acesso no Sistema</label>
                  <select 
                    value={userFormData.role_in_system}
                    onChange={(e) => setUserFormData({...userFormData, role_in_system: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  >
                    <option value="user">Usuário Padrão</option>
                    <option value="admin">Administrador de Secretaria</option>
                    <option value="viewer">Apenas Visualização</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    Cadastrar Usuário
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Secretarias e Usuários</h2>
          <p className="text-slate-500">Gerencie o acesso e as permissões de cada órgão municipal.</p>
        </div>
        
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 shrink-0"
        >
          Nova Secretaria
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="Pesquisar secretaria, usuário, email ou matrícula na prefeitura..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {filteredSecretariats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSecretariats.map((sec) => (
            <div 
              key={sec.id}
              onClick={() => setSelectedSecretariat(sec)}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Building2 size={24} />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  {sec.acronym}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{sec.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-6">{sec.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users size={16} />
                  <span className="text-xs font-bold">{sec.users.length} Usuários</span>
                </div>
                <div className="text-indigo-600 flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Gerenciar <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum resultado encontrado</h3>
          <p className="text-slate-500">Tente ajustar sua pesquisa para encontrar o que procura.</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
          >
            Limpar pesquisa
          </button>
        </div>
      )}
    </div>
  );
}
