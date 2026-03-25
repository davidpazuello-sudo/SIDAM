import { supabase } from './supabaseClient';

export interface MetaObjectType {
  id: string;
  name: string;
  slug: string;
  table_name?: string | null;
}

export interface MetaObjectProperty {
  id: string;
  object_type_id: string;
  name: string;
  slug: string;
  data_type?: string;
  is_required?: boolean;
  sort_order?: number;
}

export const metaGovService = {
  async getObjectTypes(): Promise<MetaObjectType[]> {
    const { data, error } = await (supabase as any).from('cfg_object_types').select('*').order('name');
    if (error) throw error;
    return data ?? [];
  },

  async getObjectConfig(objectTypeId: string): Promise<MetaObjectProperty[]> {
    const { data, error } = await (supabase as any)
      .from('cfg_object_properties')
      .select('*')
      .eq('object_type_id', objectTypeId)
      .order('sort_order');
    if (error) throw error;
    return data ?? [];
  },

  async upsertObject(tableName: string, record: Record<string, unknown>, id?: string) {
    if (id) {
      const { data, error } = await (supabase as any)
        .from(tableName)
        .update({ ...record, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await (supabase as any).from(tableName).insert(record).select().single();
    if (error) throw error;
    return data;
  },
};
