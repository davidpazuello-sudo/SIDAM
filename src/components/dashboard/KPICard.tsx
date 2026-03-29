import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  isLoading?: boolean;
  colorClass?: string;
  icon?: React.ReactNode;
}

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  isLoading,
  colorClass = 'text-blue-400',
  icon,
}: KPICardProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-700 rounded w-36 mb-2" />
        <div className="h-3 bg-gray-700 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        {icon && <span className="text-gray-600">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${colorClass} mb-1`}>{value}</div>
      {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
      {trend !== undefined && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}
        >
          <span>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-gray-500">vs mês anterior</span>
        </div>
      )}
    </div>
  );
}
