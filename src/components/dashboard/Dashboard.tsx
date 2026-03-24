import React from 'react';
import { AgentChat } from '../ai/AgentChat';

interface DashboardProps {
  secretariat?: string;
  welcomeMessage: string;
}

export function Dashboard({ secretariat, welcomeMessage }: DashboardProps) {
  // In a real app, we would fetch data based on the secretariat
  // For now, we'll just adjust the values slightly to simulate different data
  const isSecretariat = !!secretariat;
  
  const stats = isSecretariat ? [
    { title: "Total Inscrito (Secretaria)", value: "R$ 8.4M", trend: "+5%", color: "blue" as const },
    { title: "Arrecadação Mês", value: "R$ 240K", trend: "+2.1%", color: "emerald" as const },
    { title: "CDAs Emitidas", value: "312", trend: "+8%", color: "indigo" as const },
    { title: "Rating Médio", value: "A-", trend: "Melhorando", color: "amber" as const },
  ] : [
    { title: "Total Inscrito (Geral)", value: "R$ 45.2M", trend: "+12%", color: "blue" as const },
    { title: "Arrecadação Mês", value: "R$ 1.2M", trend: "+5.4%", color: "emerald" as const },
    { title: "CDAs Emitidas", value: "1,240", trend: "-2%", color: "indigo" as const },
    { title: "Rating Médio", value: "B+", trend: "Estável", color: "amber" as const },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">
          {isSecretariat ? `Dashboard: ${secretariat}` : welcomeMessage}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">
          {isSecretariat 
            ? "Visão específica das informações e arrecadação da sua secretaria." 
            : "Visão consolidada da arrecadação e saúde de todas as secretarias."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-3 h-[500px]">
          <AgentChat />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, color }: { title: string, value: string, trend: string, color: 'blue' | 'emerald' | 'indigo' | 'amber' }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
    emerald: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
    indigo: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30',
    amber: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${colorClasses[color]}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}
