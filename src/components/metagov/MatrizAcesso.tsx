import React from 'react';
import { CheckCircle2, XCircle, ShieldAlert } from "lucide-react";

const perfis = [
  { slug: 'super_dev', name: 'Super Admin' },
  { slug: 'procurador_pgm', name: 'Procurador' },
  { slug: 'adm_externo', name: 'Secretaria' },
  { slug: 'contribuinte', name: 'Cidadão' }
];

const modulos = [
  { name: 'Gestão Jurídica', slug: 'mod_juridico', roles: ['procurador_pgm', 'super_dev'] },
  { name: 'Inscrição de Débitos', slug: 'mod_inscricao', roles: ['adm_externo', 'super_dev'] },
  { name: 'Portal do Contribuinte', slug: 'mod_contribuinte', roles: ['contribuinte', 'super_dev'] },
  { name: 'Dev Ops & Infra', slug: 'mod_dev_terminal', roles: ['super_dev'] }
];

export function MatrizAcesso() {
  // Mock function for toggleAccess
  const handleToggleAccess = async (perfilSlug: string, moduloSlug: string) => {
    console.log(`Toggling access for ${perfilSlug} on ${moduloSlug}`);
    // In a real app, this would call a server action
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Matriz de Acesso (RBAC/ABAC)</h3>
          <p className="text-xs text-slate-500">Controle dinâmico de permissões por perfil e módulo.</p>
        </div>
        <div className="px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white">
          Motor MetaGov v1.0
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[240px]">Módulo / Recurso</th>
              {perfis.map((perfil) => (
                <th key={perfil.slug} className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {perfil.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {modulos.map((modulo) => (
              <tr key={modulo.slug} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-slate-800">{modulo.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{modulo.slug}</div>
                </td>
                {perfis.map((perfil) => {
                  const hasAccess = modulo.roles.includes(perfil.slug);
                  return (
                    <TableCell 
                      key={perfil.slug} 
                      hasAccess={hasAccess} 
                      onClick={() => handleToggleAccess(perfil.slug, modulo.slug)}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-6 text-[11px] text-slate-500 italic">
        <div className="flex items-center gap-1.5">
          <ShieldAlert size={14} className="text-amber-500" />
          Políticas de RLS Ativas em todas as tabelas.
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
          O perfil 'super_dev' possui bypass total via política mestre.
        </div>
      </div>
    </div>
  );
}

function TableCell({ hasAccess, onClick }: { hasAccess: boolean, onClick: () => void }) {
  return (
    <td className="px-4 py-4 text-center">
      <button 
        onClick={onClick}
        className={`inline-flex items-center justify-center gap-1.5 transition-all ${
          hasAccess 
            ? 'text-emerald-600 hover:scale-110' 
            : 'text-slate-200 hover:text-slate-400'
        }`}
      >
        {hasAccess ? (
          <>
            <CheckCircle2 size={20} />
            <span className="text-[10px] uppercase font-bold tracking-tight">Acesso</span>
          </>
        ) : (
          <XCircle size={20} />
        )}
      </button>
    </td>
  );
}
