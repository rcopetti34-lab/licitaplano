import React from 'react';
import { DashboardStats } from '../types';
import { FileText, Clock } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
      {/* Total Card */}
      <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Total</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-none mt-0.5">{stats.total}</h3>
        </div>
        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Priority Card */}
      <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
        <div className="flex justify-between items-center h-full">
           <div className="text-center px-2">
             <span className="block text-[9px] text-gray-500 uppercase font-bold">Normal</span>
             <span className="text-base font-bold text-slate-700 dark:text-slate-200 leading-none">{stats.byPriority.normal || 0}</span>
           </div>
           <div className="w-px h-6 bg-slate-100 dark:bg-slate-700 mx-1"></div>
           <div className="text-center px-2">
             <span className="block text-[9px] text-orange-500 uppercase font-bold">Alta</span>
             <span className="text-base font-bold text-orange-600 leading-none">{stats.byPriority.alta || 0}</span>
           </div>
           <div className="w-px h-6 bg-slate-100 dark:bg-slate-700 mx-1"></div>
           <div className="text-center px-2">
             <span className="block text-[9px] text-red-500 uppercase font-bold">Urgente</span>
             <span className="text-base font-bold text-red-600 leading-none">{stats.byPriority.urgente || 0}</span>
           </div>
        </div>
      </div>

      {/* Status Stats (Compact Horizontal Layout) */}
      <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 md:col-span-1 flex flex-col justify-center">
         <div className="flex justify-between items-center w-full h-full">
            <div className="flex flex-col items-center">
               <span className="text-[8px] text-slate-400 uppercase font-bold mb-0.5">Aguard.</span>
               <span className="text-base font-bold text-slate-700 dark:text-slate-200 leading-none">{stats.byStatus['aguardando início'] || 0}</span>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[8px] text-blue-400 uppercase font-bold mb-0.5">Elab.</span>
               <span className="text-base font-bold text-blue-600 leading-none">{stats.byStatus['em elaboração'] || 0}</span>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[8px] text-green-400 uppercase font-bold mb-0.5">Final.</span>
               <span className="text-base font-bold text-green-600 leading-none">{stats.byStatus['finalizado'] || 0}</span>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[8px] text-purple-400 uppercase font-bold mb-0.5">Prorrog.</span>
               <span className="text-base font-bold text-purple-600 leading-none">{stats.byStatus['prorrogado'] || 0}</span>
            </div>
         </div>
      </div>

      {/* Time Estimates */}
      <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex gap-4">
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Corridos</span>
              <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                {stats.averageDays.toFixed(0)}d
              </h3>
            </div>
            <div className="pl-4 border-l border-slate-100 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Úteis</span>
              <h3 className="text-base font-bold text-blue-600 dark:text-blue-400 leading-none">
                {stats.averageBusinessDays.toFixed(0)}d
              </h3>
            </div>
        </div>
        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md self-center">
          <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    </div>
  );
};