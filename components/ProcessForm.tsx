import React, { useState, useEffect } from 'react';
import { Process, ProcessStatus, Priority, YesNo, PcaPrediction } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';
import { calculateElapsedDays } from '../utils/helpers';

interface ProcessFormProps {
  initialData?: Process;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Process) => Promise<void>;
}

const emptyProcess: Process = {
  processo_anterior: '',
  vencimento_anterior: '',
  previsao_pca: 'não previsto no PCA',
  status: 'aguardando início',
  previsao_start: '',
  prioridade: 'normal',
  modalidade: 'Pregão Eletrônico',
  objeto: '',
  responsavel_demanda: '',
  prorrogavel: 'não',
  inicio_efetivo_planejamento: '',
  termino_efetivo_planejamento: '',
  data_remessa_compras: '',
  fiscais_gestores: '',
  is_prorrogado: false,
  observacoes: '',
  is_archived: false
};

export const ProcessForm: React.FC<ProcessFormProps> = ({ initialData, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Process>(emptyProcess);
  const [elapsed, setElapsed] = useState({ total: 0, business: 0 });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
    if (initialData) {
      // Ensure nulls are converted back to empty strings for inputs
      const safeData = { ...initialData };
      // Helper to safely handle nulls coming from DB
      const safeStr = (val: any) => val === null || val === undefined ? '' : val;
      
      safeData.vencimento_anterior = safeStr(initialData.vencimento_anterior);
      safeData.inicio_efetivo_planejamento = safeStr(initialData.inicio_efetivo_planejamento);
      safeData.termino_efetivo_planejamento = safeStr(initialData.termino_efetivo_planejamento);
      safeData.data_remessa_compras = safeStr(initialData.data_remessa_compras);
      safeData.previsao_start = safeStr(initialData.previsao_start);
      // Ensure boolean
      safeData.is_archived = !!initialData.is_archived;

      setFormData(safeData);
    } else {
      setFormData(emptyProcess);
    }
  }, [initialData, isOpen]);

  // Auto calculate elapsed time when dates change
  useEffect(() => {
    const calc = calculateElapsedDays(formData.inicio_efetivo_planejamento, formData.termino_efetivo_planejamento);
    setElapsed(calc);
  }, [formData.inicio_efetivo_planejamento, formData.termino_efetivo_planejamento]);

  // Automação do Status com base nas regras de negócio
  useEffect(() => {
    let newStatus: ProcessStatus = 'aguardando início';

    // 1. Prioridade Máxima: Prorrogado
    if (formData.is_prorrogado) {
      newStatus = 'prorrogado';
    } 
    // 2. Se tem remessa -> Finalizado
    else if (formData.data_remessa_compras) {
      newStatus = 'finalizado';
    }
    // 3. Se não tem data de início -> Aguardando Início
    else if (!formData.inicio_efetivo_planejamento) {
      newStatus = 'aguardando início';
    }
    // 4. Se tem início (implícito pelo else anterior) mas não tem término -> Em Elaboração
    // Regra: "se não houver dados em termino de planejamento então “em elaboração”"
    else if (!formData.termino_efetivo_planejamento) {
      newStatus = 'em elaboração';
    }
    else {
      // Caso (Start preenchido + Termino preenchido + Sem Remessa + Sem Prorrogação)
      // Mantém em elaboração pois ainda não foi finalizado (sem remessa)
      newStatus = 'em elaboração';
    }

    // Só atualiza se mudou para evitar loops infinitos
    if (formData.status !== newStatus) {
      setFormData(prev => ({ ...prev, status: newStatus }));
    }
  }, [
    formData.is_prorrogado,
    formData.data_remessa_compras,
    formData.inicio_efetivo_planejamento,
    formData.termino_efetivo_planejamento
  ]);

  const handleChange = (field: keyof Process, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      setErrorMessage(error.message || "Erro desconhecido ao salvar. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl my-8 border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 rounded-t-xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {initialData ? 'Editar Processo' : 'Novo Processo'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {errorMessage && (
            <div className="md:col-span-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          {/* Col B */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Processo Anterior</label>
            <input type="text" required className="w-full p-2 bg-white border border-slate-300 text-black rounded" 
              value={formData.processo_anterior} onChange={e => handleChange('processo_anterior', e.target.value)} />
          </div>

          {/* Col C */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vencimento Anterior</label>
            <input type="date" className="w-full p-2 bg-white border border-slate-300 text-black rounded"
              value={formData.vencimento_anterior} onChange={e => handleChange('vencimento_anterior', e.target.value)} />
          </div>

          {/* Col D */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Previsão PCA</label>
            <select className="w-full p-2 bg-white border border-slate-300 text-black rounded"
              value={formData.previsao_pca} onChange={e => handleChange('previsao_pca', e.target.value as PcaPrediction)}>
              <option value="previsto no PCA">Previsto no PCA</option>
              <option value="não previsto no PCA">Não previsto</option>
            </select>
          </div>

          {/* Col E & Q Interaction */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status (Automático)</label>
            <select className="w-full p-2 bg-slate-100 border border-slate-300 text-slate-600 rounded cursor-not-allowed"
              value={formData.status} 
              disabled={true}
              onChange={e => handleChange('status', e.target.value as ProcessStatus)}>
              <option value="aguardando início">Aguardando Início</option>
              <option value="em elaboração">Em Elaboração</option>
              <option value="finalizado">Finalizado</option>
              <option value="prorrogado">Prorrogado</option>
            </select>
          </div>

           {/* Col Q - Checkbox */}
           <div className="md:col-span-1 flex items-center h-full pt-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                checked={formData.is_prorrogado} onChange={e => handleChange('is_prorrogado', e.target.checked)} />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">MARCAR COMO PRORROGADO</span>
            </label>
          </div>

          {/* Col F */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Previsão Start</label>
            <input type="month" className="w-full p-2 bg-white border border-slate-300 text-black rounded"
              value={formData.previsao_start} onChange={e => handleChange('previsao_start', e.target.value)} />
          </div>

          {/* Col G */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prioridade</label>
            <select className="w-full p-2 bg-white border border-slate-300 text-black rounded"
              value={formData.prioridade} onChange={e => handleChange('prioridade', e.target.value as Priority)}>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          {/* Col H */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Modalidade</label>
            <select className="w-full p-2 bg-white border border-slate-300 text-black rounded"
              value={formData.modalidade} onChange={e => handleChange('modalidade', e.target.value)}>
              <option value="Pregão Eletrônico">Pregão Eletrônico</option>
              <option value="Concorrência">Concorrência</option>
              <option value="Dispensa">Dispensa</option>
              <option value="Inexigibilidade">Inexigibilidade</option>
              <option value="Credenciamento">Credenciamento</option>
            </select>
          </div>

           {/* Col J */}
           <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Responsável Demanda</label>
            <input type="text" className="w-full p-2 bg-white border border-slate-300 text-black rounded"
              value={formData.responsavel_demanda} onChange={e => handleChange('responsavel_demanda', e.target.value)} />
          </div>

          {/* Col I - Full Width */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Objeto</label>
            <textarea rows={2} className="w-full p-2 bg-white border border-slate-300 text-black rounded"
              value={formData.objeto} onChange={e => handleChange('objeto', e.target.value)} />
          </div>

          {/* Col K */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prorrogável?</label>
            <select className="w-full p-2 bg-white border border-slate-300 text-black rounded"
              value={formData.prorrogavel} onChange={e => handleChange('prorrogavel', e.target.value as YesNo)}>
              <option value="sim">Sim</option>
              <option value="não">Não</option>
            </select>
          </div>

          {/* Col L */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Início Planejamento</label>
            <input type="date" className="w-full p-2 bg-white border border-slate-300 text-black rounded"
              value={formData.inicio_efetivo_planejamento} onChange={e => handleChange('inicio_efetivo_planejamento', e.target.value)} />
          </div>

          {/* Col M */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Término Planejamento</label>
            <input type="date" className="w-full p-2 bg-white border border-slate-300 text-black rounded"
              value={formData.termino_efetivo_planejamento} onChange={e => handleChange('termino_efetivo_planejamento', e.target.value)} />
          </div>

          {/* Col N - Read Only Calc */}
          <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200">
             <span className="block text-xs font-bold text-slate-500 uppercase">Prazo Decorrido</span>
             <div className="flex space-x-4 mt-1">
                <span className="text-sm text-slate-800 dark:text-slate-200 font-mono">Total: {elapsed.total}d</span>
                <span className="text-sm text-slate-800 dark:text-slate-200 font-mono">Úteis: {elapsed.business}d</span>
             </div>
          </div>

          {/* Col O */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Remessa Compras</label>
            <input type="date" className="w-full p-2 bg-white border border-slate-300 text-black rounded"
              value={formData.data_remessa_compras} onChange={e => handleChange('data_remessa_compras', e.target.value)} />
          </div>

           {/* Col P */}
           <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fiscais e Gestores</label>
            <input type="text" className="w-full p-2 bg-white border border-slate-300 text-black rounded" placeholder="Nome 1, Nome 2..."
              value={formData.fiscais_gestores} onChange={e => handleChange('fiscais_gestores', e.target.value)} />
          </div>

          {/* Col R */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observações Gerais</label>
            <textarea rows={3} className="w-full p-2 bg-white border border-slate-300 text-black rounded"
              value={formData.observacoes} onChange={e => handleChange('observacoes', e.target.value)} />
          </div>

        </form>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-800 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded font-medium transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-lg flex items-center space-x-2 transition-all">
            <Save className="h-4 w-4" />
            <span>{loading ? 'Salvando...' : 'Salvar Processo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};