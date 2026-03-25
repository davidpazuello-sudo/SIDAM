import { beforeEach, describe, expect, it, vi } from 'vitest';
import { metaGovService } from '../../services/metaGovService';
import { supabase } from '../../services/supabaseClient';

describe('metaGovService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getObjectTypes retorna tipos', async () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [{ id: '1', name: 'FDA', slug: 'fda' }], error: null }),
    };
    vi.mocked(supabase.from as any).mockReturnValue(query as any);
    const result = await metaGovService.getObjectTypes();
    expect(result[0].slug).toBe('fda');
  });

  it('upsertObject faz insert sem id', async () => {
    const query = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
    };
    vi.mocked(supabase.from as any).mockReturnValue(query as any);
    const result = await metaGovService.upsertObject('obj_fda', { devedor_nome: 'Maria' });
    expect(result.id).toBe('new-id');
  });
});
