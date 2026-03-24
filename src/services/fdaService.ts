import { supabase } from './supabaseClient';

export interface FDAFilters {
  organizationId?: string;
  status?: string;
  devedorNome?: string;
  page?: number;
  pageSize?: number;
}

export const fdaService = {
  async list(filters: FDAFilters = {}) {
    const { organizationId, status, devedorNome, page = 1, pageSize = 20 } = filters;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('obj_fda')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (organizationId) query = query.eq('organization_id', organizationId);
    if (status) query = query.eq('status_atual', status);
    if (devedorNome) query = query.ilike('devedor_nome', `%${devedorNome}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data ?? [], total: count ?? 0, page, pageSize };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('obj_fda')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(fda: {
    organization_id: string;
    numero_inscricao: string;
    documento_devedor: string;
    devedor_nome: string;
    valor_principal_inscrito: number;
  }) {
    const { data, error } = await supabase
      .from('obj_fda')
      .insert({ ...fda, status_atual: 'ATIVA' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, novoStatus: string) {
    const { data, error } = await supabase
      .from('obj_fda')
      .update({
        status_atual: novoStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async softDelete(id: string) {
    return this.updateStatus(id, 'CANCELADO');
  },

  async getKPIs(organizationId: string) {
    const { data, error } = await supabase
      .from('obj_fda')
      .select('status_atual, valor_principal_inscrito')
      .eq('organization_id', organizationId)
      .neq('status_atual', 'CANCELADO');

    if (error) throw error;

    const total = data?.reduce((acc, fda) => acc + Number(fda.valor_principal_inscrito), 0) ?? 0;
    const porStatus =
      data?.reduce((acc, fda) => {
        acc[fda.status_atual] = (acc[fda.status_atual] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>) ?? {};

    return { totalDivida: total, totalInscricoes: data?.length ?? 0, porStatus };
  },
};
