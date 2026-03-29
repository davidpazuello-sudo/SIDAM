import React from 'react';
import { CircleDollarSign, FileText, Scale } from 'lucide-react';
import { AgentChat } from '../ai/AgentChat';
import KPICard from './KPICard';
import StatusDistributionChart from './StatusDistributionChart';
import FDATable from '../fda/FDATable';
import { useDashboardKPIs } from '../../hooks/useDashboardKPIs';
import { useAuth } from '../../context/AuthContext';

interface DashboardProps {
  secretariat?: string;
  welcomeMessage: string;
}

export function Dashboard({ secretariat, welcomeMessage }: DashboardProps) {
  const { user } = useAuth();
  const organizationId = String(user?.user_metadata?.organization_id ?? '');
  const { kpis } = useDashboardKPIs(organizationId);
  const isSecretariat = !!secretariat;

  const debtValue = kpis.totalDivida.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">
          {isSecretariat ? `Dashboard: ${secretariat}` : welcomeMessage}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">
          {isSecretariat
            ? 'Visão específica das informações e arrecadação da sua secretaria.'
            : 'Visão consolidada da arrecadação e saúde de todas as secretarias.'}
        </p>
      </div>

      {kpis.error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-4 text-sm">
          {kpis.error}. Defina `organization_id` em `user_metadata` para consultar dados reais.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title={isSecretariat ? 'Total Inscrito (Secretaria)' : 'Total Inscrito (Geral)'}
          value={debtValue}
          trend={kpis.variacaoMes}
          isLoading={kpis.isLoading}
          icon={<CircleDollarSign size={16} />}
          colorClass="text-blue-400"
        />
        <KPICard
          title="Arrecadação Mês"
          value={kpis.arrecadacaoMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          trend={0}
          isLoading={kpis.isLoading}
          icon={<CircleDollarSign size={16} />}
          colorClass="text-emerald-400"
        />
        <KPICard
          title="Inscrições"
          value={kpis.totalInscricoes.toLocaleString('pt-BR')}
          isLoading={kpis.isLoading}
          icon={<FileText size={16} />}
          colorClass="text-indigo-400"
        />
        <KPICard
          title="Status distintos"
          value={Object.keys(kpis.porStatus).length}
          isLoading={kpis.isLoading}
          icon={<Scale size={16} />}
          colorClass="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:col-span-1">
          <h3 className="text-sm uppercase tracking-wider text-slate-300 font-bold mb-3">Distribuição por Status</h3>
          <StatusDistributionChart porStatus={kpis.porStatus} isLoading={kpis.isLoading} />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:col-span-2">
          <h3 className="text-sm uppercase tracking-wider text-slate-300 font-bold mb-3">Dívida Ativa — Lista</h3>
          <FDATable organizationId={organizationId} />
        </div>
      </div>

      <div className="h-[420px]">
        <AgentChat />
      </div>
    </div>
  );
}
