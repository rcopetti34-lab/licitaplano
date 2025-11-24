import React, { useEffect, useState, useMemo } from 'react';
import { getSupabase, initSupabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ProcessList } from './components/ProcessList';
import { ProcessForm } from './components/ProcessForm';
import { EntitySelector } from './components/EntitySelector';
import { Process, DashboardStats, ProcessStatus, Entity } from './types';
import * as processService from './services/processService';
import { Plus, Sun, Moon, LogOut, LayoutList, Archive, Building2, Waypoints } from 'lucide-react';

const App: React.FC = () => {
  // 1. Estado da Entidade (Primeira etapa)
  const [currentEntity, setCurrentEntity] = useState<Entity | null>(null);
  
  // 2. Estado da Sessão e App
  const [session, setSession] = useState<Session | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [processes, setProcesses] = useState<Process[]>([]);
  
  // Tab State: 'active' (Production) vs 'archived'
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProcessStatus | 'todos'>('todos');
  const [startFilter, setStartFilter] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | undefined>(undefined);

  // Manipulador de Seleção de Entidade
  const handleEntitySelect = (entity: Entity) => {
    // Inicializa o Singleton do Supabase com as credenciais da entidade escolhida
    initSupabase(entity.supabaseUrl, entity.supabaseKey);
    setCurrentEntity(entity);
  };

  const handleChangeEntity = () => {
    // Logout da sessão atual se houver
    if (session) {
        try { getSupabase().auth.signOut(); } catch(e) {}
    }
    setSession(null);
    setCurrentEntity(null);
  };

  // Efeito de Sessão - Só roda se tivermos uma entidade
  useEffect(() => {
    if (!currentEntity) return;

    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [currentEntity]);

  const loadData = async () => {
    if (!session || !currentEntity) return;
    try {
      const data = await processService.fetchProcesses();
      setProcesses(data);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  };

  useEffect(() => {
    if (session && currentEntity) loadData();
  }, [session, currentEntity]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
      if (currentEntity) {
        getSupabase().auth.signOut();
      }
  };

  const handleSaveProcess = async (process: Process) => {
    try {
      if (process.id) {
        await processService.updateProcess(process);
      } else {
        await processService.createProcess(process);
      }
      loadData(); // Refresh
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert(`Erro ao salvar processo: ${error.message || 'Verifique se a coluna is_archived existe no banco.'}`);
    }
  };

  const handleToggleArchive = async (process: Process) => {
    if (!process.id) {
      alert("Erro: ID do processo não encontrado.");
      return;
    }
    
    // Inverte o status atual. Se for null/undefined, assume false, então vira true.
    const isArchiving = !process.is_archived;
    
    const confirmMessage = isArchiving 
      ? 'Deseja ARQUIVAR este processo?\n\nEle será movido para a aba de "Arquivados" e não aparecerá nos indicadores principais.'
      : 'Deseja DESARQUIVAR este processo?\n\nEle retornará para a lista de Processos Ativos.';
      
    if (window.confirm(confirmMessage)) {
      try {
        console.log(`Tentando atualizar processo ${process.id} para arquivado=${isArchiving}`);
        // Usa a atualização parcial (PATCH) e aguarda confirmação do banco
        await processService.updateProcessStatus(process.id, isArchiving);
        await loadData(); // Recarrega a lista
      } catch (error: any) {
        console.error("Erro ao alterar status de arquivamento", error);
        
        let msg = `Não foi possível atualizar o processo.\n`;
        
        // Verifica o erro específico de RLS lançado pelo service
        if (error.message === 'RLS_BLOCKED' || error.code === 'PGRST116') {
            msg += `\n⛔ BLOQUEIO DE SEGURANÇA (RLS)\n\nO banco de dados impediu a atualização. Isso acontece quando as permissões não estão configuradas.\n\nCOPIE E EXECUTE O SEGUINTE SQL NO SUPABASE:\n\ncreate policy "Permitir update para todos" on public.processos for update using (true) with check (true);`;
        } else if (error.message?.includes('is_archived')) {
            msg += `\n⚠️ COLUNA NÃO ENCONTRADA\n\nA coluna 'is_archived' não existe no banco.\n\nSQL:\nALTER TABLE processos ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;`;
        } else {
            msg += `\nErro Técnico: ${error.message || error.code || 'Desconhecido'}`;
        }

        alert(msg);
      }
    }
  };

  const openNewModal = () => {
    setEditingProcess(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (process: Process) => {
    setEditingProcess(process);
    setIsModalOpen(true);
  };

  // Derived state for filtering
  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      // 1. Filter by Tab (Archived vs Active)
      // Treat undefined/null as false (not archived)
      const isArchived = !!p.is_archived;
      
      if (activeTab === 'active' && isArchived) return false;
      if (activeTab === 'archived' && !isArchived) return false;

      // 2. Status Filter
      if (statusFilter !== 'todos' && p.status !== statusFilter) return false;

      // 3. Start Filter (YYYY-MM)
      if (startFilter && p.previsao_start !== startFilter) return false;

      // 4. Text Search
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        return (
          p.objeto.toLowerCase().includes(lower) ||
          p.processo_anterior.toLowerCase().includes(lower) ||
          p.responsavel_demanda.toLowerCase().includes(lower) ||
          p.modalidade.toLowerCase().includes(lower) ||
          (p.fiscais_gestores && p.fiscais_gestores.toLowerCase().includes(lower))
        );
      }
      return true;
    });
  }, [processes, searchTerm, statusFilter, startFilter, activeTab]);

  // Derived statistics based on filtered results
  const stats = useMemo(() => processService.calculateStats(filteredProcesses), [filteredProcesses]);

  // ----------------------------------------------------
  // CONDITIONAL RENDERING BASED ON FLOW
  // ----------------------------------------------------

  // 1. Entity Not Selected
  if (!currentEntity) {
      return <EntitySelector onSelect={handleEntitySelect} />;
  }

  // 2. Entity Selected but Not Logged In
  if (!session) {
    return <Auth currentEntity={currentEntity} onChangeEntity={handleChangeEntity} />;
  }

  // 3. Logged In to an Entity -> Main App
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Waypoints className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight leading-none">LicitaPlano</h1>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{currentEntity.name}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            {theme === 'light' ? <Moon className="h-5 w-5 text-slate-600" /> : <Sun className="h-5 w-5 text-yellow-400" />}
          </button>
          
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-slate-700 dark:text-slate-200 font-medium">{session.user.email}</span>
                <button onClick={handleChangeEntity} className="text-[10px] text-blue-500 hover:underline flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Trocar Entidade
                </button>
            </div>
            <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg flex items-center gap-1">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col max-w-[1920px] mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Painel de Planejamento</h2>
            <p className="text-slate-500 dark:text-slate-400">Gerencie etapas, prazos e prioridades.</p>
          </div>
          <button 
            onClick={openNewModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Novo Processo
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-2 text-sm font-medium flex items-center gap-2 transition-colors relative ${
              activeTab === 'active' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <LayoutList className="h-4 w-4" />
            Processos Ativos
            {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>}
          </button>
          
          <button
            onClick={() => setActiveTab('archived')}
            className={`pb-3 px-2 text-sm font-medium flex items-center gap-2 transition-colors relative ${
              activeTab === 'archived' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Archive className="h-4 w-4" />
            Arquivados
            {activeTab === 'archived' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>}
          </button>
        </div>

        {/* Insights */}
        <div>
            <Dashboard stats={stats} />
        </div>

        {/* Data Table */}
        <div className="mt-4">
          <ProcessList 
            processes={filteredProcesses} 
            onEdit={openEditModal}
            onToggleArchive={handleToggleArchive}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            startFilter={startFilter}
            onStartFilterChange={setStartFilter}
            isArchivedTab={activeTab === 'archived'}
          />
        </div>
      </main>

      {/* Modal */}
      <ProcessForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProcess}
        initialData={editingProcess}
      />

    </div>
  );
};

export default App;