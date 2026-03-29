// Gerado manualmente como stub inicial para integração com Supabase.
// Recomendado: substituir por tipos gerados com `npx supabase gen types typescript --project-id <id>`.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      sec_organization: {
        Row: {
          id: string;
          name: string;
          slug: string;
          cnpj: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          cnpj?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sec_organization']['Insert']>;
        Relationships: [];
      };
      obj_fda: {
        Row: {
          id: string;
          organization_id: string;
          numero_inscricao: string | null;
          documento_devedor: string;
          devedor_nome: string;
          valor_principal_inscrito: number;
          status_atual: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          numero_inscricao?: string | null;
          documento_devedor: string;
          devedor_nome: string;
          valor_principal_inscrito: number;
          status_atual?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['obj_fda']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
