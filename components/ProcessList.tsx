import React from 'react';
import { Process, ProcessStatus } from '../types';
import { Edit, Search, FileDown, Filter, Calendar, Archive, ArchiveRestore } from 'lucide-react';
import { formatDate, formatMonthYear, calculateElapsedDays, getStatusColor, getPriorityColor, getConsistentColor } from '../utils/helpers';
import { exportToPDF, exportToExcel } from '../utils/export';

interface ProcessListProps {
  processes: Process[];
  onEdit: (p: Process) => void;
  onToggleArchive: (process: Process) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: ProcessStatus | 'todos';
  onStatusFilterChange: (status: ProcessStatus | 'todos') => void;
  startFilter: string;
  onStartFilterChange: (value: string) => void;
  isArchivedTab: boolean;
}

export const ProcessList: React.FC<ProcessListProps> = ({ 
  processes, 
  onEdit, 
  onToggleArchive,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  startFilter,
  onStartFilterChange,
  isArchivedTab
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 flex flex-col">
      
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between flex-none">
        
        {/* Quick Status Filters */}
        <div className="flex flex-wrap gap-2">
          {(['todos', 'aguardando início', 'em elaboração', 'finalizado', 'prorrogado'] as const).map(status => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusFilterChange(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors border ${
                statusFilter === status 
                  ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900' 
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Actions & Search */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          
          {/* Start Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="month"
              className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 transition-all outline-none h-[38px]"
              value={startFilter}
              onChange={(e) => onStartFilterChange(e.target.value)}
              title="Filtrar por Previsão de Início (Start)"
            />
          </div>

          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar processo..."
              className="pl-9 pr-4 py-2 w-full lg:w-64 bg-white border border-slate-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 transition-all h-[38px]"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="flex gap-1">
            <button type="button" onClick={() => exportToPDF(processes)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="PDF">
              <FileDown className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => exportToExcel(processes)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="Excel">
              <Filter className="h-5 w-5 rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Container 
          Definida altura máxima de 600px (~10 linhas) e overflow-auto para habilitar scroll vertical interno */}
      <div className="overflow-auto max-h-[600px] w-full relative">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="sticky left-0 z-30 bg-slate-50 dark:bg-slate-900 p-3 border-b border-slate-200 dark:border-slate-700 w-24 text-center">Ações</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[140px]">Responsável</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[140px]">Modalidade</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[350px]">Objeto</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[120px]">Proc. Anterior</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[100px]">Venc. Ant.</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[120px]">PCA</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[140px]">Status</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[100px]">Start</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[100px]">Prioridade</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[80px]">Prorrog.</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[100px]">Início Plan.</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[100px]">Fim Plan.</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[120px]">Decorrido</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[100px]">Remessa</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[150px]">Gestores</th>
              <th className="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[200px]">Obs</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-700">
            {processes.map((p) => {
              const elapsed = calculateElapsedDays(p.inicio_efetivo_planejamento, p.termino_efetivo_planejamento);
              return (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 p-2 border-r border-slate-200 dark:border-slate-700">
                    <div className="flex justify-center gap-2">
                      <button type="button" onClick={() => onEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Editar">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Impede conflitos de clique
                          onToggleArchive(p);
                        }} 
                        className={`p-1.5 rounded ${isArchivedTab ? 'text-green-600 hover:bg-green-50' : 'text-slate-500 hover:bg-slate-100'}`}
                        title={isArchivedTab ? "Desarquivar (Mover para Produção)" : "Arquivar Processo"}
                      >
                        {isArchivedTab ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                  <td className={`p-3 whitespace-nowrap font-semibold ${getConsistentColor(p.responsavel_demanda)}`}>
                    {p.responsavel_demanda}
                  </td>
                  <td className="p-3 whitespace-nowrap">{p.modalidade}</td>
                  <td className="p-3 min-w-[350px] max-w-[500px] whitespace-normal break-words" title={p.objeto}>{p.objeto}</td>
                  <td className="p-3 whitespace-nowrap">{p.processo_anterior}</td>
                  <td className="p-3 whitespace-nowrap">{formatDate(p.vencimento_anterior)}</td>
                  <td className="p-3 whitespace-nowrap">
                    {p.previsao_pca === 'previsto no PCA' ? 
                      <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded-full">SIM</span> : 
                      <span className="text-slate-400 text-xs">NÃO</span>}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">{formatMonthYear(p.previsao_start)}</td>
                  <td className={`p-3 whitespace-nowrap capitalize ${getPriorityColor(p.prioridade)}`}>{p.prioridade}</td>
                  <td className="p-3 whitespace-nowrap capitalize">{p.prorrogavel}</td>
                  <td className="p-3 whitespace-nowrap">{formatDate(p.inicio_efetivo_planejamento)}</td>
                  <td className="p-3 whitespace-nowrap">{formatDate(p.termino_efetivo_planejamento)}</td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex flex-col text-xs">
                       <span className="font-medium text-slate-700 dark:text-slate-300">Total: {elapsed.total}d</span>
                       <span className="text-slate-400">Úteis: {elapsed.business}d</span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">{formatDate(p.data_remessa_compras)}</td>
                  <td className="p-3 min-w-[150px] truncate">{p.fiscais_gestores}</td>
                  <td className="p-3 min-w-[200px] truncate text-slate-500">{p.observacoes}</td>
                </tr>
              );
            })}
            {processes.length === 0 && (
              <tr>
                <td colSpan={17} className="p-8 text-center text-slate-400">
                  {isArchivedTab ? "Nenhum processo arquivado encontrado." : "Nenhum processo ativo encontrado com os filtros atuais."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};