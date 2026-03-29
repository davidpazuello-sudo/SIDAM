import { supabase } from './supabaseClient';
import type { Database } from '../types/database';

type Organization = Database['public']['Tables']['sec_organization']['Row'];

export const organizationService = {
  async getAll(): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('sec_organization')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data as Organization[]) ?? [];
  },

  async getById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('sec_organization')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return (data as Organization) ?? null;
  },
};
