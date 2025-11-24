import React from 'react';
import { DashboardStats } from '../types';
import { FileText, Clock } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
      {/* Total Card */}
      <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Total de Processos</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{stats.total}</h3>
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Priority Card */}
      <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">Prioridades</p>
        <div className="flex justify-between items-end">
           <div className="text-center">
             <span className="block text-[10px] text-gray-500 uppercase leading-none mb-1">Normal</span>
             <span className="text-lg font-bold text-slate-700 dark:text-slate-200 leading-none">{stats.byPriority.normal || 0}</span>
           </div>
           <div className="text-center">
             <span className="block text-[10px] text-orange-500 uppercase leading-none mb-1">Alta</span>
             <span className="text-lg font-bold text-orange-600 leading-none">{stats.byPriority.alta || 0}</span>
           </div>
           <div className="text-center">
             <span className="block text-[10px] text-red-500 uppercase leading-none mb-1">Urgente</span>
             <span className="text-lg font-bold text-red-600 leading-none">{stats.byPriority.urgente || 0}</span>
           </div>
        </div>
      </div>

      {/* Status Stats (Compact Horizontal Layout) */}
      <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 md:col-span-1 flex flex-col justify-center">
         <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">Status</p>
         <div className="flex justify-between items-center w-full">
            <div className="flex flex-col items-center">
               <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wide mb-1">Aguard.</span>
               <span className="text-base font-bold text-slate-700 dark:text-slate-200 leading-none">{stats.byStatus['aguardando início'] || 0}</span>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[9px] text-blue-500 uppercase font-bold tracking-wide mb-1">Elab.</span>
               <span className="text-base font-bold text-blue-600 leading-none">{stats.byStatus['em elaboração'] || 0}</span>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[9px] text-green-500 uppercase font-bold tracking-wide mb-1">Final.</span>
               <span className="text-base font-bold text-green-600 leading-none">{stats.byStatus['finalizado'] || 0}</span>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[9px] text-purple-500 uppercase font-bold tracking-wide mb-1">Prorrog.</span>
               <span className="text-base font-bold text-purple-600 leading-none">{stats.byStatus['prorrogado'] || 0}</span>
            </div>
         </div>
      </div>

      {/* Time Estimates */}
      <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">Prazos Médios</p>
          <div className="flex gap-4">
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-semibold block mb-0.5">Corridos</span>
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                {stats.averageDays.toFixed(0)}<span className="text-[10px] font-normal text-slate-500 ml-0.5">d</span>
              </h3>
            </div>
            <div className="pl-4 border-l border-slate-100 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block mb-0.5">Úteis</span>
              <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 leading-none">
                {stats.averageBusinessDays.toFixed(0)}<span className="text-[10px] font-normal text-slate-500 ml-0.5">d</span>
              </h3>
            </div>
          </div>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full self-center">
          <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    </div>
  );
};