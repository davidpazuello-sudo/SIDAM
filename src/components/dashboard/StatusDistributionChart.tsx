import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  porStatus: Record<string, number>;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ATIVA: { label: 'Ativa', color: '#3B82F6' },
  SUSPENSA: { label: 'Suspensa', color: '#F59E0B' },
  EXTINTA: { label: 'Extinta', color: '#10B981' },
  AJUIZADA: { label: 'Ajuizada', color: '#EF4444' },
  PARCELADA: { label: 'Parcelada', color: '#8B5CF6' },
};

export default function StatusDistributionChart({ porStatus, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-64 bg-gray-800 rounded-xl animate-pulse" />;
  }

  const data = Object.entries(porStatus)
    .filter(([k]) => STATUS_CONFIG[k])
    .map(([status, count]) => ({
      name: STATUS_CONFIG[status].label,
      value: count,
      color: STATUS_CONFIG[status].color,
    }));

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500 text-sm">Nenhum dado disponível</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any) => [Number(value ?? 0).toLocaleString('pt-BR'), 'Inscrições']}
          contentStyle={{ background: '#111827', border: '1px solid #374151' }}
          labelStyle={{ color: '#F9FAFB' }}
        />
        <Legend formatter={(value) => <span className="text-gray-300 text-xs">{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
