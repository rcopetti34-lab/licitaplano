import React from 'react';
import { DashboardStats } from '../types';
import { FileText, Clock } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Card */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total de Processos</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.total}</h3>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Priority Card */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2">Prioridades</p>
        <div className="flex justify-between items-end">
           <div className="text-center">
             <span className="block text-xs text-gray-500">Normal</span>
             <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{stats.byPriority.normal || 0}</span>
           </div>
           <div className="text-center">
             <span className="block text-xs text-orange-500">Alta</span>
             <span className="text-lg font-bold text-orange-600">{stats.byPriority.alta || 0}</span>
           </div>
           <div className="text-center">
             <span className="block text-xs text-red-500">Urgente</span>
             <span className="text-lg font-bold text-red-600">{stats.byPriority.urgente || 0}</span>
           </div>
        </div>
      </div>

      {/* Status Stats (Substitui o Gráfico) */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 md:col-span-1 flex flex-col justify-center">
         <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">Status</p>
         <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            <div className="flex flex-col">
               <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Aguardando</span>
               <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{stats.byStatus['aguardando início'] || 0}</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] text-blue-500 uppercase font-bold tracking-wide">Em Elaboração</span>
               <span className="text-xl font-bold text-blue-600">{stats.byStatus['em elaboração'] || 0}</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] text-green-500 uppercase font-bold tracking-wide">Finalizado</span>
               <span className="text-xl font-bold text-green-600">{stats.byStatus['finalizado'] || 0}</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] text-purple-500 uppercase font-bold tracking-wide">Prorrogado</span>
               <span className="text-xl font-bold text-purple-600">{stats.byStatus['prorrogado'] || 0}</span>
            </div>
         </div>
      </div>

      {/* Time Estimates */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2">Prazos Médios</p>
          <div className="flex gap-6">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Corridos</span>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.averageDays.toFixed(0)} <span className="text-sm font-normal text-slate-500">dias</span>
              </h3>
            </div>
            <div className="pl-6 border-l border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-400 uppercase font-semibold">Úteis</span>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.averageBusinessDays.toFixed(0)} <span className="text-sm font-normal text-slate-500">dias</span>
              </h3>
            </div>
          </div>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-full self-start">
          <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    </div>
  );
};