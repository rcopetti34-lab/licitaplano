import React from 'react';
import { Entity } from '../types';
import { Building2, ChevronRight } from 'lucide-react';

interface EntitySelectorProps {
  onSelect: (entity: Entity) => void;
}

// Em um cenário real, isso viria de uma API mestre ou arquivo de config.
// Estamos simulando 2 bancos de dados distintos usando credenciais diferentes (ou as mesmas para teste).
const AVAILABLE_ENTITIES: Entity[] = [
  {
    id: 'SMSA',
    name: 'Prefeitura Marechal Candido Rondon - SMSA',
    // Usando as credenciais originais fornecidas
    supabaseUrl: 'https://lvfjcakdydgljoxciccd.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZmpjYWtkeWRnbGpveGNpY2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NjQ3MjcsImV4cCI6MjA3OTM0MDcyN30.twg5tR8-AoDmIJuLlKlaM5x7V-4W17N2dK3uiaabLyk',
  },
  {
    id: 'filial_norte',
    name: 'TESTE - XX',
    // Usando as MESMAS credenciais para demonstração, mas conceitualmente seria OUTRO projeto Supabase
    supabaseUrl: 'https://rulwzgytxzunqbzspwha.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1bHd6Z3l0eHp1bnFienNwd2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjEzODQsImV4cCI6MjA3OTUzNzM4NH0.Sz-Gl-Ly0L1c3VSRjnNJEJRibs874NfUgl8pODZ3Xb8',
  }
];

export const EntitySelector: React.FC<EntitySelectorProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors">
      <div className="w-full max-w-2xl">
        
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 bg-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-600/20 mb-6">
             <span className="text-white font-bold text-2xl">LP</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">Bem-vindo ao LicitaPlano</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Selecione a entidade para acessar seu ambiente exclusivo.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {AVAILABLE_ENTITIES.map((entity) => (
            <button
              key={entity.id}
              onClick={() => onSelect(entity)}
              className="group relative flex flex-col items-start p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-left"
            >
              <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {entity.name}
              </h3>

              <div className="mt-auto flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                Acessar Ambiente <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
            <p className="text-xs text-slate-400">
                LicitaPlano v3.0 • Sistema de Gestão Multi-tenant
            </p>
        </div>
      </div>
    </div>
  );
};