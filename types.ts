export type ProcessStatus = 'aguardando início' | 'em elaboração' | 'finalizado' | 'prorrogado';
export type Priority = 'normal' | 'alta' | 'urgente';
export type YesNo = 'sim' | 'não';
export type PcaPrediction = 'previsto no PCA' | 'não previsto no PCA';

export interface Entity {
  id: string;
  name: string;
  supabaseUrl: string;
  supabaseKey: string;
  logoUrl?: string; // Opcional para mostrar logo da prefeitura/empresa
}

export interface Process {
  id?: string; // Supabase UUID
  user_id?: string;
  created_at?: string;

  // Column B
  processo_anterior: string;
  // Column C
  vencimento_anterior: string; // Date string YYYY-MM-DD
  // Column D
  previsao_pca: PcaPrediction;
  // Column E
  status: ProcessStatus;
  // Column F
  previsao_start: string; // Month/Year e.g., "2024-05"
  // Column G
  prioridade: Priority;
  // Column H
  modalidade: string;
  // Column I
  objeto: string;
  // Column J
  responsavel_demanda: string;
  // Column K
  prorrogavel: YesNo;
  // Column L
  inicio_efetivo_planejamento: string; // Date
  // Column M
  termino_efetivo_planejamento: string; // Date
  // Column O
  data_remessa_compras: string; // Date
  // Column P
  fiscais_gestores: string;
  // Column Q
  is_prorrogado: boolean;
  // Column R
  observacoes: string;
  
  // New field for archiving
  is_archived?: boolean;
}

export interface DashboardStats {
  total: number;
  byStatus: Record<ProcessStatus, number>;
  byPriority: Record<Priority, number>;
  averageDays: number;
  averageBusinessDays: number;
}