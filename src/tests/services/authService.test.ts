import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '../../services/authService';
import { supabase } from '../../services/supabaseClient';

describe('authService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('signIn retorna sessão em credenciais válidas', async () => {
    const session = { user: { id: 'u1', email: 'admin@sidam.gov.br' } };
    vi.mocked(supabase.auth.signInWithPassword as any).mockResolvedValue({ data: session, error: null });
    const result = await authService.signIn('admin@sidam.gov.br', '123');
    expect(result).toEqual(session);
  });

  it('signOut resolve sem erro', async () => {
    vi.mocked(supabase.auth.signOut as any).mockResolvedValue({ error: null });
    await expect(authService.signOut()).resolves.toBeUndefined();
  });
});
