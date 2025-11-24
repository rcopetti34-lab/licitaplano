import { getSupabase } from '../supabaseClient';
import { Process, DashboardStats, ProcessStatus, Priority } from '../types';
import { calculateElapsedDays } from '../utils/helpers';

const TABLE_NAME = 'processos';

// Helper para converter strings vazias de data em NULL para o PostgreSQL aceitar
const sanitizePayload = (process: Process) => {
  const payload = { ...process } as any;
  
  // Campos que são do tipo DATE no banco de dados
  const dateFields = [
    'vencimento_anterior',
    'inicio_efetivo_planejamento',
    'termino_efetivo_planejamento',
    'data_remessa_compras'
  ];

  dateFields.forEach(field => {
    if (payload[field] === '') {
      payload[field] = null;
    }
  });

  return payload;
};

export const fetchProcesses = async (): Promise<Process[]> => {
  // Ordenação fixa: mais antigo primeiro (created_at asc)
  const { data, error } = await getSupabase()
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createProcess = async (process: Process): Promise<Process> => {
  const { data: { user } } = await getSupabase().auth.getUser();
  
  let payload = { ...process, user_id: user?.id };
  delete payload.id; 
  
  // Limpa campos de data vazios
  payload = sanitizePayload(payload);

  const { data, error } = await getSupabase()
    .from(TABLE_NAME)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Erro Supabase Create:", error);
    throw error;
  }
  return data;
};

export const updateProcess = async (process: Process): Promise<Process> => {
  // IMPORTANTE: Extrair campos de sistema e ID para não enviá-los no update.
  // O Supabase bloqueia updates em user_id/created_at via RLS se o usuário não for super admin.
  const { id, user_id, created_at, ...rawPayload } = process;
  
  // Limpa campos de data vazios
  const payload = sanitizePayload(rawPayload as Process);

  const { data, error } = await getSupabase()
    .from(TABLE_NAME)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Erro Supabase Update:", error);
    throw error;
  }
  return data;
};

// Nova função para atualização parcial (Patch)
// Isso evita enviar o formulário inteiro quando queremos apenas mudar o status de arquivamento
export const updateProcessStatus = async (id: string, isArchived: boolean): Promise<Process> => {
  // Usamos .select() sem .single() para podermos verificar o tamanho do array retornado.
  // Se o RLS bloquear o update, ele retorna data=[] (vazio) e error=null, o que confunde o frontend.
  const { data, error } = await getSupabase()
    .from(TABLE_NAME)
    .update({ is_archived: isArchived })
    .eq('id', id)
    .select();

  if (error) {
    console.error("Erro Supabase Patch Archive:", error);
    throw error;
  }

  // DETECÇÃO DE BLOQUEIO RLS:
  // Se não houve erro, mas o array está vazio, significa que o banco "fingiu" que atualizou
  // mas a política de segurança (RLS) impediu a alteração.
  if (!data || data.length === 0) {
    throw new Error("RLS_BLOCKED");
  }

  return data[0];
};

export const deleteProcess = async (id: string): Promise<void> => {
  const { error } = await getSupabase()
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const calculateStats = (processes: Process[]): DashboardStats => {
  const total = processes.length;
  const byStatus: Record<ProcessStatus, number> = {
    'aguardando início': 0,
    'em elaboração': 0,
    'finalizado': 0,
    'prorrogado': 0
  };
  const byPriority: Record<Priority, number> = {
    'normal': 0,
    'alta': 0,
    'urgente': 0
  };

  let totalDaysSum = 0;
  let totalBusinessDaysSum = 0;
  let processesWithTime = 0;

  processes.forEach(p => {
    // Contagem segura de status
    const status = p.status || 'aguardando início';
    if (byStatus[status] !== undefined) byStatus[status]++;
    else byStatus['aguardando início']++; // Fallback

    // Contagem segura de prioridade
    const prio = p.prioridade || 'normal';
    if (byPriority[prio] !== undefined) byPriority[prio]++;
    else byPriority['normal']++; // Fallback

    // Only calculate average time for processes that have both start and end dates
    if (p.inicio_efetivo_planejamento && p.termino_efetivo_planejamento) {
      const { total, business } = calculateElapsedDays(p.inicio_efetivo_planejamento, p.termino_efetivo_planejamento);
      totalDaysSum += total;
      totalBusinessDaysSum += business;
      processesWithTime++;
    }
  });

  return {
    total,
    byStatus,
    byPriority,
    averageDays: processesWithTime > 0 ? totalDaysSum / processesWithTime : 0,
    averageBusinessDays: processesWithTime > 0 ? totalBusinessDaysSum / processesWithTime : 0
  };
};