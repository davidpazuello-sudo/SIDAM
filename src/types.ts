/**
 * SIDAM - Global Types
 */

export type ObjectStatus = 'RASCUNHO' | 'EM_TRIAGEM' | 'ATIVA' | 'SUSPENSA' | 'EXTINTA' | 'AJUIZADA' | 'PARCELADA' | 'CANCELADA' | 'QUARENTENA' | 'PENDENTE';
export type Rating = 'A' | 'B' | 'C' | 'D';

export interface FDA {
  id: string;
  organization_id: string;
  numero_inscricao?: string;
  numero_processo_administrativo: string;
  documento_devedor: string;
  devedor_nome: string;
  valor_principal_inscrito: number;
  natureza_debito: string;
  ano_exercicio: number;
  status_atual: ObjectStatus;
  rating_recuperabilidade?: Rating;
  gigo_score: number;
  is_blockchain_sealed: boolean;
  blockchain_hash?: string;
  has_attachment: boolean;
  attachment_url?: string;
  is_segredo_justica: boolean;
  created_at: string;
  updated_at: string;
  
  // Financial Details
  financeiro?: {
    principal: number;
    multa_mora: number;
    juros: number;
    atualizacao_monetaria: number;
    custas_honorarios: number;
    data_vencimento_original: string;
  };

  // Location & Contact
  contato?: {
    endereco: string;
    bairro: string;
    cep: string;
    email: string;
    telefone: string;
    lat?: number;
    lng?: number;
  };

  // Co-responsibles
  co_responsaveis?: {
    nome: string;
    documento: string;
    vinculo: string;
  }[];

  // Timeline
  eventos?: {
    data: string;
    descricao: string;
    origem: string;
  }[];
}

export interface ObjectProperty {
  id: string;
  object_type_slug: string;
  name: string;
  slug: string;
  data_type: string;
  ui_component: string;
  is_required: boolean;
  sort_order: number;
  configuration: any;
}

export interface ObjectType {
  slug: string;
  name: string;
  storage_mode: 'table' | 'view';
  table_name: string;
  configuration: any;
}

export interface UserPermission {
  id: string;
  name: string;
  email: string;
  registration_number: string;
  sector: string;
  role_in_secretariat: string;
  role_in_system: 'admin' | 'user' | 'viewer';
  is_active: boolean;
  has_vulnerability: boolean;
  last_access: string;
}

export interface Secretariat {
  id: string;
  name: string;
  acronym: string;
  description: string;
  users: UserPermission[];
}
