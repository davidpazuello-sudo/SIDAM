import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fdaService } from '../../services/fdaService';
import { supabase } from '../../services/supabaseClient';

describe('fdaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list retorna dados paginados', async () => {
    const mockData = [{ id: '1', devedor_nome: 'João', valor_principal_inscrito: 1000, status_atual: 'ATIVA' }];
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: mockData, count: 1, error: null })),
    };

    vi.mocked(supabase.from as any).mockReturnValue(query as any);

    const result = await fdaService.list({ organizationId: 'org1' });
    expect(result.total).toBe(1);
    expect((result.data[0] as any).devedor_nome).toBe('João');
  });

  it('softDelete chama updateStatus com CANCELADO', async () => {
    const spy = vi.spyOn(fdaService, 'updateStatus').mockResolvedValue({ id: '1', status_atual: 'CANCELADO' } as any);
    await fdaService.softDelete('1');
    expect(spy).toHaveBeenCalledWith('1', 'CANCELADO');
  });
});
