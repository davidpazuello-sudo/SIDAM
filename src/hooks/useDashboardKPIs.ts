import { useEffect, useState } from 'react';
import { fdaService } from '../services/fdaService';

interface DashboardKPIs {
  totalDivida: number;
  totalInscricoes: number;
  porStatus: Record<string, number>;
  arrecadacaoMes: number;
  variacaoMes: number;
  isLoading: boolean;
  error: string | null;
}

export const STATUS_CORES: Record<string, string> = {
  ATIVA: '#3B82F6',
  SUSPENSA: '#F59E0B',
  EXTINTA: '#10B981',
  AJUIZADA: '#EF4444',
  PARCELADA: '#8B5CF6',
  CANCELADA: '#6B7280',
};

export function useDashboardKPIs(organizationId?: string) {
  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalDivida: 0,
    totalInscricoes: 0,
    porStatus: {},
    arrecadacaoMes: 0,
    variacaoMes: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!organizationId) {
      setKpis((prev) => ({ ...prev, isLoading: false, error: 'organizationId não informado' }));
      return;
    }

    const load = async () => {
      setKpis((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fdaService.getKPIs(organizationId);
        setKpis({
          ...data,
          arrecadacaoMes: 0,
          variacaoMes: 0,
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        setKpis((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Erro ao carregar KPIs',
        }));
      }
    };

    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [organizationId]);

  return { kpis, STATUS_CORES };
}
