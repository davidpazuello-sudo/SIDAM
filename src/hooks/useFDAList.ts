import { useCallback, useEffect, useState } from 'react';
import { fdaService, type FDAFilters } from '../services/fdaService';

interface UseFDAListState {
  data: Awaited<ReturnType<typeof fdaService.list>>['data'];
  total: number;
  page: number;
  isLoading: boolean;
  error: string | null;
}

export function useFDAList(baseFilters: FDAFilters = {}) {
  const [state, setState] = useState<UseFDAListState>({
    data: [],
    total: 0,
    page: 1,
    isLoading: false,
    error: null,
  });

  const [filters, setFilters] = useState<FDAFilters>(baseFilters);

  const load = useCallback(
    async (newFilters?: FDAFilters) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await fdaService.list(newFilters ?? filters);
        setState({
          data: result.data,
          total: result.total,
          page: result.page,
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Erro ao carregar FDAs',
        }));
      }
    },
    [filters]
  );

  useEffect(() => {
    load();
  }, [load]);

  const changePage = (page: number) => {
    const updated = { ...filters, page };
    setFilters(updated);
    load(updated);
  };

  const applyFilter = (newFilters: Partial<FDAFilters>) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    load(updated);
  };

  return { ...state, changePage, applyFilter, reload: load };
}
