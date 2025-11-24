import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variável para armazenar a instância ativa
let supabaseInstance: SupabaseClient | null = null;

// Função para inicializar o Supabase com credenciais dinâmicas
export const initSupabase = (url: string, key: string): SupabaseClient => {
  if (supabaseInstance) {
    // Opcional: desconectar ou limpar anterior se necessário
    // mas normalmente apenas sobrescrevemos para a nova entidade
  }
  supabaseInstance = createClient(url, key);
  return supabaseInstance;
};

// Função para pegar a instância ativa.
// Lança erro se tentar usar antes de escolher a entidade.
export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    throw new Error("Supabase client not initialized. Select an entity first.");
  }
  return supabaseInstance;
};

// Exportamos uma variável 'dummy' apenas para manter compatibilidade de tipagem se necessário,
// mas o código deve usar getSupabase()
export const supabase =  new Proxy({}, {
  get: function(_target, prop) {
    if (!supabaseInstance) {
        console.warn("Acessando 'supabase' antes da inicialização. Use 'getSupabase()' ou selecione uma entidade.");
        return undefined;
    }
    return (supabaseInstance as any)[prop];
  }
}) as SupabaseClient; // Casting para enganar o TS temporariamente onde não refatoramos